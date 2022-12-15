/**
 * Contains functions that interact with the backing storage.
 */

import {
  IncomingRequestCfProperties,
  RequestInit,
  RequestInitCfProperties,
  Response,
  console,
  fetch,
} from '@cloudflare/workers-types';

import {FetchError} from './errors';
import {
  CHARSET_UTF_8,
  ContentEncoding,
  ContentType,
  HeaderKeys,
  supportsBrotli,
} from './headers';
import {getAmpFileUrl} from './storage-util';

const FETCH_OPTIONS: RequestInit<RequestInitCfProperties> = {
  cf: {cacheEverything: true, cacheTtl: 31536000},
};

/**
 * Fetches a URL from the network or responds with a simple error message.
 *
 * Cloudflare caches edge requests, so simply using `fetch` takes advantage of
 * that. Note that this function should *only* be used for immutable, raw files.
 * https://developers.cloudflare.com/workers/learning/how-the-cache-works#interacting-with-the-cloudflare-cache
 *
 * @param url - to fetch from cache or network.
 * @param cf - incoming Cloudflare properties, used to determine whether to try
 *     fetching the Brotli pre-compressed version of the URL.
 * @returns a Response object for the request URL.
 */
export async function fetchImmutableUrlOrDie(
  url: string,
  cf?: IncomingRequestCfProperties
): Promise<Response> {
  const responsePromise = fetch(url, FETCH_OPTIONS);
  const brotliResponsePromise = supportsBrotli(cf)
    ? fetch(`${url}.br`, FETCH_OPTIONS)
    : null;

  const [response, brotliResponse] = await Promise.all([
    responsePromise,
    brotliResponsePromise,
  ]);

  if (!response.ok) {
    throw new FetchError(response.status, response.statusText);
  }

  if (brotliResponse?.ok) {
    // Merge the content of the Brotli response with the Content-Type of the
    // uncompressed response, and set other required headers.
    return new Response(brotliResponse.body, {
      headers: {
        [HeaderKeys.CONTENT_TYPE]:
          response.headers.get(HeaderKeys.CONTENT_TYPE) ??
          `${ContentType.TEXT_PLAIN}; ${CHARSET_UTF_8}`,
        [HeaderKeys.CONTENT_ENCODING]: ContentEncoding.BROTLI,
      },
      encodeBody: 'manual',
    });
  }

  // Brotli pre-compressed file for `url` was either not tried, or the file
  // was not found in storage.
  console.warn('No Brotli pre-compressed response for', url);
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
 * @param cf - incoming Cloudflare properties, used to determine whether to try
 *     fetching the Brotli pre-compressed version of the URL.
 * @returns a Response object for the request URL.
 */
export async function fetchImmutableAmpFileOrDie(
  rtv: string,
  path: string,
  cf?: IncomingRequestCfProperties
): Promise<Response> {
  return fetchImmutableUrlOrDie(getAmpFileUrl(rtv, path), cf);
}
