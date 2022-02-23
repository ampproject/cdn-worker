/**
 * Contains request routing logic.
 */

import {HeaderKeys} from './headers';
import * as injectorsCache from './injectors-cache';
import router from './router';

/**
 * Handles requests.
 */
async function handler(event: FetchEvent): Promise<Response> {
  let response = await router.run(event);

  const xCacheAfterServing = response.headers.get(
    HeaderKeys.X_CACHE_AFTER_SERVING
  );

  if (!xCacheAfterServing || !response.body) {
    return response;
  }

  // Responses might be immutable if they are returned from `fetch` without
  // being passed through any `new Response` before being returned from the
  // router. We clone the response to ensure it is mutable.
  response = new Response(response.body, response);
  if (!response.body) {
    // To pass type checking below...
    throw new Error('Cloned response has no body');
  }

  const [url, ...cacheKeyParts] = xCacheAfterServing.split(';');
  const cacheKey = cacheKeyParts.join(';');

  // Strip this internal header from the response being cached, or risk an
  // infinite loop of saving to cache.
  response.headers.delete(HeaderKeys.X_CACHE_AFTER_SERVING);

  // If we need to cache this response, we must call .tee on the body as it is
  // going to be read multiple times.
  const [body1, body2] = response.body.tee();

  // Do *not* await on this promise. The `waitUntil` call extends the
  // execution of this call until this promise is resolved, but we want to
  // respond before the caching is performed.
  event.waitUntil(
    injectorsCache.saveCache(new Response(body2, response), url, cacheKey)
  );
  return new Response(body1, response);
}

addEventListener('fetch', async (event) => {
  event.respondWith(handler(event));
});
