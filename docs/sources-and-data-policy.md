# Sources, data publication and corrections

## Publication boundary

Canonical records are reviewed in `data/{selected-lgu}/`; generated `public/data/` and `dist/data/` are not edited. Run `npm run data:validate` before publication. `npm run data:build` validates the entire pack and stages downloads/search/portal output before replacement. An invalid pack must not replace a complete generated snapshot.

Each download declares its schema, capture, source IDs, row count, canonical-file SHA-256, upstream response hashes where captured, coverage and upstream rights. A hash establishes byte identity, not factual truth. The published schemas describe the heterogeneous research evidence as well as normalized evidence/status/statistic/service contracts. Missing values remain null or absent with a source-specific explanation, never fabricated strings or zero-value civic indicators.

Source register entries preserve original source names, URLs, tiers, capture notes and formats. Normalized public source metadata adds stable verification, availability and freshness dimensions. The original descriptive notes remain accessible. Registered URLs include direct evidence routes and attachment links; source registration alone does not verify every claim in an attachment.

## Evidence quality and limits

- Primary direct retrieval, primary search-index-only leads, secondary values, unreviewed machine extraction, conflicts and unreviewed claims remain distinguishable.
- The homepage history is a selected chronology, not a complete community history. Church-history entries rely partly on secondary accounts; the 2024 population is a dated census count and the 2026 data turnover is separately sourced.
- Availability and freshness do not upgrade verification. `current-at-capture` describes capture availability, not the present legal validity of a law, current term of office or present operation of a hotline.
- Unknown role/term dates remain unknown. Do not infer a title from an honorific, directory order or committee label.
- The 2025 Cavinti returns are Rappler's partial, unofficial Comelec Media Server snapshot, not proclamations or evidence of current tenure. Percentages are of registered voters; the captured councilor list includes only the first ten displayed candidates, not the full field. Source names and party labels are retained separately from directory profiles and OpenHalalan winner claims.
- DILG's elective-official directory records the 2025–2028 term and public office contacts as of February 2026. These are separate source claims, not proof of present tenure or live contact validation; name forms are not silently merged with municipal directory records.
- Source-specific barangay lists remain competing claims. Do not merge similarly named places or declare a canonical roster until dated authoritative evidence resolves the conflict.
- Statistics require unit, reference period, geography and registered evidence. Derived civic statistics are rejected. Numeric zero is publishable only with explicit source-published zero evidence; unknown remains null with a status.
- Legislative rows retain original numbers/suffixes, dates, titles and separate duplicate occurrences. A link may be an attachment or a source-published copy-request/contact route. Neither a title nor a link verifies an enacted clause or fiscal amount.
- Public directory contacts are time-sensitive. Page retrieval is not live validation; retain the validation limitation and do not describe them as current emergency instructions.
- Search-index discoveries, procurement dates after capture, incomplete award queries and unreviewed OCR/transcriptions are leads, not completed awards or verified legal/financial facts.
- DPWH project reports retain the BetterGov snapshot and a separate dated contract API capture. API status, progress, payment fields and coordinates are source-reported, not independently verified; linked documents are not reviewed. A zero payment field does not establish that no payment was made.
- Empty inspected tables and inaccessible sources do not imply that no municipal services, spending, projects or records exist.
- The services directory searches service records and ordinance-index leads together. Detail pages distinguish unverified leads from service records and show unavailable application details as unverified. Lead topics are navigation labels, not translated legal text or confirmation that a program currently operates. Follow the original title and official document links; confirm requirements and availability with the responsible office.

## Refresh behavior

Manual `npm run data:refresh -- --lgu {slug}` only. Known structured legislative feeds have explicit pagination/completeness/parsing adapters. Other source families receive coverage checks until a genuine record adapter exists. Honor robots, rate limits and access controls; do not disable TLS verification to bypass certificate failures. PDF/social metadata checks do not scrape posts, comments or attachments.

The current structured family is explicitly registered as `adapter: "municipal-legislation-datatables/v1"` with a `dataUrl`. Municipality-specific source IDs do not select parser behavior. Every captured page is re-fetched for consistency before publication, and page-response SHA-256 values must match their ordered combined digest and manifest.

Structured captures stage before canonical/public replacement. A rejected feed keeps the last good records and writes a separate refresh report. Public source metadata and `refresh-status.json` reveal the failed check and stale state. Reports under `.cache/data-refresh/` are operational local state, not canonical replacements. A subsequent build reapplies an available local report; a clean checkout reproduces canonical evidence without that local report.

Review successful source-response changes before committing and deployment. Do not overwrite a disputed claim with a competing extraction, infer missing values, silently drop historical rows, strip number suffixes or deduplicate published source occurrences. Source checks may be current while the captured records remain old; retain both timestamps and their scopes.

## Rights and safe exports

Project-authored code is licensed under MIT, and project-authored documentation under CC BY 4.0; see [LICENSE](../LICENSE) and [LICENSE-DOCS](../LICENSE-DOCS). These licenses do not cover upstream source content or third-party dependencies. Unknown source terms are not permission to mirror full PDFs, photographs, posts or map tiles. Link to official documents; archive bounded evidence only where useful and permitted. The initial publication exports captured metadata with source-specific rights notices; it does not grant reuse rights to the full linked source documents.

CSV retains source spelling, quotes, units and nested evidence. Nested columns contain JSON and are named in `csvNestedColumns`. Import CSV as text: exact source strings may begin spreadsheet formula characters. Do not use CSV exports as executable spreadsheet input.

Never collect private profiles/posts, user reactions/comments, household CBMS, patient records or unnecessary personal phone numbers. An official source must designate a number as a public contact before it is listed. Map layers require documented provenance and license, and non-authoritative geometry must never be called an official boundary.

## Translation review

UI catalogs may be localized without changing records. Preserve original language when known; otherwise say it is unrecorded. Content translations require original text, original language, separate translated text, translation status, translator/reviewer and review date. Human review is required for eligibility, steps, legal text, fees and emergency guidance. Until then show original wording and an explicit missing/unreviewed translation label, not an invented official translation.

## Public review queue

GitHub issues are public. Correction forms request record ID, field, proposed value and a public evidence URL; project observations request project ID, observation time/location and permitted public evidence. Avoid sensitive details and unlicensed attachments. Reports are leads, not live edits. Review the primary source, retain prior evidence/change history, validate the resulting data pack and merge before publishing. The community portal and its issue queue are not official service-request or emergency channels.
