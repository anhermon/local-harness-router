#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

function oneLine(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

async function renderCapabilities() {
  // Load capabilities
  const capabilitiesPath = join(ROOT_DIR, 'capabilities.yaml');
  const content = await readFile(capabilitiesPath, 'utf8');
  const capabilities = YAML.parse(content);
  
  // Build markdown
  let md = '# Capability Map\n\n';
  md += `**Last Updated**: ${capabilities.updated_at}\n\n`;
  md += '**NOTE**: Promoted / provisional task-type rows cite harness-arena run IDs ';
  md += '(dogfood evidence; see `evidence/`). Rows without evidence render as pending. ';
  md += 'Further **high** promotions still require the quality bar ';
  md += '(PASS ≥ 0.9, ≥2 runs, human review, objective check). ';
  md += '`provisional` = promote-with-notes; ranks below medium (not auto-routed at `require_confidence: high` or `medium`).\n\n';
  
  md += '## Quality Policy\n\n';
  md += `- **Quality Bar**: ${capabilities.policy.quality_bar}\n`;
  md += `- **Minimum Runs**: ${capabilities.policy.min_runs}\n`;
  md += '- **Confidence Levels**:\n';
  for (const [level, desc] of Object.entries(capabilities.policy.confidence_levels)) {
    md += `  - **${level}**: ${desc}\n`;
  }
  md += '\n';
  
  md += '## Supported Harness:Model Combinations\n\n';
  
  for (const entry of capabilities.entries) {
    const runFlags = [];
    if (entry.effort) runFlags.push(`effort: ${entry.effort}`);
    if (entry.lean_prompt) runFlags.push('--lean-prompt');
    md += `### ${entry.harness}:${entry.model}\n\n`;
    if (runFlags.length) {
      md += `**Required run flags**: ${runFlags.map((f) => '`' + f + '`').join(', ')}\n\n`;
    }

    if (entry.notes) {
      md += `${oneLine(entry.notes)}\n\n`;
    }
    
    if (entry.task_types && entry.task_types.length > 0) {
      md += '#### Task Types\n\n';
      md += '| Task Type | Confidence | Evidence | Notes |\n';
      md += '|-----------|------------|----------|-------|\n';
      
      for (const tt of entry.task_types) {
        const evidence = Array.isArray(tt.evidence) ? tt.evidence : [];
        const evidenceCell = evidence.length > 0 
          ? evidence.map(e => `[${e}](../runs/${e})`).join(', ')
          : '⏳ pending';
        const notesCell = oneLine(tt.notes);
        md += `| \`${tt.id}\` | ${tt.confidence} | ${evidenceCell} | ${notesCell} |\n`;
      }
      md += '\n';
    }
    
    if (entry.not_suitable && entry.not_suitable.length > 0) {
      md += '#### Not Suitable For\n\n';
      md += entry.not_suitable.map(t => `- \`${t}\``).join('\n');
      md += '\n\n';
    }
  }
  
  md += '## Task Type Taxonomy\n\n';
  md += 'Current task types supported across all harnesses:\n\n';
  
  const allTaskTypes = new Set();
  for (const entry of capabilities.entries) {
    for (const tt of entry.task_types || []) {
      allTaskTypes.add(tt.id);
    }
  }
  
  md += Array.from(allTaskTypes).sort().map(t => `- \`${t}\``).join('\n');
  md += '\n\n';
  
  md += '**Not suitable for local LLMs yet**: multi-file refactor, security review, ';
  md += 'architecture design, long context research, complex debugging, tool-heavy agent loops\n\n';
  
  md += '---\n\n';
  md += '*Generated from `capabilities.yaml`. To update, edit capabilities.yaml and run `npm run render-capabilities`.*\n';
  
  // Write to file
  const outputPath = join(ROOT_DIR, 'CAPABILITIES.md');
  await writeFile(outputPath, md, 'utf8');
  
  // Also export JSON for agents
  const jsonPath = join(ROOT_DIR, 'capabilities.json');
  await writeFile(jsonPath, JSON.stringify(capabilities, null, 2), 'utf8');
  
  console.log('✓ Generated CAPABILITIES.md');
  console.log('✓ Generated capabilities.json');
}

renderCapabilities().catch(err => {
  console.error('Error rendering capabilities:', err);
  process.exit(1);
});
