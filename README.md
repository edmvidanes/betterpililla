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

The Community Atlas homepage uses a fluid place-name masthead, a three-photo strip, search with service-office badges, quick links, grouped browsing, a history timeline, a map and source transparency. Quick links sit immediately below search. Components and responsive styles live in `src/features/home/`; global navigation and search remain shared with the rest of the portal.

GSAP ScrollSmoother adds eased desktop scrolling and integrates with the homepage's ScrollTrigger effects. Touch scrolling remains native, and reduced-motion preferences disable smoothing.

Press Ctrl+K (or Command+K on macOS) from any page, or use the header search control, to open live search. Matching portal pages appear before captured records; arrow keys select results and Escape closes the palette. The full search page uses the same ranking.

The demographics section pairs locally hosted Cavinti photography with population bars from the current data pack. Year links lead to the original sources; the PSA index-only 2024 figure and the secondary PhilAtlas figures remain separately labeled. The section's Caliraya Lake photograph is by [Judgefloro](https://commons.wikimedia.org/wiki/File:9720Kanluran_Talaongan,_Cavinti,_Laguna_09.jpg), CC0 1.0, resized and converted to WebP.
The Sambalilo Festival photograph is credited to Cavinti Tourism by [The Filipino Rambler](https://www.thefilipinorambler.com/2025/02/cavinti-laguna-a-journey-into-the-art-of-sambalilo-weaving-and-beyond.html). The user reports permission from Cavinti Tourism for its photographs. This permission is not an open license; the photograph was resized and converted to WebP.
The cave photograph comes from the [Cavinti Underground River and Caves Complex website](https://cavintiunderground.wixsite.com/cavinticave), whose contact page lists the municipal administrator. Converted to WebP; user reports permission from Cavinti Tourism.
Photographs are real Cavinti images hosted locally under `public/images/cavinti/`, not AI-generated scenery. Configure their paths, dimensions, bilingual alternative text, source URLs, authors and licenses in `lgu.homepagePhotos`. The native photo-credit disclosure links to each source and license and identifies resizing, WebP conversion and display cropping.

- [Caliraya Lake at Kanluran Talaongan](https://commons.wikimedia.org/wiki/File:9720Kanluran_Talaongan,_Cavinti,_Laguna_10.jpg), Judgefloro — [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- [Cavinti/Pagsanjan Falls](https://commons.wikimedia.org/wiki/File:Pagsanjan_Falls_-_Pagsanjan,_Laguna_1.jpg), Kathleen Mae Tugano — [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The resized WebP derivative remains under that license.
- [Cavinti Bridge II in Tibatib](https://commons.wikimedia.org/wiki/File:38Tibatib_Poblacion,_Cavinti,_Laguna_08.jpg), Judgefloro — [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

Generated design proposals under `.impeccable/proposals/` are development references only and are not deployed. Another municipality must supply its own licensed photographs and credits alongside its data pack.

### History, public services and geography

The history layout pairs a chronological timeline with contextual notes. Its claims link to the [NHCP Church of Cavinti marker](https://philhistoricsites.nhcp.gov.ph/registry_database/church-of-cavinti/), [Act No. 1240](https://issuances-library.senate.gov.ph/legislative-issuance/act-no-1240) and [Act No. 1712](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/28/16606). The 1619 ecclesiastical date is not presented as a verified municipal founding date.

Service badges beneath search link to offices actually present in `emergency-contacts.json`. They do not invent Citizens’ Charter procedures, requirements, fees or current availability. Source and live-validation limitations remain available on the linked office pages.

The interactive map uses MapLibre GL and [OpenFreeMap](https://openfreemap.org/quick_start/) vector tiles. It loads the map engine only when approaching the viewport, uses cobalt water and pale-blue land, retains provider attribution and supports zoom/reset without hijacking ordinary page scrolling. Its heading and geographic description remain accessible but are visually hidden. WebGL and an internet connection are required; failures display a localized message rather than a fake map.

Set the approximate town center and initial zoom in `lgu.mapView`. The basemap is OpenStreetMap geographic context, not verified official municipal geometry. Third-party style, font and tile requests expose the visitor’s IP address to OpenFreeMap; the privacy page discloses this behavior.

## Evidence and downloads

`data/cavinti/` is the reviewed canonical evidence pack. `public/data/` is ignored, atomically generated output, never a second editable source. The browser reads generated files only. Public downloads include JSON, CSV, JSON Schema, source register, capture dates, technical row counts, hashes, rights and coverage notes. Nested CSV columns contain JSON; the download manifest identifies those columns. **Import CSV columns as text**: exact source strings are preserved and may begin spreadsheet formula characters.

The snapshot preserves all 406 ordinance and 4,492 resolution source rows, including duplicates. Titles, index metadata and attachment/copy-request links are not reviewed legal summaries. Some missing committee/publication fields are `null`. At least one index link points to a contact/copy-request page rather than a PDF; the site preserves and labels non-PDF links. These evidence details take precedence over broader wording in the original research plan.

The current barangay roster is unresolved. Population has separately labeled secondary/index-only claims. Official-page phone numbers are **not live-validated**. Empty Charter responses, inaccessible fiscal sources, incomplete procurement and project registers, missing official geometry and unavailable advisory feeds are coverage states, not zero-value dashboards.

Additional primary-source collection attempts and bounded, unreviewed PDF transcription are in `research-updates.json`; they do not replace established facts. No PDF archive, social comments, household CBMS or patient records are mirrored.

The 2026-10-27 research adds the legislative office's published contact details, a dated school-garden evaluation, two BSP opinions on proposed municipal borrowing, and a historical national road appropriation. Contact details are not live-validated; borrowing proposals do not establish loan drawdown or debt, and an appropriation does not establish spending or construction. None of these records is a complete directory, budget, debt register, school roster, or project inventory.

### Public information pages

Services link to the official Citizens’ Charter, captured office contacts, national civil-registration guidance and selected historical service-related ordinance titles. National guidance is not a current local service catalogue. Facilities include an undated DepEd Laguna elementary directory and high-school leads; neither is a verified complete current roster. Advisories link to official weather and hazard resources, not a live alert feed. Government and officials use searchable directory rows; contact pages expose tap-to-call numbers with their live-validation limit.

Demographics offers a keyboard-operable population chart with year selection and recent/all-captured-year ranges. Points retain their published reference years and source provenance; connecting lines do not supply intermediate values. The source-published growth rate remains separate. Finance includes 72 description matches from the CC0-labeled BetterGov DPWH dataset, downloaded 2026-10-27 at revision `648ea96af4f7625d606fda0b78803917913a26b7`. The underlying capture date is unknown; statuses may be stale, some contracts span municipalities, and budgets are not Cavinti-only expenditure. This text match is not a complete or independently verified project register.

The officials page also presents 81 historical Cavinti election-winner claims from OpenHalalan, cataloged by BetterGov. The 2010 extract contains only two rows; 2004–2013 provenance is undocumented, and historical election results do not establish tenure. Leung et al. (2026), [OpenHalalan](https://doi.org/10.5281/zenodo.17783099), [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/); the election subset and its download remain under ODbL.

Finance and municipal income show 2009–2016 regular-income figures from PhilAtlas, attributed there to BLGF; these historical figures are not budgets or expenditure. BetterGov's BLGF spreadsheets returned HTTP 403, so the original fiscal series was not checked. Procurement lists 20 historical BetterGov PhilGEPS browser leads: amounts are rounded, source dates have unverified meaning, and records were not checked against primary notices or proven paid or complete.

Legislation keeps search, type and year visible; number, author, topic, date-range and source filters expand under “More filters”. Active advanced URL filters open that section automatically; reload and locale switching preserve them. Open data and sources have local search, compact records, downloads and expandable provenance. Source citations retain separate localized verification, access and freshness states.

Barangays provides searchable population bars with 2015/2020 selection, name/population sorting and linked detail pages. Municipal and secondary roster claims remain separate: Mahipon and Mahipon-Lumot are not aliases, and a name without a population record never inherits another entry’s value. Map & geography reuses the homepage’s styled MapLibre map, alongside published neighbors, coordinate ranges and the official-boundary limitation.

Page components live in `src/features/` with shared styles in `civic.css`. New interface copy belongs in the typed `civic-en.json` / `civic-fil.json` catalogs; legislative messages stay in their existing catalogs. Source-original wording remains unchanged and language-marked. `e2e/civic.spec.ts` covers population/evidence selection, intersecting directory filters and advanced legislative deep links.

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

Project-authored code is licensed under [MIT](LICENSE); project-authored documentation is licensed under [CC BY 4.0](LICENSE-DOCS). These licenses do not cover upstream source records, government documents, photographs, map layers, dependencies or other third-party content; their source-specific terms and attribution requirements remain in force. Unknown source terms do not grant reuse rights. See the [operational data policy](docs/sources-and-data-policy.md) and each generated dataset manifest.

The scope and original acceptance criteria are in [CAVINTI_TEMPLATE_PLAN.md](docs/CAVINTI_TEMPLATE_PLAN.md).
