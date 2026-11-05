# Pililla Water District and Rizal provincial collection

Collected on 5 November 2026. Local preview remains on port 4174.

- Public assistance: http://127.0.0.1:4174/en/services/public-contacts
- Water district: http://127.0.0.1:4174/en/services/water-district
- Phase progress: http://127.0.0.1:4174/en/collection-plan#provider-progress

Pililla Water District is a separate GOCC. Provincial records belong to Rizal province. Neither source replaces Pililla municipal charter, finance, elected-official or PSA datasets.

## Collection results

| Evidence | Result |
| --- | --- |
| PRWD documents | 23: 16 PDFs, two DOCX forms and five XLSX workbooks; 452 PDF pages |
| Provincial documents | 44 PDFs; 382 pages |
| District charter | 2023 third edition, 53 pages, 13 external services; 2021 edition archived |
| Rates | April 2026 announcement and four meter-size sheets; 20 tariff rows with source ranges |
| Public contacts | Four source-listed hotline entries and 15 selected provincial offices |
| Provincial service references | Eight services, cited to the 2025 first-edition charter |
| District announcements | 45 pages without placeholder text; dated schedules retained as archives |
| Procurement | Two PRWD documents and 34 provincial 2026 bid documents; six text-bearing provincial pages name Pililla |
| Missing downloads | 21 PRWD transparency links point to `#`; three service forms have labels without links |
| Other captures | Blank BMP waiver form, payment video, charts and advisory images |

Source inventories and extracted service/rate records are in `public/collection/providers/`. Every inventory row retains the source URL, retrieval time, HTTP status, byte count and response hash. Published dates are retained when present; upload folders are not treated as document edition dates.

Original district captures are under the folder named by `.cache/prwd/latest.txt`; additional captures are in `.cache/prwd/images`, `.cache/prwd/additional` and `.cache/prwd/media`. Provincial captures and PDF extraction are in `.cache/province/`. A local review archive is `.cache/provider-review-2026-11-05.zip`; it is not served by the website.

## Outstanding review

- Hotline images are undated. No test calls, form submissions, payment transactions or FOI requests were made.
- PRWD complaint, feedback and older satisfaction forms return 404. The working client-satisfaction form is a separate link.
- The FAQ’s office-only payment statement conflicts with the later LANDBANK video post. The LANDBANK page loads, but PRWD merchant availability and fees were not verified.
- The 2007 rate page is historical. Proposed-rate pages embed images from a different district’s development domain and were not used.
- Senior-discount processing steps sum to seven minutes; the charter prints three. Complex FOI periods also conflict within the 2025 manual.
- The pipeline bid has mismatched written/numeric ABC and two submission deadlines. The truck notice establishes an award, not delivery or payment.
- Historical financial charts lack exact data labels and an unambiguous scale multiplier. No financial totals were estimated.
- The About page prints “sixteen (18)” pumping stations; the count remains unresolved. Its 12,520 concessionaires figure is explicitly for December 2024.
- Board terms, the full creating resolution, current municipal charter and municipal finances remain outstanding.
- Provincial procurement/disclosure extraction found 138 image-only pages. The 13-page ordinance is also a scan. These need visual/transcription review and amendment checks.
- A provincial Pililla dining-list link returns 404. Visitor hours, fees and access are not inferred from tourism listings.

FOI report originals are available only in the local review archive/source cache. Public output includes their metadata and sheet names, not requester names, contacts or request-level rows.

## Validation

Production build succeeds: 58 paths in two locales. The 25 data tests and 21 browser tests pass. Tests cover tariff/source-cell reconciliation, tax rounding, withheld municipal records, broken-link behavior, phone links, source downloads, mobile layout and locale switching. Lint has five pre-existing warnings and no errors.
