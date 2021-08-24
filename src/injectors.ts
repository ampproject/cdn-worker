/**
 * Contains functions that inject dynamic content.
 */

import {KV, read} from 'worktop/kv';

// KV Binding via `wrangler.toml` config.
declare const AMP_EXP: KV.Namespace;

interface AmpExp {
  experiments: Array<{
    name: string;
    percentage: number;
    rtvPrefixes?: string[];
  }>;
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
  const ampExpConfig = await read<AmpExp>(AMP_EXP, 'AMP_EXP', {type: 'json'});
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
  const text = await response.text();
  response = new Response(
    text.replace(
      '/*AMP_CONFIG*/',
      `/*AMP_CONFIG*/self.AMP_EXP=${JSON.stringify(ampExpJson)};/*AMP_EXP*/`
    ),
    response
  );
  return response;
}

/**
 * Injects country code into amp-geo file.
 *
 * @param response - object to inject country code into.
 * @param countryIso - to use.
 * @returns new Response object with injected content.
 */
export async function injectAmpGeo(
  response: Response,
  countryIso: string | null
): Promise<Response> {
  if (!countryIso) {
    console.warn('ISO country code is empty, skipping amp-geo injection');
    return response;
  }
  console.log('Injecting amp-geo ISO country code');
  // TODO(danielrozenberg): add support for subdivisions, e.g., "us-ca"
  const text = await response.text();
  return new Response(
    text.replace(
      '{{AMP_ISO_COUNTRY_HOTPATCH}}',
      countryIso.toLowerCase().padEnd(28)
    ),
    response
  );
}
