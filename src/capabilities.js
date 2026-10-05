import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

/**
 * Confidence rank for routing eligibility and preference.
 * Order: high > medium > provisional > low.
 *
 * Measured / evidence-backed levels (high, medium) outrank provisional
 * ("promising; awaiting arena evaluation"). Provisional therefore does
 * *not* meet require_confidence: medium — only high and medium do.
 * Provisional qualifies when require_confidence is low.
 */
export const CONFIDENCE_RANK = {
  high: 3,
  medium: 2,
  provisional: 1,
  low: 0
};

/**
 * Load capabilities map from YAML
 */
export async function loadCapabilities() {
  const capabilitiesPath = join(ROOT_DIR, 'capabilities.yaml');
  const content = await readFile(capabilitiesPath, 'utf8');
  return YAML.parse(content);
}

/**
 * Load configuration
 */
export async function loadConfig() {
  const configPath = join(ROOT_DIR, 'config.yaml');
  const content = await readFile(configPath, 'utf8');
  return YAML.parse(content);
}

/**
 * Get all task types with given confidence level or higher
 */
export function getTaskTypesByConfidence(capabilities, minConfidence = 'high') {
  const minLevel = CONFIDENCE_RANK[minConfidence] ?? CONFIDENCE_RANK.high;
  
  const taskTypes = [];
  
  for (const entry of capabilities.entries) {
    for (const taskType of entry.task_types) {
      const level = CONFIDENCE_RANK[taskType.confidence] ?? 0;
      if (level >= minLevel) {
        taskTypes.push({
          id: taskType.id,
          harness: entry.harness,
          model: entry.model,
          confidence: taskType.confidence,
          evidence: taskType.evidence,
          notes: taskType.notes
        });
      }
    }
  }
  
  return taskTypes;
}

/**
 * Find best route for a given task type
 */
export function findRouteForTaskType(capabilities, taskType, minConfidence = 'high') {
  const minLevel = CONFIDENCE_RANK[minConfidence] ?? CONFIDENCE_RANK.high;
  
  let bestRoute = null;
  let bestLevel = -1;
  
  for (const entry of capabilities.entries) {
    for (const tt of entry.task_types) {
      if (tt.id === taskType) {
        const level = CONFIDENCE_RANK[tt.confidence] ?? 0;
        if (level >= minLevel && level > bestLevel) {
          bestRoute = {
            harness: entry.harness,
            model: entry.model,
            taskType: tt.id,
            confidence: tt.confidence,
            evidence: tt.evidence,
            notes: tt.notes
          };
          bestLevel = level;
        }
      }
    }
  }
  
  return bestRoute;
}

/**
 * Check if a task type is explicitly marked as not suitable
 */
export function isNotSuitable(capabilities, taskType) {
  for (const entry of capabilities.entries) {
    if (entry.not_suitable && entry.not_suitable.includes(taskType)) {
      return true;
    }
  }
  return false;
}
