import brotliImportPromise from 'brotli-wasm';
import type {BrotliModule, Options} from 'brotli-wasm';

// This Module object is injected as a global by the Cloudflare Worker runner.
declare const BROTLI_WASM: WebAssembly.Module;

// The build process replaces references to the `wasm` variable in the
// dependency file brotli_wasm_bg.js with `globalThis.__BROTLI_WASM_INSTANCE`.
// Note that initially this field is undefined. The exported functions in this
// wrapper first await on `init_()` to ensure this field is initialized.
declare const globalThis: DedicatedWorkerGlobalScope & {
  __BROTLI_WASM_INSTANCE: WebAssembly.Exports & BrotliModule;
};

/**
 * Initializes the globalThis.__BROTLI_WASM_INSTANCE variable exactly once.
 */
async function init_(): Promise<BrotliModule> {
  // See note in types/brotli-wasm.d.ts.
  const brotli = await brotliImportPromise;
  if (!globalThis.__BROTLI_WASM_INSTANCE) {
    const instance = await WebAssembly.instantiate(BROTLI_WASM, {
      './brotli_wasm_bg.js': brotli,
    });
    globalThis.__BROTLI_WASM_INSTANCE = instance.exports as BrotliModule;
  }
  return brotli;
}

/**
 * Async wrapper around brotli-wasm's `compress` function.
 */
export async function compress(
  buf: Uint8Array,
  options?: Options
): Promise<Uint8Array> {
  const brotli = await init_();
  return brotli.compress(buf, options);
}

/**
 * Async wrapper around brotli-wasm's `decompress` function.
 */
export async function decompress(buf: Uint8Array): Promise<Uint8Array> {
  const brotli = await init_();
  return brotli.decompress(buf);
}
