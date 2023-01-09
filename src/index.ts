/**
 * Contains request routing logic.
 */

import {setupKnownMimeTypes} from './headers';
import router from './router';

setupKnownMimeTypes();

addEventListener('fetch', async (event) => {
  event.respondWith(router.run(event));
});
