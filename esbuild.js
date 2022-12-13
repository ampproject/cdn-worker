const esbuild = require('esbuild');
const ignorePlugin = require('esbuild-plugin-ignore');
const textReplacePlugin = require('esbuild-plugin-text-replace');

esbuild
  .build({
    bundle: true,
    outfile: 'dist/worker.mjs',
    entryPoints: ['src/index.ts'],
    plugins: [
      ignorePlugin([
        {
          resourceRegExp: /\.wasm$/,
        },
      ]),
      textReplacePlugin({
        include: /brotli_wasm(?:_bg)?\.js$/,
        pattern: [
          ["import * as wasm from './brotli_wasm_bg.wasm';", ''],
          ['wasm.', 'globalThis.__BROTLI_WASM_INSTANCE.'],
        ],
      }),
    ],
    sourcemap: true,
    format: 'esm',
    logLevel: 'info',
  })
  .catch(() => process.exit(1));
