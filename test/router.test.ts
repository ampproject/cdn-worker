/**
 * Tests for router.ts.
 */

import {beforeEach} from '@jest/globals';
import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';
import makeServiceWorkerEnv from 'service-worker-mock';
import {mocked} from 'ts-jest/utils';
import {read} from 'worktop/kv';
import {Router} from 'worktop/router';

import {FetchError} from '../src/errors';
import {CacheControl} from '../src/headers';
import {injectAmpExp, injectAmpGeo} from '../src/injectors';
import {enqueueCacheAndClone, getCacheFor} from '../src/injectors-cache';
import {rtvMetadata} from '../src/metadata';
import router from '../src/router';
import {chooseRtv} from '../src/rtv';
import {
  fetchImmutableAmpFileOrDie,
  fetchImmutableUrlOrDie,
} from '../src/storage';

// This is a hack around Jest's limitation with respect to loading ECMAScript
// modules. The 'worktop' module re-exports the `Router` class from
// 'worktop/router', but 'worktop/router' is not a valid import that the
// TypeScript compiler understands, only 'ts-jest' does. This allows the real
// source code to import `Router` from 'worktop', and forces the test to load it
// from 'worktop/router'.
jest.mock('worktop', () => ({
  Router,
}));

jest.mock('worktop/kv');
const readMock = mocked(read);

jest.mock('../src/metadata');
const rtvMetadataMock = mocked(rtvMetadata);

jest.mock('../src/rtv');
const chooseRtvMock = mocked(chooseRtv);

jest.mock('../src/injectors');
const injectAmpExpMock = mocked(injectAmpExp);
const injectAmpGeoMock = mocked(injectAmpGeo);

jest.mock('../src/injectors-cache');
const enqueueCacheAndCloneMock = mocked(enqueueCacheAndClone);
const getCacheForMock = mocked(getCacheFor);

jest.mock('../src/storage');
const fetchImmutableUrlOrDieMock = mocked(fetchImmutableUrlOrDie);
const fetchImmutableAmpFileOrDieMock = mocked(fetchImmutableAmpFileOrDie);

/** Makes a FetchEvent-like object to be used by router.run. */
function makeFetchEvent(path: string): FetchEvent {
  return {
    type: 'fetch',
    request: {
      method: 'GET',
      url: `https://example.com${path}`,
      // @ts-expect-error ignore missing fields, we only care about these ones.
      cf: {
        country: 'nl',
      },

      // We don't care about these fields, but they are used by the constructor
      // of FetchEvent.
      headers: new Headers({
        'content-type': 'text/plain',
      }),
      blob: async () => new Blob(),
      text: async () => '',
      arrayBuffer: async () => new ArrayBuffer(0),
      formData: async () => new FormData(),
      json: async () => ({}),
    },

    waitUntil: () => undefined,
  };
}

