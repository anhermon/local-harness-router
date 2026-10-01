import { test } from 'node:test';
import assert from 'node:assert';
import { classifyPrompt, explainClassification } from '../src/classifier.js';

test('classifyPrompt - tiny_code_snippet', () => {
  const prompts = [
    'Write a Python function that returns hello world',
    'Create a JavaScript script to add two numbers',
    'Implement a function in Go to reverse a string'
  ];
  
  for (const prompt of prompts) {
    const result = classifyPrompt(prompt);
    assert.strictEqual(result, 'tiny_code_snippet', `Expected tiny_code_snippet for: ${prompt}`);
  }
});

test('classifyPrompt - explain_simple', () => {
  const prompts = [
    'Explain what a linked list is',
    'What is recursion?',
    'How does a hash table work?',
    'ELI5 what REST APIs are'
  ];
  
  for (const prompt of prompts) {
    const result = classifyPrompt(prompt);
    assert.strictEqual(result, 'explain_simple', `Expected explain_simple for: ${prompt}`);
  }
});

test('classifyPrompt - rewrite_short_prose', () => {
  const prompts = [
    'Rephrase this sentence in a professional tone',
    'Edit this text to improve clarity',
    'Polish this paragraph for readability'
  ];
  
  for (const prompt of prompts) {
    const result = classifyPrompt(prompt);
    assert.strictEqual(result, 'rewrite_short_prose', `Expected rewrite_short_prose for: ${prompt}`);
  }
});

test('classifyPrompt - classify_label', () => {
  const prompts = [
    'Classify this email as spam or not spam',
    'Categorize this product review as positive or negative',
    'Which category does this belong to: sports, tech, or politics?'
  ];
  
  for (const prompt of prompts) {
    const result = classifyPrompt(prompt);
    assert.strictEqual(result, 'classify_label', `Expected classify_label for: ${prompt}`);
  }
});

test('classifyPrompt - extract_structured', () => {
  const prompts = [
    'Extract the name and email from this text as JSON',
    'Parse the following text and return YAML',
    'Extract structured data from this document'
  ];
  
  for (const prompt of prompts) {
    const result = classifyPrompt(prompt);
    assert.strictEqual(result, 'extract_structured', `Expected extract_structured for: ${prompt}`);
  }
});

test('classifyPrompt - unit_test_stub', () => {
  const prompts = [
    'Unit test case for the add method',
    'Test stub needed for authentication'
  ];
  
  for (const prompt of prompts) {
    const result = classifyPrompt(prompt);
    assert.strictEqual(result, 'unit_test_stub', `Expected unit_test_stub for: ${prompt}`);
  }
});

test('classifyPrompt - no match returns null', () => {
  const prompts = [
    'What do you think about this?',
    'Random unrelated text',
    'xyz abc 123'
  ];
  
  for (const prompt of prompts) {
    const result = classifyPrompt(prompt);
    assert.strictEqual(result, null, `Expected null for: ${prompt}`);
  }
});

test('explainClassification returns reasonable explanation', () => {
  const prompt = 'Write a Python function to add two numbers';
  const taskType = 'tiny_code_snippet';
  const explanation = explainClassification(prompt, taskType);
  
  assert.ok(explanation.length > 0, 'Explanation should not be empty');
  assert.ok(explanation.includes('write') || explanation.includes('function') || explanation.includes('python'), 
    'Explanation should mention matched keywords');
});

test('classifyPrompt is deterministic', () => {
  const prompt = 'Explain what a binary tree is';
  
  const results = [];
  for (let i = 0; i < 10; i++) {
    results.push(classifyPrompt(prompt));
  }
  
  const allSame = results.every(r => r === results[0]);
  assert.ok(allSame, 'Classification should be deterministic');
});

test('classifyPrompt - rewrite is not tiny_code via write substring', () => {
  const prompts = [
    'Rewrite this paragraph into rewrite.md',
    'rewrite the text to be clearer',
    'Please rewrite this short prose for tone'
  ];

  for (const prompt of prompts) {
    const result = classifyPrompt(prompt);
    assert.strictEqual(result, 'rewrite_short_prose', `Expected rewrite_short_prose for: ${prompt}`);
  }
});

test('classifyPrompt - js does not match inside json', () => {
  // "json" must not fire tiny_code's codeKeyword "js"
  const prompt = 'Extract the name and email from this text as JSON';
  assert.strictEqual(classifyPrompt(prompt), 'extract_structured');

  // Prompt with write + json should not get a false js code-keyword boost
  // from the substring inside "json" (still tiny_code via "write", but
  // explanation must not list js).
  const writeJson = 'Write the answer as json only';
  assert.strictEqual(classifyPrompt(writeJson), 'tiny_code_snippet');
  const explanation = explainClassification(writeJson, 'tiny_code_snippet');
  assert.ok(!/\bjs\b/.test(explanation), `should not list js from json: ${explanation}`);
});

test('classifyPrompt - rewrite preferred over bare write when both present', () => {
  // Both patterns can match; longer keyword "rewrite" should win
  const prompt = 'Rewrite this and write it more clearly';
  const result = classifyPrompt(prompt);
  assert.strictEqual(result, 'rewrite_short_prose');
});

test('containsKeyword respects word boundaries', async () => {
  const { containsKeyword } = await import('../src/classifier.js');
  assert.strictEqual(containsKeyword('rewrite.md please', 'write'), false);
  assert.strictEqual(containsKeyword('please rewrite this', 'rewrite'), true);
  assert.strictEqual(containsKeyword('write SOLUTION.md', 'write'), true);
  assert.strictEqual(containsKeyword('return as json', 'js'), false);
  assert.strictEqual(containsKeyword('a js function', 'js'), true);
  assert.strictEqual(containsKeyword('use c++ here', 'c++'), true);
});
