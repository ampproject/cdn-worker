// Of the various entry points of the brotli-wasm module, we explicitly set an
// alias in tsconfig.js to use the index.browser.js version (the other entry
// points require APIs that are only available on Web or Node, which are
// unavailable in the Webworker environment).
//
// index.browser.js exports a dynamic import (`module.exports = import(...)`)
// of the actual module's code (== a Promise<...> object) which we re-export
// here as the default, along with the rest of the source module's exports, so
// it can be awaited in brotli-wasm-wrapper.ts without any type errors!
declare module 'browser:brotli-wasm' {
  // Re-export the content of the source module verbatim.
  export * from 'brotli-wasm/pkg.bundler/brotli_wasm';

  // Export an explicit type that references the module itself, to be used for
  // type annotations.
  export type BrotliModule = WebAssembly.Exports &
    typeof import('brotli-wasm/pkg.bundler/brotli_wasm');

  // Export the corrected type as the default export.
  const defaultExport: Promise<BrotliModule>;
  export default defaultExport;
}
