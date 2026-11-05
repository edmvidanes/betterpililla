# Pililla public-record collection — 5 November 2026

Current tracker: [PROGRESS.md](PROGRESS.md). It itemizes 17 sections across six phases with progress bars, missing records and publication checkpoints. The collection plan was removed from the website on 6 November 2026; this report preserves the first collection pass.

| Phase | First collection pass | Remaining work |
| --- | --- | --- |
| 1. Identity and source access | Corrected the manifest and PSA source entry to Pililla, Rizal / 0405810000; checked against two primary PSA reader pages | Direct PSA requests return 403; preserve web-reader versus original-byte provenance |
| 2. Services and contacts | Located the official 2024 charter PDF; direct download timed out; no current edition established | Retrieve the charter, page-level service details and verified public office/hotline directory |
| 3. Officials and legislation | Captured the DILG-linked February 2026 directory: 10 Pililla/Rizal rows for term 2025–2028, with unique source rows, one mayor and one vice-mayor | Verify later changes and ex-officio seats; obtain SB committee orders, ordinance/resolution index and full texts |
| 4. Statistics and geography | Transcribed the PSA 2024 POPCEN table and nine barangay rows dated 31 July 2025; row sum reconciles to PSA's published municipal total | Latest PSGC XLSX, DTI profile and BLGF classification access blocked; verify land area and boundaries |
| 5. Municipal finance | Found COA's 2025 audit landing-page lead; FDPP public home and report page downloaded | COA blocked; FDPP province filter did not finish. No municipal budget, SRE or audit PDF collected |
| 6. Places, advisories, history | Captured NHCP church registry metadata and three provincial Pililla place-listing candidates | Current visitor information and advisory dates still needed; Wikipedia-derived descriptions excluded |

Seventeen direct source attempts: 7 HTTP/format captures for review, 10 blocked. A separate browser report records the unsuccessful FDPP filter. A captured folder or landing page is not a captured underlying document.

The public review queue contains source URLs, capture dates, hashes and limitations in `public/collection/`. Original HTTP responses remain in ignored `.cache/public-records/<run>/phase-<n>/` folders. Error-response hashes are labeled as response hashes. PSA reader transcription does not claim original-source byte capture.

Repeat one phase with `node scripts/collect-public-records.mjs 1` (choose 1–6). An optional second argument selects one catalog source ID. This performs valid-TLS public retrievals with bounded time and size, and does not log in, submit requests or automatically promote content to the canonical pack.

Extract the captured DILG table with `node scripts/extract-officials-review.mjs <path-to-phase-3/report.json>` after confirming the public folder title and February 2026 directory edition. The extractor checks jurisdiction, term, headers, unique rows and mayor/vice-mayor coverage; it excludes contact/address columns. Recheck edition metadata before using a future capture.

After content review of captured sources, `node scripts/export-collection-log.mjs` exports access metadata, review candidates and checked source-link statuses. Keep actual response hashes and source dates distinct from project extraction dates.

The local [request checklist](record-requests.md) supplies document scopes and periods for confirmed custodians. No email, FOI request or other message has been sent. Unresolved sections stay WorkInProgress; budget-title matches and external feeds retain their existing, separate coverage.
