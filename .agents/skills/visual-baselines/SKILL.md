---
name: visual-baselines
description: Update or debug Playwright visual regression baselines and store screenshots for the SemBeacon app. Use when yarn test:visual fails or after an intended UI change.
---

# Visual baselines

Baselines are in `tests/e2e/visual/__screenshots__` and only valid when rendered in the
Playwright Docker image used by CI (fonts differ per machine). Never regenerate them on the host.

1. Confirm the UI change is intended. Run `yarn test:visual` (needs Docker) and inspect the diff
   images in `test-results/`.
2. Regenerate: `yarn test:visual:update` (rewrites all baselines, light and dark, Android and iOS projects).
3. Review every changed PNG; commit only the ones that match the intended change.
4. `scripts/playwright-docker.js` derives the image tag from the installed `@playwright/test`;
   the hard-coded tag in `.github/workflows/ci.yml` must be bumped together with that dependency.

Flakiness: relative times are masked and the beacon list is sorted by RSSI then UID. New
time- or order-dependent UI must be masked or made deterministic in the test, not tolerated with
a higher diff threshold.

Store screenshots (`yarn screenshots`, output `resources/screenshots`) are separate from baselines
and are not committed from a local run unless the task asks for it.
