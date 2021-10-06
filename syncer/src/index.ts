/**
 * Contains request routing logic.
 */

import {App} from '@octokit/app';
import {Octokit} from '@octokit/rest';

import {handleRequest} from './handler';
import {pullRequestClosedHandler} from './webhook';

// Secrets defined by `wrangler secret`.
declare const ACCESS_TOKEN: string;
declare const APP_ID: string;
declare const WEBHOOK_SECRET: string;
// The private-key.pem file from GitHub needs to be transformed from the
// PKCS#1 format to PKCS#8, as the crypto APIs do not support PKCS#1:
//     openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private-key.pem -out private-key-pkcs8.pem
declare const PRIVATE_KEY: string;

const userOctokit = new Octokit({auth: `token ${ACCESS_TOKEN}`});
const app = new App({
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  webhooks: {
    secret: WEBHOOK_SECRET,
  },
  Octokit,
});

app.webhooks.on('pull_request.closed', ({octokit: appOctokit, payload}) =>
  pullRequestClosedHandler(userOctokit, appOctokit, payload)
);

addEventListener('fetch', async (event) => {
  event.respondWith(handleRequest(app, event.request));
});
