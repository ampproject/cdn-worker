/**
 * Tests for headers.ts.
 */

import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';

import {FetchError} from '../src/errors';
import {
  fetchImmutableAmpFileOrDie,
  fetchImmutableUrlOrDie,
} from '../src/storage';

describe('storage', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('fetchImmutableUrlOrDie', () => {
    it('fetchs an arbitrary URL', async () => {
      fetchMock.mockResponse('Kittens.', {status: 200});

      const response = await fetchImmutableUrlOrDie(
        'https://example.com/kittens.txt'
      );

      await expect(response.text()).resolves.toEqual('Kittens.');
      expect(response.status).toEqual(200);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('https://example.com/kittens.txt', {
        'cf': {'cacheEverything': true, 'cacheTtl': 31536000},
      });
    });

    it('throws an error when the response is not 200 OK', async () => {
      fetchMock.mockResponse('Kittens.', {status: 404});

      await expect(() =>
        fetchImmutableUrlOrDie('https://example.com/kittens.txt')
      ).rejects.toThrowError(new FetchError(404, 'Not Found'));

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('https://example.com/kittens.txt', {
        'cf': {'cacheEverything': true, 'cacheTtl': 31536000},
      });
    });
  });

  describe('fetchImmutableAmpFileOrDie', () => {
    it('fetches an AMP file', async () => {
      fetchMock.mockResponse('…var global=self;…', {status: 200});

      const response = await fetchImmutableAmpFileOrDie(
        '002105150310000',
        '/v0.js'
      );

      await expect(response.text()).resolves.toEqual('…var global=self;…');
      expect(response.status).toEqual(200);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://storage.googleapis.com/org-cdn/org-cdn/rtv/002105150310000/v0.js',
        {
          'cf': {'cacheEverything': true, 'cacheTtl': 31536000},
        }
      );
    });

    it('fetches an LTS AMP file', async () => {
      fetchMock.mockResponse('…var global=self;…', {status: 200});

      const response = await fetchImmutableAmpFileOrDie(
        '002105150310000',
        '/lts/v0.js'
      );

      await expect(response.text()).resolves.toEqual('…var global=self;…');
      expect(response.status).toEqual(200);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        'https://storage.googleapis.com/org-cdn/org-cdn/rtv/002105150310000/v0.js',
        {
          'cf': {'cacheEverything': true, 'cacheTtl': 31536000},
        }
      );
    });

    it.each([
      ['00', '01'],
      ['01', '01'],
      ['02', '01'],
      ['03', '01'],
      ['04', '01'],
      ['05', '01'],
      ['10', '10'],
      ['11', '11'],
      ['12', '12'],
      ['20', '01'],
      ['21', '21'],
      ['22', '01'],
      ['23', '23'],
      ['24', '01'],
      ['25', '25'],
    ])(
      'v0/ requests to a %s-prefix file should serve the %s-prefix file',
      async (requestedRtvPrefix, expectedRtvPrefix) => {
        fetchMock.mockResponse('…var global=self;…', {status: 200});

        const response = await fetchImmutableAmpFileOrDie(
          `${requestedRtvPrefix}2105150310000`,
          '/v0/amp-list-0.1.js'
        );

        await expect(response.text()).resolves.toEqual('…var global=self;…');
        expect(response.status).toEqual(200);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          `https://storage.googleapis.com/org-cdn/org-cdn/rtv/${expectedRtvPrefix}2105150310000/v0/amp-list-0.1.js`,
          {
            'cf': {'cacheEverything': true, 'cacheTtl': 31536000},
          }
        );
      }
    );

    it.each([
      ['00', '01'],
      ['01', '01'],
      ['02', '01'],
      ['03', '01'],
      ['04', '01'],
      ['05', '01'],
      ['10', '10'],
      ['11', '11'],
      ['12', '12'],
      ['20', '01'],
      ['21', '21'],
      ['22', '01'],
      ['23', '23'],
      ['24', '01'],
      ['25', '25'],
    ])(
      'lts/v0/ requests to a %s-prefix file should serve the %s-prefix file',
      async (requestedRtvPrefix, expectedRtvPrefix) => {
        fetchMock.mockResponse('…var global=self;…', {status: 200});

        const response = await fetchImmutableAmpFileOrDie(
          `${requestedRtvPrefix}2105150310000`,
          '/lts/v0/amp-list-0.1.js'
        );

        await expect(response.text()).resolves.toEqual('…var global=self;…');
        expect(response.status).toEqual(200);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          `https://storage.googleapis.com/org-cdn/org-cdn/rtv/${expectedRtvPrefix}2105150310000/v0/amp-list-0.1.js`,
          {
            'cf': {'cacheEverything': true, 'cacheTtl': 31536000},
          }
        );
      }
    );
  });
});
