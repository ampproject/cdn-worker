/**
 * Contains request routing logic.
 */

import {addEventListener} from '@cloudflare/workers-types';

import router from './router';

addEventListener('fetch', async (event) => {
  event.respondWith(router.handle(event.request, event.waitUntil));
});
