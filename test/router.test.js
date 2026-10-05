import { test } from 'node:test';
import assert from 'node:assert';
import { findRouteForTaskType, getTaskTypesByConfidence, isNotSuitable, CONFIDENCE_RANK } from '../src/capabilities.js';

// Mock capabilities for testing - matches dogfood promotion
const mockCapabilities = {
  version: 1,
  updated_at: '2026-09-29T08:36:00+03:00',
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
          evidence: ['20260928-231055', '20260929-081437'],
          notes: 'Promoted from dogfood evidence'
        },
        {
          id: 'extract_structured',
          confidence: 'high',
          evidence: ['20260929-081619', '20260929-083323'],
          notes: 'Promoted from dogfood evidence'
        },
        {
          id: 'rewrite_short_prose',
          confidence: 'high',
          evidence: ['20260929-082405', '20260929-083411'],
          notes: 'Promoted from dogfood evidence'
        }
      ],
      not_suitable: ['classify_label', 'explain_simple', 'unit_test_stub', 'multi_file_refactor', 'security_review']
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
  // All three promoted task types are now high confidence, so they should route
  const route = findRouteForTaskType(mockCapabilities, 'rewrite_short_prose', 'high');
  
  assert.ok(route, 'Should find route for rewrite_short_prose at high confidence (promoted)');
  assert.strictEqual(route.confidence, 'high');
});

test('findRouteForTaskType - rejects unsuitable task types', () => {
  // classify_label is in not_suitable, so should return null regardless of confidence
  const route = findRouteForTaskType(mockCapabilities, 'classify_label', 'high');
  
  assert.strictEqual(route, null, 'Should reject classify_label (marked not_suitable)');
});

test('findRouteForTaskType - finds high confidence when allowed', () => {
  // extract_structured is now high confidence (promoted)
  const route = findRouteForTaskType(mockCapabilities, 'extract_structured', 'high');
  
  assert.ok(route, 'Should find route with high confidence');
  assert.strictEqual(route.confidence, 'high');
  assert.strictEqual(route.taskType, 'extract_structured');
});

test('findRouteForTaskType - returns null for unknown task type', () => {
  const route = findRouteForTaskType(mockCapabilities, 'unknown_task', 'high');
  
  assert.strictEqual(route, null, 'Should return null for unknown task type');
});

test('getTaskTypesByConfidence - filters by confidence', () => {
  const highTasks = getTaskTypesByConfidence(mockCapabilities, 'high');
  
  assert.strictEqual(highTasks.length, 3, 'Should have exactly 3 high confidence tasks (promoted)');
  assert.ok(highTasks.every(t => t.confidence === 'high'), 'All tasks should be high confidence');
  const taskIds = highTasks.map(t => t.id);
  assert.ok(taskIds.includes('tiny_code_snippet'), 'Should include tiny_code_snippet');
  assert.ok(taskIds.includes('extract_structured'), 'Should include extract_structured');
  assert.ok(taskIds.includes('rewrite_short_prose'), 'Should include rewrite_short_prose');
});

test('getTaskTypesByConfidence - high threshold only includes high tasks', () => {
  const highTasks = getTaskTypesByConfidence(mockCapabilities, 'high');
  
  assert.strictEqual(highTasks.length, 3, 'Should have 3 high confidence tasks');
  assert.ok(highTasks.every(t => t.confidence === 'high'), 'All should be high confidence');
});

