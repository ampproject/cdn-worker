/**
 * Contains functions that choose an RTV based on the request.
 */

import {KVNamespace, Request, URL, console} from '@cloudflare/workers-types';

// KV Binding via `wrangler.toml` config.
declare const RTV: KVNamespace;

export enum Channel {
  STABLE = 'stable',
  CONTROL = 'control',
  LTS = 'lts',
  BETA = 'beta',
  EXPERIMENTAL = 'experimental',
  NIGHTLY = 'nightly',
  NIGHTLY_CONTROL = 'nightly-control',
}

// Some channels have a separation between `-opt-in` and `-traffic`, while the
// rest do not. This set contains all the channels that can only be opted in to
// by adding the `-opt-in` suffix.
const CHANNELS_WITH_OPT_IN_SUFFIX: ReadonlySet<string> = new Set([
  Channel.BETA,
  Channel.EXPERIMENTAL,
]);

/**
 * Adds an `-opt-in` suffix to opt in channels that require it.
 * @param channel - name of a channel that might require an `-opt-in` suffix.
 * @returns the passed in `channel`, or or `channel` + '-opt-in'.
 */
function maybeAddOptInSuffix(channel: string | null): string | null {
  return channel && CHANNELS_WITH_OPT_IN_SUFFIX.has(channel)
    ? `${channel}-opt-in`
    : channel;
}

/**
 * Chooses which RTV to use for a requested unversioned file.
 *
 * @param request - the request object.
 * @returns the chosen RTV.
 */
export async function chooseRtv(request: Request): Promise<string> {
  const optInCookie = maybeAddOptInSuffix(
    Cookie.parse(request.headers.get('cookie') ?? '')['__Host-AMP_OPT_IN']
  );
  const {pathname, searchParams} = new URL(request.url);
  const optInQueryParam = maybeAddOptInSuffix(searchParams.get('optin'));

  // Choose which channel to opt in to based on the following order.
  const channelChooser = [
    // Opt-in cookie value:
    optInCookie,
    // Query param (?optin=channel-name):
    optInQueryParam,
    // LTS request:
    pathname.startsWith('/lts') && Channel.LTS,
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

    const rtv = await RTV.get(channel);
    if (rtv) {
      console.log('Chose RTV', rtv);
      return rtv;
    }
  }

  throw new Error(
    'No available RTV channel was chosen. This is a server error, due to missing `stable` channel config'
  );
}
