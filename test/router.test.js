import { test } from 'node:test';
import assert from 'node:assert';
import { findRouteForTaskType, getTaskTypesByConfidence, isNotSuitable } from '../src/capabilities.js';

// Mock capabilities for testing
const mockCapabilities = {
  version: 1,
  updated_at: '2026-09-29T00:00:00Z',
  policy: {
    quality_bar: 'high',
    min_runs: 2,
    confidence_levels: {
      high: 'test',
      provisional: 'test',
      medium: 'test',
      low: 'test'
    }
  },
  entries: [
    {
      harness: 'opencode',
      model: 'ollama/qwen2.5:3b-instruct',
      task_types: [
        {
          id: 'tiny_code_snippet',
          confidence: 'high',
          evidence: ['run-001', 'run-002'],
          notes: 'Test note with evidence'
        },
        {
          id: 'explain_simple',
          confidence: 'provisional',
          evidence: [],
          notes: 'Pending evidence'
        },
        {
          id: 'rewrite_short_prose',
          confidence: 'medium',
          evidence: [],
          notes: 'Needs validation'
        }
      ],
      not_suitable: ['multi_file_refactor', 'security_review']
    }
  ]
};

test('findRouteForTaskType - finds high confidence route', () => {
  const route = findRouteForTaskType(mockCapabilities, 'tiny_code_snippet', 'high');
  
  assert.ok(route, 'Should find a route');
  assert.strictEqual(route.harness, 'opencode');
  assert.strictEqual(route.model, 'ollama/qwen2.5:3b-instruct');
  assert.strictEqual(route.taskType, 'tiny_code_snippet');
  assert.strictEqual(route.confidence, 'high');
});

test('findRouteForTaskType - respects confidence threshold', () => {
  const route = findRouteForTaskType(mockCapabilities, 'rewrite_short_prose', 'high');
  
  assert.strictEqual(route, null, 'Should not find route when confidence is below threshold');
});

test('findRouteForTaskType - finds medium confidence when allowed', () => {
  const route = findRouteForTaskType(mockCapabilities, 'rewrite_short_prose', 'medium');
  
  assert.ok(route, 'Should find route with medium confidence');
  assert.strictEqual(route.confidence, 'medium');
});

test('findRouteForTaskType - returns null for unknown task type', () => {
  const route = findRouteForTaskType(mockCapabilities, 'unknown_task', 'high');
  
  assert.strictEqual(route, null, 'Should return null for unknown task type');
});

test('getTaskTypesByConfidence - filters by confidence', () => {
  const highTasks = getTaskTypesByConfidence(mockCapabilities, 'high');
  
  assert.ok(highTasks.length >= 1, 'Should have at least 1 high confidence task');
  assert.ok(highTasks.every(t => t.confidence === 'high'), 'All tasks should be high confidence');
});

test('getTaskTypesByConfidence - includes medium when threshold is medium', () => {
  const mediumTasks = getTaskTypesByConfidence(mockCapabilities, 'medium');
  
  assert.ok(mediumTasks.length >= 2, 'Should include high, provisional and medium tasks');
  assert.ok(mediumTasks.some(t => t.confidence === 'medium'), 'Should include medium tasks');
  assert.ok(mediumTasks.some(t => t.confidence === 'high'), 'Should include high tasks');
  assert.ok(mediumTasks.some(t => t.confidence === 'provisional'), 'Should include provisional tasks');
});

test('isNotSuitable - identifies unsuitable tasks', () => {
  assert.ok(isNotSuitable(mockCapabilities, 'multi_file_refactor'), 'Should identify multi_file_refactor as not suitable');
  assert.ok(isNotSuitable(mockCapabilities, 'security_review'), 'Should identify security_review as not suitable');
  assert.ok(!isNotSuitable(mockCapabilities, 'tiny_code_snippet'), 'Should not mark tiny_code_snippet as not suitable');
});
