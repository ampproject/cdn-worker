const esbuild = require('esbuild');

esbuild
  .build({
    bundle: true,
    outfile: 'dist/worker.js',
    entryPoints: ['src/index.ts'],
    sourcemap: true,
    format: 'cjs',
    logLevel: 'info',
  })
  .catch(() => process.exit(1));
