/**
 * Simple heuristic-based task type classifier
 *
 * This is intentionally basic and deterministic for v0.
 * Keywords and prompt length help guess the task type.
 *
 * Habit: prefer `--task-type` when the label matters (routing cells may
 * share a harness:model today, but per-type evidence / future splits need
 * an accurate type).
 */

const TASK_TYPE_PATTERNS = [
  {
    id: 'tiny_code_snippet',
    keywords: ['write', 'code', 'function', 'script', 'program', 'implement', 'create'],
    codeKeywords: ['python', 'javascript', 'js', 'java', 'c++', 'go', 'rust', 'def', 'function', 'class'],
    maxWords: 50
  },
  {
    id: 'explain_simple',
    keywords: ['explain', 'what is', 'what are', 'how does', 'eli5', 'describe', 'define'],
    maxWords: 40
  },
  {
    id: 'rewrite_short_prose',
    keywords: ['rewrite', 'rephrase', 'edit', 'improve', 'revise', 'polish'],
    maxWords: 400
  },
  {
    id: 'classify_label',
    keywords: ['classify', 'categorize', 'label', 'tag', 'which category', 'pick from'],
    maxWords: 100
  },
  {
    id: 'extract_structured',
    keywords: ['extract', 'parse', 'json', 'yaml', 'structure', 'data from'],
    maxWords: 200
  },
  {
    id: 'unit_test_stub',
    keywords: ['test', 'unit test', 'test case', 'test for', 'write test'],
    codeKeywords: ['function', 'method', 'class', 'def'],
    maxWords: 60
  }
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * True if `keyword` appears as a whole word/phrase in `text` (case-insensitive).
 * Uses non-alphanumeric boundaries so write⊄rewrite and js⊄json.
 *
 * @param {string} text
 * @param {string} keyword
 * @returns {boolean}
 */
export function containsKeyword(text, keyword) {
  const parts = keyword.trim().split(/\s+/).map(escapeRegex);
  if (parts.length === 0 || parts[0] === '') return false;
  // Boundary: start/end or a non-[A-Za-z0-9_] char. Lookahead keeps punctuation OK.
  const pattern = new RegExp(
    `(^|[^A-Za-z0-9_])${parts.join('\\s+')}(?=[^A-Za-z0-9_]|$)`,
    'i'
  );
  return pattern.test(text);
}

/**
 * First matching keyword in list order, or null.
 * Callers should pass keywords sorted longest-first when specificity matters.
 *
 * @param {string} text
 * @param {string[]} keywords
 * @returns {string|null}
 */
function findMatchingKeyword(text, keywords) {
  // Prefer longer / more-specific keywords (rewrite > write, unit test > test)
  const ordered = [...keywords].sort((a, b) => b.length - a.length);
  for (const keyword of ordered) {
    if (containsKeyword(text, keyword)) {
      return keyword;
    }
  }
  return null;
}

/**
 * Classify a prompt into a task type using basic heuristics
 *
 * @param {string} prompt - The user prompt
 * @returns {string|null} - Classified task type ID or null
 */
export function classifyPrompt(prompt) {
  const words = prompt.split(/\s+/).length;

  let bestMatch = null;
  let bestScore = 0;
  let bestKeywordLen = 0;

  for (const pattern of TASK_TYPE_PATTERNS) {
    const matchedKeyword = findMatchingKeyword(prompt, pattern.keywords);
    if (!matchedKeyword) {
      continue;
    }

    let score = 3;
    // Specificity: longer keywords beat shorter ones on ties / near-ties
    // (rewrite > write; "unit test" > "test"; "what is" > bare fragments)
    const keywordLen = matchedKeyword.length;
    score += Math.min(3, Math.floor(keywordLen / 4));

    if (pattern.codeKeywords) {
      const matchedCode = findMatchingKeyword(prompt, pattern.codeKeywords);
      if (matchedCode) {
        score += 2;
      }
    }

    if (pattern.maxWords && words <= pattern.maxWords) {
      score += 1;
    } else if (pattern.maxWords && words > pattern.maxWords * 2) {
      score -= 2;
    }

    // Prefer higher score; on equal score prefer longer matched keyword
    // (so rewrite_short_prose wins over tiny_code_snippet when both hit).
    if (
      score > bestScore ||
      (score === bestScore && keywordLen > bestKeywordLen)
    ) {
      bestScore = score;
      bestKeywordLen = keywordLen;
      bestMatch = pattern.id;
    }
  }

  // Only return a match if we have reasonable confidence (base keyword hit)
  return bestScore >= 3 ? bestMatch : null;
}

/**
 * Get a human-readable explanation of why a task was classified
 *
 * @param {string} prompt - The user prompt
 * @param {string} taskType - The classified task type
 * @returns {string} - Explanation
 */
export function explainClassification(prompt, taskType) {
  const pattern = TASK_TYPE_PATTERNS.find(p => p.id === taskType);

  if (!pattern) {
    return 'Unknown task type';
  }

  const matchedKeywords = pattern.keywords.filter(k => containsKeyword(prompt, k));

  const matchedCodeKeywords = pattern.codeKeywords
    ? pattern.codeKeywords.filter(k => containsKeyword(prompt, k))
    : [];

  const parts = [];

  if (matchedKeywords.length > 0) {
    parts.push(`matched keywords: ${matchedKeywords.join(', ')}`);
  }

  if (matchedCodeKeywords.length > 0) {
    parts.push(`code indicators: ${matchedCodeKeywords.join(', ')}`);
  }

  const words = prompt.split(/\s+/).length;
  if (pattern.maxWords) {
    parts.push(`${words} words (≤${pattern.maxWords} expected)`);
  }

  return parts.join('; ');
}
