import { loadCapabilities, loadConfig, findRouteForTaskType } from './capabilities.js';
import { classifyPrompt, explainClassification } from './classifier.js';

/**
 * Route a prompt to the best local harness:model
 * 
 * @param {string} prompt - The user prompt
 * @param {Object} options - Routing options
 * @param {string} [options.taskType] - Explicit task type (bypasses classification)
 * @param {string} [options.fallback='reject'] - Fallback mode: reject | frontier
 * @param {boolean} [options.dryRun=false] - Dry-run mode (no execution)
 * @returns {Promise<Object>} - Routing result
 */
export async function route(prompt, options = {}) {
  const {
    taskType: explicitTaskType = null,
    fallback = 'reject',
    dryRun = false
  } = options;

  const capabilities = await loadCapabilities();
  const config = await loadConfig();
  
  const minConfidence = config.require_confidence || 'high';
  
  // Determine task type
  let taskType = explicitTaskType;
  let classifiedTaskType = null;
  
  if (!taskType) {
    classifiedTaskType = classifyPrompt(prompt);
    taskType = classifiedTaskType;
    
    if (!taskType) {
      return {
        route: null,
        reason: 'Could not classify prompt into a known task type. Try specifying --task-type explicitly.',
        classifiedTaskType: null,
        taskType: null,
        execution: null
      };
    }
  }
  
  // Find best route
  const route = findRouteForTaskType(capabilities, taskType, minConfidence);
  
  if (!route) {
    let reason = `No local harness:model found for task type '${taskType}' with confidence >= ${minConfidence}`;
    
    if (classifiedTaskType) {
      const explanation = explainClassification(prompt, taskType);
      reason += `\nClassification reasoning: ${explanation}`;
    }
    
    return {
      route: null,
      reason,
      classifiedTaskType,
      taskType,
      execution: null
    };
  }
  
  // Build routing result
  const result = {
    route: {
      harness: route.harness,
      model: route.model,
      taskType: route.taskType,
      confidence: route.confidence,
      reason: classifiedTaskType 
        ? `Auto-classified as '${taskType}': ${explainClassification(prompt, taskType)}`
        : `Explicitly specified task type: ${taskType}`
    },
    classifiedTaskType,
    taskType,
    execution: null
  };
  
  // Execute if not dry-run
  if (!dryRun) {
    result.execution = await executeRoute(prompt, route, config);
  }
  
  return result;
}

/**
 * Execute a routed task via the selected harness
 * 
 * @param {string} prompt - The user prompt
 * @param {Object} route - Selected route
 * @param {Object} config - Configuration
 * @returns {Promise<Object>} - Execution result
 */
async function executeRoute(prompt, route, config) {
  const { harness, model } = route;
  
  // Check if harness is available
  const availableHarnesses = ['opencode', 'little-coder'];
  
  if (!availableHarnesses.includes(harness)) {
    return {
      success: false,
      message: `Harness '${harness}' is not yet wired for execution in v0.\nSupported harnesses: ${availableHarnesses.join(', ')}`
    };
  }
  
  // In v0, we don't actually execute - just provide instructions
  return {
    success: false,
    message: `Execution via ${harness}:${model} is not yet implemented in v0.

To execute manually:
  1. Ensure harness-arena is installed
  2. Run: ./arena run --harness ${harness} --model ${model} --prompt "${prompt}"
  3. Check results in ${config.arena?.runs_dir || './runs'}

Future versions will support direct execution.`
  };
}
