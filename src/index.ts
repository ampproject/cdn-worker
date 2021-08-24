/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Contains request routing logic.
 */

import {Router} from 'worktop';

import {
  CacheControl,
  ContentType,
  HeaderKeys,
  cacheControlFor,
  withHeaders,
} from './headers';
import {injectAmpExp, injectAmpGeo} from './injectors';
import {rtvMetadata} from './metadata';
import {chooseRtv} from './rtv';
import {fetchImmutableOrDie} from './storage';

// TODO(danielrozenberg): replace this with a storage location that serves the
// raw compiled binaries without any of the modifications that the Google AMP
// CDN performs.
const STORAGE_BASE_URL = 'https://cdn.ampproject.org';

const RTV_METADATA_EXTRA_HEADERS = new Map([
  [HeaderKeys.CONTENT_TYPE, ContentType.APPLICATION_JSON],
]);
const EXPERIMENTS_EXTRA_HEADERS = new Map([
  [HeaderKeys.X_FRAME_OPTIONS, 'deny'],
]);

const router = new Router();

router.onerror = (req, res, status, error) =>
  new Response(`🌩 ${status} ${error}`);

router.add('GET', '/', () => Response.redirect('https://amp.dev/'));

router.add('GET', '/favicon.ico', () => {
  return fetchImmutableOrDie('https://amp.dev/static/img/favicon.png');
});

router.add('GET', '/rtv/metadata', async (request) => {
  return withHeaders(
    await rtvMetadata(request),
    CacheControl.RTV_METADATA_FILE,
    RTV_METADATA_EXTRA_HEADERS
  );
});

router.add('GET', '/rtv/:rtv/*', async ({headers, path}) => {
  console.log('Serving versioned request to', path);
  const countryIso = headers.get('cf-ipcountry');

  const storageUrl = `${STORAGE_BASE_URL}${path}`;
  const response = await fetchImmutableOrDie(storageUrl);

  if (path.includes('/v0/amp-geo-')) {
    return withHeaders(
      await injectAmpGeo(response, countryIso),
      CacheControl.AMP_GEO
    );
  }
  return withHeaders(response, CacheControl.STATIC_RTV_FILE);
});

router.add('GET', '*', async (req) => {
  let {path} = req;
  const {headers} = req;
  console.log('Serving unversioned request to', path);
  const isLts = path.startsWith('/lts/');
  const countryIso = headers.get('cf-ipcountry');

  const rtv = await chooseRtv(req, isLts);
  path = path.replace(/^\/lts/, '');
  const cacheControlOptions = {
    isLts,
    isEntryFile: /^\/[\w-]+\.m?js$/.test(path),
    isServiceWorkerFile: path.startsWith('/sw/'),
  };

  console.log('Chose RTV', rtv);
  const storageUrl = `${STORAGE_BASE_URL}/rtv/${rtv}${path}`;
  const response = await fetchImmutableOrDie(storageUrl);

  if (!isLts && (path == '/v0.js' || path == '/v0.mjs')) {
    return withHeaders(
      await injectAmpExp(response, rtv),
      cacheControlFor(cacheControlOptions)
    );
  } else if (path.includes('/v0/amp-geo-')) {
    return withHeaders(
      await injectAmpGeo(response, countryIso),
      CacheControl.AMP_GEO
    );
  } else if (path === '/experiments.html') {
    return withHeaders(
      response,
      CacheControl.ENTRY_FILE,
      EXPERIMENTS_EXTRA_HEADERS
    );
  }
  return withHeaders(response, cacheControlFor(cacheControlOptions));
});

addEventListener('fetch', async (event) => {
  event.respondWith(router.run(event));
});
