/**
 * Contains functions that inject dynamic content.
 */

import {KV, read} from 'worktop/kv';

import * as brotli from './brotli-wasm-wrapper';
import {ContentEncoding, ContentType, HeaderKeys} from './headers';

// KV Binding via `wrangler.toml` config.
declare const CONFIG: KV.Namespace;

// TODO(danielrozenberg): this is only correct for requests that accept Brotli, fix.
const HEADERS_FOR_INJECTED_RESPONSE: ResponseInit = {
  headers: {
    [HeaderKeys.CONTENT_TYPE]: ContentType.TEXT_JAVASCRIPT,
    [HeaderKeys.CONTENT_ENCODING]: ContentEncoding.BROTLI,
  },
  encodeBody: 'manual',
};

const textEncoder = new TextEncoder();

interface AmpExp {
  experiments: Array<{
    name: string;
    percentage: number;
    rtvPrefixes?: string[];
  }>;
}

/**
 * Compresses a text (assumed to be in UTF-8) to Brotli level 11.
 */
async function brotliCompress(text: string): Promise<Uint8Array> {
  return brotli.compress(textEncoder.encode(text), {quality: 11});
}

/**
 * Injects AMP_EXP object into an AMP entry file.
 *
 * @param response - object to inject AMP_EXP into.
 * @param rtv - number to filter by.
 * @returns new Response object with injected content.
 */
export async function injectAmpExp(
  response: Response,
  rtv: string
): Promise<Response> {
  const ampExpConfig = await read<AmpExp>(CONFIG, 'AMP_EXP', {type: 'json'});
  if (!ampExpConfig) {
    console.warn('AMP_EXP config is missing from KV store, skipping injection');
    return response;
  }

  const ampExpJson = Object.fromEntries(
    ampExpConfig.experiments
      .filter(
        (experiment) =>
          !experiment.rtvPrefixes ||
          experiment.rtvPrefixes.some((rtvPrefix) =>
            new RegExp(`^${rtvPrefix}`).test(rtv)
          )
      )
      .map((experiment) => [experiment.name, experiment.percentage])
  );
  if (Object.keys(ampExpJson).length === 0) {
    console.info('No AMP_EXP defined for RTV', rtv, '; skipping injection');
    return response;
  }

  console.log('Injecting AMP_EXP');
  const ampExpJsonString = JSON.stringify(ampExpJson);
  const text = `self.AMP_EXP=${ampExpJsonString};/*AMP_EXP*/${await response.text()}`;
  return new Response(
    await brotliCompress(text),
    HEADERS_FOR_INJECTED_RESPONSE
  );
}

/**
 * Injects country code into amp-geo file.
 *
 * @param response - object to inject country code into.
 * @param countryIso - to use.
 * @param regionIso - (optional) to use.
 * @returns new Response object with injected content.
 */
export async function injectAmpGeo(
  response: Response,
  countryIso: string | null,
  regionIso?: string
): Promise<Response> {
  if (!countryIso) {
    console.warn('ISO country code is empty, skipping amp-geo injection');
    return response;
  }

  console.log('Injecting amp-geo ISO country code');
  const text = await response.text();
  const injectIsoCode = regionIso
    ? `${countryIso} ${countryIso}-${regionIso}`
    : countryIso;
  const replacedText = text.replace(
    '{{AMP_ISO_COUNTRY_HOTPATCH}}',
    injectIsoCode.toLowerCase().padEnd(28)
  );
  return new Response(
    await brotliCompress(replacedText),
    HEADERS_FOR_INJECTED_RESPONSE
  );
}
