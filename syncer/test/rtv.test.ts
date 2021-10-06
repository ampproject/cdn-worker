/**
 * Test for rtv.ts
 */

import {Octokit} from '@octokit/rest';
import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';
import {mocked} from 'ts-jest/utils';
import {write} from 'worktop/kv';

import {syncVersioning} from '../src/rtv';

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

describe('rtv', () => {
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

  it('syncs RTVs', async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        stable: '011234567890123',
        control: '021234567890123',
        'beta-opt-in': '031234567890123',
      })
    );

    await syncVersioning('sha', octokit, fixtureWebhookPullRequestClosed);

    expect(writeMock).toHaveBeenCalledWith(null, 'stable', '011234567890123');
    expect(writeMock).toHaveBeenCalledWith(null, 'control', '021234567890123');
    expect(writeMock).toHaveBeenCalledWith(
      null,
      'beta-opt-in',
      '031234567890123'
    );
    expect(octokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'danielrozenberg',
      repo: 'amphtml',
      'issue_number': 12,
      body: expect.stringContaining('have been deployed to the CDN'),
    });
  });

  it('fails on invalid schema', async () => {
    fetchMock.mockResponse(JSON.stringify({experimental: 5}));

    await syncVersioning('sha', octokit, fixtureWebhookPullRequestClosed);

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

    await syncVersioning('sha', octokit, fixtureWebhookPullRequestClosed);

    expect(writeMock).not.toHaveBeenCalled();
    expect(octokit.rest.issues.createComment).toHaveBeenCalledWith({
      owner: 'danielrozenberg',
      repo: 'amphtml',
      'issue_number': 12,
      body: expect.stringContaining('does not pass schema validation'),
    });
  });
});
