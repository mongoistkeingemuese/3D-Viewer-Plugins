#!/usr/bin/env node
import * as esbuild from 'esbuild';
import { existsSync, mkdirSync } from 'fs';

const isWatch = process.argv.includes('--watch');

if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

const builds = [
  {
    entryPoints: ['src/cli.ts'],
    outfile: 'dist/cli.js',
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    sourcemap: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
    external: [
      'express',
      'cors',
      'ws',
      'chokidar',
      'esbuild',
      'chalk',
      'commander',
    ],
  },
  {
    entryPoints: ['src/server/DevServer.ts'],
    outfile: 'dist/server/DevServer.js',
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    sourcemap: true,
    external: [
      'express',
      'cors',
      'ws',
      'chokidar',
      'esbuild',
    ],
  },
];

async function build() {
  console.log('Building devtools...');

  try {
    if (isWatch) {
      const contexts = await Promise.all(
        builds.map((config) => esbuild.context(config))
      );
      await Promise.all(contexts.map((ctx) => ctx.watch()));
      console.log('Watching for changes...');
    } else {
      await Promise.all(builds.map((config) => esbuild.build(config)));
      console.log('Build complete!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
