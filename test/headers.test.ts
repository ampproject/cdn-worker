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
      headers: {'Content-Type': 'text/javascript', 'X-Other-Header': 'kittens'},
      status: 200,
    });

    const outputResponse = withHeaders(inputResponse, CacheControl.DEFAULT);

    expect(outputResponse.status).toEqual(200);
    await expect(outputResponse.text()).resolves.toEqual('alert("!");');
    expect(Object.fromEntries(outputResponse.headers.entries())).toMatchObject({
      'access-control-allow-origin': '*',
      'cache-control': 'private, max-age=604800, stale-while-revalidate=604800',
      'content-security-policy':
        "default-src * blob: data:; script-src blob: https://cdn.ampproject.org/lts/ https://cdn.ampproject.org/rtv/ https://cdn.ampproject.org/sw/ https://cdn.ampproject.org/v0.js https://cdn.ampproject.org/v0.mjs https://cdn.ampproject.org/v0/ https://cdn.ampproject.org/viewer/; object-src 'none'; style-src 'unsafe-inline' https://cdn.ampproject.org/rtv/ https://cdn.materialdesignicons.com https://cloud.typography.com https://fast.fonts.net https://fonts.googleapis.com https://maxcdn.bootstrapcdn.com https://p.typekit.net https://pro.fontawesome.com https://use.fontawesome.com https://use.typekit.net; report-uri https://csp.withgoogle.com/csp/amp",
      'content-type': 'text/javascript',
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
      headers: {'Content-Type': 'text/javascript'},
    });

    const outputResponse = withHeaders(
      inputResponse,
      CacheControl.DEFAULT,
      new Map([[HeaderKeys.X_FRAME_OPTIONS, 'deny']])
    );

    expect(Object.fromEntries(outputResponse.headers.entries())).toMatchObject(
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

    expect(Object.fromEntries(outputResponse.headers.entries())).toMatchObject(
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

    expect(Object.fromEntries(outputResponse.headers.entries())).toMatchObject(
      expect.objectContaining({
        'content-type': 'text/plain',
      })
    );
  });
});
