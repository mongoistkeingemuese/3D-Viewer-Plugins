/**
 * @fileoverview Plugin Development Server
 *
 * Provides:
 * - HTTP server for serving plugin bundles
 * - WebSocket server for hot reload notifications
 * - File watching with automatic rebuild
 * - CORS support for 3DViewer integration
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { watch, FSWatcher } from 'chokidar';
import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';

export interface DevServerOptions {
  /** Port for HTTP server (default: 3100) */
  port: number;
  /** Root directory for plugins (default: ./plugins) */
  pluginsDir: string;
  /** Enable verbose logging */
  verbose: boolean;
  /** 3DViewer URL for CORS */
  viewerUrl: string;
}

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  path: string;
  bundleUrl: string;
  manifestUrl: string;
  sandbox: 'proxy' | 'iframe';
  lastBuild?: Date;
  buildError?: string;
}

interface WebSocketMessage {
  type: 'reload' | 'error' | 'build-start' | 'build-complete' | 'plugins-list';
  pluginId?: string;
  error?: string;
  plugins?: PluginInfo[];
}

export class DevServer {
  private app: Express;
  private server: Server | null = null;
  private wss: WebSocketServer | null = null;
  private watcher: FSWatcher | null = null;
  private plugins: Map<string, PluginInfo> = new Map();
  private buildQueue: Set<string> = new Set();
  private building: boolean = false;

  constructor(private options: DevServerOptions) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // CORS for 3DViewer access - allow all origins in dev mode
    // (needed for blob: iframes which have origin 'null')
    this.app.use(
      cors({
        origin: true,  // Allow all origins (dev server only!)
        credentials: true,
      })
    );

    // JSON parsing
    this.app.use(express.json());

