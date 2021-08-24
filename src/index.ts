/**
 * Contains request routing logic.
 */

import {Router} from 'worktop';
import {ServerRequest} from 'worktop/request';

import {CacheControl, ContentType, HeaderKeys, withHeaders} from './headers';
import {injectAmpExp, injectAmpGeo} from './injectors';
import {rtvMetadata} from './metadata';
import {chooseRtv} from './rtv';
import {fetchImmutableAmpFileOrDie, fetchImmutableUrlOrDie} from './storage';

const RTV_METADATA_EXTRA_HEADERS: ReadonlyMap<HeaderKeys, string> = new Map([
  [HeaderKeys.CONTENT_TYPE, ContentType.APPLICATION_JSON],
]);
const EXPERIMENTS_EXTRA_HEADERS: ReadonlyMap<HeaderKeys, string> = new Map([
  [HeaderKeys.X_FRAME_OPTIONS, 'deny'],
]);

const router = new Router();

router.onerror = (req, res, status, error) =>
  new Response(`🌩 ${status} ${error}`);

router.add('GET', '/', () => Response.redirect('https://amp.dev/'));

router.add('GET', '/favicon.ico', () => {
  return fetchImmutableUrlOrDie('https://amp.dev/static/img/favicon.png');
});

router.add('GET', '/rtv/metadata', async (request) => {
  return withHeaders(
    await rtvMetadata(request),
    CacheControl.RTV_METADATA_FILE,
    RTV_METADATA_EXTRA_HEADERS
  );
});

router.add('GET', '/rtv/:rtv/*', async ({cf, params, path}) => {
  console.log('Serving versioned request to', path);

  const response = await fetchImmutableAmpFileOrDie(
    params.rtv,
    `/${params.wild}`
  );
  if (path.includes('/v0/amp-geo-')) {
    return withHeaders(
      await injectAmpGeo(response, cf.country, cf.regionCode),
      CacheControl.AMP_GEO
    );
  }

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

/**
 * Handles unversioned amp-geo requests.
 *
 * @param req - the request object.
 * @returns Response object with injected amp-geo content.
 */
async function unversionedAmpGeoRequest(req: ServerRequest): Promise<Response> {
  console.log('Serving unversioned amp-geo request to', req.path);

  const rtv = await chooseRtv(req);
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path);

  return withHeaders(
    await injectAmpGeo(response, req.cf.country, req.cf.regionCode),
    CacheControl.AMP_GEO
  );
}

router.add('GET', '/lts/v0/amp-geo-*', unversionedAmpGeoRequest);
router.add('GET', '/v0/amp-geo-*', unversionedAmpGeoRequest);

/**
 * Handles unversioned requests to /experiments.html.
 *
 * @param request - the request object.
 * @returns Response object with experiments.html content.
 */
async function unversionedExperimentsRequest(
  req: ServerRequest
): Promise<Response> {
  console.log('Serving unversioned experiments.html request to', req.path);

  const rtv = await chooseRtv(req);
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path);

  return withHeaders(
    response,
    CacheControl.ENTRY_FILE,
    EXPERIMENTS_EXTRA_HEADERS
  );
}

router.add('GET', '/lts/experiments.html', unversionedExperimentsRequest);
router.add('GET', '/experiments.html', unversionedExperimentsRequest);

router.add('GET', '/lts/*', async (req) => {
  console.log('Serving unversioned LTS request to', req.path);
  const rtv = await chooseRtv(req);
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path);

  return withHeaders(response, CacheControl.LTS);
});

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
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path);

  return withHeaders(response, CacheControl.SERVICE_WORKER_FILE);
}

router.add('GET', '/lts/sw/*', unversionedServiceWorkerRequest);
router.add('GET', '/sw/*', unversionedServiceWorkerRequest);

router.add('GET', '/*', async (req) => {
  console.log('Serving unversioned request to', req.path);

  const rtv = await chooseRtv(req);
  const response = await fetchImmutableAmpFileOrDie(rtv, req.path);

  return withHeaders(response, CacheControl.DEFAULT);
});

addEventListener('fetch', async (event) => {
  event.respondWith(router.run(event));
});
