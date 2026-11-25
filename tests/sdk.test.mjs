import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  capabilityRegistry,
  listCapabilitiesByCategory,
  validateManifest,
  PLUGIN_CAPABILITY_IDS,
} from '../dist/index.js';

test('capabilityRegistry exposes 16 capabilities and 12 requestable plugin capability IDs', () => {
  assert.equal(Object.keys(capabilityRegistry).length, 16);
  assert.equal(PLUGIN_CAPABILITY_IDS.length, 12);
  const byCategory = listCapabilitiesByCategory();
  assert.equal(typeof byCategory, 'object');
  assert.ok(Object.keys(byCategory).length > 0);
});

test('validateManifest accepts valid manifests and rejects network:fetch without allowedHosts', () => {
  const ok = validateManifest({
    name: 'example-plugin',
    version: '1.0.0',
    entry: 'index.js',
    requestedCapabilities: [{ id: 'content:read', reason: 'reads site pages' }],
    runtime: 'javascript',
  });
  assert.equal(ok.valid, true, JSON.stringify(ok.errors));

  const bad = validateManifest({
    name: 'example-plugin',
    version: '1.0.0',
    entry: 'index.js',
    requestedCapabilities: [{ id: 'network:fetch', reason: 'missing allowedHosts' }],
    runtime: 'javascript',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.length > 0);
});
