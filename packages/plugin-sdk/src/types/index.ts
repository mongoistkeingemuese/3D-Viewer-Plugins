/**
 * @fileoverview 3DViewer Plugin SDK - Type Definitions
 * @version 1.0.0
 *
 * This file contains all type definitions for the 3DViewer Plugin System.
 * Use these types to build type-safe plugins that integrate seamlessly
 * with the 3DViewer application.
 *
 * @example
 * ```typescript
 * import type { Plugin, PluginContext, PluginManifest } from '@3dviewer/plugin-sdk';
 * ```
 */

import type { ComponentType } from 'react';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * 3D Vector representation for positions, rotations, and scales
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * 2D Screen position
 */
export interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * Unsubscribe function returned by all subscription methods
 */
export type Unsubscribe = () => void;

// ============================================================================
// PLUGIN MANIFEST
// ============================================================================

/**
 * Available permissions a plugin can request.
 * Each permission grants access to specific APIs.
 */
export type PluginPermission =
  | 'mqtt:subscribe'    // Subscribe to MQTT topics
  | 'mqtt:publish'      // Publish to MQTT topics
  | 'opcua:read'        // Read OPC UA values
  | 'opcua:write'       // Write OPC UA values
  | 'http:fetch'        // Make HTTP requests
  | 'nodes:read'        // Read node properties
  | 'nodes:write'       // Modify node properties
  | 'vars:read'         // Read global variables
  | 'vars:write'        // Modify global variables
  | 'ui:popup'          // Show popup dialogs
  | 'ui:panel'          // Register side panels
  | 'ui:overlay'        // Show 3D overlays
  | 'state:persist';    // Persist state across sessions

/**
 * Sandbox type determines plugin isolation level
 */
export type SandboxType = 'proxy' | 'iframe';

/**
 * Node binding configuration
 */
export interface NodeBindingConfig {
  /**
   * Binding mode:
   * - 'manual': User manually binds nodes to this plugin
   * - 'auto': Plugin automatically binds to nodes matching the filter
   */
  mode: 'manual' | 'auto';

  /** Filter for auto-binding (only used when mode is 'auto') */
  filter?: {
    /** Regex pattern to match node names */
    namePattern?: string;
    /** Required metadata properties */
    metadata?: Record<string, unknown>;
  };
}

/**
 * JSON Schema definition for plugin configuration
 */
export interface JSONSchema {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array';
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title?: string;
  description?: string;
  default?: unknown;
  enum?: (string | number)[];
  enumNames?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'color' | 'date' | 'time' | 'uri' | 'email';
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
}

/**
 * UI Component configuration in manifest
 */
export interface ManifestUIConfig {
  /** Toolbar button configuration */
  toolbar?: {
    enabled: boolean;
    icon?: string;
    tooltip?: string;
  };

  /** Side panel configuration */
  panel?: {
    component: string;
    title?: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
  };

  /** Popup dialog definitions */
  popups?: Record<string, {
    component: string;
    width?: number;
    height?: number;
    resizable?: boolean;
  }>;

  /** 3D overlay definitions */
  overlays?: Record<string, {
    component: string;
    occlude?: boolean;
  }>;

  /** Node properties panel section */
  nodeSection?: {
    component: string;
    title?: string;
    icon?: string;
    filter?: string;
    order?: number;
  };

  /** Context menu items */
  contextMenu?: Array<{
    id: string;
    label: string;
    icon?: string;
    filter?: string;
  }>;
}

/**
 * Plugin manifest defines metadata and capabilities.
 * This is the main configuration file for a plugin (manifest.json).
 */
export interface PluginManifest {
  /** Unique plugin identifier (reverse domain notation recommended) */
  id: string;

  /** Human-readable display name */
  name: string;

  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** Plugin author name or organization */
  author?: string;

  /** Short description of the plugin's purpose */
  description?: string;

  /** License identifier (e.g., "MIT", "Apache-2.0") */
  license?: string;

