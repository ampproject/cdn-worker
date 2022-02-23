/**
 * Contains request routing logic.
 */

import router from './router';

addEventListener('fetch', async (event) => {
  event.respondWith(router.run(event));
});
