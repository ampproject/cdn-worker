/**
 * Contains request routing logic.
 */

import {HeaderKeys} from './headers';
import * as injectorsCache from './injectors-cache';
import router from './router';

/** */
async function cacheAfterServing(
  event: FetchEvent,
  response: Response
): Promise<void> {
  const xCacheAfterServing = response.headers.get(
    HeaderKeys.X_CACHE_AFTER_SERVING
  );
  if (!xCacheAfterServing) {
    return;
  }

  // Strip this internal header from the response being cached, or risk an
  // infinite loop of saving to cache.
  response.headers.delete(HeaderKeys.X_CACHE_AFTER_SERVING);

  const [url, ...cacheKeyParts] = xCacheAfterServing.split(';');
  const cacheKey = cacheKeyParts.join(';');
  console.log(
    'Caching',
    url,
    'with cache key',
    cacheKey,
    '(deferred until after response is complete)'
  );
  const cachingPromise = injectorsCache.saveCache(response, url, cacheKey);
  event.waitUntil(cachingPromise);
}

/** */
async function handler(event: FetchEvent): Promise<Response> {
  const response = await router.run(event);

  if (
    !response.headers.has(HeaderKeys.X_CACHE_AFTER_SERVING) ||
    !response.body
  ) {
    return response;
  }

  // If we need to cache this response, we must call .tee on the body as it is
  // going to be read multiple times.
  const [body1, body2] = response.body.tee();

  // Do *not* await on this promise. The `waitUntil` call extends the
  // execution of this call until this promise is resolved, but we want to
  // respond before the caching is performed.
  cacheAfterServing(event, new Response(body2, response));
  return new Response(body1, response);
}

addEventListener('fetch', async (event) => {
  event.respondWith(handler(event));
});
