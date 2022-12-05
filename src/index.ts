/**
 * Contains request routing logic.
 */

import mime from 'mime/lite';

import router from './router';

mime.define(
  {
    'image/x-icon': ['ico'],
    'text/javascript': ['js', 'mjs'],
  },
  true
);

addEventListener('fetch', async (event) => {
  event.respondWith(router.run(event));
});
