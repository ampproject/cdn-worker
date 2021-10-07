/** Client-side experiments (AMP_EXP) sync code. */

import type {Octokit} from '@octokit/rest';
import type {PullRequestClosedEvent} from '@octokit/webhooks-types';
import type {ValidateFunction} from 'ajv/dist/types';
import type {KV} from 'worktop/kv';
import {write} from 'worktop/kv';

import * as AmpExpSchemaModule from './schema/generated/amp_exp_schema';
const ampExpValidator =
  AmpExpSchemaModule.default as unknown as ValidateFunction;

// KV Binding via `wrangler.toml` config.
declare const AMP_EXP: KV.Namespace;

export const AMP_EXP_FILE =
  'build-system/global-configs/client-side-experiments-config.json';

/** Syncs AMP_EXP config. */
export async function syncAmpExp(
  sha: string,
  octokit: Octokit,
  payload: PullRequestClosedEvent
): Promise<void> {
  const {'pull_request': pullRequest} = payload;
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;

  console.log(
    'Pull request',
    pullRequest.number,
    'modified the client-side experiments (AMP_EXP) config file',
    AMP_EXP_FILE
  );
  try {
    const ampExpConfig = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/${AMP_EXP_FILE}`
    ).then((response) => response.json());
    if (!ampExpValidator(ampExpConfig)) {
      throw ampExpValidator.errors;
    }

    await write(AMP_EXP, 'AMP_EXP', JSON.stringify(ampExpConfig));
    await octokit.rest.issues.createComment({
      owner,
      repo,
      'issue_number': pullRequest.number,
      body: `This pull request's changes to the [client-side experiments config file](https://github.com/${owner}/${repo}/blob/${sha}/${AMP_EXP_FILE}) have been deployed to the CDN`,
    });
  } catch (error) {
    console.log(AMP_EXP_FILE, 'fails validation:', error);
    octokit.rest.issues.createComment({
      owner,
      repo,
      'issue_number': pullRequest.number,
      body:
        `This pull requested modified the [client-side experiments config file](https://github.com/${owner}/${repo}/blob/${sha}/${AMP_EXP_FILE}) but it does not pass schema validation.\n\n` +
        `Please send a follow-up pull request to fix this file using the [correct schema](https://github.com/${owner}/${repo}/blob/${sha}/build-system/global-configs/README.md#client-side-experiments-configjson).`,
    });
    return;
  }
}
