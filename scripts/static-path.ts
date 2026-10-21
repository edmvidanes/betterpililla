import { isAbsolute, relative, resolve, sep } from 'node:path'

/** A public URL must never turn a source identifier into a filesystem path. */
export function staticEntryPath(localeRoot: string, urlPath: string): string {
  const segments = urlPath.split('/').filter(Boolean).map(segment => {
    const decoded = decodeURIComponent(segment)
    if (decoded === '.' || decoded === '..' || /[/\\\0]/.test(decoded)) {
      throw new Error(`Unsafe static route segment: ${segment}`)
    }
    return decoded
  })
  const root = resolve(localeRoot)
  const destination = resolve(root, ...segments)
  const descendant = relative(root, destination)
  if (isAbsolute(descendant) || descendant === '..' || descendant.startsWith(`..${sep}`)) {
    throw new Error(`Static route escapes locale root: ${urlPath}`)
  }
  return destination
}
