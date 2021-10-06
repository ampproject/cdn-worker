/**
 * Contains the GitHub App code.
 */

import type {Octokit} from '@octokit/rest';
import type {PullRequestClosedEvent} from '@octokit/webhooks-types';

import {AMP_EXP_FILE, syncAmpExp} from './amp_exp';
import {VERSIONING_FILE, syncVersioning} from './rtv';

/** Handler implementation for pull_request.closed events. */
export async function pullRequestClosedHandler(
  userOctokit: Octokit,
  appOctokit: Octokit,
  payload: PullRequestClosedEvent
): Promise<void> {
  const {'pull_request': pullRequest} = payload;
  const {'merge_commit_sha': mergeCommitSha} = pullRequest;
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;

  if (!pullRequest.merged || pullRequest.base.ref !== 'main') {
    return;
  }
  if (!mergeCommitSha) {
    return;
  }

  console.log(
    'Pull request',
    pullRequest.number,
    'merged into',
    pullRequest.base.ref,
    'as',
    mergeCommitSha
  );

  const commitResponse = await appOctokit.rest.repos.getCommit({
    owner,
    repo,
    ref: mergeCommitSha,
  });
  const {files} = commitResponse.data;

  if (files?.some((file) => file.filename === AMP_EXP_FILE)) {
    await syncAmpExp(mergeCommitSha, userOctokit, payload);
  }
  if (files?.some((file) => file.filename === VERSIONING_FILE)) {
    await syncVersioning(mergeCommitSha, userOctokit, payload);
  }
}
