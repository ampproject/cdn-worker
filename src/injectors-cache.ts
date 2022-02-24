/**
 * Contains functions that inject dynamic content.
 */

import * as brotli from './brotli-wasm-wrapper';
import {
  CacheControl,
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
 * Generates a complete cache key for a Brotli-compressed cache object.
 *
 * @param parts - unique list of identifiers for object in cache.
 * @returns a unique cache key.
 */
function cacheKeyBrotli(...parts: string[]): string {
  return cacheKey(...parts, ContentEncoding.BROTLI);
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
  return supportsBrotli(cf)
    ? cache.match(cacheKeyBrotli(url, key))
    : cache.match(cacheKey(url, key));
}

/**
 * Saves an injected Response to the cache twice, for raw and Brotli-compressed.
 *
 * @param response - raw Response to save to cache.
 * @param url - base file URL that has dynamic content injected into it.
 * @param key - unique identifiers for this specific injection.
 */
async function saveCache(
  response: Response,
  url: string,
  key: string
): Promise<void> {
  console.log('Caching', url, 'with cache key', key);
  if (!response.body) {
    throw new Error('Response has no body');
  }

  // Replace whatever cache-control header that we respond with, with a 1 year
  // cache-control. Responses to user requests should replace this header again
  // with the relevant cache-control before serving.
  response.headers.set(HeaderKeys.CACHE_CONTROL, CacheControl.STATIC_RTV_FILE);

  // We need to read the body of the response twice: once for saving the plain
  // response and once for performing Brotli compression. Since response.body is
  // a ReadableStream and can only be read once under normal circumstances, we
  // must call .clone on it so we can read it twice.
  const responseClone = response.clone();

  const cache = await openInjectorsCache();
  const plainResponsePromise = cache
    .put(cacheKey(url, key), response)
    .then(() => {
      console.log('> Plain response cached');
    });

  // Create an equivalent Response object that is already Brotli-compressed.
  const bodyAsText = await responseClone.text();
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
    .put(cacheKeyBrotli(url, key), brotliResponse)
    .then(() => {
      console.log('> Brotli response cached');
    });

  // Cache both the plain and the Brotli-compressed responses.
  await Promise.all([plainResponsePromise, brotliResponsePromise]);
}

/**
 * Enqueues a cache-save action for after the request, and respond with a clone
 *
 * @param extend - wrapper for the FetchEvent's waitUntil method.
 * @param response - raw Response to save to cache.
 * @param url - base file URL that has dynamic content injected into it.
 * @param key - unique identifiers for this specific injection.
 * @returns a clone of `response`.
 */
export function enqueueCacheAndClone(
  extend: FetchEvent['waitUntil'],
  response: Response,
  url: string,
  key: string
): Response {
  if (!response.body) {
    // To pass type checking below...
    throw new Error('Response has no body');
  }

  // We need to read the body of the response twice: once by the saveCache call,
  // and once by the server responding to the client request. Since
  // response.body is a ReadableStream and can only be read once under normal
  // circumstances, we must call .clone on it so we can read it twice.
  // The astute reader will notice that `saveCache` also calls .clone as well,
  // because it also needs to read the body twice (for a total of 3 body reads).
  const responseClone = response.clone();

  // Do *not* await on this promise. The `waitUntil` call extends the
  // execution of this call until this promise is resolved, but we want to
  // respond before the caching is performed.
  extend(saveCache(responseClone, url, key));
  return response;
}
