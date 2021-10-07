import {Octokit} from '@octokit/rest';
import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';
import {mocked} from 'ts-jest/utils';
import {write} from 'worktop/kv';

import {syncAmpExp} from '../src/amp_exp';

import fixtureWebhookPullRequestClosed from './fixtures/webhook.pull_request.closed.json';

jest.mock('worktop/kv');
const writeMock = mocked(write);

const octokit = mocked({
  rest: {
    issues: {
      createComment: jest.fn(),
    },
  },
} as unknown as Octokit);

describe('amp_exp', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.resetMocks();
  });

  it('syncs AMP_EXP', async () => {
    const ampExp = JSON.stringify({
      experiments: [{name: 'foo-bar', percentage: 0.1}],
    });
    fetchMock.mockResponse(ampExp);

    await syncAmpExp('sha', octokit, fixtureWebhookPullRequestClosed);

    expect(writeMock).toHaveBeenCalledWith(null, 'AMP_EXP', ampExp);
    expect(octokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'danielrozenberg',
      repo: 'amphtml',
      'issue_number': 12,
      body: expect.stringContaining('have been deployed to the CDN'),
    });
  });

  it('fails on invalid schema', async () => {
    fetchMock.mockResponse(JSON.stringify({experiments: [{name: 'foo-bar'}]}));

    await syncAmpExp('sha', octokit, fixtureWebhookPullRequestClosed);

    expect(writeMock).not.toHaveBeenCalled();
    expect(octokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'danielrozenberg',
      repo: 'amphtml',
      'issue_number': 12,
      body: expect.stringContaining('does not pass schema validation'),
    });
  });

  it('fails on file-not-found', async () => {
    fetchMock.mockResponse('{"error": "message"}', {status: 404});

    await syncAmpExp('sha', octokit, fixtureWebhookPullRequestClosed);

    expect(writeMock).not.toHaveBeenCalled();
    expect(octokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'danielrozenberg',
      repo: 'amphtml',
      'issue_number': 12,
      body: expect.stringContaining('does not pass schema validation'),
    });
  });
});
