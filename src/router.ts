/**
 * Contains request routing logic.
 */

import {Router} from 'worktop';
import {ServerRequest} from 'worktop/request';

import {FetchError} from './errors';
import {CacheControl, ContentType, HeaderKeys, withHeaders} from './headers';
import {injectAmpExp, injectAmpGeo} from './injectors';
import {enqueueCacheAndClone, getCacheFor} from './injectors-cache';
import {rtvMetadata} from './metadata';
import {chooseRtv} from './rtv';
import {
  fetchImmutableAmpFileOrDie,
  fetchImmutableUrlOrDie,
  getAmpFileUrl,
} from './storage';

const RTV_METADATA_EXTRA_HEADERS: ReadonlyMap<HeaderKeys, string> = new Map([
  [HeaderKeys.CONTENT_TYPE, ContentType.APPLICATION_JSON],
]);
const EXPERIMENTS_EXTRA_HEADERS: ReadonlyMap<HeaderKeys, string> = new Map([
  [HeaderKeys.X_FRAME_OPTIONS, 'deny'],
  [
    HeaderKeys.CONTENT_SECURITY_POLICY,
    "default-src * blob: data:; script-src blob: https://cdn.ampproject.org/lts/ https://cdn.ampproject.org/rtv/ https://cdn.ampproject.org/sw/ https://cdn.ampproject.org/v0.js https://cdn.ampproject.org/v0.mjs https://cdn.ampproject.org/v0/ https://cdn.ampproject.org/viewer/; object-src 'none'; style-src 'unsafe-inline' https://cdn.ampproject.org/rtv/ https://cdn.materialdesignicons.com https://cloud.typography.com https://fast.fonts.net https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com https://p.typekit.net https://pro.fontawesome.com https://use.fontawesome.com https://use.typekit.net; report-uri https://csp.withgoogle.com/csp/amp",
  ],
]);

const router = new Router();

router.onerror = (req, res, status, error) => {
  if (!(error instanceof FetchError)) {
    error = new FetchError(status ?? 500, 'Internal Server Error');
  }
  console.error(error?.stack ?? error);
  return new Response(error.message, {status: (error as FetchError).status});
};

router.add('GET', '/', () => Response.redirect('https://amp.dev/'));

router.add('GET', '/favicon.ico', () => {
  return fetchImmutableUrlOrDie('https://amp.dev/static/img/favicon.png');
});

router.add('GET', '/rtv/metadata', async (request) => {
  return withHeaders(
    await rtvMetadata(request.origin),
    CacheControl.RTV_METADATA_FILE,
    RTV_METADATA_EXTRA_HEADERS
  );
});

/**
 * Handles amp-geo requests.
 * @param req - the request object.
 * @param rtv - RTV number to use.
 * @param path - path to the requested amp-geo file, must start with `/`.
 * @returns a dynamically injected amp-geo response, possibly from cache.
 */
async function ampGeoRequest(
  {cf, extend}: ServerRequest,
  rtv: string,
  path: string
): Promise<Response> {
  const url = getAmpFileUrl(rtv, path);
  const cacheKey = `${cf.country ?? ''};${cf.regionCode ?? ''}`;

  const cachedResponse = await getCacheFor(url, cacheKey, cf);
  if (cachedResponse) {
    console.log('Serving', url, 'with dynamic key', cacheKey, 'from cache');
    return withHeaders(cachedResponse, CacheControl.AMP_GEO);
  }
  console.log('Cache miss for', url, 'with dynamic key', cacheKey);

  const response = await injectAmpGeo(
    await fetchImmutableUrlOrDie(url),
    cf.country,
    cf.regionCode
  );

  return withHeaders(
    await enqueueCacheAndClone(extend, response, url, cacheKey),
    CacheControl.AMP_GEO
  );
}

router.add(
  'GET',
  /^\/rtv\/(?<rtv>\d+)(?<wild>\/v0\/amp-geo-.+\.m?js)$/,
  async (req) => {
    return ampGeoRequest(req, req.params.rtv, req.params.wild);
  }
);

router.add('GET', '/rtv/:rtv/*', async ({cf, params}) => {
  const response = await fetchImmutableAmpFileOrDie(
    params.rtv,
    `/${params.wild}`,
    cf
  );

  return withHeaders(response, CacheControl.STATIC_RTV_FILE);
});

router.add('GET', /^\/(?:\w+-)?v0\.m?js$/, async (req) => {
  console.log('Serving unversioned entry-file request to', req.path);

  const rtv = await chooseRtv(req);
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path);

  return withHeaders(
    await injectAmpExp(response, rtv),
    CacheControl.ENTRY_FILE
  );
});

router.add('GET', /^(?:\/lts)?\/v0\/amp-geo-.+\.m?js$/, async (req) => {
  console.log('Serving unversioned amp-geo request to', req.path);

  const rtv = await chooseRtv(req);
  return ampGeoRequest(req, rtv, req.path);
});

/**
 * Handles unversioned requests to /experiments.html.
 *
 * @param req - the request object.
 * @returns Response object with experiments.html content.
 */
async function unversionedExperimentsRequest(
  req: ServerRequest
): Promise<Response> {
  console.log('Serving unversioned experiments.html request to', req.path);

  const rtv = await chooseRtv(req);
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path, req.cf);

  return withHeaders(
    response,
    CacheControl.ENTRY_FILE,
    EXPERIMENTS_EXTRA_HEADERS
  );
}

router.add('GET', '/lts/experiments.html', unversionedExperimentsRequest);
router.add('GET', '/experiments.html', unversionedExperimentsRequest);

/**
 * Handles unversioned requests to service worker files.
 *
 * @param req - the request object.
 * @returns Response object with service worker content.
 */
async function unversionedServiceWorkerRequest(
  req: ServerRequest
): Promise<Response> {
  console.log('Serving unversioned service worker request to', req.path);

  const rtv = await chooseRtv(req);
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path, req.cf);

  return withHeaders(response, CacheControl.SERVICE_WORKER_FILE);
}

router.add('GET', '/lts/sw/*', unversionedServiceWorkerRequest);
router.add('GET', '/sw/*', unversionedServiceWorkerRequest);

router.add('GET', '/lts/*', async (req) => {
  console.log('Serving unversioned LTS request to', req.path);
  const rtv = await chooseRtv(req);
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path, req.cf);

  return withHeaders(response, CacheControl.LTS);
});

router.add('GET', '/*', async (req) => {
  console.log('Serving unversioned request to', req.path);

  const rtv = await chooseRtv(req);
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path, req.cf);

  return withHeaders(response, CacheControl.DEFAULT);
});

export default router;
