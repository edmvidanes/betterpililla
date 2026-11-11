# Contributing to BetterPililla

Help make public information about **Pililla, Rizal** easier to find and verify. We welcome code, design, accessibility, English/Filipino translations and public-record research.

## Start here

1. Check [open issues](https://github.com/edmvidanes/betterpililla/issues) and the [backlog](docs/BACKLOG.md).
2. For data work, read the [collection tracker](docs/collection/PROGRESS.md) and [source policy](docs/sources-and-data-policy.md).
3. Open an issue for substantial changes so scope and sources can be discussed.
4. Fork the repository, create a branch and submit a focused pull request.

## Local setup

Use Node.js 24 and npm:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 4174 --strictPort
```

For a production preview, use `npm run build` and `npm run local:serve`. Stop another local process using 4174 first, or choose another port. The repository does not require server credentials.

Before opening a pull request, run checks relevant to the change:

```sh
npm run data:validate
npm run test:data
npm run lint
npm run build
```

For behavior or layout changes, also run `npm run test:e2e` and inspect desktop/mobile layouts. Install the browser with `npx playwright install chromium`, or set `PLAYWRIGHT_EXECUTABLE_PATH` to an installed Edge/Chrome executable. Set `PLAYWRIGHT_BASE_URL` when checking an existing preview.

## Public-record contributions

- Include the publisher, public URL, municipality, reference period, access date and exact page/table or record identifier.
- Keep original wording, units and dated evidence. Explain translations and derived values.
- Use primary government sources where possible. Clearly distinguish historical archives from current records.
- Keep unknown values unknown. A dead URL does not justify invented content, and missing data is not zero.
- Edit canonical records under `data/pililla/`; generated `public/data/` files are not hand-edited. Curated datasets under `src/data/` also need provenance.
- Do not submit credentials, private contacts, personal case files or unlicensed media. Public hotline numbers still need current confirmation.

Use the data-correction, missing-record or project-observation issue form where applicable. Record requests and observations are reviewed; they do not automatically change published facts.

## Pull requests and community

Describe the problem, changes, source evidence and checks performed. Include screenshots for visual changes. Keep commits focused and under **150 added/deleted text lines each**. Maintainers review changes before merging and deploying; contributors do not need production access.

Follow the [Code of Conduct](CODE_OF_CONDUCT.md). Code contributions use the existing MIT license; project documentation uses CC BY 4.0. Preserve third-party licenses and attribution.