    // Static file serving for plugin bundles
    this.app.use('/plugins', express.static(this.options.pluginsDir));
  }

  private setupRoutes(): void {
    // List all available plugins
    this.app.get('/api/plugins', (_req: Request, res: Response) => {
      res.json({
        plugins: Array.from(this.plugins.values()),
        serverTime: new Date().toISOString(),
      });
    });

    // Get specific plugin info
    this.app.get('/api/plugins/:id', (req: Request, res: Response) => {
      const plugin = this.plugins.get(req.params.id);
      if (!plugin) {
        res.status(404).json({ error: 'Plugin not found' });
        return;
      }
      res.json(plugin);
    });

    // Trigger rebuild for a plugin
    this.app.post('/api/plugins/:id/rebuild', async (req: Request, res: Response) => {
      const plugin = this.plugins.get(req.params.id);
      if (!plugin) {
        res.status(404).json({ error: 'Plugin not found' });
        return;
      }

      try {
        await this.buildPlugin(plugin.path);
        res.json({ success: true, plugin: this.plugins.get(req.params.id) });
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Validate a manifest
    this.app.post('/api/validate/manifest', (req: Request, res: Response) => {
      try {
        const result = this.validateManifest(req.body);
        res.json(result);
      } catch (error) {
        res.status(400).json({ valid: false, error: String(error) });
      }
    });

    // Server health check
    this.app.get('/api/health', (_req: Request, res: Response) => {
      res.json({
        status: 'ok',
        uptime: process.uptime(),
        plugins: this.plugins.size,
        watching: this.watcher !== null,
      });
    });

    // Development documentation
    this.app.get('/', (_req: Request, res: Response) => {
      res.send(this.getIndexHtml());
    });
  }

  private getIndexHtml(): string {
    const plugins = Array.from(this.plugins.values());
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3DViewer Plugin Dev Server</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: #eee; }
    h1 { color: #00d4ff; }
    .container { max-width: 1200px; margin: 0 auto; }
    .card { background: #16213e; border-radius: 8px; padding: 20px; margin: 10px 0; }
    .plugin-card { border-left: 4px solid #00d4ff; }
    .plugin-card.error { border-left-color: #ff4757; }
    .plugin-name { font-size: 1.2em; font-weight: bold; color: #00d4ff; }
    .plugin-id { color: #888; font-size: 0.9em; }
    .plugin-meta { display: flex; gap: 20px; margin-top: 10px; font-size: 0.9em; }
    .plugin-meta span { background: #0f3460; padding: 4px 8px; border-radius: 4px; }
    .endpoints { margin-top: 20px; }
    .endpoint { background: #0f3460; padding: 10px 15px; border-radius: 4px; margin: 5px 0; font-family: monospace; }
    .method { color: #00d4ff; font-weight: bold; }
    .status { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
    .status.ok { background: #00ff88; }
    .status.error { background: #ff4757; }
    .ws-status { position: fixed; bottom: 20px; right: 20px; padding: 10px 20px; background: #16213e; border-radius: 8px; }
    pre { background: #0f3460; padding: 15px; border-radius: 4px; overflow-x: auto; }
    code { color: #00d4ff; }
    a { color: #00d4ff; }
  </style>
</head>
<body>
  <div class="container">
    <h1>3DViewer Plugin Dev Server</h1>

    <div class="card">
      <h2>Detected Plugins (${plugins.length})</h2>
      ${
        plugins.length === 0
          ? '<p>No plugins found. Create a plugin in the <code>plugins/</code> directory.</p>'
          : plugins
              .map(
                (p) => `
        <div class="plugin-card card ${p.buildError ? 'error' : ''}">
          <span class="status ${p.buildError ? 'error' : 'ok'}"></span>
          <span class="plugin-name">${p.name}</span>
          <span class="plugin-id">(${p.id})</span>
          <div class="plugin-meta">
            <span>v${p.version}</span>
            <span>${p.sandbox}</span>
            ${p.lastBuild ? `<span>Built: ${p.lastBuild.toLocaleTimeString()}</span>` : ''}
          </div>
          ${p.buildError ? `<pre style="color: #ff4757;">${p.buildError}</pre>` : ''}
          <div class="endpoints">
            <div class="endpoint"><span class="method">GET</span> <a href="${p.manifestUrl}">${p.manifestUrl}</a></div>
            <div class="endpoint"><span class="method">GET</span> <a href="${p.bundleUrl}">${p.bundleUrl}</a></div>
          </div>
        </div>
      `
              )
              .join('')
      }
    </div>

    <div class="card">
      <h2>API Endpoints</h2>
      <div class="endpoint"><span class="method">GET</span> /api/plugins - List all plugins</div>
      <div class="endpoint"><span class="method">GET</span> /api/plugins/:id - Get plugin info</div>
      <div class="endpoint"><span class="method">POST</span> /api/plugins/:id/rebuild - Trigger rebuild</div>
      <div class="endpoint"><span class="method">POST</span> /api/validate/manifest - Validate manifest</div>
      <div class="endpoint"><span class="method">GET</span> /api/health - Server health</div>
    </div>

    <div class="card">
      <h2>Connect from 3DViewer</h2>
      <p>Load a plugin from this dev server:</p>
      <pre><code>{
  "type": "url",
  "url": "http://localhost:${this.options.port}/plugins/PLUGIN_NAME/manifest.json"
}</code></pre>
    </div>

    <div class="ws-status" id="ws-status">
      WebSocket: <span id="ws-state">Connecting...</span>
    </div>
  </div>

  <script>
    const ws = new WebSocket('ws://localhost:${this.options.port}');
    const wsState = document.getElementById('ws-state');

    ws.onopen = () => {
      wsState.textContent = 'Connected';
      wsState.style.color = '#00ff88';
    };

    ws.onclose = () => {
      wsState.textContent = 'Disconnected';
      wsState.style.color = '#ff4757';
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'reload' || msg.type === 'build-complete') {
        location.reload();
      }
    };
  </script>
</body>
</html>
    `;
  }

  async start(): Promise<void> {
    // Discover plugins
    await this.discoverPlugins();

    // Start HTTP server
    this.server = this.app.listen(this.options.port, () => {
      this.log(`Dev server running at http://localhost:${this.options.port}`);
      this.log(`Plugins directory: ${this.options.pluginsDir}`);
      this.log(`Found ${this.plugins.size} plugin(s)`);
    });

    // Start WebSocket server
    this.wss = new WebSocketServer({ server: this.server });
    this.wss.on('connection', (ws) => {
      this.log('Client connected');

      // Send current plugins list
      this.sendToClient(ws, {
        type: 'plugins-list',
        plugins: Array.from(this.plugins.values()),
      });

      ws.on('close', () => {
        this.log('Client disconnected');
      });
    });

    // Start file watcher
    this.startWatcher();
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = null;
    }
  }

  private async discoverPlugins(): Promise<void> {
    const pluginsDir = this.options.pluginsDir;

    if (!fs.existsSync(pluginsDir)) {
      fs.mkdirSync(pluginsDir, { recursive: true });
      return;
    }

    const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const pluginPath = path.join(pluginsDir, entry.name);
      const manifestPath = path.join(pluginPath, 'manifest.json');

      if (!fs.existsSync(manifestPath)) continue;

      try {
        await this.loadPlugin(pluginPath);
      } catch (error) {
        this.log(`Failed to load plugin at ${pluginPath}: ${error}`, 'error');
      }
    }
  }

  private async loadPlugin(pluginPath: string): Promise<void> {
    const manifestPath = path.join(pluginPath, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    const pluginName = path.basename(pluginPath);
    const baseUrl = `http://localhost:${this.options.port}/plugins/${pluginName}`;

    const pluginInfo: PluginInfo = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      path: pluginPath,
      bundleUrl: `${baseUrl}/${manifest.entryPoint}`,
      manifestUrl: `${baseUrl}/manifest.json`,
      sandbox: manifest.sandbox || 'proxy',
    };

    this.plugins.set(manifest.id, pluginInfo);

    // Initial build
    await this.buildPlugin(pluginPath);
  }

  private async buildPlugin(pluginPath: string): Promise<void> {
    const manifestPath = path.join(pluginPath, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const pluginInfo = this.plugins.get(manifest.id);

    if (!pluginInfo) return;

    this.broadcast({ type: 'build-start', pluginId: manifest.id });
    this.log(`Building ${manifest.name}...`);

    try {
      const srcPath = path.join(pluginPath, 'src', 'index.ts');
      const srcPathJs = path.join(pluginPath, 'src', 'index.tsx');
      const entryPoint = fs.existsSync(srcPath) ? srcPath : fs.existsSync(srcPathJs) ? srcPathJs : null;

      if (!entryPoint) {
        throw new Error('No entry point found (src/index.ts or src/index.tsx)');
      }

      const outfile = path.join(pluginPath, manifest.entryPoint);
      const outDir = path.dirname(outfile);

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      await esbuild.build({
        entryPoints: [entryPoint],
        outfile,
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2020',
        sourcemap: true,
        // Note: We bundle React/ReactDOM into each plugin for dev simplicity.
        // Production builds should use import maps or shared externals.
        define: {
          'process.env.NODE_ENV': '"development"',
        },
        loader: {
          '.tsx': 'tsx',
          '.ts': 'ts',
        },
      });

      pluginInfo.lastBuild = new Date();
      pluginInfo.buildError = undefined;

      this.log(`Build complete: ${manifest.name}`);
      this.broadcast({ type: 'build-complete', pluginId: manifest.id });
      this.broadcast({ type: 'reload', pluginId: manifest.id });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      pluginInfo.buildError = errorMsg;

      this.log(`Build failed: ${manifest.name} - ${errorMsg}`, 'error');
      this.broadcast({ type: 'error', pluginId: manifest.id, error: errorMsg });
    }
  }

  private startWatcher(): void {
    const watchPaths = [
      path.join(this.options.pluginsDir, '*/src/**/*.{ts,tsx,js,jsx}'),
      path.join(this.options.pluginsDir, '*/manifest.json'),
    ];

    this.watcher = watch(watchPaths, {
      ignoreInitial: true,
      ignored: ['**/node_modules/**', '**/dist/**'],
    });

    this.watcher.on('change', (filePath) => {
      this.handleFileChange(filePath);
    });

    this.watcher.on('add', (filePath) => {
      this.handleFileChange(filePath);
    });

    this.log('File watcher started');
  }

  private handleFileChange(filePath: string): void {
    // Find which plugin this file belongs to
    const relativePath = path.relative(this.options.pluginsDir, filePath);
    const pluginName = relativePath.split(path.sep)[0];
    const pluginPath = path.join(this.options.pluginsDir, pluginName);

    this.log(`File changed: ${relativePath}`);

    // Debounced rebuild
    this.buildQueue.add(pluginPath);
    this.processBuildQueue();
  }

  private processBuildQueue = this.debounce(async () => {
    if (this.building) return;
    this.building = true;

    for (const pluginPath of this.buildQueue) {
      await this.buildPlugin(pluginPath);
    }

    this.buildQueue.clear();
    this.building = false;
  }, 300);

  private debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: unknown[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    }) as T;
  }

  private broadcast(message: WebSocketMessage): void {
    if (!this.wss) return;

    const data = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private validateManifest(manifest: unknown): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!manifest || typeof manifest !== 'object') {
      return { valid: false, errors: ['Manifest must be an object'], warnings: [] };
    }

    const m = manifest as Record<string, unknown>;

    // Required fields
    if (!m.id || typeof m.id !== 'string') errors.push('Missing or invalid "id"');
    if (!m.name || typeof m.name !== 'string') errors.push('Missing or invalid "name"');
    if (!m.version || typeof m.version !== 'string') errors.push('Missing or invalid "version"');
    if (!m.entryPoint || typeof m.entryPoint !== 'string') errors.push('Missing or invalid "entryPoint"');
    if (!Array.isArray(m.permissions)) errors.push('Missing or invalid "permissions" array');

    // ID format
    if (m.id && typeof m.id === 'string') {
      if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9-]*)+$/i.test(m.id)) {
        warnings.push('Plugin ID should use reverse domain notation (e.g., "com.example.my-plugin")');
      }
    }

    // Version format
    if (m.version && typeof m.version === 'string') {
      if (!/^\d+\.\d+\.\d+/.test(m.version)) {
        warnings.push('Version should follow semantic versioning (e.g., "1.0.0")');
      }
    }

    // Validate permissions
    const validPermissions = new Set([
      'mqtt:subscribe',
      'mqtt:publish',
      'opcua:read',
      'opcua:write',
      'http:fetch',
      'nodes:read',
      'nodes:write',
      'vars:read',
      'vars:write',
      'ui:popup',
      'ui:panel',
      'ui:overlay',
      'state:persist',
    ]);

    if (Array.isArray(m.permissions)) {
      for (const perm of m.permissions) {
        if (!validPermissions.has(perm as string)) {
          errors.push(`Unknown permission: "${perm}"`);
        }
      }
    }

    // Sandbox type
    if (m.sandbox && !['proxy', 'iframe'].includes(m.sandbox as string)) {
      errors.push(`Invalid sandbox type: "${m.sandbox}". Must be "proxy" or "iframe"`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private log(message: string, level: 'info' | 'error' = 'info'): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = level === 'error' ? '\x1b[31m[ERROR]\x1b[0m' : '\x1b[36m[DEV]\x1b[0m';
    console.log(`${prefix} ${timestamp} ${message}`);
  }
}
