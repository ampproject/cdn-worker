/**
 * Tests for injectors-cache.ts.
 */

import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';

import * as brotli from '../src/brotli-wasm-wrapper';
import {
  CacheControl,
  IncomingRequestCloudflareProperties,
} from '../src/headers';
import {enqueueCacheAndClone, getCacheFor} from '../src/injectors-cache';

jest.mock('../src/brotli-wasm-wrapper');
const brotliCompressMock = jest.mocked(brotli.compress);

const cacheMatchMock = jest.fn<Promise<Response | undefined>, [string]>();
const cachePutMock = jest.fn<Promise<void>, [string, Response]>();
const extendMock = jest.fn();

const cfSupportsBrotli = {
  clientAcceptEncoding: 'gzip, deflate, br',
} as IncomingRequestCloudflareProperties;
const cfDoesNotSupportBrotli = {
  clientAcceptEncoding: 'gzip, deflate',
} as IncomingRequestCloudflareProperties;

describe('injectors-cache', () => {
  beforeAll(() => {
    enableFetchMocks();

    Object.assign(global, {
      caches: {
        open: () =>
          Promise.resolve({
            match: cacheMatchMock,
            put: cachePutMock,
          }),
      },
    });
  });

  afterAll(() => {
    disableFetchMocks();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getCacheFor', () => {
    it('returns cached response to /v0/amp-geo-0.1.js with key NL; for a client that supports brotli', async () => {
      cacheMatchMock.mockResolvedValue(new Response('javascript;'));

      const response = await getCacheFor(
        'https://example.com/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js',
        'NL;',
        cfSupportsBrotli
      );
      expect(response).toBeDefined();

      expect(cacheMatchMock).toHaveBeenCalledWith(
        'https://example.com/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js;NL;;br'
      );
    });

    it('returns cached response to /v0/amp-geo-0.1.js with key US;NY for a client that does not supports brotli', async () => {
      cacheMatchMock.mockResolvedValue(new Response('javascript;'));

      const response = await getCacheFor(
        'https://example.com/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js',
        'US;NY',
        cfDoesNotSupportBrotli
      );
      expect(response).toBeDefined();

      expect(cacheMatchMock).toHaveBeenCalledWith(
        'https://example.com/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js;US;NY'
      );
    });

    it('returns undefined on cache miss', async () => {
      cacheMatchMock.mockResolvedValue(undefined);

      const response = await getCacheFor(
        'https://example.com/org-cdn/rtv/012105150310000/v0.js',
        'edaf9e1f7bd5aa20f61c78be7017134eafb88de3',
        cfSupportsBrotli
      );
      expect(response).toBeUndefined();

      expect(cacheMatchMock).toHaveBeenCalledWith(
        'https://example.com/org-cdn/rtv/012105150310000/v0.js;edaf9e1f7bd5aa20f61c78be7017134eafb88de3;br'
      );
    });
  });

  describe('enqueueCacheAndClone', () => {
    it('saves to cache and returns the input response', async () => {
      cachePutMock.mockResolvedValue(undefined);
      brotliCompressMock.mockResolvedValue(Uint8Array.from([0x00, 0x01, 0x02]));

      const inputResponse = new Response('javascript;', {
        headers: {
          'content-type': 'text/javascript; charset=utf-8',
          'cache-control': CacheControl.AMP_GEO,
        },
      });

      const response = enqueueCacheAndClone(
        extendMock,
        inputResponse,
        'https://example.com/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js',
        'US;NY'
      );

      expect(response).toBe(inputResponse);

      await new Promise((resolve) => process.nextTick(resolve));
      expect(cachePutMock).toHaveBeenCalledTimes(2);
      expect(cachePutMock).toHaveBeenNthCalledWith(
        1,
        'https://example.com/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js;US;NY',
        expect.any(Response)
      );
      expect(cachePutMock).toHaveBeenNthCalledWith(
        2,
        'https://example.com/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js;US;NY;br',
        expect.any(Response)
      );
      expect(brotliCompressMock).toHaveBeenCalledWith(
        Uint8Array.from(Buffer.from('javascript;', 'utf-8')),
        {quality: 11}
      );

      const [putResponse1, putResponse2] = [
        cachePutMock.mock.calls[0][1],
        cachePutMock.mock.calls[1][1],
      ];
      await expect(putResponse1.text()).resolves.toEqual('javascript;');
      expect(putResponse1.headers).toEqual(
        new Headers({
          'cache-control': CacheControl.STATIC_RTV_FILE,
          'content-type': 'text/javascript; charset=utf-8',
        })
      );
      expect(putResponse2.body).toEqual(Buffer.from([0x00, 0x01, 0x02]));
    });

    it('throws an error on input without body', () => {
      expect(() => {
        enqueueCacheAndClone(
          extendMock,
          new Response(null),
          'https://example.com/org-cdn/rtv/012105150310000/v0/amp-geo-0.1.js',
          'US;NY'
        );
      }).toThrow('Response has no body');
    });
  });
});
