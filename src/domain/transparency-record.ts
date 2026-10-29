// Content-derived identifiers also cover procurement leads without a source ID.
export function transparencyRecordId(record: object): string {
  let hash = 2166136261
  for (const char of JSON.stringify(record)) {
    hash ^= char.codePointAt(0)!
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}
