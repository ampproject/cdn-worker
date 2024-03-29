/**
 * Tests for headers.ts.
 */

import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';

import {injectAmpExp, injectAmpGeo} from '../src/injectors';

describe('injectors', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  describe('AMP_EXP', () => {
    it('injects AMP_EXP object', async () => {
      const inputResponse = new Response(
        'self.AMP_CONFIG={"v":"002105150310000"};/*AMP_CONFIG*/var global=self;…',
        {headers: {'content-type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpExp(
        inputResponse,
        '002105150310000',
        {
          experiments: [
            {name: 'foo', percentage: 0.5, rtvPrefixes: ['00']},
            {name: 'bar', percentage: 1},
            {name: 'baz', percentage: 0.2, rtvPrefixes: ['..2105']},
            {name: 'qux', percentage: 0.2, rtvPrefixes: ['0.2106']},
          ],
        }
      );

      await expect(outputResponse.text()).resolves.toEqual(
        'self.AMP_CONFIG={"v":"002105150310000"};/*AMP_CONFIG*/self.AMP_EXP={"foo":0.5,"bar":1,"baz":0.2};/*AMP_EXP*/var global=self;…'
      );
    });

    it('skips on empty AMP_EXP config', async () => {
      const inputResponse = new Response(
        'self.AMP_CONFIG={"v":"002105150310000"};/*AMP_CONFIG*/var global=self;…',
        {headers: {'content-type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpExp(
        inputResponse,
        '002105150310000',
        {experiments: []}
      );

      expect(outputResponse).toBe(inputResponse);
    });

    it('ignores AMP_EXP when there are no matching RTVs', async () => {
      const inputResponse = new Response(
        'self.AMP_CONFIG={"v":"002105150310000"};/*AMP_CONFIG*/var global=self;…',
        {headers: {'content-type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpExp(
        inputResponse,
        '002105150310000',
        {
          experiments: [{name: 'foo', percentage: 0.5, rtvPrefixes: ['01']}],
        }
      );

      expect(outputResponse).toBe(inputResponse);
    });
  });

  describe('amp-geo', () => {
    it('injects country code', async () => {
      const inputResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {headers: {'content-type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpGeo(inputResponse, 'US');

      await expect(outputResponse.text()).resolves.toEqual(
        '…d=T.exec("us                          ")…'
      );
    });

    it('injects country and region codes', async () => {
      const inputResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {headers: {'content-type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpGeo(inputResponse, 'US', 'CA');

      await expect(outputResponse.text()).resolves.toEqual(
        '…d=T.exec("us us-ca                    ")…'
      );
    });

    it('ignores explicitly missing region code', async () => {
      const inputResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {headers: {'content-type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpGeo(inputResponse, 'BR', undefined);

      await expect(outputResponse.text()).resolves.toEqual(
        '…d=T.exec("br                          ")…'
      );
    });

    it('ignores explicitly missing country code', async () => {
      const inputResponse = new Response(
        '…d=T.exec("{{AMP_ISO_COUNTRY_HOTPATCH}}")…',
        {headers: {'content-type': 'text/javascript'}}
      );

      const outputResponse = await injectAmpGeo(inputResponse, null);

      expect(outputResponse).toBe(inputResponse);
    });
  });
});
