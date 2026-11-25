#!/usr/bin/env node
// MIT. Clean-room tarball conformance smoke test (runtime ESM + tsc --noEmit on every exported type).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const tscBin = resolve(root, 'node_modules/typescript/bin/tsc');

execFileSync(npmBin, ['run', 'build'], { cwd: root, stdio: 'inherit' });

const workDir = mkdtempSync(join(tmpdir(), 'portaless-plugin-sdk-smoke-'));
const consumerDir = join(workDir, 'consumer');
mkdirSync(consumerDir, { recursive: true });

try {
  const packOut = execFileSync(npmBin, ['pack', '--pack-destination', workDir, '--silent'], {
    cwd: root,
    encoding: 'utf8',
  });
  const filename = packOut
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .findLast((l) => l.endsWith('.tgz'));
  if (!filename) throw new Error(`No tarball produced: ${packOut}`);
  const tarballPath = join(workDir, filename);

  // Verify MIT LICENSE is inside the tarball
  const licContent = execFileSync('tar', ['-xOf', tarballPath, 'package/LICENSE'], { encoding: 'utf8' });
  if (!licContent.includes('MIT License')) {
    throw new Error('Tarball package/LICENSE does not contain MIT License');
  }

  writeFileSync(
    join(consumerDir, 'package.json'),
    JSON.stringify({ name: 'plugin-sdk-consumer-probe', private: true, type: 'module', version: '0.0.0' }, null, 2) + '\n',
    'utf8',
  );
  execFileSync(npmBin, ['install', tarballPath, '--no-audit', '--no-fund'], { cwd: consumerDir, stdio: 'inherit' });

  // 1. Runtime ESM verification
  const runtimeScript = `
    import { capabilityRegistry, listCapabilitiesByCategory, validateManifest, PLUGIN_CAPABILITY_IDS } from '@portaless/plugin-sdk';
    const total = Object.keys(capabilityRegistry).length;
    if (total !== 16) throw new Error('Expected 16 capabilities, got ' + total);
    if (PLUGIN_CAPABILITY_IDS.length !== 12) throw new Error('Expected 12 plugin ids, got ' + PLUGIN_CAPABILITY_IDS.length);
    if (typeof listCapabilitiesByCategory() !== 'object') throw new Error('listCapabilitiesByCategory failed');
    const ok = validateManifest({ name: 'x', version: '1', entry: 'i.js', requestedCapabilities: [{ id: 'content:read', reason: 'reads content' }], runtime: 'javascript' });
    if (!ok.valid) throw new Error('valid manifest rejected: ' + JSON.stringify(ok.errors));
    const bad = validateManifest({ name: 'x', version: '1', entry: 'i.js', requestedCapabilities: [{ id: 'network:fetch', reason: 'no hosts' }], runtime: 'javascript' });
    if (bad.valid) throw new Error('invalid manifest accepted');
    console.log('[smoke:tarball] runtime surface OK:', total, 'capabilities,', PLUGIN_CAPABILITY_IDS.length, 'requestable');
  `;
  writeFileSync(join(consumerDir, 'runtime.mjs'), runtimeScript, 'utf8');
  execFileSync(process.execPath, [join(consumerDir, 'runtime.mjs')], { cwd: consumerDir, stdio: 'inherit' });

  // 2. Type-check a consumer using every exported type
  const consumerTs = `
    import {
      capabilityRegistry, listCapabilitiesByCategory, validateManifest, PLUGIN_CAPABILITY_IDS,
      type CapabilityId, type PluginCapabilityId, type CapabilityDefinition, type CapabilityRequest,
      type PluginManifest, type GrantedCapabilities, type ManifestValidationResult,
      type CapabilityHostBridge, type SandboxExecutionInput, type SandboxExecutionResult,
      type SandboxAdapter, type PluginCapabilities, type PluginFetchAllowed, type PluginEntry, type PluginEntryContext,
    } from "@portaless/plugin-sdk";

    const id: CapabilityId = "content:read";
    const pid: PluginCapabilityId = "site:admin";
    const def: CapabilityDefinition = capabilityRegistry[id];
    const byCat: Record<string, CapabilityDefinition[]> = listCapabilitiesByCategory();
    const req: CapabilityRequest = { id, reason: "reads site content" };
    const manifest: PluginManifest = { name: "m", version: "1", entry: "i.js", requestedCapabilities: [req], runtime: "javascript" };
    const v: ManifestValidationResult = validateManifest(manifest);
    const granted: GrantedCapabilities = new Set<CapabilityId>([id]);
    const entry: PluginEntry = async (_payload, ctx: PluginEntryContext) => {
      const caps: PluginCapabilities = ctx.capabilities;
      const fetcher: PluginFetchAllowed = ctx.fetchAllowed;
      return { ok: Boolean(caps && typeof fetcher === "function" && def && byCat && v && granted && pid && PLUGIN_CAPABILITY_IDS.length) };
    };
    type _Check = [CapabilityHostBridge, SandboxExecutionInput, SandboxExecutionResult, SandboxAdapter];
    export { entry };
  `;
  writeFileSync(join(consumerDir, 'consumer.ts'), consumerTs, 'utf8');
  writeFileSync(
    join(consumerDir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        noEmit: true,
        lib: ['ES2022', 'DOM'],
      },
      include: ['consumer.ts'],
    }, null, 2) + '\n',
    'utf8',
  );
  execFileSync(process.execPath, [tscBin, '-p', join(consumerDir, 'tsconfig.json')], { cwd: consumerDir, stdio: 'inherit' });
  console.log('[smoke:tarball] TypeScript consumer type-check OK.');
} finally {
  if (existsSync(workDir)) rmSync(workDir, { recursive: true, force: true });
}
