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