describe('router', () => {
  beforeAll(() => {
    Object.assign(global, makeServiceWorkerEnv());
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('/', () => {
    it('redirects to amp.dev', async () => {
      const response = await router.run(makeFetchEvent('/'));

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual('https://amp.dev/');
    });
  });

  describe('/favicon.ico', () => {
    it('responds with the favicon from amp.dev', async () => {
      fetchImmutableUrlOrDieMock.mockResolvedValue(
        new Response('favicon-raw-bytes', {
          headers: {'content-type': 'image/x-icon'},
        })
      );

      const response = await router.run(makeFetchEvent('/favicon.ico'));

      expect(response.status).toEqual(200);
      expect(response.headers.get('content-type')).toEqual('image/x-icon');
      await expect(response.text()).resolves.toEqual('favicon-raw-bytes');

      expect(fetchImmutableUrlOrDieMock).toHaveBeenCalledWith(
        'https://amp.dev/static/img/favicon.png'
      );
    });
  });

  describe('/rtv/metadata', () => {
    it('responds with RTV metadata', async () => {
      rtvMetadataMock.mockResolvedValue(
        new Response(JSON.stringify({ampRuntimeVersion: '012105150310000'}))
      );

      const response = await router.run(makeFetchEvent('/rtv/metadata'));

      expect(response.status).toEqual(200);
      expect(response.headers.get('content-type')).toEqual(
        'application/json; charset=UTF-8'
      );
      await expect(response.json()).resolves.toEqual({
        ampRuntimeVersion: '012105150310000',
      });
    });
  });

  describe('requests to immutable versioned files', () => {
    it('responds with an immutable file', async () => {
      fetchImmutableAmpFileOrDieMock.mockResolvedValue(
        new Response('…var global=self;…', {
          headers: {'content-type': 'text/javascript'},
        })
      );

      const response = await router.run(
        makeFetchEvent('/rtv/012105150310000/v0.js')
      );

      expect(response.status).toEqual(200);
      expect(response.headers.get('content-type')).toEqual('text/javascript');
      expect(response.headers.get('cache-control')).toEqual(
        CacheControl.STATIC_RTV_FILE
      );
      await expect(response.text()).resolves.toEqual('…var global=self;…');

      expect(fetchImmutableAmpFileOrDieMock).toHaveBeenCalledWith(
        '012105150310000',
        '/v0.js',
        {country: 'nl'}
      );
    });
  });

  describe('requests to dynamic versioned files', () => {
    it('injects requests to amp-geo with country code', async () => {
      const expectedResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {
          headers: {'content-type': 'text/javascript'},
        }
      );
      getCacheForMock.mockResolvedValue(undefined);
      fetchImmutableUrlOrDieMock.mockResolvedValue(expectedResponse);
      injectAmpGeoMock.mockImplementation(async (response) => response);
      enqueueCacheAndCloneMock.mockReturnValue(expectedResponse);

      const response = await router.run(
        makeFetchEvent('/rtv/012105150310000/v0/amp-geo-0.1.js')
      );

      expect(response.status).toEqual(200);
      expect(response.headers.get('content-type')).toEqual('text/javascript');
      expect(response.headers.get('cache-control')).toEqual(
        CacheControl.AMP_GEO
      );
      await expect(response.text()).resolves.toEqual(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…'
      );

      expect(getCacheForMock).toHaveBeenCalledWith(
        'https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js',
        'nl;',
        {'country': 'nl'}
      );
      expect(fetchImmutableUrlOrDieMock).toHaveBeenCalledWith(
        'https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js'
      );
      expect(injectAmpGeoMock).toHaveBeenCalledWith(
        expect.any(Response),
        'nl',
        undefined
      );
      expect(enqueueCacheAndCloneMock).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Response),
        'https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js',
        'nl;'
      );
    });
  });

  describe('requests to immutable unversioned files', () => {
    beforeEach(() => {
      chooseRtvMock.mockResolvedValue('012105150310000');
    });

    it.each(['/experiments.html', '/lts/experiments.html'])(
      'responds to requests to %s',
      async (path) => {
        fetchImmutableAmpFileOrDieMock.mockResolvedValue(
          new Response('<html>…</html>', {
            headers: {'content-type': 'text/html'},
          })
        );

        const response = await router.run(makeFetchEvent(path));

        expect(response.status).toEqual(200);
        expect(response.headers.get('content-type')).toEqual('text/html');
        expect(response.headers.get('cache-control')).toEqual(
          CacheControl.ENTRY_FILE
        );
        expect(response.headers.get('x-frame-options')).toEqual('deny');
        expect(response.headers.get('content-security-policy')).toContain(
          'default-src * blob: data:;'
        );
        await expect(response.text()).resolves.toEqual('<html>…</html>');

        expect(fetchImmutableAmpFileOrDieMock).toHaveBeenCalledWith(
          '012105150310000',
          path,
          {'country': 'nl'}
        );
      }
    );

    it.each(['/lts/v0.js', '/lts/v0/amp-ad-0.1.mjs'])(
      'responds to LTS requests to %s',
      async (path) => {
        fetchImmutableAmpFileOrDieMock.mockResolvedValue(
          new Response('…var global=self;…', {
            headers: {'content-type': 'text/javascript'},
          })
        );

        const response = await router.run(makeFetchEvent(path));

        expect(response.status).toEqual(200);
        expect(response.headers.get('content-type')).toEqual('text/javascript');
        expect(response.headers.get('cache-control')).toEqual(CacheControl.LTS);
        await expect(response.text()).resolves.toEqual('…var global=self;…');

        expect(fetchImmutableAmpFileOrDieMock).toHaveBeenCalledWith(
          '012105150310000',
          path,
          {'country': 'nl'}
        );
        expect(injectAmpExpMock).not.toHaveBeenCalled();
      }
    );

    it.each(['/sw/amp-sw.js', '/lts/sw/amp-sw.js'])(
      'responds to service worker requests to %s',
      async (path) => {
        fetchImmutableAmpFileOrDieMock.mockResolvedValue(
          new Response('…var global=self;…', {
            headers: {'content-type': 'text/javascript'},
          })
        );

        const response = await router.run(makeFetchEvent(path));

        expect(response.status).toEqual(200);
        expect(response.headers.get('content-type')).toEqual('text/javascript');
        expect(response.headers.get('cache-control')).toEqual(
          CacheControl.SERVICE_WORKER_FILE
        );
        await expect(response.text()).resolves.toEqual('…var global=self;…');

        expect(fetchImmutableAmpFileOrDieMock).toHaveBeenCalledWith(
          '012105150310000',
          path,
          {'country': 'nl'}
        );
      }
    );

    it.each([
      ['/v0/amp-list-0.1.js', 'text/javascript'],
      ['/files.txt', 'text/plain'],
      ['/caches.json', 'application/json'],
    ])('responds to requests to %s', async (path, contentType) => {
      fetchImmutableAmpFileOrDieMock.mockResolvedValue(
        new Response('raw-file-bytes', {
          headers: {'content-type': contentType},
        })
      );

      const response = await router.run(makeFetchEvent(path));

      expect(response.status).toEqual(200);
      expect(response.headers.get('content-type')).toEqual(contentType);
      expect(response.headers.get('cache-control')).toEqual(
        CacheControl.DEFAULT
      );
      await expect(response.text()).resolves.toEqual('raw-file-bytes');

      expect(fetchImmutableAmpFileOrDieMock).toHaveBeenCalledWith(
        '012105150310000',
        path,
        {'country': 'nl'}
      );
    });
  });

  describe('requests to dynamic unversioned files', () => {
    beforeEach(() => {
      chooseRtvMock.mockResolvedValue('012105150310000');
    });

    it.each(['/v0.js', '/v0.mjs', '/shadow-v0.mjs', '/amp4ads-v0.js'])(
      'responds with entry file %s',
      async (path) => {
        const expectedResponse = new Response('…var global=self;…', {
          headers: {'content-type': 'text/javascript'},
        });
        readMock.mockResolvedValue(undefined);
        getCacheForMock.mockResolvedValue(undefined);
        fetchImmutableUrlOrDieMock.mockResolvedValue(expectedResponse);
        injectAmpExpMock.mockImplementation(async (response) => response);
        enqueueCacheAndCloneMock.mockReturnValue(expectedResponse);

        const response = await router.run(makeFetchEvent(path));

        expect(response.status).toEqual(200);
        expect(response.headers.get('content-type')).toEqual('text/javascript');
        expect(response.headers.get('cache-control')).toEqual(
          CacheControl.ENTRY_FILE
        );
        await expect(response.text()).resolves.toEqual('…var global=self;…');

        expect(readMock).toHaveBeenCalledWith(null, 'AMP_EXP', {type: 'json'});
        expect(getCacheForMock).toHaveBeenCalledWith(
          `https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000${path}`,
          '33f8b592a7722000aa8a50cce7e61ad4aaa019fe',
          {'country': 'nl'}
        );
        expect(fetchImmutableUrlOrDieMock).toHaveBeenCalledWith(
          `https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000${path}`
        );
        expect(injectAmpExpMock).toHaveBeenCalledWith(
          expect.any(Response),
          '012105150310000',
          {experiments: []}
        );
        expect(enqueueCacheAndCloneMock).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Response),
          `https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000${path}`,
          '33f8b592a7722000aa8a50cce7e61ad4aaa019fe'
        );
      }
    );

    it.each([
      ['/v0/amp-geo-0.1.js', 'amp-geo-0.1.js'],
      ['/lts/v0/amp-geo-latest.mjs', 'amp-geo-latest.mjs'],
    ])('injects requests to %s with country code', async (path, file) => {
      const expectedResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {
          headers: {'content-type': 'text/javascript'},
        }
      );
      getCacheForMock.mockResolvedValue(undefined);
      fetchImmutableUrlOrDieMock.mockResolvedValue(expectedResponse);
      injectAmpGeoMock.mockImplementation(async (response) => response);
      enqueueCacheAndCloneMock.mockReturnValue(expectedResponse);

      const response = await router.run(makeFetchEvent(path));

      expect(response.status).toEqual(200);
      expect(response.headers.get('content-type')).toEqual('text/javascript');
      expect(response.headers.get('cache-control')).toEqual(
        CacheControl.AMP_GEO
      );
      await expect(response.text()).resolves.toEqual(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…'
      );

      expect(getCacheForMock).toHaveBeenCalledWith(
        `https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000/v0/${file}`,
        'nl;',
        {'country': 'nl'}
      );
      expect(fetchImmutableUrlOrDieMock).toHaveBeenCalledWith(
        `https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000/v0/${file}`
      );
      expect(injectAmpGeoMock).toHaveBeenCalledWith(
        expect.any(Response),
        'nl',
        undefined
      );
      expect(enqueueCacheAndCloneMock).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Response),
        `https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000/v0/${file}`,
        'nl;'
      );
    });
  });

  describe('requests to pre-cached dynamic files', () => {
    beforeEach(() => {
      chooseRtvMock.mockResolvedValue('012105150310000');
    });

    it.each(['/rtv/012105150310000/v0/amp-geo-0.1.js', '/v0/amp-geo-0.1.js'])(
      'serves requests to %s from cache',
      async (path) => {
        const expectedResponse = new Response(
          '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
          {
            headers: {'content-type': 'text/javascript'},
          }
        );
        getCacheForMock.mockResolvedValue(expectedResponse);

        const response = await router.run(makeFetchEvent(path));

        expect(response.status).toEqual(200);
        expect(response.headers.get('content-type')).toEqual('text/javascript');
        expect(response.headers.get('cache-control')).toEqual(
          CacheControl.AMP_GEO
        );
        await expect(response.text()).resolves.toEqual(
          '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…'
        );

        expect(getCacheForMock).toHaveBeenCalledWith(
          'https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js',
          'nl;',
          {'country': 'nl'}
        );
        expect(fetchImmutableUrlOrDieMock).not.toHaveBeenCalled();
        expect(injectAmpGeoMock).not.toHaveBeenCalled();
        expect(enqueueCacheAndCloneMock).not.toHaveBeenCalled();
      }
    );

    it('serves requests for /v0.js from cache', async () => {
      readMock.mockResolvedValue({
        experiments: [{name: 'foo', percentage: 0.1}],
      });
      getCacheForMock.mockResolvedValue(
        new Response('…var global=self;…', {
          headers: {'content-type': 'text/javascript'},
        })
      );

      const response = await router.run(makeFetchEvent('/v0.js'));

      expect(response.status).toEqual(200);
      expect(response.headers.get('content-type')).toEqual('text/javascript');
      expect(response.headers.get('cache-control')).toEqual(
        CacheControl.ENTRY_FILE
      );
      await expect(response.text()).resolves.toEqual('…var global=self;…');

      expect(readMock).toHaveBeenCalledWith(null, 'AMP_EXP', {type: 'json'});
      expect(getCacheForMock).toHaveBeenCalledWith(
        'https://storage.googleapis.com/org-cdn/org-cdn/rtv/012105150310000/v0.js',
        '075dd3a9f4007daabf4629bffeb89644f1c55ec0',
        {'country': 'nl'}
      );
      expect(fetchImmutableUrlOrDieMock).not.toHaveBeenCalled();
      expect(injectAmpExpMock).not.toHaveBeenCalledWith();
      expect(enqueueCacheAndCloneMock).not.toHaveBeenCalledWith();
    });
  });

  describe('handles errors', () => {
    it('fetch errors', async () => {
      fetchImmutableAmpFileOrDieMock.mockRejectedValue(
        new FetchError(404, 'Not Found')
      );

      const response = await router.run(
        makeFetchEvent('/v0/amp-does-not-exist-0.1.js')
      );

      expect(response.status).toEqual(404);
      await expect(response.text()).resolves.toEqual('🌩 404 Error: Not Found');
    });

    it('other errors', async () => {
      chooseRtvMock.mockRejectedValue(
        new Error(
          'No available RTV channel was chosen. This is a server error, due to missing `stable` channel config'
        )
      );

      const response = await router.run(makeFetchEvent('/v0.js'));

      expect(response.status).toEqual(500);
      await expect(response.text()).resolves.toEqual(
        '🌩 500 Error: Internal Server Error'
      );
    });
  });
});
