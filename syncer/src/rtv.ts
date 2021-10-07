/** Contains functions that choose an RTV based on the request. */

import type {Octokit} from '@octokit/rest';
import type {PullRequestClosedEvent} from '@octokit/webhooks-types';
import type {ValidateFunction} from 'ajv';
import type {KV} from 'worktop/kv';
import {write} from 'worktop/kv';

import * as RtvSchemaModule from './schema/generated/rtv_schema';
const versioningValidator =
  RtvSchemaModule.default as unknown as ValidateFunction;

// KV Binding via `wrangler.toml` config.
declare const RTV: KV.Namespace;

export const VERSIONING_FILE =
  'build-system/global-configs/versioning-config.json';

interface Versioning {
  stable: string;
  [channel: string]: string;
}

/** Syncs versioning config. */
export async function syncVersioning(
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
    'modified the versioning (RTV) config file',
    VERSIONING_FILE
  );
  try {
    const versioning: Versioning = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/${sha}/${VERSIONING_FILE}`
    ).then((response) => response.json());
    if (!versioningValidator(versioning)) {
      throw versioningValidator.errors;
    }
    await Promise.all(
      Object.entries(versioning).map(async ([channel, rtv]) => {
        await write(RTV, channel, rtv);
        console.log('Set version of', channel, 'channel to', rtv);
      })
    );
    await octokit.rest.issues.createComment({
      owner,
      repo,
      'issue_number': pullRequest.number,
      body: `This pull request's changes to the [versioning config file](https://github.com/${owner}/${repo}/blob/${sha}/${VERSIONING_FILE}) have been deployed to the CDN`,
    });
  } catch (error) {
    console.log(VERSIONING_FILE, 'fails validation:', error);
    octokit.rest.issues.createComment({
      owner,
      repo,
      'issue_number': pullRequest.number,
      body:
        `This pull request modified the [versioning config file](https://github.com/${owner}/${repo}/blob/${sha}/${VERSIONING_FILE}) but it does not pass schema validation.\n\n` +
        `Please send a follow-up pull request to fix this file using the [correct schema](https://github.com/${owner}/${repo}/blob/${sha}/build-system/global-configs/README.md#versioning-configjson).`,
    });
    return;
  }
}
