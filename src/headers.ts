/**
 * HTTP headers related functions and consts.
 */

import mime from 'mime/lite';
import type {IncomingCloudflareProperties} from 'worktop/request';

// `clientAcceptEncoding` is unofficial, but guaranteed by Cloudflare.
export type IncomingCloudflarePropertiesExtended =
  IncomingCloudflareProperties & {
    clientAcceptEncoding?: string;
  };

const SHARED_HEADERS: ReadonlyMap<string, string> = new Map([
  ['access-control-allow-origin', '*'],
  ['cross-origin-resource-policy', 'cross-origin'],
  ['strict-transport-security', 'max-age=31536000; includeSubDomains; preload'],
  ['timing-allow-origin', '*'],
  ['vary', 'accept-encoding'],
  ['x-content-type-options', 'nosniff'],
  ['x-xss-protection', '0'],
]);

export const CHARSET_UTF_8 = 'charset=UTF-8';

export enum HeaderKeys {
  CACHE_CONTROL = 'cache-control',
  CONTENT_ENCODING = 'content-encoding',
  CONTENT_SECURITY_POLICY = 'content-security-policy',
  CONTENT_TYPE = 'content-type',
  X_FRAME_OPTIONS = 'x-frame-options',
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
  APPLICATION_JSON = 'application/json',
  IMAGE_X_ICON = 'image/x-icon',
  TEXT_CSS = 'text/css',
  TEXT_JAVASCRIPT = 'text/javascript',
  TEXT_HTML = 'text/html',
  TEXT_PLAIN = 'text/plain',
}

export enum ContentEncoding {
  BROTLI = 'br',
}

/**
 * Overrides the `mime` module's default mime types for some known types.
 *
 * Must be executed at the start of the worker execution!
 */
export function setupKnownMimeTypes() {
  mime.define(
    {
      [ContentType.IMAGE_X_ICON]: ['ico'],
      [ContentType.TEXT_JAVASCRIPT]: ['js', 'mjs'],
    },
    true
  );
}

/**
 * Normalizes the Content-Type of the output based on the input response's value.
 *
 * Adds `; charset=UTF-8` to known types for the input response, or fallbacks
 * back to `text/plain; charset=UTF-8` if the input response has no Content-Type
 * at all.
 *
 * @param inputContentType - value of the input response's Content-Type header.
 */
function normalizeContentType(inputContentType: string | null): string {
  if (inputContentType) {
    return Object.values(ContentType).map(String).includes(inputContentType)
      ? `${inputContentType}; ${CHARSET_UTF_8}`
      : inputContentType;
  }

  return `${ContentType.TEXT_PLAIN}; ${CHARSET_UTF_8}`;
}

/**
 * Creates a new Response object with default HTTP headers.
 *
 * Drops all existing HTTP headers on the input response, except for the
 * Content-Encoding/Type headers which are kept. These headers can be overridden
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
  // Note that these could be overridden via extraHeaders.
  const contentEncoding = inputResponse.headers.get(
    HeaderKeys.CONTENT_ENCODING
  );
  const contentType = normalizeContentType(
    inputResponse.headers.get(HeaderKeys.CONTENT_TYPE)
  );

  // Create a map for headers that get chosen directly in this function.
  const initialHeaders = new Map<HeaderKeys, string>([
    [HeaderKeys.CACHE_CONTROL, cacheControl],
    [HeaderKeys.CONTENT_TYPE, contentType],
  ]);

  // Already-encoded content needs to have its Content-Encoding header set and
  // the `encodeBody` field set to 'manual', to indicate to the Cloudflare
  // Worker that it should not attempt to re-encode it.
  const responseInit: ResponseInit = {};
  if (contentEncoding) {
    initialHeaders.set(HeaderKeys.CONTENT_ENCODING, contentEncoding);
    responseInit.encodeBody = 'manual';
  }

  // Merge the chosen, shared, and (possibly) extra headers together.
  responseInit.headers = Object.fromEntries([
    ...initialHeaders,
    ...SHARED_HEADERS,
    ...(extraHeaders || []),
  ]);

  return new Response(inputResponse.body, responseInit);
}

/**
 * Whether the client supports Brotli compression.
 */
export function supportsBrotli(
  cf?: IncomingCloudflarePropertiesExtended
): boolean {
  return /\bbr\b/.test(cf?.clientAcceptEncoding ?? '');
}
