# bettercavinti

bettercavinti is an independent, bilingual public-information portal for Cavinti, Laguna. It is a static site, not an official government website. The codebase can be adapted for another municipality by replacing its data and configuration.

## run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Useful checks:

```sh
npm run data:validate
npm run test:data
npm run build
npm run preview
npm run test:e2e
npm run lint
```

## stack

React 19, TypeScript, Vite, Tailwind CSS 4 and Kapwa. MapLibre GL provides the map; GSAP handles selected scroll effects. There is no runtime API, database, authentication, analytics or scheduled scraper. The site is built as static files in `dist/`.

## data

`data/cavinti/` holds the reviewed source data. `public/data/` is generated during development and builds; do not edit it. Data schemas and validation live in `data/schemas/` and `src/domain/`. Sources, capture dates, evidence and coverage gaps are part of the data—keep them with each dataset, and do not treat missing information as zero or verified fact.

### For agents adapting the data to another LGU

Treat `data/cavinti/` as an example, not as target-LGU data. Read its `dataset-manifest.json`, `source-register.json`, dataset schemas and [data policy](docs/sources-and-data-policy.md). Create the target pack under `data/{slug}/` using the same contracts. Replace its municipality-specific records, source IDs, URLs, capture dates, manifest identity, coverage and known limitations; set the target identity and source-role IDs in `src/config/lgu.ts`. Keep evidence with each claim, represent unknowns honestly, and never relabel Cavinti facts as another LGU's.

Also audit data outside the canonical pack: `src/data/cavinti-news.json` and `src/data/cavinti-other-documents.json` are separate snapshots, and the refresh command updates neither. Replace them only with reviewed target-LGU records; do not copy Cavinti records over.

After editing, run the data validation/build commands below, then run `npm run build` and review the generated changes before publishing.

To update the public data files after editing canonical data:

```sh
npm run data:validate
npm run data:build
```

Data refresh is manual and source-specific:

```sh
npm run data:refresh -- --lgu cavinti
```

Review the resulting changes before publishing.

## project files

```text
.
├── data/
│   ├── cavinti/                 # canonical Cavinti data pack
│   │   ├── schemas/             # JSON schemas for each dataset
│   │   ├── legislation/         # ordinance and resolution captures
│   │   ├── dataset-manifest.json
│   │   ├── source-register.json # source URLs, roles and capture details
│   │   └── *.json               # municipality, barangay, service and other records
│   └── schemas/                 # shared canonical data schemas
├── docs/                        # data policy and template notes
├── e2e/                         # Playwright browser tests
├── public/
│   ├── data/                    # generated data; do not edit
│   └── images/cavinti/          # locally hosted, credited photographs
├── scripts/
│   ├── data/                    # validation, generation and refresh
│   └── build-routes.ts          # static route generation
├── src/
│   ├── app/                     # routing, search and application shell
│   ├── assets/                  # imported application assets
│   ├── components/              # shared UI components
│   ├── config/lgu.ts            # selected LGU and site settings
│   ├── data/                    # data loading
│   ├── domain/                  # shared data types and status rules
│   ├── features/                # page and feature components
│   └── i18n/catalogs/           # English and Filipino interface copy
├── package.json                 # scripts and dependencies
└── vite.config.ts               # build and development server config
```

## use as a template

1. Add a complete data pack under `data/{slug}/`, following the schemas and manifest contract used by `data/cavinti/`.
2. Set its identity, data slug, repository, official URL, locale and source-role IDs in `src/config/lgu.ts`.
3. Replace the data and licensed media with material for that LGU. Do not carry Cavinti facts, contact details or photographs over as if they apply elsewhere.
4. Add and review translations in `src/i18n/catalogs/`.
5. Run `npm run data:validate` and `npm run build`, then review the site and run relevant tests.

See [docs/sources-and-data-policy.md](docs/sources-and-data-policy.md) for data and source rules. The data refresh command does not run on a schedule; only publish reviewed records. Keep source wording distinct from translations, retain provenance, and label unknown, stale or unverified information honestly.

Route-specific datasets are selected in `src/data/loaders.ts`; update that mapping when a page starts using another dataset. The search index loads on demand. Legislation listings and service leads use generated indexes; detail pages fetch the selected record separately.

For deployment, publish all of `dist/`, including generated `data/` files, nested route pages, `sitemap.xml` and `robots.txt`. The build generates canonical URLs for `https://bettercavinti.org`, localized page metadata and crawlable summaries; React renders the full pages. Search pages and the custom 404 are marked `noindex`. For a subdirectory, set a slash-terminated base, for example `SITE_BASE=/portal/ npm run build`; configure the host to serve the generated `robots.txt` at the domain root so crawlers can find the sitemap.

## licenses

Project-authored code is MIT licensed; project-authored documentation is CC BY 4.0. Third-party data, photographs, maps and other assets have separate terms. Check their attribution and reuse conditions before copying them. See [LICENSE](LICENSE) and [LICENSE-DOCS](LICENSE-DOCS).