test('isNotSuitable - identifies unsuitable tasks', () => {
  assert.ok(isNotSuitable(mockCapabilities, 'multi_file_refactor'), 'Should identify multi_file_refactor as not suitable');
  assert.ok(isNotSuitable(mockCapabilities, 'security_review'), 'Should identify security_review as not suitable');
  assert.ok(isNotSuitable(mockCapabilities, 'classify_label'), 'Should identify classify_label as not suitable (flaky)');
  assert.ok(isNotSuitable(mockCapabilities, 'explain_simple'), 'Should identify explain_simple as not suitable (flaky)');
  assert.ok(isNotSuitable(mockCapabilities, 'unit_test_stub'), 'Should identify unit_test_stub as not suitable');
  assert.ok(!isNotSuitable(mockCapabilities, 'tiny_code_snippet'), 'Should not mark tiny_code_snippet as not suitable');
  assert.ok(!isNotSuitable(mockCapabilities, 'extract_structured'), 'Should not mark extract_structured as not suitable');
  assert.ok(!isNotSuitable(mockCapabilities, 'rewrite_short_prose'), 'Should not mark rewrite_short_prose as not suitable');
});

// Dogfooding 2026-10-05: with require_confidence=medium, tiny_code must prefer
// evidence-backed opencode (medium) over little-coder (provisional).
const dogfoodMediumVsProvisional = {
  version: 1,
  updated_at: '2026-10-05T09:15:00+03:00',
  policy: {
    quality_bar: 'high',
    min_runs: 2,
    confidence_levels: {
      high: 'test',
      medium: 'test',
      provisional: 'test',
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
          confidence: 'medium',
          evidence: ['20261005-090323', '20261005-085227'],
          notes: 'Demoted high→medium; evidence-backed'
        }
      ],
      not_suitable: ['extract_structured', 'rewrite_short_prose']
    },
    {
      harness: 'little-coder',
      model: 'ollama/qwen2.5:3b-instruct',
      task_types: [
        {
          id: 'tiny_code_snippet',
          confidence: 'provisional',
          evidence: ['20261001-145407'],
          notes: 'Lean-only provisional; awaiting evaluation'
        }
      ],
      not_suitable: []
    }
  ]
};

test('CONFIDENCE_RANK - medium outranks provisional', () => {
  assert.ok(CONFIDENCE_RANK.high > CONFIDENCE_RANK.medium);
  assert.ok(CONFIDENCE_RANK.medium > CONFIDENCE_RANK.provisional);
  assert.ok(CONFIDENCE_RANK.provisional > CONFIDENCE_RANK.low);
});

test('findRouteForTaskType - medium with evidence outranks provisional at medium threshold', () => {
  const route = findRouteForTaskType(dogfoodMediumVsProvisional, 'tiny_code_snippet', 'medium');

  assert.ok(route, 'Should find a route at medium threshold');
  assert.strictEqual(route.harness, 'opencode', 'Evidence-backed medium must beat provisional little-coder');
  assert.strictEqual(route.model, 'ollama/qwen2.5:3b-instruct');
  assert.strictEqual(route.confidence, 'medium');
});

test('findRouteForTaskType - provisional does not meet medium threshold', () => {
  const provisionalOnly = {
    ...dogfoodMediumVsProvisional,
    entries: [dogfoodMediumVsProvisional.entries[1]]
  };
  const route = findRouteForTaskType(provisionalOnly, 'tiny_code_snippet', 'medium');
  assert.strictEqual(route, null, 'provisional alone must not qualify at require_confidence: medium');

  const atLow = findRouteForTaskType(provisionalOnly, 'tiny_code_snippet', 'low');
  assert.ok(atLow, 'provisional should qualify at require_confidence: low');
  assert.strictEqual(atLow.harness, 'little-coder');
  assert.strictEqual(atLow.confidence, 'provisional');
});

test('getTaskTypesByConfidence - medium threshold excludes provisional', () => {
  const atMedium = getTaskTypesByConfidence(dogfoodMediumVsProvisional, 'medium');
  assert.strictEqual(atMedium.length, 1);
  assert.strictEqual(atMedium[0].harness, 'opencode');
  assert.strictEqual(atMedium[0].confidence, 'medium');

  const atLow = getTaskTypesByConfidence(dogfoodMediumVsProvisional, 'low');
  assert.strictEqual(atLow.length, 2);
});