  /** Icon (emoji or path to image) */
  icon?: string;

  /** Path to the compiled plugin bundle (relative to manifest) */
  entryPoint: string;

  /** Required permissions */
  permissions: PluginPermission[];

  /** Sandbox type for execution isolation */
  sandbox?: SandboxType;

  /** Node binding configuration */
  nodeBinding?: NodeBindingConfig;

  /** UI component registration */
  ui?: ManifestUIConfig;

  /** Configuration schema */
  config?: {
    /** Global plugin configuration schema */
    global?: { schema: JSONSchema };
    /** Per-node instance configuration schema */
    instance?: { schema: JSONSchema };
  };

  /** Event subscriptions */
  events?: {
    onClick?: boolean;
    onHover?: boolean;
    onDataChange?: boolean;
  };
}

// ============================================================================
// NODE & BINDING
// ============================================================================

/**
 * Node event data passed to event handlers
 */
export interface NodeEvent {
  nodeId: string;
  nodeName: string;
  point?: Vector3;
  screenPosition?: ScreenPosition;
}

/**
 * Bound node representation available to plugins
 */
export interface BoundNode {
  readonly id: string;
  readonly name: string;
  readonly metadata: Record<string, unknown>;
}

/**
 * Node proxy with writable properties
 * Returned by NodesAPI.get() for node manipulation
 */
export interface NodeProxy {
  readonly id: string;
  readonly name: string;
  readonly metadata: Record<string, unknown>;

  // Transform properties (writable)
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;

  // Visual properties (writable)
  color: string;
  opacity: number;
  visible: boolean;
  emissive: string;
  emissiveIntensity: number;

  // Text properties (writable, for text nodes)
  text?: string;
  fontSize?: number;

  // Animation duration in ms
  duration: number;
}

/**
 * Filter options for finding nodes
 */
export interface NodeFilter {
  namePattern?: string | RegExp;
  metadata?: Record<string, unknown>;
  visible?: boolean;
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * MQTT message structure
 */
export interface MqttMessage {
  topic: string;
  payload: unknown;
  timestamp: number;
}

/**
 * MQTT publish options
 */
export interface MqttPublishOptions {
  qos?: 0 | 1 | 2;
  retain?: boolean;
}

/**
 * MQTT callback function type
 */
export type MqttCallback = (message: MqttMessage) => void;

/**
 * MQTT API for pub/sub communication
 */
export interface MqttAPI {
  /**
   * Publish a message to a topic
   * @requires mqtt:publish permission
   */
  publish(topic: string, payload: unknown, options?: MqttPublishOptions): void;

  /**
   * Subscribe to a specific topic
   * @requires mqtt:subscribe permission
   * @returns Unsubscribe function
   */
  subscribe(topic: string, callback: MqttCallback): Unsubscribe;

  /**
   * Subscribe to topics matching a pattern (supports + and # wildcards)
   * @requires mqtt:subscribe permission
   * @returns Unsubscribe function
   */
  subscribePattern(pattern: string, callback: MqttCallback): Unsubscribe;

  /**
   * Create a scoped MQTT API with a source identifier
   * Useful for multi-source configurations
   */
  withSource(sourceId: string): MqttAPI;

  /**
   * Get list of available MQTT source/broker IDs
   * @returns Array of source IDs configured in the 3DViewer
   */
  getSources(): string[];
}

/**
 * OPC UA value structure
 */
export interface OpcUaValue {
  value: unknown;
  dataType: string;
  statusCode: string;
  timestamp: Date;
}

/**
 * OPC UA callback function type
 */
export type OpcUaCallback = (value: OpcUaValue) => void;

/**
 * OPC UA API for industrial automation
 */
export interface OpcUaAPI {
  /**
   * Read a value from an OPC UA node
   * @requires opcua:read permission
   */
  read(nodeId: string): Promise<OpcUaValue>;

