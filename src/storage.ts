/**
 * Contains functions that interact with the backing storage.
 */

// TODO(danielrozenberg): replace this with a storage location that serves the
// raw compiled binaries without any of the modifications that the Google AMP
// CDN performs.
const STORAGE_BASE_URL = 'https://cdn.ampproject.org';

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
  return response.ok
    ? response
    : new Response(`🌩 ${response.status} Error: ${response.statusText}`);
}

/**
 * Fetches a raw AMP file from storage or responsds with a simple error message.
 *
 * Convenience wrapper for fetchImmutableUrlOrDie. Optionally strips '/lts'
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
  return fetchImmutableUrlOrDie(
    `${STORAGE_BASE_URL}/rtv/${rtv}${stripLts(path)}`
  );
}

/**
 * Strips '/lts' prefix from LTS paths.
 *
 * @param path - path to an unversioned AMP file, must start with `/`.
 * @returns same path, stripping the `/lts` prefix if it exists.
 */
function stripLts(path: string): string {
  return path.startsWith('/lts/') ? path.slice('/lts'.length) : path;
}
