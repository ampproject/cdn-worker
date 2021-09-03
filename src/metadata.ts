/**
 * Contains function that dynamically generates the /rtv/metadata
 * JSON file.
 */

import {KV, list, read} from 'worktop/kv';

import {Channel} from './rtv';

// KV Binding via `wrangler.toml` config.
declare const RTV: KV.Namespace;

/**
 * Dynamically generates the /rtv/metadata JSON file.
 *
 * @param origin - origin part of the request URL.
 * @returns Response object with the /rtv/metadata JSON file.
 */
export async function rtvMetadata(origin: string): Promise<Response> {
  console.log('Generating /rtv/metadata');

  const kvSpaces = list(RTV, {metadata: false});
  const rtvs = new Map<string, string>();
  for await (const kvSpace of kvSpaces) {
    await Promise.all(
      kvSpace.keys.map(async (channel) => {
        const rtv = await read<string>(RTV, channel, {
          type: 'text',
        });
        rtvs.set(channel, rtv as string);
      })
    );
  }

  const stableRtv = rtvs.get(Channel.STABLE);
  const ltsRtv = rtvs.get(Channel.LTS);
  const otherRtvs = [...rtvs.values()]
    .filter((rtv) => ![stableRtv, ltsRtv].includes(rtv))
    // Order this list by AMP version number, then by RTV prefix.
    .sort((a, b) => Number(a.slice(0, 2)) - Number(b.slice(0, 2)))
    .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));

  return new Response(
    JSON.stringify({
      ampRuntimeVersion: stableRtv,
      ampCssUrl: stableRtv && `${origin}/rtv/${stableRtv}/v0.css`,
      // TODO(danielrozenberg): currently 0, really.
      canaryPercentage: '0.005',
      diversions: otherRtvs,
      ltsRuntimeVersion: ltsRtv,
      ltsCssUrl: ltsRtv && `${origin}/rtv/${ltsRtv}/v0.css`,
    })
  );
}
