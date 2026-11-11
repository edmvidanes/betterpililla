# Pililla census verification — 11 November 2026

Reviewed municipality: **Pililla, Rizal**, PSGC **0405810000**. Latest published census located: **2024 POPCEN, 72,503 people as of 1 July 2024**. This is a census count, not an estimate for 2026.

| Census | Published total | Primary source |
| --- | ---: | --- |
| 2015 | 64,812 | PSA OpenSTAT, parameter `0` of `0221A6DLPD0.px` |
| 2020 | 71,535 | PSA OpenSTAT, parameter `1` of the same table |
| 2024 | 72,503 | PSA OpenSTAT, parameter `2`; independently matches parameter `0` of `0041A6DTPH3.px` |

The [PSA CALABARZON population table](https://openstat.psa.gov.ph/PXWeb/api/v1/en/DB/1A/PO_2024/0041A6DTPH3.px) and [historical population table](https://openstat.psa.gov.ph/PXWeb/api/v1/en/DB/1A/PO_2024/0221A6DLPD0.px) returned original JSON bytes through public, read-only POST queries. Select `Geographic Location = 0405810000`, `Parameter = 0` or `0,1,2`, and response format `json`. The 2024 CSV export independently returned 72,503.

The [PSA release](https://psa.gov.ph/content/2024-census-population-popcen-population-counts-declared-official-president), reference 2025-258, dated 17 July 2025, establishes the census reference date and declaration under Proclamation 973 of 11 July 2025. The primary-page reader also confirmed Pililla's count in the [Rizal municipality table](https://psa.gov.ph/classification/psgc/citimuni/0405800000) and [Pililla record](https://psa.gov.ph/classification/psgc/barangays/0405810000).

The corrected [PhilAtlas Rizal profile](https://www.philatlas.com/luzon/r04a/rizal/pililla.html) returned HTTP 200, 33,978 bytes. Its 2015/2020 municipal totals match PSA; its nine barangay rows are historical. The previous Laguna URL and purported 19-row extraction were incorrect and have been superseded in the source register. Older income, area, density and household figures remain outside this population release.

Original response bytes and queries are retained alongside this note in `census/`; SHA-256 and timestamps are in `capture.json`. Direct PSA HTML/XLSX requests returned HTTP 403; that does not invalidate the separately captured OpenSTAT JSON. No access restriction was bypassed. The `json-stat2` exporter returned malformed/inconsistent values and was rejected; only the coherent JSON and CSV exports support publication. API `updated` values resemble query-generation timestamps and are not census or publication dates.

Review cleared for the municipal totals and their stated census years. Current barangay roster reconciliation, age structure, household statistics, geographic boundaries and other municipal datasets remain pending.

Skill Inspector: unchanged complete directory and scanner 2.13.4; reused APPROVE review (risk 0, complete coverage, no LLM calls). No other skill instructions or scripts were used.
