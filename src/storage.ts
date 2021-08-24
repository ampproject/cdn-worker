/**
 * Contains functions that interact with the backing storage.
 */

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
export async function fetchImmutableOrDie(url: string): Promise<Response> {
  const response = await fetch(url, {
    cf: {cacheEverything: true, cacheTtl: 31536000},
  });
  return response.ok
    ? response
    : new Response(`🌩 ${response.status} Error: ${response.statusText}`);
}
