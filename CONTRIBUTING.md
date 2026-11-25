# Contributing to `geroiloyola/portaless-plugin-sdk`

Thank you for contributing to `@portaless/plugin-sdk`.

## License and Developer Certificate of Origin (DCO)

- This repository is published under the **MIT License** (`LICENSE`).
- Every commit must include a Developer Certificate of Origin (`Signed-off-by`) trailer (`https://developercertificate.org/`):

```bash
git commit -s -m "feat(sdk): describe your change"
```

## Guardrails

1. **Zero AGPL / core dependencies:** this package must never import from `geroiloyola/portaless` internals or add runtime dependencies that taint the MIT boundary.
2. **Strict public exports:** only `.` (`dist/index.js` + `dist/index.d.ts`) is exported; `dist/` and `LICENSE` must always ship in the tarball.

## Local Checks

```bash
npm run build
npm test
npm run verify:license
npm run smoke:tarball
```
