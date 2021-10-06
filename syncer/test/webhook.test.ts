/**
 * Tests for webhook.ts.
 */

import type {Octokit} from '@octokit/rest';
import {mocked} from 'ts-jest/utils';

import {AMP_EXP_FILE, syncAmpExp} from '../src/amp_exp';
import {VERSIONING_FILE, syncVersioning} from '../src/rtv';
import {pullRequestClosedHandler} from '../src/webhook';

import fixtureWebhookPullRequestClosed from './fixtures/webhook.pull_request.closed.json';

jest.mock('../src/amp_exp');
const syncAmpExpMock = mocked(syncAmpExp);

jest.mock('../src/rtv');
const syncVersioningMock = mocked(syncVersioning);

const getCommitMock = jest.fn();
const octokit = mocked({
  rest: {
    repos: {
      getCommit: getCommitMock,
    },
  },
} as unknown as Octokit);

describe('webhook', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('syncs AMP_EXP', async () => {
    getCommitMock.mockResolvedValue({
      data: {
        files: [
          {filename: 'some/other/file'},
          {filename: AMP_EXP_FILE},
          {filename: 'yet/another/file'},
        ],
      },
    });

    await pullRequestClosedHandler(
      octokit,
      octokit,
      fixtureWebhookPullRequestClosed
    );

    expect(getCommitMock).toHaveBeenCalledWith({
      owner: 'danielrozenberg',
      repo: 'amphtml',
      ref: 'ad43b36f7f0b6c040678a1c73bd1b10cedcbf1c7',
    });
    expect(syncAmpExpMock).toHaveBeenCalledWith(
      'ad43b36f7f0b6c040678a1c73bd1b10cedcbf1c7',
      octokit,
      fixtureWebhookPullRequestClosed
    );
    expect(syncVersioningMock).not.toHaveBeenCalled();
  });

  it('syncs RTVs', async () => {
    getCommitMock.mockResolvedValue({
      data: {
        files: [
          {filename: 'some/other/file'},
          {filename: VERSIONING_FILE},
          {filename: 'yet/another/file'},
        ],
      },
    });

    await pullRequestClosedHandler(
      octokit,
      octokit,
      fixtureWebhookPullRequestClosed
    );

    expect(getCommitMock).toHaveBeenCalledWith({
      owner: 'danielrozenberg',
      repo: 'amphtml',
      ref: 'ad43b36f7f0b6c040678a1c73bd1b10cedcbf1c7',
    });
    expect(syncAmpExpMock).not.toHaveBeenCalled();
    expect(syncVersioningMock).toHaveBeenCalledWith(
      'ad43b36f7f0b6c040678a1c73bd1b10cedcbf1c7',
      octokit,
      fixtureWebhookPullRequestClosed
    );
  });

  it('syncs both AMP_EXP and RTVs', async () => {
    getCommitMock.mockResolvedValue({
      data: {
        files: [
          {filename: 'some/other/file'},
          {filename: AMP_EXP_FILE},
          {filename: VERSIONING_FILE},
          {filename: 'yet/another/file'},
        ],
      },
    });

    await pullRequestClosedHandler(
      octokit,
      octokit,
      fixtureWebhookPullRequestClosed
    );

    expect(getCommitMock).toHaveBeenCalledWith({
      owner: 'danielrozenberg',
      repo: 'amphtml',
      ref: 'ad43b36f7f0b6c040678a1c73bd1b10cedcbf1c7',
    });
    expect(syncAmpExpMock).toHaveBeenCalledWith(
      'ad43b36f7f0b6c040678a1c73bd1b10cedcbf1c7',
      octokit,
      fixtureWebhookPullRequestClosed
    );
    expect(syncVersioningMock).toHaveBeenCalledWith(
      'ad43b36f7f0b6c040678a1c73bd1b10cedcbf1c7',
      octokit,
      fixtureWebhookPullRequestClosed
    );
  });

  it('ignored PRs that do not modify files of interest', async () => {
    getCommitMock.mockResolvedValue({data: {files: []}});

    await pullRequestClosedHandler(
      octokit,
      octokit,
      fixtureWebhookPullRequestClosed
    );

    expect(getCommitMock).toHaveBeenCalledWith({
      owner: 'danielrozenberg',
      repo: 'amphtml',
      ref: 'ad43b36f7f0b6c040678a1c73bd1b10cedcbf1c7',
    });
    expect(syncAmpExpMock).not.toHaveBeenCalled();
    expect(syncVersioningMock).not.toHaveBeenCalled();
  });

  it.each([
    {merged: false},
    {merged: true, base: {ref: 'amp-release-1234'}},
    {merged: true, base: {ref: 'main'}, 'merge_commit_sha': null},
  ])(
    'ignores PRs that do not merge correctly into the main branch (%j)',
    async (extraPayload) => {
      const payload = Object.assign({}, fixtureWebhookPullRequestClosed, {
        'pull_request': extraPayload,
      });

      await pullRequestClosedHandler(octokit, octokit, payload);

      expect(getCommitMock).not.toHaveBeenCalled();
      expect(syncAmpExpMock).not.toHaveBeenCalled();
      expect(syncVersioningMock).not.toHaveBeenCalled();
    }
  );
});
