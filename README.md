# AMP CDN Worker ⚡

This repository is the source code for the web worker that powers the [AMP](https://amp.dev/) project's CDN server. This web worker runs on [Cloudflare Workers](https://workers.cloudflare.com/).

A detailed explanation of the inner workings of this server is available in its original [design document](https://docs.google.com/document/d/1QD0SBwgmZxrvJTpv68ytTI2oKxq4EOi-mkSCKm2JTPc/edit).

## Other useful information

-   The [AMP meta repository](https://github.com/ampproject/meta) has information _about_ the AMP open source project, including AMP's [governance](https://github.com/ampproject/meta/blob/main/GOVERNANCE.md).
-   The [amphtml repository](https://github.com/ampproject/amphtml) contains the source code for the AMP runtime itself and its extensions.
-   [AMP's code of conduct](https://github.com/ampproject/meta/blob/main/CODE_OF_CONDUCT.md) documents how all members, committers and volunteers in the community are required to act. AMP strives for a positive and growing project community that provides a safe environment for everyone.

## Maintenance

Pre-requisite: install the Wrangler CLI tool (`npm install --global wrangler`) and login (`wrangler login`). Ensure you have access to **Lamentis@amp.dev's Account** with `wrangler whoami`.

### Worker environments

We are using three (3) different environments (defined in [wrangler.toml](./wrangler.toml)):

-   `development`: uses separate `RTV` and `CONFIG` KV namespaces from `staging` and `production`
-   `staging`: uses the same `RTV` and `CONFIG` KV namespaces as `production`, but does not serve traffic on https://ampjs.org/
-   `production`: serves traffic https://ampjs.org/

### Development

Make your changes and run `wrangler dev --env development` (or `staging`, if you really need live `RTV`/`CONFIG` namespaces).

Note that `development`'s KV namespaces are not updated automatically, so you will need to [manually update](https://dash.cloudflare.com/78e1d5140b47fc9dab18dc8b25351b7a/workers/kv/namespaces) the `RTV` namespace with an active RTV number for (at the very least) the `stable` field.

### Deployment

Deploy in rolling stages, and verify that the changes are stable. Do not skip this. Deployment command is: `wrangler publish --env development` (or `staging` or `production`)

#### Verifying Brotli compression for dynamic files

Files that get dynamically modified before serving (`/v0.[m]js` and `/v0/amp-geo-*.[m]js`) have special handling to maximize their Brotli compression level _after_ they are first requested by each edge node.

When a dynamic file is first requested, it will be served with Cloudflare Worker's default Brotli compression level, then a background thread in the Worker (our code) will compress the file with the maximum compression level and store it in the edge node's cache, to be served to subsequent requests. This process takes <1s.

There are three (3) ways to verify that such files have been compressed successfully after publishing code updates:

1.  (easy, but unscientific) open the browser's DevTools, request a dynamic file in the `development` environment and look at the fetch size in the Network tab. Wait 3 seconds, force-refresh the page, and see if the fetched size decreased by more than 0.2kb (which could indicate just network overhead differences)
2.  (still easy, slightly more scientific but relies on a server implementation detail that might change in the future) inspect the response headers in the DevTools' Network tab. If the response header contains a `content-encoding: br` _and_ has a `content-length` field, the file has been compressed by our code and cached succesfully. This is because currently Cloudflare default Brotli compression does not indicate the content length, but requests that have been pre-cached do
3.  (hard, but most accurate) in Cloudflare worker dashboard go to `Workers > cdn-worker-development > Logs > Begin log stream`, then request the dynamic file and look for these lines in the log:

    -   `> Plain response cached` and `> Brotli response cached`, or
    -   `Serving <URL> with dynamic key <KEY> from cache`

Static files are pre-compressed on the storage backend and do not require any verification.
