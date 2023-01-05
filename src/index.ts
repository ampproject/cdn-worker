/**
 * Contains request routing logic.
 */

import {setupKnownMimeTypes} from './headers';
import router from './router';

setupKnownMimeTypes();

addEventListener('fetch', (event) => {
  event.respondWith(router.run(event));
});
