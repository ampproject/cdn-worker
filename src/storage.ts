/**
 * Contains functions that interact with the backing storage.
 */

import {FetchError} from './errors';

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
 * Fetches a URL from the network or responds with a simple error message.
 *
 * Cloudflare caches edge requests, so simply using `fetch` takes advantage of
 * that. Note that this function should *only* be used for immutable, raw files.
 * https://developers.cloudflare.com/workers/learning/how-the-cache-works#interacting-with-the-cloudflare-cache
 *
 * @param url - to fetch from cache or network.
 * @returns a Response object for the request URL.
 */
export async function fetchImmutableUrlOrDie(url: string): Promise<Response> {
  const response = await fetch(url, {
    cf: {cacheEverything: true, cacheTtl: 31536000},
  });
  if (!response.ok) {
    throw new FetchError(response.status, response.statusText);
  }
  return response;
}

/**
 * Fetches a raw AMP file from storage or responds with a simple error message.
 *
 * Convenience wrapper for fetchImmutableUrlOrDie that:
 * - Dedups requests when serving v0/ files that are equivalent to Stable (01)
 * - Optionally strips '/lts'
 * prefix from path.
 *
 * @param rtv - RTV number to use.
 * @param path - path to an unversioned AMP file, must start with `/`.
 * @returns a Response object for the request URL.
 */
export async function fetchImmutableAmpFileOrDie(
  rtv: string,
  path: string
): Promise<Response> {
  if (path.startsWith('/lts/')) {
    path = path.slice('/lts'.length);
  }
  if (path.startsWith('/v0/') && V0_DEDUP_RTV_PREFIXES.has(rtv.slice(0, 2))) {
    rtv = `01${rtv.slice(2)}`;
  }

  return fetchImmutableUrlOrDie(`${STORAGE_BASE_URL}${rtv}${path}`);
}
