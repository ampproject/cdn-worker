/**
 * HTTP headers related functions and consts.
 */

const SHARED_HEADERS: ReadonlyMap<string, string> = new Map([
  ['Access-Control-Allow-Origin', '*'],
  ['Cross-Origin-Resource-Policy', 'cross-origin'],
  ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'],
  ['Timing-Allow-Origin', '*'],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Xss-Protection', '0'],
]);

export enum HeaderKeys {
  CACHE_CONTROL = 'Cache-Control',
  CONTENT_SECURITY_POLICY = 'Content-Security-Policy',
  CONTENT_TYPE = 'Content-Type',
  X_FRAME_OPTIONS = 'X-Frame-Options',
}

export enum CacheControl {
  // Requests to dynamic files, private caching only.
  DEFAULT = 'private, max-age=604800, stale-while-revalidate=604800',
  ENTRY_FILE = 'private, max-age=3000, stale-while-revalidate=1206600',
  AMP_GEO = 'private, max-age=1800',
  LTS = 'private, max-age=2419200, stale-while-revalidate=604800',

  // Requests to unchanging file, public caching allowed.
  STATIC_RTV_FILE = 'public, max-age=31536000',

  // Special cases.
  RTV_METADATA_FILE = 'public, max-age=0',
  SERVICE_WORKER_FILE = 'no-cache, must-revalidate',
}

export enum ContentType {
  APPLICATION_JSON = 'application/json; charset=UTF-8',
}

/**
 * Creates a new Response object with default HTTP headers.
 *
 * Drops all existing HTTP headers on the input response, except for the
 * Content-Type header which is kept. Note that Content-Type can be overridden
 * using the `extraHeaders` parameter.
 *
 * @param inputResponse - object to add headers to.
 * @param cacheControl - Cache-Control header value.
 * @param extraHeaders - (optional) map of extra header key/values to add.
 * @returns new Response object with injected headers.
 */
export function withHeaders(
  inputResponse: Response,
  cacheControl: string,
  extraHeaders?: ReadonlyMap<HeaderKeys, string>
): Response {
  const response = new Response(inputResponse.body);

  // Set Content-Type to the the input response's original value, or fallback
  // to 'text/plain'. Note that this could also get overridden via extraHeaders.
  const contentType =
    inputResponse.headers.get(HeaderKeys.CONTENT_TYPE) ?? 'text/plain';

  response.headers.set(HeaderKeys.CACHE_CONTROL, cacheControl);
  response.headers.set(HeaderKeys.CONTENT_TYPE, contentType);

  [...SHARED_HEADERS, ...(extraHeaders ?? [])].forEach(([header, value]) => {
    response.headers.set(header, value);
  });

  return response;
}
