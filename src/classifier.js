/**
 * Simple heuristic-based task type classifier
 * 
 * This is intentionally basic and deterministic for v0.
 * Keywords and prompt length help guess the task type.
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

/**
 * Classify a prompt into a task type using basic heuristics
 * 
 * @param {string} prompt - The user prompt
 * @returns {string|null} - Classified task type ID or null
 */
export function classifyPrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const words = prompt.split(/\s+/).length;
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const pattern of TASK_TYPE_PATTERNS) {
    let score = 0;
    let hasMainKeyword = false;
    
    // Check keyword matches
    for (const keyword of pattern.keywords) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        score += 3;
        hasMainKeyword = true;
        break; // Only count first main keyword to avoid over-weighting
      }
    }
    
    // Skip this pattern if no main keyword matched
    if (!hasMainKeyword) {
      continue;
    }
    
    // Check code-specific keywords if applicable
    if (pattern.codeKeywords) {
      for (const keyword of pattern.codeKeywords) {
        if (lowerPrompt.includes(keyword.toLowerCase())) {
          score += 2;
          break; // Only count first code keyword
        }
      }
    }
    
    // Check word count constraint
    if (pattern.maxWords && words <= pattern.maxWords) {
      score += 1;
    } else if (pattern.maxWords && words > pattern.maxWords * 2) {
      // Penalize if way over word limit
      score -= 2;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern.id;
    }
  }
  
  // Only return a match if we have reasonable confidence (score >= 3)
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
  const lowerPrompt = prompt.toLowerCase();
  const pattern = TASK_TYPE_PATTERNS.find(p => p.id === taskType);
  
  if (!pattern) {
    return 'Unknown task type';
  }
  
  const matchedKeywords = pattern.keywords.filter(k => 
    lowerPrompt.includes(k.toLowerCase())
  );
  
  const matchedCodeKeywords = pattern.codeKeywords 
    ? pattern.codeKeywords.filter(k => lowerPrompt.includes(k.toLowerCase()))
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
