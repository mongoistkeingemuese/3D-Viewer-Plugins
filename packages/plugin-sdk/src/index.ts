/**
 * @fileoverview 3DViewer Plugin SDK - Main Entry Point
 * @version 1.0.0
 *
 * Official SDK for developing plugins for the 3DViewer application.
 *
 * @example
 * ```typescript
 * import {
 *   type Plugin,
 *   type PluginContext,
 *   type PluginManifest,
 *   definePlugin,
 *   createMockContext,
 * } from '@3dviewer/plugin-sdk';
 *
 * const plugin = definePlugin({
 *   onLoad(ctx) {
 *     ctx.log.info('Hello from plugin!');
 *   }
 * });
 *
 * export default plugin;
 * ```
 */

// Re-export all types
export * from './types';

// Type imports for internal use
import type { Plugin, PluginManifest } from './types';

/**
 * Helper function to define a plugin with type safety.
 * This is the recommended way to create a plugin.
 *
 * @example
 * ```typescript
 * import { definePlugin } from '@3dviewer/plugin-sdk';
 *
 * export default definePlugin({
 *   onLoad(ctx) {
 *     ctx.log.info('Plugin loaded!');
 *   },
 *
 *   onNodeBound(ctx, node) {
 *     ctx.nodes.get(node.id)!.color = '#00ff00';
 *   }
 * });
 * ```
 */
export function definePlugin(plugin: Plugin): Plugin {
  return plugin;
}

/**
 * Helper function to define a plugin manifest with type safety.
 * Use this in your manifest.ts file for type checking.
 *
 * @example
 * ```typescript
 * import { defineManifest } from '@3dviewer/plugin-sdk';
 *
 * export default defineManifest({
 *   id: 'com.example.my-plugin',
 *   name: 'My Plugin',
 *   version: '1.0.0',
 *   entryPoint: 'dist/index.js',
 *   permissions: ['nodes:read', 'nodes:write'],
 * });
 * ```
 */
export function defineManifest(manifest: PluginManifest): PluginManifest {
  return manifest;
}

/**
 * Validate a plugin manifest object.
 * Throws an error if the manifest is invalid.
 *
 * @param manifest The manifest to validate
 * @returns The validated manifest
 * @throws Error if validation fails
 */
export function validateManifest(manifest: unknown): PluginManifest {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Manifest must be an object');
  }

  const m = manifest as Record<string, unknown>;

  // Required fields
  if (typeof m.id !== 'string' || !m.id) {
    throw new Error('Manifest must have a valid "id" string');
  }
  if (typeof m.name !== 'string' || !m.name) {
    throw new Error('Manifest must have a valid "name" string');
  }
  if (typeof m.version !== 'string' || !m.version) {
    throw new Error('Manifest must have a valid "version" string');
  }
  if (typeof m.entryPoint !== 'string' || !m.entryPoint) {
    throw new Error('Manifest must have a valid "entryPoint" string');
  }
  if (!Array.isArray(m.permissions)) {
    throw new Error('Manifest must have a "permissions" array');
  }

  // Validate ID format (reverse domain notation)
  if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9-]*)+$/i.test(m.id as string)) {
    console.warn(
      `Plugin ID "${m.id}" should use reverse domain notation (e.g., "com.example.my-plugin")`
    );
  }

  // Validate version (semver)
  if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(m.version as string)) {
    console.warn(
      `Plugin version "${m.version}" should follow semantic versioning (e.g., "1.0.0")`
    );
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

  for (const perm of m.permissions as string[]) {
    if (!validPermissions.has(perm)) {
      throw new Error(`Unknown permission: "${perm}"`);
    }
  }

  // Validate sandbox type
  if (m.sandbox && !['proxy', 'iframe'].includes(m.sandbox as string)) {
    throw new Error(`Invalid sandbox type: "${m.sandbox}". Must be "proxy" or "iframe"`);
  }

  return manifest as PluginManifest;
}

/**
 * Plugin SDK version
 */
export const SDK_VERSION = '1.0.0';

/**
 * List of all available permissions with descriptions
 */
export const PERMISSIONS = {
  'mqtt:subscribe': 'Subscribe to MQTT topics',
  'mqtt:publish': 'Publish to MQTT topics',
  'opcua:read': 'Read OPC UA values',
  'opcua:write': 'Write OPC UA values',
  'http:fetch': 'Make HTTP requests',
  'nodes:read': 'Read node properties',
  'nodes:write': 'Modify node properties',
  'vars:read': 'Read global variables',
  'vars:write': 'Modify global variables',
  'ui:popup': 'Show popup dialogs',
  'ui:panel': 'Register side panels',
  'ui:overlay': 'Show 3D overlays',
  'state:persist': 'Persist state across sessions',
} as const;
