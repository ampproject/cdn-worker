/**
 * Tests for rtv.ts.
 */

import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';
import {read} from 'worktop/kv';
import {ServerRequest} from 'worktop/request';

import {chooseRtv} from '../src/rtv';

jest.mock('worktop/kv');
const readMock = jest.mocked(read);

// Object to match the last parameter passed to mock `read` function calls.
const opts = {
  type: 'text',
};

/** Sets the RTVs to be returned by the mock */
function setRtvs(rtvs: Record<string, string | null>): void {
  readMock.mockName('readMock');
  readMock.mockImplementation(async (_, key) => rtvs[key]);
}

/** Makes a ServerRequest-like object to be used by chooseRtvs. */
function makeServerRequest(
  path: string,
  optInOptions?: {
    queryParam?: string;
    cookie?: string;
  }
): ServerRequest {
  // @ts-expect-error ignore missing fields, we only care about these ones.
  return {
    path,
    query: new URLSearchParams(
      optInOptions?.queryParam ? {optin: optInOptions.queryParam} : {}
    ),
    headers: new Headers({
      cookie: optInOptions?.cookie
        ? `__Host-AMP_OPT_IN=${optInOptions?.cookie}`
        : '',
    }),
  };
}

describe('rtv', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    // Some individual tests call setRtvs on their own to override this.
    setRtvs({
      'beta-opt-in': '032105190310001',
      'beta-traffic': '032105190310000',
      'control': '022105150310000',
      'experimental-opt-in': '002105190310001',
      'experimental-traffic': '002105190310000',
      'experimentA': null,
      'experimentB': '112105190310000',
      'experimentC': null,
      'lts': '012104031425006',
      'nightly': '042105220310000',
      'nightly-control': '052105150310000',
      'stable': '012105150310000',
    });
  });

  it('chooses an RTV for unversioned requests', async () => {
    const rtv = await chooseRtv(makeServerRequest('/v0.js'));

    expect(rtv).toEqual('012105150310000');
    expect(readMock).toHaveBeenCalledTimes(1);
    expect(readMock).toHaveBeenCalledWith(null, 'stable', opts);
  });

  it('chooses an RTV for unversioned LTS requests', async () => {
    const rtv = await chooseRtv(makeServerRequest('/lts/v0.js'));

    expect(rtv).toEqual('012104031425006');
    expect(readMock).toHaveBeenCalledTimes(1);
    expect(readMock).toHaveBeenCalledWith(null, 'lts', opts);
  });

  it('falls back to stable when LTS is missing, for unversioned LTS requests', async () => {
    setRtvs({
      'stable': '012105150310000',
    });

    const rtv = await chooseRtv(makeServerRequest('/lts/v0.js'));

    expect(rtv).toEqual('012105150310000');
    expect(readMock).toHaveBeenCalledTimes(2);
    expect(readMock).toHaveBeenNthCalledWith(1, null, 'lts', opts);
    expect(readMock).toHaveBeenNthCalledWith(2, null, 'stable', opts);
  });

  it('opts in to channel via query param', async () => {
    const rtv = await chooseRtv(
      makeServerRequest('/v0.js', {queryParam: 'beta'})
    );

    expect(rtv).toEqual('032105190310001');
    expect(readMock).toHaveBeenCalledTimes(1);
    expect(readMock).toHaveBeenCalledWith(null, 'beta-opt-in', opts);
  });

  it('opts in to channel via cookie', async () => {
    const rtv = await chooseRtv(
      makeServerRequest('/v0.js', {cookie: 'experimental'})
    );

    expect(rtv).toEqual('002105190310001');
    expect(readMock).toHaveBeenCalledTimes(1);
    expect(readMock).toHaveBeenCalledWith(null, 'experimental-opt-in', opts);
  });

  it('prefers opting in via cookie over the query param', async () => {
    const rtv = await chooseRtv(
      makeServerRequest('/v0.js', {queryParam: 'beta', cookie: 'experimental'})
    );

    expect(rtv).toEqual('002105190310001');
    expect(readMock).toHaveBeenCalledTimes(1);
    expect(readMock).toHaveBeenCalledWith(null, 'experimental-opt-in', opts);
  });

  it('opts in to RTV number via query param', async () => {
    const rtv = await chooseRtv(
      makeServerRequest('/v0.js', {queryParam: '111112222233333'})
    );

    expect(rtv).toEqual('111112222233333');
    expect(readMock).not.toHaveBeenCalled();
  });

  it('falls back to stable on unknown channel names in cookie or query param', async () => {
    const rtv = await chooseRtv(
      makeServerRequest('/v0.js', {queryParam: 'kittens', cookie: 'doggies'})
    );

    expect(rtv).toEqual('012105150310000');
    expect(readMock).toHaveBeenCalledTimes(3);
    expect(readMock).toHaveBeenNthCalledWith(1, null, 'doggies', opts);
    expect(readMock).toHaveBeenNthCalledWith(2, null, 'kittens', opts);
    expect(readMock).toHaveBeenNthCalledWith(3, null, 'stable', opts);
  });

  it('raises an error if no RTVs were undefined', async () => {
    setRtvs({});

    await expect(() =>
      chooseRtv(
        makeServerRequest('/lts/v0.js', {queryParam: 'beta', cookie: 'nightly'})
      )
    ).rejects.toThrowError('No available RTV');

    expect(readMock).toHaveBeenCalledTimes(4);
    expect(readMock).toHaveBeenNthCalledWith(1, null, 'nightly', opts);
    expect(readMock).toHaveBeenNthCalledWith(2, null, 'beta-opt-in', opts);
    expect(readMock).toHaveBeenNthCalledWith(3, null, 'lts', opts);
    expect(readMock).toHaveBeenNthCalledWith(4, null, 'stable', opts);
  });
});
