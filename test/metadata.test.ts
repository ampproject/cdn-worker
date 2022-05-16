/**
 * Tests for metadata.ts.
 */

import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';
import {list, read} from 'worktop/kv';

import {rtvMetadata} from '../src/metadata';

jest.mock('worktop/kv', () => ({
  // this module's `list` method is an async generator (i.e.,
  // `async function* () {}`), and Jest's automock feature does not work with
  // those. Unfortunately this means we have to explicitly list all the
  // functions in this module that we want to mock.
  // TODO(danielrozenberg): https://github.com/facebook/jest/pull/11080 fixes
  // the need for this hack.
  list: jest.fn(),
  read: jest.fn(),
}));
const listMock = jest.mocked(list);
const readMock = jest.mocked(read);

describe('metadata', () => {
  beforeAll(() => {
    enableFetchMocks();

    listMock.mockImplementation(async function* () {
      yield {
        done: true,
        keys: [
          'beta',
          'control',
          'experimental',
          'lts',
          'nightly',
          'nightly-control',
          'stable',
        ],
      };
    });
    readMock.mockImplementation(
      async (_, key) =>
        ({
          'beta': '032105190310000',
          'control': '022105150310000',
          'experimental': '002105190310000',
          'lts': '012104031425006',
          'nightly': '042105220310000',
          'nightly-control': '052105150310000',
          'stable': '012105150310000',
        }[key])
    );
  });

  afterAll(() => {
    disableFetchMocks();
  });

  it('generates /rtv/metadata', async () => {
    const outputResponse = await rtvMetadata('https://example.com');

    await expect(outputResponse.json()).resolves.toMatchObject({
      ampRuntimeVersion: '012105150310000',
      ampCssUrl: 'https://example.com/rtv/012105150310000/v0.css',
      canaryPercentage: '0.005',
      diversions: [
        '022105150310000',
        '052105150310000',
        '002105190310000',
        '032105190310000',
        '042105220310000',
      ],
      ltsRuntimeVersion: '012104031425006',
      ltsCssUrl: 'https://example.com/rtv/012104031425006/v0.css',
    });
  });
});