  /**
   * Write a value to an OPC UA node
   * @requires opcua:write permission
   */
  write(nodeId: string, value: unknown): Promise<void>;

  /**
   * Subscribe to value changes on an OPC UA node
   * @requires opcua:read permission
   * @returns Unsubscribe function
   */
  subscribe(nodeId: string, callback: OpcUaCallback): Unsubscribe;

  /**
   * Create a scoped OPC UA API with a source identifier
   */
  withSource(sourceId: string): OpcUaAPI;

  /**
   * Get list of available OPC-UA source/server IDs
   * @returns Array of source IDs configured in the 3DViewer
   */
  getSources(): string[];
}

/**
 * HTTP request options
 */
export interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * HTTP response structure
 */
export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
}

/**
 * HTTP callback function type
 */
export type HttpCallback = (response: HttpResponse) => void;

/**
 * HTTP API for REST communication
 */
export interface HttpAPI {
  /**
   * Make an HTTP request
   * @requires http:fetch permission
   */
  fetch(url: string, options?: HttpOptions): Promise<HttpResponse>;

  /**
   * Convenience method for GET requests
   * @requires http:fetch permission
   */
  get(url: string, options?: Omit<HttpOptions, 'method'>): Promise<HttpResponse>;

  /**
   * Convenience method for POST requests
   * @requires http:fetch permission
   */
  post(url: string, body: unknown, options?: Omit<HttpOptions, 'method' | 'body'>): Promise<HttpResponse>;

  /**
   * Start polling an endpoint at regular intervals
   * @requires http:fetch permission
   * @returns Unsubscribe function to stop polling
   */
  poll(url: string, intervalMs: number, callback: HttpCallback): Unsubscribe;
}

/**
 * Change callback for property changes
 */
export type ChangeCallback<T = unknown> = (newValue: T, oldValue: T) => void;

/**
 * Nodes API for scene manipulation
 */
export interface NodesAPI {
  /**
   * Get a node by name or ID
   * @requires nodes:read permission
   */
  get(nameOrId: string): NodeProxy | undefined;

  /**
   * Get all nodes in the scene
   * @requires nodes:read permission
   */
  getAll(): NodeProxy[];

  /**
   * Find nodes matching a filter
   * @requires nodes:read permission
   */
  find(filter: NodeFilter): NodeProxy[];

  /**
   * Subscribe to property changes on a node
   * @requires nodes:read permission
   * @returns Unsubscribe function
   */
  onChange(nodeId: string, property: string, callback: ChangeCallback): Unsubscribe;
}

/**
 * Global variables API
 */
export interface VarsAPI {
  /**
   * Get a variable value
   * @requires vars:read permission
   */
  get(name: string): unknown;

  /**
   * Set a variable value
   * @requires vars:write permission
   */
  set(name: string, value: unknown): void;

  /**
   * Subscribe to variable changes
   * @requires vars:read permission
   * @returns Unsubscribe function
   */
  onChange(name: string, callback: ChangeCallback): Unsubscribe;

  /**
   * Get all variables
   * @requires vars:read permission
   */
  getAll(): Record<string, unknown>;
}

/**
 * Constants API (read-only variables)
 */
export interface ConstsAPI {
  /**
   * Get a constant value
   */
  get(name: string): unknown;

  /**
   * Get all constants
   */
  getAll(): Record<string, unknown>;
}

/**
 * Node event callback type
 */
export type NodeEventCallback = (event: NodeEvent) => void;

/**
 * Events API for subscribing to application events
 */
export interface EventsAPI {
  /**
   * Subscribe to node click events
   * @param callback Called when any node is clicked
   * @returns Unsubscribe function
   */
  onNodeClick(callback: NodeEventCallback): Unsubscribe;

  /**
   * Subscribe to node hover events
   * @param callback Called when mouse enters/leaves a node
   * @returns Unsubscribe function
   */
  onNodeHover(callback: NodeEventCallback): Unsubscribe;

