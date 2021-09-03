/**
 * Tests for headers.ts.
 */

import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';
import {mocked} from 'ts-jest/utils';
import {read} from 'worktop/kv';

import {injectAmpExp, injectAmpGeo} from '../src/injectors';

jest.mock('worktop/kv');
const readMock = mocked(read);

describe('injectors', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  describe('AMP_EXP', () => {
    it('injects AMP_EXP object', async () => {
      readMock.mockResolvedValue({
        experiments: [
          {name: 'foo', percentage: 0.5, rtvPrefixes: ['00']},
          {name: 'bar', percentage: 1},
          {name: 'baz', percentage: 0.2, rtvPrefixes: ['..2105']},
          {name: 'qux', percentage: 0.2, rtvPrefixes: ['0.2106']},
        ],
      });

      const inputResponse = new Response(
        'self.AMP_CONFIG={"v":"002105150310000"};/*AMP_CONFIG*/var global=self;…',
        {headers: {'Content-Type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpExp(
        inputResponse,
        '002105150310000'
      );

      await expect(outputResponse.text()).resolves.toEqual(
        'self.AMP_CONFIG={"v":"002105150310000"};/*AMP_CONFIG*/self.AMP_EXP={"foo":0.5,"bar":1,"baz":0.2};/*AMP_EXP*/var global=self;…'
      );
    });

    it('skips on missing AMP_EXP config', async () => {
      readMock.mockResolvedValue(undefined);

      const inputResponse = new Response(
        'self.AMP_CONFIG={"v":"002105150310000"};/*AMP_CONFIG*/var global=self;…',
        {headers: {'Content-Type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpExp(
        inputResponse,
        '002105150310000'
      );

      expect(outputResponse).toBe(inputResponse);
    });

    it('ignores AMP_EXP when there are no matching RTVs', async () => {
      readMock.mockResolvedValue({
        experiments: [{name: 'foo', percentage: 0.5, rtvPrefixes: ['01']}],
      });

      const inputResponse = new Response(
        'self.AMP_CONFIG={"v":"002105150310000"};/*AMP_CONFIG*/var global=self;…',
        {headers: {'Content-Type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpExp(
        inputResponse,
        '002105150310000'
      );

      expect(outputResponse).toBe(inputResponse);
    });
  });

  describe('amp-geo', () => {
    it('injects country code', async () => {
      const inputResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {headers: {'Content-Type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpGeo(inputResponse, 'US');

      await expect(outputResponse.text()).resolves.toEqual(
        '…d=T.exec("us                          ")…'
      );
    });

    it('injects country and region codes', async () => {
      const inputResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {headers: {'Content-Type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpGeo(inputResponse, 'US', 'CA');

      await expect(outputResponse.text()).resolves.toEqual(
        '…d=T.exec("us us-ca                    ")…'
      );
    });

    it('ignores explicitly missing region code', async () => {
      const inputResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {headers: {'Content-Type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpGeo(inputResponse, 'BR', undefined);

      await expect(outputResponse.text()).resolves.toEqual(
        '…d=T.exec("br                          ")…'
      );
    });

    it('ignores explicitly missing country code', async () => {
      const inputResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {headers: {'Content-Type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpGeo(inputResponse, null);

      expect(outputResponse).toBe(inputResponse);
    });
  });
});
