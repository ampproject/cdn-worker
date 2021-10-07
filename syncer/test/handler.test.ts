import type {App} from '@octokit/app';
import {disableFetchMocks, enableFetchMocks} from 'jest-fetch-mock';
import {mocked} from 'ts-jest/utils';

import {handleRequest} from '../src/handler';

const octokitRequestMock = jest.fn();
const webhooksVerifyAndReceive = jest.fn();
const app = mocked({
  octokit: {
    request: octokitRequestMock,
  },
  webhooks: {
    verifyAndReceive: webhooksVerifyAndReceive,
  },
} as unknown as App);

describe('webhook', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('responds to GET requests', async () => {
    octokitRequestMock.mockResolvedValue({
      data: {message: 'GET /app response'},
    });

    const response = await handleRequest(app, new Request('', {method: 'GET'}));

    expect(octokitRequestMock).toHaveBeenCalledWith('GET /app');
    await expect(response.json()).resolves.toEqual({
      message: 'GET /app response',
    });

    expect(webhooksVerifyAndReceive).not.toHaveBeenCalled();
  });

  it('handles webhook requests', async () => {
    webhooksVerifyAndReceive.mockResolvedValue(null);

    const response = await handleRequest(
      app,
      new Request('', {
        method: 'POST',
        headers: new Headers({
          'X-Github-Delivery': 'b1f2ec80-2558-11ec-84de-03a8b7b68b19',
          'X-Github-Event': 'pull_request',
          'X-Hub-Signature-256':
            'sha256=294d353b9de0f121ece4b92d5c0a303452585aabcfa935f0df8ee3351bd81f0e',
        }),
        body: JSON.stringify({data: {}}),
      })
    );

    expect(webhooksVerifyAndReceive).toHaveBeenCalledWith({
      id: 'b1f2ec80-2558-11ec-84de-03a8b7b68b19',
      name: 'pull_request',
      payload: {data: {}},
      signature:
        '294d353b9de0f121ece4b92d5c0a303452585aabcfa935f0df8ee3351bd81f0e',
    });

    await expect(response.json()).resolves.toEqual({ok: true});

    expect(octokitRequestMock).not.toHaveBeenCalled();
  });

  it.each([
    ['X-Github-Delivery', 400],
    ['X-Github-Event', 400],
    ['X-Hub-Signature-256', 403],
  ])(
    'errors on webhook requests that are missing header %s',
    async (missingHeader, expectedStatus) => {
      webhooksVerifyAndReceive.mockResolvedValue(null);

      const headers = new Headers({
        'X-Github-Delivery': 'b1f2ec80-2558-11ec-84de-03a8b7b68b19',
        'X-Github-Event': 'pull_request',
        'X-Hub-Signature-256':
          'sha256=294d353b9de0f121ece4b92d5c0a303452585aabcfa935f0df8ee3351bd81f0e',
      });
      headers.delete(missingHeader);

      const response = await handleRequest(
        app,
        new Request('', {
          method: 'POST',
          headers,
          body: JSON.stringify({data: {}}),
        })
      );

      expect(response.status).toEqual(expectedStatus);
      await expect(response.json()).resolves.toEqual({
        error: `${missingHeader} header is missing`,
      });

      expect(octokitRequestMock).not.toHaveBeenCalled();
      expect(webhooksVerifyAndReceive).not.toHaveBeenCalled();
    }
  );

  it('forwards webhook handler errors', async () => {
    webhooksVerifyAndReceive.mockRejectedValue(new Error('kittens exploded'));

    const response = await handleRequest(
      app,
      new Request('', {
        method: 'POST',
        headers: new Headers({
          'X-Github-Delivery': 'b1f2ec80-2558-11ec-84de-03a8b7b68b19',
          'X-Github-Event': 'pull_request',
          'X-Hub-Signature-256':
            'sha256=294d353b9de0f121ece4b92d5c0a303452585aabcfa935f0df8ee3351bd81f0e',
        }),
        body: JSON.stringify({data: {}}),
      })
    );

    await expect(response.json()).resolves.toEqual({error: 'kittens exploded'});

    expect(webhooksVerifyAndReceive).toHaveBeenCalled();
    expect(octokitRequestMock).not.toHaveBeenCalled();
  });
});