  /**
   * Subscribe to node selection events
   * @param callback Called when a node is selected
   * @returns Unsubscribe function
   */
  onNodeSelect(callback: NodeEventCallback): Unsubscribe;

  /**
   * Subscribe to node binding events
   * @param callback Called when a node is bound to this plugin
   * @returns Unsubscribe function
   */
  onNodeBound(callback: (node: BoundNode) => void): Unsubscribe;

  /**
   * Subscribe to node unbinding events
   * @param callback Called when a node is unbound from this plugin
   * @returns Unsubscribe function
   */
  onNodeUnbound(callback: (node: BoundNode) => void): Unsubscribe;

  /**
   * Emit a custom event
   * @param eventName Custom event name
   * @param data Optional event data
   */
  emit(eventName: string, data?: unknown): void;

  /**
   * Subscribe to a custom event
   * @param eventName Custom event name
   * @param callback Event handler
   * @returns Unsubscribe function
   */
  on(eventName: string, callback: (data: unknown) => void): Unsubscribe;

  /**
   * Register activation callback (called when plugin becomes active)
   */
  onActivate(callback: () => void): void;

  /**
   * Register deactivation callback (called when plugin is disabled)
   */
  onDeactivate(callback: () => void): void;

  /**
   * Subscribe to log acknowledgment events from Viewer Log
   * @param callback Called when log entries are acknowledged, receives the acknowledged entries
   * @returns Unsubscribe function
   */
  onLogAcknowledged(callback: (entries: Array<{ nodeId?: string; nodeName?: string; source?: string; message?: string }>) => void): Unsubscribe;
}

/**
 * Popup handle returned by UI API
 */
export interface PopupHandle {
  id: string;
  close(): void;
}

/**
 * Popup display options
 */
export interface PopupOptions {
  title?: string;
  width?: number;
  height?: number;
  position?: ScreenPosition;
  data?: Record<string, unknown>;
  onClose?: () => void;
}

/**
 * Overlay handle returned by UI API
 */
export interface OverlayHandle {
  id: string;
}

/**
 * Overlay display options
 */
export interface OverlayOptions {
  nodeId: string;
  offset?: Vector3;
  data?: Record<string, unknown>;
  occlude?: boolean;
}

/**
 * Notification type
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * UI API for dialogs and overlays
 */
export interface UiAPI {
  /**
   * Show a popup dialog
   * @requires ui:popup permission
   * @param componentName Name of the popup component from manifest
   * @param options Popup options
   * @returns Popup handle
   */
  showPopup(componentName: string, options: PopupOptions): PopupHandle;

  /**
   * Close a popup by handle
   */
  closePopup(handle: PopupHandle): void;

  /**
   * Close all popups from this plugin
   */
  closeAllPopups(): void;

  /**
   * Show a 3D overlay attached to a node
   * @requires ui:overlay permission
   * @param componentName Name of the overlay component from manifest
   * @param options Overlay options
   * @returns Overlay handle
   */
  showOverlay(componentName: string, options: OverlayOptions): OverlayHandle;

  /**
   * Update an overlay's options
   */
  updateOverlay(handle: OverlayHandle, options: Partial<OverlayOptions>): void;

  /**
   * Hide an overlay
   */
  hideOverlay(handle: OverlayHandle): void;

  /**
   * Show a notification toast
   */
  notify(message: string, type?: NotificationType): void;

  /**
   * Show a confirmation dialog
   * @returns Promise that resolves to true if confirmed, false otherwise
   */
  confirm(message: string): Promise<boolean>;

  /**
   * Show a prompt dialog
   * @returns Promise that resolves to the entered text, or null if cancelled
   */
  prompt(message: string, defaultValue?: string): Promise<string | null>;
}

/**
 * Session storage API (cleared on page reload)
 */
export interface SessionStorageAPI {
  /**
   * Get a session value
   */
  get<T>(key: string, defaultValue?: T): T;

  /**
   * Set a session value
   */
  set<T>(key: string, value: T): void;
}

