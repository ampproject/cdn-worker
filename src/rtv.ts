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
 * @returns the chosen RTV.
 */
export async function chooseRtv(request: ServerRequest): Promise<string> {
  // Choose which channel to opt in to based on the following order:
  const channelChooser = [
    // Opt-in cookie value:
    Cookie.parse(request.headers.get('cookie') ?? '')['__Host-AMP_OPT_IN'],
    // Query param (?optin=channel-name):
    request.query.get('optin'),
    // LTS request:
    request.path.startsWith('/lts') && Channel.LTS,
    // Default to Stable:
    Channel.STABLE,
  ].filter(
    Boolean /* Removes "false"s, "null"s, and empty strings. */
  ) as string[]; /* Guaranteed after the filter. */

  for (const channel of channelChooser) {
    if (/^\d{15}$/.exec(channel)) {
      // Requests directly opted in to an RTV.
      return channel;
    }

    const rtv = await read(RTV, channel, {type: 'text'});
    if (rtv) {
      console.log('Chose RTV', rtv);
      return rtv;
    }
  }

  throw new Error(
    'No available RTV channel was chosen. This is a server error, due to missing `stable` channel config'
  );
}
