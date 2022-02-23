/**
 * Contains functions that inject dynamic content.
 */

import * as brotli from './brotli-wasm-wrapper';
import {
  ContentEncoding,
  HeaderKeys,
  IncomingCloudflarePropertiesExtended,
  supportsBrotli,
} from './headers';

const INJECTORS_CACHE_NAME = 'injectors';
const textEncoder = new TextEncoder();

let injectorsCache_: Cache;
/** */
async function openInjectorsCache(): Promise<Cache> {
  if (!injectorsCache_) {
    injectorsCache_ = await caches.open(INJECTORS_CACHE_NAME);
  }
  return injectorsCache_;
}

/**
 * Generates a complete cache key for a cache object.
 *
 * @param parts - unique list of identifiers for object in cache.
 * @returns a unique cache key.
 */
function cacheKey(...parts: string[]): string {
  return parts.join(';');
}

/**
 * Gets an already injected Response for the given URL.
 *
 * @param url - base file URL that has dynamic content injected into it.
 * @param key - unique identifiers for this specific injection.
 * @param cf - incoming Cloudflare properties, used to determine whether to try
 *     fetching the Brotli pre-compressed version of the URL.
 * @returns an already injected Response.
 */
export async function getCacheFor(
  url: string,
  key: string,
  cf: IncomingCloudflarePropertiesExtended
): Promise<Response | undefined> {
  const cache = await openInjectorsCache();
  const keyParts = [key];
  if (supportsBrotli(cf)) {
    keyParts.push(ContentEncoding.BROTLI);
  }
  return cache.match(cacheKey(url, ...keyParts));
}

/**
 * Saves an injected Response to the cache twice, for raw and Brotli-compressed.
 *
 * @param response - raw Response to save to cache.
 * @param url - base file URL that has dynamic content injected into it.
 * @param key - unique identifiers for this specific injection.
 */
export async function saveCache(
  response: Response,
  url: string,
  key: string
): Promise<void> {
  console.log('Caching', url, 'with cache key', key);
  if (!response.body) {
    throw new Error('Response has no body');
  }

  // Don't cache short-lived cache controls.
  response.headers.delete(HeaderKeys.CACHE_CONTROL);

  // Tee the body as it is going to be read twice - once for saving the plain
  // response and once for performing Brotli compression.
  const [body1, body2] = response.body.tee();
  const plainResponse = new Response(body1, response);

  const cache = await openInjectorsCache();
  const plainResponsePromise = cache
    .put(cacheKey(url, key), plainResponse)
    .then(() => {
      console.log('> Plain response cached');
    });

  // Create an equivalent Response object that is already Brotli-compressed.
  const bodyAsText = await new Response(body2, response).text();
  const compressed = await brotli.compress(textEncoder.encode(bodyAsText), {
    quality: 11,
  });
  const brotliResponse = new Response(compressed, {
    headers: [
      ...response.headers,
      [HeaderKeys.CONTENT_ENCODING, ContentEncoding.BROTLI],
    ],
    encodeBody: 'manual',
  });
  const brotliResponsePromise = cache
    .put(cacheKey(url, key, ContentEncoding.BROTLI), brotliResponse)
    .then(() => {
      console.log('> Brotli response cached');
    });

  // Cache both the plain and the Brotli-compressed responses.
  await Promise.all([plainResponsePromise, brotliResponsePromise]);
}
