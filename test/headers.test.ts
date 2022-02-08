/**
 * Tests for headers.ts.
 */

import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';

import {CacheControl, HeaderKeys, withHeaders} from '../src/headers';

describe('headers', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  it('responds with headers', async () => {
    const inputResponse = new Response('alert("!");', {
      headers: {
        'Content-Type': 'application/javascript',
        'X-Other-Header': 'kittens',
      },
      status: 200,
    });

    const outputResponse = withHeaders(inputResponse, CacheControl.DEFAULT);

    expect(outputResponse.status).toEqual(200);
    await expect(outputResponse.text()).resolves.toEqual('alert("!");');
    expect(Object.fromEntries(outputResponse.headers)).toMatchObject({
      'access-control-allow-origin': '*',
      'cache-control': 'private, max-age=604800, stale-while-revalidate=604800',
      'content-type': 'text/javascript; charset=UTF-8',
      'cross-origin-resource-policy': 'cross-origin',
      'strict-transport-security':
        'max-age=31536000; includeSubDomains; preload',
      'timing-allow-origin': '*',
      'x-content-type-options': 'nosniff',
      'x-xss-protection': '0',
    });
  });

  it('adds extra headers', () => {
    const inputResponse = new Response('alert("!");', {
      headers: {'Content-Type': 'application/javascript'},
    });

    const outputResponse = withHeaders(
      inputResponse,
      CacheControl.DEFAULT,
      new Map([[HeaderKeys.X_FRAME_OPTIONS, 'deny']])
    );

    expect(Object.fromEntries(outputResponse.headers)).toMatchObject(
      expect.objectContaining({
        'x-frame-options': 'deny',
      })
    );
  });

  it('overrides the content type', () => {
    const inputResponse = new Response('<html></html>', {
      headers: {'Content-Type': 'text/plain'},
    });

    const outputResponse = withHeaders(
      inputResponse,
      CacheControl.DEFAULT,
      new Map([[HeaderKeys.CONTENT_TYPE, 'text/html']])
    );

    expect(Object.fromEntries(outputResponse.headers)).toMatchObject(
      expect.objectContaining({
        'content-type': 'text/html',
      })
    );
  });

  it('falls back to text/plain when there is no input content type', () => {
    const inputResponse = new Response('1A2B3C');
    // new Response() has a default Content-Type.
    inputResponse.headers.delete('content-type');

    const outputResponse = withHeaders(inputResponse, CacheControl.DEFAULT);

    expect(Object.fromEntries(outputResponse.headers)).toMatchObject(
      expect.objectContaining({
        'content-type': 'text/plain; charset=UTF-8',
      })
    );
  });
});
