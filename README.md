# BetterCavinti

Independent, bilingual civic portal and reusable single-LGU static template. **Not an official government website.** React, Vite, TypeScript, Tailwind and Kapwa; no runtime API, database, authentication, analytics or scheduled scraper.

## Run

Use Node.js 24 LTS and npm. Install with `npm ci`.

```sh
npm run dev
npm run build
npm run preview
npm run data:validate
npm run data:coverage -- --lgu cavinti
npm run test:data
npm run test:e2e
npm run lint
```

`dev` and `build` first validate and publish canonical data. Build emits portable `dist/{en,fil}/…/index.html` entries for the route inventory and each captured searchable record, plus `404.html`. Deploy **all of `dist/`**, including `data/` and nested entry pages. A directory-index static host can serve known deep links without SPA rewrites. Configure its custom 404 document to use `404.html` for unknown URLs; otherwise its own 404 is shown. Vite preview provides the local fallback.

For a subdirectory deployment, use an absolute, slash-terminated base:

```sh
SITE_BASE=/bettercavinti/ npm run build
SITE_BASE=/bettercavinti/ npm run preview
```

## Landing page, photographs and map

The Community Atlas homepage uses a fluid place-name masthead, a three-photo strip, search, quick links, grouped browsing, a history timeline, service highlights, a map and source transparency. Quick links sit immediately below search. Components and responsive styles live in `src/features/home/`; global navigation and search remain shared with the rest of the portal.

Photographs are real Cavinti images hosted locally under `public/images/cavinti/`, not AI-generated scenery. Configure their paths, dimensions, bilingual alternative text, source URLs, authors and licenses in `lgu.homepagePhotos`. The native photo-credit disclosure links to each source and license and identifies resizing, WebP conversion and display cropping.