/**
 * State API for persistent storage
 */
export interface StateAPI {
  /**
   * Get a persisted value
   * @requires state:persist permission
   */
  get<T>(key: string, defaultValue?: T): T;

  /**
   * Set a persisted value
   * @requires state:persist permission
   */
  set<T>(key: string, value: T): void;

  /**
   * Delete a persisted value
   * @requires state:persist permission
   */
  delete(key: string): void;

  /**
   * Session storage (not persisted across page reloads)
   */
  session: SessionStorageAPI;
}

/**
 * Log API for debugging
 */
export interface LogAPI {
  /**
   * Log a debug message (only shown in development mode)
   */
  debug(message: string, data?: unknown): void;

  /**
   * Log an info message
   */
  info(message: string, data?: unknown): void;

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown): void;

  /**
   * Log an error message
   */
  error(message: string, data?: unknown): void;
}

/**
 * Global configuration API
 */
export interface GlobalConfigAPI {
  /**
   * Get a global config value
   */
  get<T>(key: string, defaultValue?: T): T;

  /**
   * Set a global config value
   */
  set<T>(key: string, value: T): void;

  /**
   * Get all global config values
   */
  getAll(): Record<string, unknown>;

  /**
   * Subscribe to config changes
   * @returns Unsubscribe function
   */
  onChange(key: string, callback: ChangeCallback): Unsubscribe;
}

/**
 * Instance (per-node) configuration API
 */
export interface InstanceConfigAPI {
  /**
   * Get an instance config value for a specific node
   */
  get<T>(nodeId: string, key: string, defaultValue?: T): T;

  /**
   * Set an instance config value for a specific node
   */
  set<T>(nodeId: string, key: string, value: T): void;

  /**
   * Get all config values for a specific node
   */
  getForNode(nodeId: string): Record<string, unknown>;

  /**
   * Get all instance configs (Map of nodeId -> config)
   */
  getAll(): Map<string, Record<string, unknown>>;

  /**
   * Subscribe to instance config changes
   * @returns Unsubscribe function
   */
  onChange(nodeId: string, key: string, callback: ChangeCallback): Unsubscribe;
}

/**
 * Plugin configuration API
 */
export interface PluginConfigAPI {
  /** Global plugin configuration */
  readonly global: GlobalConfigAPI;

  /** Per-node instance configuration */
  readonly instance: InstanceConfigAPI;
}

// ============================================================================
// PLUGIN CONTEXT
// ============================================================================

/**
 * Plugin context provides access to all APIs.
 * This is the main interface for interacting with the 3DViewer.
 *
 * @example
 * ```typescript
 * const plugin: Plugin = {
 *   onLoad(ctx: PluginContext) {
 *     // Access APIs
 *     ctx.mqtt.subscribe('sensors/#', (msg) => {
 *       ctx.log.info('Received', msg);
 *     });
 *
 *     // Manipulate nodes
 *     const motor = ctx.nodes.get('Motor_01');
 *     if (motor) {
 *       motor.color = '#00ff00';
 *     }
 *   }
 * };
 * ```
 */
export interface PluginContext {
  /** Unique plugin identifier */
  readonly pluginId: string;

  /** Plugin version from manifest */
  readonly version: string;

  /** Configuration API */
  readonly config: PluginConfigAPI;

  /** Node manipulation API */
  readonly nodes: NodesAPI;

  /** MQTT pub/sub API */
  readonly mqtt: MqttAPI;

  /** OPC UA API */
  readonly opcua: OpcUaAPI;

  /** HTTP/REST API */
  readonly http: HttpAPI;

  /** Global variables API */
  readonly vars: VarsAPI;

  /** Constants API (read-only) */
  readonly consts: ConstsAPI;

  /** Event subscription API */
  readonly events: EventsAPI;

  /** UI dialogs and overlays API */
  readonly ui: UiAPI;

  /** Persistent state API */
  readonly state: StateAPI;

