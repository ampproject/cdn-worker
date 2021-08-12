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

/**
 * Contains functions that choose an RTV based on the request.
 */

import * as Cookie from 'worktop/cookie';
import {KV} from 'worktop/kv';
import {read} from 'worktop/kv';
import {ServerRequest} from 'worktop/request';

// KV Binding via `wrangler.toml` config.
declare const RTV: KV.Namespace;

export enum Channel {
  STABLE = 'stable',
  CONTROL = 'control',
  LTS = 'lts',
  BETA = 'beta',
  EXPERIMENTAL = 'experimental',
  NIGHTLY = 'nightly',
  NIGHTLY_CONTROL = 'nightly-control',
}

/**
 * Chooses which RTV to use for a requested unversioned file.
 *
 * @param request - the request object.
 * @param isLts - whether this is a request for an LTS file.
 * @returns the chosen RTV.
 */
export async function chooseRtv(
  request: ServerRequest,
  isLts: boolean
): Promise<string> {
  // Choose which channel to opt in to based on the following order:
  const channelChooser = [
    // Opt-in cookie value:
    Cookie.parse(request.headers.get('cookie') ?? '').__Host_AMP_OPT_IN,
    // Query param (?optin=channel-name):
    request.query.get('optin'),
    // LTS request:
    isLts && Channel.LTS,
    // Default to Stable:
    Channel.STABLE,
  ].filter(
    Boolean /* Removes "false"s, "null"s, and empty strings. */
  ) as string[]; /* Guaranteed after the filter. */

  for (const channel of channelChooser) {
    const rtv = await read<string>(RTV, channel, {type: 'text'});
    if (rtv) {
      return rtv;
    }
  }

  throw new Error(
    'No available RTV channel was chosen. This is a server error, due to missing `stable` channel config'
  );
}
