/**
 * @fileoverview Plugin Development CLI
 *
 * Commands:
 * - serve: Start development server with hot reload
 * - build: Build a plugin for production
 * - validate: Validate a plugin manifest
 * - new: Create a new plugin from template
 */

import { Command } from 'commander';
import { DevServer } from './server/DevServer';
import * as path from 'path';
import * as fs from 'fs';
import * as esbuild from 'esbuild';

const program = new Command();

program
  .name('plugin-dev')
  .description('3DViewer Plugin Development Tools')
  .version('1.0.0');

// Serve command
program
  .command('serve')
  .description('Start the development server with hot reload')
  .option('-p, --port <port>', 'Server port', '3100')
  .option('-d, --plugins-dir <dir>', 'Plugins directory', './plugins')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--viewer-url <url>', '3DViewer URL for CORS', 'http://localhost:5173')
  .action(async (options) => {
    const server = new DevServer({
      port: parseInt(options.port, 10),
      pluginsDir: path.resolve(options.pluginsDir),
      verbose: options.verbose,
      viewerUrl: options.viewerUrl,
    });

    await server.start();

    // Handle shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await server.stop();
      process.exit(0);
    });
  });

// Build command
program
  .command('build')
  .description('Build a plugin for production')
  .argument('<plugin-path>', 'Path to plugin directory')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .option('--minify', 'Minify output')
  .option('--sourcemap', 'Generate sourcemaps')
  .action(async (pluginPath: string, options) => {
    const absolutePath = path.resolve(pluginPath);
    const manifestPath = path.join(absolutePath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      console.error(`Error: No manifest.json found at ${manifestPath}`);
      process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log(`Building ${manifest.name} v${manifest.version}...`);

    const srcPath = path.join(absolutePath, 'src', 'index.ts');
    const srcPathTsx = path.join(absolutePath, 'src', 'index.tsx');
    const entryPoint = fs.existsSync(srcPath) ? srcPath : fs.existsSync(srcPathTsx) ? srcPathTsx : null;

    if (!entryPoint) {
      console.error('Error: No entry point found (src/index.ts or src/index.tsx)');
      process.exit(1);
    }

    const outDir = path.join(absolutePath, options.output);
    const outfile = path.join(outDir, 'index.js');

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    try {
      await esbuild.build({
        entryPoints: [entryPoint],
        outfile,
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2020',
        minify: options.minify,
        sourcemap: options.sourcemap,
        // Mark React as external - host app provides it via window.React
        external: ['react', 'react-dom'],
        // Map external imports to global variables
        // import React from 'react' -> const React = window.React
        banner: {
          js: `const React = window.React;`,
        },
        define: {
          'process.env.NODE_ENV': '"production"',
        },
        loader: {
          '.tsx': 'tsx',
          '.ts': 'ts',
        },
        metafile: true,
      });

      // Copy manifest to output
      fs.copyFileSync(manifestPath, path.join(outDir, 'manifest.json'));

      console.log(`Build complete: ${outfile}`);

      // Show bundle size
      const stats = fs.statSync(outfile);
      console.log(`Bundle size: ${(stats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error('Build failed:', error);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate a plugin manifest')
  .argument('[plugin-path]', 'Path to plugin directory or manifest.json', '.')
  .action((pluginPath: string) => {
    let manifestPath = path.resolve(pluginPath);

    if (fs.statSync(manifestPath).isDirectory()) {
      manifestPath = path.join(manifestPath, 'manifest.json');
    }

    if (!fs.existsSync(manifestPath)) {
      console.error(`Error: No manifest found at ${manifestPath}`);
      process.exit(1);
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const result = validateManifest(manifest);

      if (result.errors.length > 0) {
        console.log('\x1b[31mErrors:\x1b[0m');
        result.errors.forEach((e) => console.log(`  - ${e}`));
      }

      if (result.warnings.length > 0) {
        console.log('\x1b[33mWarnings:\x1b[0m');
        result.warnings.forEach((w) => console.log(`  - ${w}`));
      }

      if (result.valid) {
        console.log('\x1b[32mManifest is valid!\x1b[0m');
        console.log(`  Plugin: ${manifest.name} (${manifest.id})`);
        console.log(`  Version: ${manifest.version}`);
        console.log(`  Permissions: ${manifest.permissions.join(', ')}`);
      } else {
        process.exit(1);
      }
    } catch (error) {
      console.error('Failed to parse manifest:', error);
      process.exit(1);
    }
  });

// New plugin command
program
  .command('new')
  .description('Create a new plugin from template')
  .argument('<name>', 'Plugin name (e.g., "my-plugin")')
  .option('-t, --template <template>', 'Template type: sandbox, iframe', 'sandbox')
  .option('-d, --dir <dir>', 'Output directory', './plugins')
  .option('--id <id>', 'Plugin ID (default: com.example.<name>)')
  .action((name: string, options) => {
    const pluginId = options.id || `com.example.${name}`;
    const pluginDir = path.join(path.resolve(options.dir), name);

    if (fs.existsSync(pluginDir)) {
      console.error(`Error: Directory already exists: ${pluginDir}`);
      process.exit(1);
    }

    console.log(`Creating new ${options.template} plugin: ${name}`);

    // Create directory structure
    fs.mkdirSync(path.join(pluginDir, 'src', 'components'), { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'dist'), { recursive: true });

    // Create manifest
    const manifest = {
      id: pluginId,
      name: name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      version: '1.0.0',
      author: 'Your Name',
      description: `A ${options.template} plugin for 3DViewer`,
      icon: '🔌',
      entryPoint: 'dist/index.js',
      permissions: ['nodes:read', 'nodes:write'],
      sandbox: options.template === 'iframe' ? 'iframe' : 'proxy',
      nodeBinding: {
        mode: 'manual',
      },
      config: {
        global: {
          schema: {
            type: 'object',
            properties: {
              enabled: {
                type: 'boolean',
                title: 'Enabled',
                default: true,
              },
            },
          },
        },
      },
    };

    fs.writeFileSync(path.join(pluginDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // Create plugin source
    const pluginSource = `/**
 * ${manifest.name}
 * ${manifest.description}
 */

import type { Plugin, PluginContext, BoundNode } from '@3dviewer/plugin-sdk';

const plugin: Plugin = {
  onLoad(ctx: PluginContext) {
    ctx.log.info('${manifest.name} loaded!');

    // Subscribe to node clicks
    ctx.events.onNodeClick((event) => {
      ctx.log.info('Node clicked:', event.nodeId);
    });
  },

  onNodeBound(ctx: PluginContext, node: BoundNode) {
    ctx.log.info('Node bound:', node.name);

    // Get the node proxy to modify properties
    const nodeProxy = ctx.nodes.get(node.id);
    if (nodeProxy) {
      // Example: Change color to green
      nodeProxy.color = '#00ff00';
    }
  },

  onNodeUnbound(ctx: PluginContext, node: BoundNode) {
    ctx.log.info('Node unbound:', node.name);
  },

  onUnload(ctx: PluginContext) {
    ctx.log.info('${manifest.name} unloaded');
  },
};

export default plugin;
`;

    fs.writeFileSync(path.join(pluginDir, 'src', 'index.ts'), pluginSource);

    // Create package.json
    const packageJson = {
      name: pluginId,
      version: '1.0.0',
      private: true,
      scripts: {
        build: 'plugin-dev build .',
        'build:watch': 'plugin-dev build . --watch',
        test: 'vitest',
      },
      devDependencies: {
        '@3dviewer/plugin-sdk': 'workspace:*',
        typescript: '^5.3.3',
      },
    };

    fs.writeFileSync(path.join(pluginDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create tsconfig.json
    const tsconfig = {
      extends: '../../tsconfig.json',
      compilerOptions: {
        outDir: './dist',
        rootDir: './src',
      },
      include: ['src/**/*'],
    };

    fs.writeFileSync(path.join(pluginDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    // Create README
    const readme = `# ${manifest.name}

${manifest.description}

## Development

\`\`\`bash
# Start dev server (from workspace root)
npm run dev

# Build this plugin
npm run build
\`\`\`

## Configuration

See \`manifest.json\` for available configuration options.

## API

This plugin uses the following permissions:
${manifest.permissions.map((p: string) => `- \`${p}\``).join('\n')}
`;

    fs.writeFileSync(path.join(pluginDir, 'README.md'), readme);

    console.log(`\x1b[32mPlugin created at: ${pluginDir}\x1b[0m`);
    console.log('\nNext steps:');
    console.log('  1. cd ' + pluginDir);
    console.log('  2. npm install (from workspace root)');
    console.log('  3. npm run dev (to start dev server)');
  });

function validateManifest(manifest: unknown): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be an object'], warnings: [] };
  }

  const m = manifest as Record<string, unknown>;

  if (!m.id || typeof m.id !== 'string') errors.push('Missing or invalid "id"');
  if (!m.name || typeof m.name !== 'string') errors.push('Missing or invalid "name"');
  if (!m.version || typeof m.version !== 'string') errors.push('Missing or invalid "version"');
  if (!m.entryPoint || typeof m.entryPoint !== 'string') errors.push('Missing or invalid "entryPoint"');
  if (!Array.isArray(m.permissions)) errors.push('Missing or invalid "permissions" array');

  if (m.id && typeof m.id === 'string') {
    if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9-]*)+$/i.test(m.id)) {
      warnings.push('Plugin ID should use reverse domain notation');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

program.parse();
