#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { route } from './router.js';

const USAGE = `
local-route - Route prompts to optimal local harness:model pairs

Usage:
  local-route "<prompt>" [options]

Options:
  --task-type <type>    Explicitly specify task type (bypasses classification)
  --fallback <mode>     Fallback behavior: reject | frontier (default: reject)
  --dry-run            Print routing decision without executing
  -h, --help           Show this help message

Examples:
  local-route "Write a hello world in Python" --dry-run
  local-route "Explain what a linked list is" --task-type explain_simple
  local-route "Summarize this text" --fallback reject

Task Types:
  tiny_code_snippet, rewrite_short_prose, classify_label,
  extract_structured, explain_simple, unit_test_stub
`;

async function main() {
  try {
    const { values, positionals } = parseArgs({
      options: {
        'task-type': { type: 'string' },
        'fallback': { type: 'string', default: 'reject' },
        'dry-run': { type: 'boolean', default: false },
        'help': { type: 'boolean', short: 'h', default: false }
      },
      allowPositionals: true
    });

    if (values.help) {
      console.log(USAGE);
      process.exit(0);
    }

    const prompt = positionals[0];
    if (!prompt) {
      console.error('Error: prompt is required\n');
      console.log(USAGE);
      process.exit(1);
    }

    // Validate fallback option
    if (!['reject', 'frontier'].includes(values.fallback)) {
      console.error(`Error: fallback must be 'reject' or 'frontier', got '${values.fallback}'`);
      process.exit(1);
    }

    // Route the prompt
    const result = await route(prompt, {
      taskType: values['task-type'],
      fallback: values.fallback,
      dryRun: values['dry-run']
    });

    // Print routing decision
    console.log('\n=== Routing Decision ===');
    console.log(`Prompt: "${prompt}"`);
    if (result.classifiedTaskType) {
      console.log(`Classified Task Type: ${result.classifiedTaskType}`);
    }
    if (result.taskType) {
      console.log(`Task Type: ${result.taskType}`);
    }
    
    if (result.route) {
      console.log(`\nSelected: ${result.route.cell || (result.route.harness + ':' + result.route.model)}`);
      console.log(`Confidence: ${result.route.confidence}`);
      if (result.route.effort) console.log(`Effort: ${result.route.effort} (required)`);
      if (result.route.lean_prompt) console.log(`Lean prompt: required (--lean-prompt)`);
      if (result.route.flags?.length) console.log(`Flags: ${result.route.flags.join(' ')}`);
      console.log(`Reason: ${result.route.reason}`);
      
      if (values['dry-run']) {
        console.log('\n[Dry-run mode: execution skipped]');
      } else {
        console.log('\n=== Execution ===');
        console.log(result.execution.message);
        if (!result.execution.success) {
          process.exit(1);
        }
      }
    } else {
      console.log(`\nNo suitable local harness:model found`);
      console.log(`Reason: ${result.reason}`);
      
      if (values.fallback === 'frontier') {
        console.log('\nFrontier fallback is not yet wired in v0.');
        console.log('To proceed, please:');
        console.log('  1. Enable frontier in config.yaml');
        console.log('  2. Add API credentials to environment');
        console.log('  3. Wait for frontier integration in future release');
      }
      
      process.exit(1);
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
