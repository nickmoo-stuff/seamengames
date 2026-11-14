# seamengames

Seamen Games — independent games from the high seas.

K3I.2 review preparation: [changes, screenshots, test results and publication checklist](K3I.2-REVIEW.md).
The browser game and this homepage must be published in that order, only after explicit approval.

Local check: `python -m http.server 8021 --directory .`, then `node tests/homepage.cjs` with Playwright and Chromium available. No runtime build step or third-party site dependency is added.

The review branch is local: GitHub denied its push with HTTP 403. See the handover Git bundle; neither main nor the live site was changed.
