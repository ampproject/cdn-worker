/**
 * Contains function that dynamically generates the /rtv/metadata
 * JSON file.
 */

import {
  KVNamespace,
  KVNamespaceListResult,
  Response,
  console,
} from '@cloudflare/workers-types';

import {Channel} from './rtv';

// KV Binding via `wrangler.toml` config.
declare const RTV: KVNamespace;

/**
 * Helper function that lists all keys in a KVNamespace.
 */
async function listAllKeys<Key extends string>(
  kv: KVNamespace<Key>
): Promise<Key[]> {
  const keys: Key[] = [];
  let cursor;
  while (true) {
    const listResult: KVNamespaceListResult<unknown, Key> = await kv.list({
      cursor,
    });
    keys.push(...listResult.keys.map(({name}) => name));

    if (listResult.list_complete) {
      return keys;
    }

    cursor = listResult.cursor;
  }
}

/**
 * Dynamically generates the /rtv/metadata JSON file.
 *
 * @param origin - origin part of the request URL.
 * @returns Response object with the /rtv/metadata JSON file.
 */
export async function rtvMetadata(origin: string): Promise<Response> {
  console.log('Generating /rtv/metadata');

  const rtvs = new Map<string, string>();
  for (const channel of await listAllKeys(RTV)) {
    rtvs.set(channel, (await RTV.get(channel)) as string);
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
