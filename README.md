# `@portaless/plugin-sdk`

MIT-licensed public surface for **third-party Portaless plugin authors**. Import
it into a closed-source or open-source plugin without pulling in any AGPL-3.0 code.

## Install via GitHub Release Tarball (No Registry Token Required)

```sh
npm install https://github.com/geroiloyola/portaless-plugin-sdk/releases/download/v0.1.0/portaless-plugin-sdk-0.1.0.tgz
```

```ts
import {
  validateManifest,
  capabilityRegistry,
  PLUGIN_CAPABILITY_IDS,
  type PluginManifest,
  type PluginEntry,
} from "@portaless/plugin-sdk";

const manifest: PluginManifest = {
  name: "my-plugin",
  version: "1.0.0",
  entry: "index.js",
  requestedCapabilities: [
    { id: "content:read", reason: "Reads pages to generate a summary." },
  ],
  runtime: "javascript",
};

const { valid, errors } = validateManifest(manifest);
```

A plugin entry receives injected globals, declared here as `PluginEntry`:

```ts
const entry: PluginEntry = async (payload, { capabilities, fetchAllowed, console }) => {
  const pages = await capabilities.readContent({});
  console.log("pages", pages);
  return { ok: true };
};
```

## What this package is

- **The capability catalog** (`capabilityRegistry`) and the IDs a manifest may request (`PLUGIN_CAPABILITY_IDS`).
- **Manifest validation** (`validateManifest`) — same rules the Portaless core enforces.
- **The typed sandbox contract:** `PluginManifest`, `CapabilityRequest`, `GrantedCapabilities`, `CapabilityHostBridge`, `SandboxExecutionInput`, `SandboxExecutionResult`, `SandboxAdapter`, and the runtime globals (`PluginEntry`, `PluginCapabilities`, `PluginFetchAllowed`).

## What this package is not

- It has **zero runtime dependencies** and does **not** import `@portaless/plugin-sandbox` or any AGPL-3.0 code. Equivalence with the core is guaranteed by contract tests in [`geroiloyola/portaless`](https://github.com/geroiloyola/portaless).
- It ships no sandbox engine: the sandbox runtime lives in Portaless core.

## Development & Verification

```sh
npm ci
npm run build
npm test
npm run verify:license
npm run smoke:tarball
```

## License

MIT — see [`LICENSE`](./LICENSE). Portaless core is `AGPL-3.0-or-later`; see [licensing-boundaries.md](https://github.com/geroiloyola/portaless/blob/main/docs/architecture/licensing-boundaries.md).
