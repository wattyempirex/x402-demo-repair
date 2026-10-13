# demo-repair — reproducible demonstration repair

A minimal x402 seller with one paid route, a deliberately introduced v1/v2 envelope defect, the patch, and an acceptance test that runs against the **official** v2 client (`@x402/fetch@2.28.0`, schema from `@x402/core/schemas`).

- `server.js` — demo seller (`MODE=broken` / `MODE=fixed`), port 3402.
- `test.js` — acceptance test. Exit 1 on broken (documents the defect), exit 0 on fixed.
- `PATCH.md` — the defect, the failing test output, the diff, the passing test output, honest scope.

Pinned versions: `@x402/fetch@2.28.0`, `express@4.21.2` (see package.json). $0 to run; localhost only; no keys, no funds, no broadcast.

Purpose: pre-publication repair evidence for the rescue-402 commitment round (Caliper copy-review requirement). Demonstration, not customer traction.
