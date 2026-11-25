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

---

## What this repo is

- **The capability catalog** (`capabilityRegistry`) and the IDs a manifest may request (`PLUGIN_CAPABILITY_IDS`).
- **Manifest validation** (`validateManifest`) — same rules the Portaless core enforces.
- **The typed sandbox contract:** `PluginManifest`, `CapabilityRequest`, `GrantedCapabilities`, `CapabilityHostBridge`, `SandboxExecutionInput`, `SandboxExecutionResult`, `SandboxAdapter`, and the runtime globals (`PluginEntry`, `PluginCapabilities`, `PluginFetchAllowed`).

## What this repo is not

- It has **zero runtime dependencies** and does **not** import `@portaless/plugin-sandbox` or any AGPL-3.0 code. Equivalence with the core is guaranteed by contract tests in [`geroiloyola/portaless`](https://github.com/geroiloyola/portaless).
- It ships **no sandbox engine or plugin runtime**: the isolate sandbox and Permissions Center live in Portaless core.

---

## Roadmap (`portaless-plugin-sdk`)

- `[x]` Standalone MIT package `@portaless/plugin-sdk` `v0.1.0` compiled to `dist/` (`ESM .js` + `.d.ts`) with automated release tarballs.
- `[ ]` Stabilize the capability surface toward `v1.0.0` as Portaless core wires the remaining five `501 NOT_CONFIGURED` plugin capabilities (`media:*`, `commerce:*`, `site:admin`).
- `[ ]` Add typed helper utilities for signed plugin manifest authoring (ERRATA E-15).

---

## Development & Verification

```sh
npm ci
npm run build
npm test
npm run verify:license
npm run smoke:tarball
```

## Ecosystem (5 connected gears)

| Repository | Role | License |
|---|---|---|
| [`verared/vera-trust-spec`](https://github.com/verared/vera-trust-spec) | Normative specification, schemas & conformance vectors (`@verared/spec`) | **CC BY 4.0** |
| [`verared/vera-trust-stack`](https://github.com/verared/vera-trust-stack) | Neutral reference implementation (`@verared/*`, L0-net/L1/L2) | **Apache-2.0** |
| **`geroiloyola/portaless-plugin-sdk`** *(this repo)* | Third-party plugin types, manifest validator & capability catalog (`@portaless/plugin-sdk`) | **MIT** |
| [`geroiloyola/portaless-templates`](https://github.com/geroiloyola/portaless-templates) | Official fictional demo profile, templates, SVGs & live demo (`@portaless/templates`) | **CC0-1.0** |
| [`geroiloyola/portaless`](https://github.com/geroiloyola/portaless) | Sovereign reference CMS node (`starter` default) | **AGPL-3.0-or-later** |

## License

MIT — see [`LICENSE`](./LICENSE). Portaless core is `AGPL-3.0-or-later`; see [licensing-boundaries.md](https://github.com/geroiloyola/portaless/blob/main/docs/architecture/licensing-boundaries.md).
