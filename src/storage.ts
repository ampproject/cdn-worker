/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Contains functions that interact with the backing storage.
 */

/**
 * Fetches a URL from the network or responds with a simple error message.
 *
 * Cloudflare caches edge requests, so simply using `fetch` takes advantage of
 * that. Note that this function should *only* be used for immutable, raw files.
 * https://developers.cloudflare.com/workers/learning/how-the-cache-works#interacting-with-the-cloudflare-cache
 *
 * @param url - to fetch from cache or network.
 * @returns a Response object for the request URL.
 */
export async function fetchOrDie(url: string): Promise<Response> {
  const response = await fetch(url, {
    cf: {cacheEverything: true, cacheTtl: 31536000},
  });
  return response.ok
    ? response
    : new Response(`🌩 ${response.status} Error: ${response.statusText}`);
}
