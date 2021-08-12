/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {KV, list, read} from 'worktop/kv';
import {ServerRequest} from 'worktop/request';

import {Channel} from './rtv';

/**
 * Contains function that dynamically generates the /rtv/metadata
 * JSON file.
 */

// KV Binding via `wrangler.toml` config.
declare const RTV: KV.Namespace;

/**
 * Dynamically generates the /rtv/metadata JSON file.
 *
 * @returns Response object with the /rtv/metadata JSON file.
 */
export async function rtvMetadata(request: ServerRequest): Promise<Response> {
  console.log('Generating /rtv/metadata');

  const kvSpaces = list(RTV, {metadata: false});
  const rtvs = new Map<string, string>();
  for await (const kvSpace of kvSpaces) {
    for (const channel of kvSpace.keys) {
      const rtv = (await read<string>(RTV, channel, {type: 'text'})) as string;
      rtvs.set(channel, rtv);
    }
  }

  const stableRtv = rtvs.get(Channel.STABLE);
  const ltsRtv = rtvs.get(Channel.LTS);
  const otherRtvs = [...rtvs.values()].filter(
    (rtv) => ![stableRtv, ltsRtv].includes(rtv)
  );

  return new Response(
    JSON.stringify({
      ampRuntimeVersion: stableRtv,
      ampCssUrl: stableRtv && `${request.origin}/rtv/${stableRtv}/v0.css`,
      // TODO(danielrozenberg): currently 0, really.
      canaryPercentage: '0.005',
      diversions: otherRtvs,
      ltsRuntimeVersion: ltsRtv,
      ltsCssUrl: ltsRtv && `${request.origin}/rtv/${ltsRtv}/v0.css`,
    })
  );
}