  /** Logging API */
  readonly log: LogAPI;
}

// ============================================================================
// PLUGIN INTERFACE
// ============================================================================

/**
 * Main plugin interface.
 * Implement this interface to create a 3DViewer plugin.
 *
 * @example
 * ```typescript
 * import type { Plugin, PluginContext, BoundNode } from '@3dviewer/plugin-sdk';
 *
 * const plugin: Plugin = {
 *   components: {
 *     Panel: MyPanelComponent,
 *     Overlay: MyOverlayComponent,
 *   },
 *
 *   onLoad(ctx) {
 *     ctx.log.info('Plugin loaded!');
 *   },
 *
 *   onNodeBound(ctx, node) {
 *     ctx.log.info(`Node bound: ${node.name}`);
 *   },
 *
 *   onUnload(ctx) {
 *     ctx.log.info('Plugin unloaded');
 *   },
 * };
 *
 * export default plugin;
 * ```
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Plugin {
  /**
   * React components provided by this plugin.
   * Keys must match component names in manifest UI config.
   * Note: Using 'any' here to allow components with specific prop types.
   */
  components?: Record<string, ComponentType<any>>;

  /**
   * Called when the plugin is loaded.
   * Use for initialization, subscriptions, and setup.
   *
   * @param ctx Plugin context with access to all APIs
   */
  onLoad?(ctx: PluginContext): void;

  /**
   * Called when the plugin is unloaded.
   * Use for cleanup. Note: Subscriptions are auto-cleaned.
   *
   * @param ctx Plugin context
   */
  onUnload?(ctx: PluginContext): void;

  /**
   * Called when a node is bound to this plugin.
   * Use for per-node initialization.
   *
   * @param ctx Plugin context
   * @param node The bound node information
   */
  onNodeBound?(ctx: PluginContext, node: BoundNode): void;

  /**
   * Called when a node is unbound from this plugin.
   * Use for per-node cleanup.
   *
   * @param ctx Plugin context
   * @param node The unbound node information
   */
  onNodeUnbound?(ctx: PluginContext, node: BoundNode): void;

  /**
   * Called when configuration changes.
   *
   * @param ctx Plugin context
   * @param type Whether global or instance config changed
   * @param key The config key that changed
   * @param nodeId For instance config, the node ID (undefined for global)
   */
  onConfigChange?(
    ctx: PluginContext,
    type: 'global' | 'instance',
    key: string,
    nodeId?: string
  ): void;
}

// ============================================================================
// LOADING & SOURCE
// ============================================================================

/**
 * Git authentication for private repositories
 */
export interface PluginAuth {
  type: 'token' | 'basic';
  token?: string;
  username?: string;
  password?: string;
}

/**
 * Plugin source for loading
 */
export type PluginSource =
  | { type: 'git'; url: string; branch?: string; tag?: string; auth?: PluginAuth }
  | { type: 'url'; url: string }
  | { type: 'local'; path: string };

/**
 * Sandbox status
 */
export type SandboxStatus = 'loading' | 'active' | 'error' | 'unloaded';

// ============================================================================
// BACKUP & RESTORE
// ============================================================================

/**
 * Plugin backup entry for serialization
 */
export interface PluginBackupEntry {
  id: string;
  manifest: PluginManifest;
  source?: PluginSource;
  sourceType: 'git' | 'url' | 'local' | 'inline';
  enabled: boolean;
  boundNodes: string[];
  globalConfig: Record<string, unknown>;
  instanceConfigs: Record<string, Record<string, unknown>>;
}

/**
 * Complete plugin backup data
 */
export interface PluginBackupData {
  _version: '1.0';
  _type: 'plugins';
  plugins: PluginBackupEntry[];
}

/**
 * Result of plugin restore operation
 */
export interface PluginRestoreResult {
  success: boolean;
  restoredCount: number;
  restoredPlugins: string[];
  failedPlugins: string[];
  warnings: string[];
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export type {
  ComponentType,
};
