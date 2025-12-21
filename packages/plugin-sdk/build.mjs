#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

const isWatch = process.argv.includes('--watch');

// Ensure dist exists
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

const commonOptions = {
  bundle: true,
  platform: 'neutral',
  target: 'es2020',
  external: ['react', 'react-dom'],
  sourcemap: true,
  minify: false,
};

// Build configurations
const builds = [
  // Main entry - ESM
  {
    ...commonOptions,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.mjs',
    format: 'esm',
  },
  // Main entry - CJS
  {
    ...commonOptions,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    format: 'cjs',
  },
  // Types entry - ESM
  {
    ...commonOptions,
    entryPoints: ['src/types/index.ts'],
    outfile: 'dist/types/index.mjs',
    format: 'esm',
  },
  // Types entry - CJS
  {
    ...commonOptions,
    entryPoints: ['src/types/index.ts'],
    outfile: 'dist/types/index.js',
    format: 'cjs',
  },
  // Testing entry - ESM
  {
    ...commonOptions,
    entryPoints: ['src/testing/index.ts'],
    outfile: 'dist/testing/index.mjs',
    format: 'esm',
  },
  // Testing entry - CJS
  {
    ...commonOptions,
    entryPoints: ['src/testing/index.ts'],
    outfile: 'dist/testing/index.js',
    format: 'cjs',
  },
];

async function build() {
  console.log('Building SDK...');

  try {
    if (isWatch) {
      // Watch mode
      const contexts = await Promise.all(
        builds.map((config) => esbuild.context(config))
      );

      await Promise.all(contexts.map((ctx) => ctx.watch()));
      console.log('Watching for changes...');

      // Generate types once initially
      generateTypes();
    } else {
      // One-time build
      await Promise.all(builds.map((config) => esbuild.build(config)));
      console.log('Build complete!');

      // Generate TypeScript declarations
      generateTypes();
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

function generateTypes() {
  console.log('Generating type declarations...');
  try {
    execSync('npx tsc --emitDeclarationOnly --declaration --outDir dist', {
      stdio: 'inherit',
    });
    console.log('Type declarations generated!');
  } catch (error) {
    console.warn('Type generation failed (non-fatal):', error.message);
  }
}

build();
