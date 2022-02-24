// This is a bit tricky: `import 'brotli-wasm'` actually returns an import
// promise. This is because esbuild uses this file when bundling this module:
// ./node_modules/brotli-wasm/index.browser.js. This file *dynamically* imports
// brotli-wasm/pkg.bundler/brotli-wasm.js, so we must await on it to use it.
// However, type checkers will say that awaiting on the import has no effect,
// because the `brotli-wasm` package.json explicitly declares the the file
// ./pkg.node/brotli_wasm.d.ts as the module's type definition, so the type
// checker is unaware of this subtle difference.
// This type declarations file corrects this issue.
declare module 'brotli-wasm' {
  import bundlerBrotli from 'brotli-wasm/pkg.bundler/brotli_wasm';
  import nodeBrotli from 'brotli-wasm/pkg.node/brotli_wasm';

  // Export the content of the module verbatim.
  export * from 'brotli-wasm/pkg.node/brotli_wasm';

  // Export an explicit type that references the module itself, to be used for
  // type annotations.
  export type BrotliModule = typeof nodeBrotli;

  // Export the corrected type for the default export.
  const correctedDefault: Promise<typeof bundlerBrotli>;
  export default correctedDefault;
}
