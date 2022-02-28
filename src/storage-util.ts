/**
 * Contains helper functions for interacting with the backing storage.
 */

const STORAGE_BASE_URL = 'https://storage.googleapis.com/org-cdn/org-cdn/rtv/';

const V0_DEDUP_RTV_PREFIXES: ReadonlySet<string> = new Set([
  '00',
  '02',
  '03',
  '04',
  '05',
  '20',
  '22',
  '24',
]);

/**
 * Generates a complete URL to an immutable AMP file in storage.
 *
 * @param rtv - RTV number to use.
 * @param path - path to an unversioned AMP file, must start with `/`.
 * @returns a complete URL to an immutable AMP file in storage.
 */
export function getAmpFileUrl(rtv: string, path: string): string {
  if (path.startsWith('/lts/')) {
    path = path.slice('/lts'.length);
  }
  if (path.startsWith('/v0/') && V0_DEDUP_RTV_PREFIXES.has(rtv.slice(0, 2))) {
    rtv = `01${rtv.slice(2)}`;
  }
  return `${STORAGE_BASE_URL}${rtv}${path}`;
}