- [Caliraya Lake at Kanluran Talaongan](https://commons.wikimedia.org/wiki/File:9720Kanluran_Talaongan,_Cavinti,_Laguna_10.jpg), Judgefloro — [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- [Cavinti/Pagsanjan Falls](https://commons.wikimedia.org/wiki/File:Pagsanjan_Falls_-_Pagsanjan,_Laguna_1.jpg), Kathleen Mae Tugano — [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The resized WebP derivative remains under that license.
- [Cavinti Bridge II in Tibatib](https://commons.wikimedia.org/wiki/File:38Tibatib_Poblacion,_Cavinti,_Laguna_08.jpg), Judgefloro — [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

Generated design proposals under `.impeccable/proposals/` are development references only and are not deployed. Another municipality must supply its own licensed photographs and credits alongside its data pack.

### History, public services and geography

The history layout pairs a chronological timeline with contextual notes. Its claims link to the [NHCP Church of Cavinti marker](https://philhistoricsites.nhcp.gov.ph/registry_database/church-of-cavinti/), [Act No. 1240](https://issuances-library.senate.gov.ph/legislative-issuance/act-no-1240) and [Act No. 1712](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/28/16606). The 1619 ecclesiastical date is not presented as a verified municipal founding date.

Service highlights are icon-led links to offices actually present in `emergency-contacts.json`. They do not invent Citizens’ Charter procedures, requirements, fees or current availability. Source, capture date and the live-validation limitation remain visible.

The interactive map uses MapLibre GL and [OpenFreeMap](https://openfreemap.org/quick_start/) vector tiles. It loads the map engine only when approaching the viewport, uses cobalt water and pale-blue land, retains provider attribution and supports zoom/reset without hijacking ordinary page scrolling. Its heading and geographic description remain accessible but are visually hidden. WebGL and an internet connection are required; failures display a localized message rather than a fake map.

Set the approximate town center and initial zoom in `lgu.mapView`. The basemap is OpenStreetMap geographic context, not verified official municipal geometry. Third-party style, font and tile requests expose the visitor’s IP address to OpenFreeMap; the privacy page discloses this behavior.

## Evidence and downloads

`data/cavinti/` is the reviewed canonical evidence pack. `public/data/` is ignored, atomically generated output, never a second editable source. The browser reads generated files only. Public downloads include JSON, CSV, JSON Schema, source register, capture dates, technical row counts, hashes, rights and coverage notes. Nested CSV columns contain JSON; the download manifest identifies those columns. **Import CSV columns as text**: exact source strings are preserved and may begin spreadsheet formula characters.

The snapshot preserves all 406 ordinance and 4,492 resolution source rows, including duplicates. Titles, index metadata and attachment/copy-request links are not reviewed legal summaries. Some missing committee/publication fields are `null`. At least one index link points to a contact/copy-request page rather than a PDF; the site preserves and labels non-PDF links. These evidence details take precedence over broader wording in the original research plan.

The current barangay roster is unresolved. Population has separately labeled secondary/index-only claims. Official-page phone numbers are **not live-validated**. Empty Charter responses, inaccessible fiscal sources, incomplete procurement and project registers, missing official geometry and unavailable advisory feeds are coverage states, not zero-value dashboards.

Additional primary-source collection attempts and bounded, unreviewed PDF transcription are in `research-updates.json`; they do not replace established facts. No PDF archive, social comments, household CBMS or patient records are mirrored.

## Manual refresh

```sh
npm run data:refresh -- --lgu cavinti
```

Explicit invocation only. Structured DataTables legislation sources register `adapter: "municipal-legislation-datatables/v1"` and their `dataUrl` in the source register; source IDs are municipality-specific, not adapter selectors. The adapter follows pagination, reconciles totals, rejects filtered/incomplete/truncated captures, re-fetches **every captured page** to reject changing responses, and reuses existing row IDs. Separate duplicate occurrences remain separate. Page checksums and their ordered combined digest are validated together.

Other registered source families receive non-mutating HTTP/HTML coverage checks, or PDF/social HEAD metadata checks—not invented parsers for unavailable datasets. Robots rules and access controls are respected.

A structured refresh stages both feeds and the whole pack, validates before replacement, and preserves the last good capture on rejection. The report is written to `.cache/data-refresh/{slug}-latest.json`; `public/data/refresh-status.json` and source status metadata expose last checks and stale failures without overwriting captured records. Rebuilding reapplies the local refresh report when it exists. Canonical data is changed only on a complete successful structured refresh; review and commit the resulting source records and manifest before deployment. There is no scheduled job.

Raw upstream responses are not blanket-mirrored. Captures retain response hashes; multi-page captures also record page checksums and their documented combined digest. A canonical-file download hash is a separate checksum, not the upstream response hash.

## Configure another LGU

1. Provide `data/{slug}/` using the same versioned schemas and dataset-manifest contract. Include registered sources, evidence, coverage gaps and complete structured feed captures. Do not copy Cavinti facts into another municipality.
2. Select it in `src/config/lgu.ts`: identity, data slug, repository, official URL, default locale and source-role IDs. No feature component needs municipal names or URLs. The source adapters discover feeds from registered source metadata, not municipality names.
3. Run `npm run data:validate`, `npm run build` and the relevant regressions. `data:refresh -- --lgu {slug}` can target a pack independently; the selected site build still uses `lgu.slug`.
4. Update repository issue-template contact routing and project metadata for that deployment. No multitenant runtime or second application fork is needed.

Existing packs describe source-specific research evidence; runtime validators and the normalized public portal contract share TypeScript types under `src/domain/`. A new source family needs a small explicit adapter plus completeness/error behavior; an HTTP success alone does not create publishable service, finance, award, project or advisory records.

## Translation and accessibility

Locale-prefixed URLs (`/en/`, `/fil/`) preserve the route and query when switching languages. Interface catalogs live under `src/i18n/catalogs/`; source-original names, quotations, law titles, units and period strings remain unchanged. Missing source translations are explicitly labeled. Never publish machine-translated legal language, eligibility, fees, service steps or emergency instructions as reviewed/official: store original and translation separately with reviewer/date before publication.

Semantic landmarks, skip navigation, native labeled controls, visible keyboard focus, responsive navigation and locale-aware number/date formatting are provided. Report accessibility barriers with URL, browser and reproduction steps; do not include sensitive data. Manual browser smoke verification supplements regression tests; this is not a claim of formal accessibility certification.

## Contribution and rights

Use the public [GitHub issue forms](https://github.com/klnwlks/bettercavinti/issues/new/choose). Corrections require record ID, field, proposed value and evidence. Missing records and project observations have separate forms. Project observations require ID, date/time, public location and evidence URL, and never mutate published progress. A GitHub account is required. Public issue review and repository merge remain the publication boundary.

Code and project-authored schema/normalization/documentation: **CC0-1.0**. Upstream content keeps its own terms and attribution; unknown rights do not become CC0. See [the operational data policy](docs/sources-and-data-policy.md), [LICENSE](LICENSE) and each generated dataset manifest.

The scope and original acceptance criteria are in [CAVINTI_TEMPLATE_PLAN.md](docs/CAVINTI_TEMPLATE_PLAN.md).
