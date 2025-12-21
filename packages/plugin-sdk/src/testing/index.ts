/**
 * @fileoverview Plugin Testing Utilities
 * @version 1.0.0
 *
 * This module provides mock implementations of all plugin APIs
 * for unit testing plugins in isolation.
 *
 * @example
 * ```typescript
 * import { createMockContext, MockMqttAPI } from '@3dviewer/plugin-sdk/testing';
 * import plugin from '../src';
 *
 * describe('MyPlugin', () => {
 *   it('should subscribe to MQTT on load', () => {
 *     const ctx = createMockContext();
 *     plugin.onLoad?.(ctx);
 *
 *     const mqtt = ctx.mqtt as MockMqttAPI;
 *     expect(mqtt.subscriptions).toHaveLength(1);
 *     expect(mqtt.subscriptions[0].topic).toBe('sensors/#');
 *   });
 * });
 * ```
 */

import type {
  PluginContext,
  MqttAPI,
  OpcUaAPI,
  HttpAPI,
  NodesAPI,
  VarsAPI,
  ConstsAPI,
  EventsAPI,
  UiAPI,
  StateAPI,
  LogAPI,
  PluginConfigAPI,
  GlobalConfigAPI,
  InstanceConfigAPI,
  NodeProxy,
  MqttMessage,
  MqttCallback,
  MqttPublishOptions,
  OpcUaValue,
  OpcUaCallback,
  HttpOptions,
  HttpResponse,
  HttpCallback,
  NodeFilter,
  ChangeCallback,
  NodeEvent,
  NodeEventCallback,
  BoundNode,
  PopupHandle,
  PopupOptions,
  OverlayHandle,
  OverlayOptions,
  NotificationType,
  Unsubscribe,
  Vector3,
} from '../types';

// ============================================================================
// MOCK TYPES
// ============================================================================

export interface MockSubscription {
  topic: string;
  callback: MqttCallback;
}

export interface MockPublication {
  topic: string;
  payload: unknown;
  options?: MqttPublishOptions;
  timestamp: number;
}

export interface MockOpcUaSubscription {
  nodeId: string;
  callback: OpcUaCallback;
}

export interface MockHttpCall {
  url: string;
  options?: HttpOptions;
  timestamp: number;
}

export interface MockLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
  timestamp: number;
}

export interface MockNotification {
  message: string;
  type: NotificationType;
  timestamp: number;
}

// ============================================================================
// MOCK IMPLEMENTATIONS
// ============================================================================

/**
 * Mock MQTT API with inspection capabilities
 */
export class MockMqttAPI implements MqttAPI {
  subscriptions: MockSubscription[] = [];
  publications: MockPublication[] = [];

  publish(topic: string, payload: unknown, options?: MqttPublishOptions): void {
    this.publications.push({ topic, payload, options, timestamp: Date.now() });
  }

  subscribe(topic: string, callback: MqttCallback): Unsubscribe {
    const sub: MockSubscription = { topic, callback };
    this.subscriptions.push(sub);
    return () => {
      const idx = this.subscriptions.indexOf(sub);
      if (idx >= 0) this.subscriptions.splice(idx, 1);
    };
  }

  subscribePattern(pattern: string, callback: MqttCallback): Unsubscribe {
    return this.subscribe(pattern, callback);
  }

  withSource(_sourceId: string): MqttAPI {
    return this;
  }

  /**
   * Simulate receiving a message (for testing)
   */
  simulateMessage(topic: string, payload: unknown): void {
    const message: MqttMessage = { topic, payload, timestamp: Date.now() };

    for (const sub of this.subscriptions) {
      if (this.topicMatches(sub.topic, topic)) {
        sub.callback(message);
      }
    }
  }

  private topicMatches(pattern: string, topic: string): boolean {
    if (pattern === topic) return true;

    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '#') return true;
      if (patternParts[i] === '+') continue;
      if (patternParts[i] !== topicParts[i]) return false;
    }

    return patternParts.length === topicParts.length;
  }

  /** Clear all subscriptions and publications */
  reset(): void {
    this.subscriptions = [];
    this.publications = [];
  }
}

/**
 * Mock OPC UA API with inspection capabilities
 */
export class MockOpcUaAPI implements OpcUaAPI {
  subscriptions: MockOpcUaSubscription[] = [];
  values: Map<string, OpcUaValue> = new Map();
  writeLog: Array<{ nodeId: string; value: unknown; timestamp: number }> = [];

  async read(nodeId: string): Promise<OpcUaValue> {
    return (
      this.values.get(nodeId) ?? {
        value: null,
        dataType: 'Unknown',
        statusCode: 'BadNodeIdUnknown',
        timestamp: new Date(),
      }
    );
  }

  async write(nodeId: string, value: unknown): Promise<void> {
    this.writeLog.push({ nodeId, value, timestamp: Date.now() });
    const existing = this.values.get(nodeId);
    if (existing) {
      existing.value = value;
      existing.timestamp = new Date();
    }
  }

  subscribe(nodeId: string, callback: OpcUaCallback): Unsubscribe {
    const sub: MockOpcUaSubscription = { nodeId, callback };
    this.subscriptions.push(sub);
    return () => {
      const idx = this.subscriptions.indexOf(sub);
      if (idx >= 0) this.subscriptions.splice(idx, 1);
    };
  }

  withSource(_sourceId: string): OpcUaAPI {
    return this;
  }

  /**
   * Set a mock value (for testing)
   */
  setValue(nodeId: string, value: unknown, dataType = 'Float'): void {
    this.values.set(nodeId, {
      value,
      dataType,
      statusCode: 'Good',
      timestamp: new Date(),
    });
  }

  /**
   * Simulate a value change (triggers subscriptions)
   */
  simulateValueChange(nodeId: string, value: unknown, dataType = 'Float'): void {
    const opcValue: OpcUaValue = {
      value,
      dataType,
      statusCode: 'Good',
      timestamp: new Date(),
    };
    this.values.set(nodeId, opcValue);

    for (const sub of this.subscriptions) {
      if (sub.nodeId === nodeId) {
        sub.callback(opcValue);
      }
    }
  }

  reset(): void {
    this.subscriptions = [];
    this.values.clear();
    this.writeLog = [];
  }
}

/**
 * Mock HTTP API with inspection capabilities
 */
export class MockHttpAPI implements HttpAPI {
  calls: MockHttpCall[] = [];
  responses: Map<string, HttpResponse> = new Map();
  pollers: Array<{ url: string; interval: number; callback: HttpCallback }> = [];

  async fetch(url: string, options?: HttpOptions): Promise<HttpResponse> {
    this.calls.push({ url, options, timestamp: Date.now() });

    const response = this.responses.get(url);
    if (response) return response;

    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: null,
    };
  }

  async get(url: string, options?: Omit<HttpOptions, 'method'>): Promise<HttpResponse> {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  async post(
    url: string,
    body: unknown,
    options?: Omit<HttpOptions, 'method' | 'body'>
  ): Promise<HttpResponse> {
    return this.fetch(url, { ...options, method: 'POST', body });
  }

  poll(url: string, interval: number, callback: HttpCallback): Unsubscribe {
    const poller = { url, interval, callback };
    this.pollers.push(poller);
    return () => {
      const idx = this.pollers.indexOf(poller);
      if (idx >= 0) this.pollers.splice(idx, 1);
    };
  }

  /**
   * Set a mock response for a URL
   */
  setResponse(url: string, response: Partial<HttpResponse>): void {
    this.responses.set(url, {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: null,
      ...response,
    });
  }

  reset(): void {
    this.calls = [];
    this.responses.clear();
    this.pollers = [];
  }
}

/**
 * Mock Node Proxy
 */
export function createMockNodeProxy(id: string, name: string): NodeProxy {
  return {
    id,
    name,
    metadata: {},
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    color: '#ffffff',
    opacity: 1,
    visible: true,
    emissive: '#000000',
    emissiveIntensity: 0,
    duration: 300,
  };
}

/**
 * Mock Nodes API with inspection capabilities
 */
export class MockNodesAPI implements NodesAPI {
  nodes: Map<string, NodeProxy> = new Map();
  changeCallbacks: Map<string, Map<string, ChangeCallback[]>> = new Map();

  get(nameOrId: string): NodeProxy | undefined {
    // Try by ID first
    if (this.nodes.has(nameOrId)) {
      return this.nodes.get(nameOrId);
    }
    // Then by name
    for (const node of this.nodes.values()) {
      if (node.name === nameOrId) return node;
    }
    return undefined;
  }

  getAll(): NodeProxy[] {
    return Array.from(this.nodes.values());
  }

  find(filter: NodeFilter): NodeProxy[] {
    return this.getAll().filter((node) => {
      if (filter.namePattern) {
        const pattern =
          typeof filter.namePattern === 'string'
            ? new RegExp(filter.namePattern)
            : filter.namePattern;
        if (!pattern.test(node.name)) return false;
      }
      if (filter.visible !== undefined && node.visible !== filter.visible) {
        return false;
      }
      if (filter.metadata) {
        for (const [key, value] of Object.entries(filter.metadata)) {
          if (node.metadata[key] !== value) return false;
        }
      }
      return true;
    });
  }

  onChange(nodeId: string, property: string, callback: ChangeCallback): Unsubscribe {
    if (!this.changeCallbacks.has(nodeId)) {
      this.changeCallbacks.set(nodeId, new Map());
    }
    const nodeCallbacks = this.changeCallbacks.get(nodeId)!;
    if (!nodeCallbacks.has(property)) {
      nodeCallbacks.set(property, []);
    }
    nodeCallbacks.get(property)!.push(callback);

    return () => {
      const callbacks = nodeCallbacks.get(property);
      if (callbacks) {
        const idx = callbacks.indexOf(callback);
        if (idx >= 0) callbacks.splice(idx, 1);
      }
    };
  }

  /**
   * Add a mock node
   */
  addNode(id: string, name: string, props?: Partial<NodeProxy>): NodeProxy {
    const node = { ...createMockNodeProxy(id, name), ...props };
    this.nodes.set(id, node);
    return node;
  }

  /**
   * Simulate property change (triggers callbacks)
   */
  simulateChange(nodeId: string, property: string, newValue: unknown, oldValue: unknown): void {
    const nodeCallbacks = this.changeCallbacks.get(nodeId);
    if (nodeCallbacks) {
      const callbacks = nodeCallbacks.get(property);
      if (callbacks) {
        for (const cb of callbacks) {
          cb(newValue, oldValue);
        }
      }
    }
  }

  reset(): void {
    this.nodes.clear();
    this.changeCallbacks.clear();
  }
}

/**
 * Mock Variables API
 */
export class MockVarsAPI implements VarsAPI {
  variables: Map<string, unknown> = new Map();
  changeCallbacks: Map<string, ChangeCallback[]> = new Map();

  get(name: string): unknown {
    return this.variables.get(name);
  }

  set(name: string, value: unknown): void {
    const oldValue = this.variables.get(name);
    this.variables.set(name, value);

    const callbacks = this.changeCallbacks.get(name);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(value, oldValue);
      }
    }
  }

  onChange(name: string, callback: ChangeCallback): Unsubscribe {
    if (!this.changeCallbacks.has(name)) {
      this.changeCallbacks.set(name, []);
    }
    this.changeCallbacks.get(name)!.push(callback);

    return () => {
      const callbacks = this.changeCallbacks.get(name);
      if (callbacks) {
        const idx = callbacks.indexOf(callback);
        if (idx >= 0) callbacks.splice(idx, 1);
      }
    };
  }

  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.variables);
  }

  reset(): void {
    this.variables.clear();
    this.changeCallbacks.clear();
  }
}

/**
 * Mock Constants API
 */
export class MockConstsAPI implements ConstsAPI {
  constants: Map<string, unknown> = new Map();

  get(name: string): unknown {
    return this.constants.get(name);
  }

  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.constants);
  }

  /** Set a constant value (for test setup) */
  setConstant(name: string, value: unknown): void {
    this.constants.set(name, value);
  }

  reset(): void {
    this.constants.clear();
  }
}

/**
 * Mock Events API
 */
export class MockEventsAPI implements EventsAPI {
  clickCallbacks: NodeEventCallback[] = [];
  hoverCallbacks: NodeEventCallback[] = [];
  selectCallbacks: NodeEventCallback[] = [];
  boundCallbacks: ((node: BoundNode) => void)[] = [];
  unboundCallbacks: ((node: BoundNode) => void)[] = [];
  customCallbacks: Map<string, ((data: unknown) => void)[]> = new Map();
  emittedEvents: Array<{ name: string; data?: unknown; timestamp: number }> = [];
  activateCallback?: () => void;
  deactivateCallback?: () => void;

  onNodeClick(callback: NodeEventCallback): Unsubscribe {
    this.clickCallbacks.push(callback);
    return () => {
      const idx = this.clickCallbacks.indexOf(callback);
      if (idx >= 0) this.clickCallbacks.splice(idx, 1);
    };
  }

  onNodeHover(callback: NodeEventCallback): Unsubscribe {
    this.hoverCallbacks.push(callback);
    return () => {
      const idx = this.hoverCallbacks.indexOf(callback);
      if (idx >= 0) this.hoverCallbacks.splice(idx, 1);
    };
  }

  onNodeSelect(callback: NodeEventCallback): Unsubscribe {
    this.selectCallbacks.push(callback);
    return () => {
      const idx = this.selectCallbacks.indexOf(callback);
      if (idx >= 0) this.selectCallbacks.splice(idx, 1);
    };
  }

  onNodeBound(callback: (node: BoundNode) => void): Unsubscribe {
    this.boundCallbacks.push(callback);
    return () => {
      const idx = this.boundCallbacks.indexOf(callback);
      if (idx >= 0) this.boundCallbacks.splice(idx, 1);
    };
  }

  onNodeUnbound(callback: (node: BoundNode) => void): Unsubscribe {
    this.unboundCallbacks.push(callback);
    return () => {
      const idx = this.unboundCallbacks.indexOf(callback);
      if (idx >= 0) this.unboundCallbacks.splice(idx, 1);
    };
  }

  emit(eventName: string, data?: unknown): void {
    this.emittedEvents.push({ name: eventName, data, timestamp: Date.now() });

    const callbacks = this.customCallbacks.get(eventName);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(data);
      }
    }
  }

  on(eventName: string, callback: (data: unknown) => void): Unsubscribe {
    if (!this.customCallbacks.has(eventName)) {
      this.customCallbacks.set(eventName, []);
    }
    this.customCallbacks.get(eventName)!.push(callback);

    return () => {
      const callbacks = this.customCallbacks.get(eventName);
      if (callbacks) {
        const idx = callbacks.indexOf(callback);
        if (idx >= 0) callbacks.splice(idx, 1);
      }
    };
  }

  onActivate(callback: () => void): void {
    this.activateCallback = callback;
  }

  onDeactivate(callback: () => void): void {
    this.deactivateCallback = callback;
  }

  /** Simulate a click event */
  simulateClick(event: NodeEvent): void {
    for (const cb of this.clickCallbacks) {
      cb(event);
    }
  }

  /** Simulate a hover event */
  simulateHover(event: NodeEvent): void {
    for (const cb of this.hoverCallbacks) {
      cb(event);
    }
  }

  /** Simulate a select event */
  simulateSelect(event: NodeEvent): void {
    for (const cb of this.selectCallbacks) {
      cb(event);
    }
  }

  /** Simulate node bound */
  simulateBound(node: BoundNode): void {
    for (const cb of this.boundCallbacks) {
      cb(node);
    }
  }

  /** Simulate node unbound */
  simulateUnbound(node: BoundNode): void {
    for (const cb of this.unboundCallbacks) {
      cb(node);
    }
  }

  /** Trigger activate callback */
  triggerActivate(): void {
    this.activateCallback?.();
  }

  /** Trigger deactivate callback */
  triggerDeactivate(): void {
    this.deactivateCallback?.();
  }

  reset(): void {
    this.clickCallbacks = [];
    this.hoverCallbacks = [];
    this.selectCallbacks = [];
    this.boundCallbacks = [];
    this.unboundCallbacks = [];
    this.customCallbacks.clear();
    this.emittedEvents = [];
    this.activateCallback = undefined;
    this.deactivateCallback = undefined;
  }
}

/**
 * Mock UI API
 */
export class MockUiAPI implements UiAPI {
  popups: Array<{ handle: PopupHandle; componentName: string; options: PopupOptions }> = [];
  overlays: Array<{ handle: OverlayHandle; componentName: string; options: OverlayOptions }> = [];
  notifications: MockNotification[] = [];
  confirms: Array<{ message: string; result: boolean }> = [];
  prompts: Array<{ message: string; result: string | null }> = [];

  private popupIdCounter = 0;
  private overlayIdCounter = 0;

  // Default responses for confirm/prompt
  confirmResponse = true;
  promptResponse: string | null = 'test';

  showPopup(componentName: string, options: PopupOptions): PopupHandle {
    const handle: PopupHandle = {
      id: `popup-${++this.popupIdCounter}`,
      close: () => this.closePopup(handle),
    };
    this.popups.push({ handle, componentName, options });
    return handle;
  }

  closePopup(handle: PopupHandle): void {
    const idx = this.popups.findIndex((p) => p.handle.id === handle.id);
    if (idx >= 0) {
      this.popups[idx].options.onClose?.();
      this.popups.splice(idx, 1);
    }
  }

  closeAllPopups(): void {
    for (const popup of this.popups) {
      popup.options.onClose?.();
    }
    this.popups = [];
  }

  showOverlay(componentName: string, options: OverlayOptions): OverlayHandle {
    const handle: OverlayHandle = { id: `overlay-${++this.overlayIdCounter}` };
    this.overlays.push({ handle, componentName, options });
    return handle;
  }

  updateOverlay(handle: OverlayHandle, options: Partial<OverlayOptions>): void {
    const overlay = this.overlays.find((o) => o.handle.id === handle.id);
    if (overlay) {
      Object.assign(overlay.options, options);
    }
  }

  hideOverlay(handle: OverlayHandle): void {
    const idx = this.overlays.findIndex((o) => o.handle.id === handle.id);
    if (idx >= 0) this.overlays.splice(idx, 1);
  }

  notify(message: string, type: NotificationType = 'info'): void {
    this.notifications.push({ message, type, timestamp: Date.now() });
  }

  async confirm(message: string): Promise<boolean> {
    this.confirms.push({ message, result: this.confirmResponse });
    return this.confirmResponse;
  }

  async prompt(message: string, _defaultValue?: string): Promise<string | null> {
    this.prompts.push({ message, result: this.promptResponse });
    return this.promptResponse;
  }

  reset(): void {
    this.popups = [];
    this.overlays = [];
    this.notifications = [];
    this.confirms = [];
    this.prompts = [];
    this.popupIdCounter = 0;
    this.overlayIdCounter = 0;
    this.confirmResponse = true;
    this.promptResponse = 'test';
  }
}

/**
 * Mock State API
 */
export class MockStateAPI implements StateAPI {
  persistent: Map<string, unknown> = new Map();
  sessionData: Map<string, unknown> = new Map();

  session = {
    get: <T>(key: string, defaultValue?: T): T => {
      return (this.sessionData.get(key) as T) ?? defaultValue!;
    },
    set: <T>(key: string, value: T): void => {
      this.sessionData.set(key, value);
    },
  };

  get<T>(key: string, defaultValue?: T): T {
    return (this.persistent.get(key) as T) ?? defaultValue!;
  }

  set<T>(key: string, value: T): void {
    this.persistent.set(key, value);
  }

  delete(key: string): void {
    this.persistent.delete(key);
  }

  reset(): void {
    this.persistent.clear();
    this.sessionData.clear();
  }
}

/**
 * Mock Log API
 */
export class MockLogAPI implements LogAPI {
  entries: MockLogEntry[] = [];

  debug(message: string, data?: unknown): void {
    this.entries.push({ level: 'debug', message, data, timestamp: Date.now() });
  }

  info(message: string, data?: unknown): void {
    this.entries.push({ level: 'info', message, data, timestamp: Date.now() });
  }

  warn(message: string, data?: unknown): void {
    this.entries.push({ level: 'warn', message, data, timestamp: Date.now() });
  }

  error(message: string, data?: unknown): void {
    this.entries.push({ level: 'error', message, data, timestamp: Date.now() });
  }

  /** Get entries by level */
  getByLevel(level: MockLogEntry['level']): MockLogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }

  reset(): void {
    this.entries = [];
  }
}

/**
 * Mock Global Config API
 */
export class MockGlobalConfigAPI implements GlobalConfigAPI {
  config: Map<string, unknown> = new Map();
  changeCallbacks: Map<string, ChangeCallback[]> = new Map();

  get<T>(key: string, defaultValue?: T): T {
    return (this.config.get(key) as T) ?? defaultValue!;
  }

  set<T>(key: string, value: T): void {
    const oldValue = this.config.get(key);
    this.config.set(key, value);

    const callbacks = this.changeCallbacks.get(key);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(value, oldValue);
      }
    }
  }

  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.config);
  }

  onChange(key: string, callback: ChangeCallback): Unsubscribe {
    if (!this.changeCallbacks.has(key)) {
      this.changeCallbacks.set(key, []);
    }
    this.changeCallbacks.get(key)!.push(callback);

    return () => {
      const callbacks = this.changeCallbacks.get(key);
      if (callbacks) {
        const idx = callbacks.indexOf(callback);
        if (idx >= 0) callbacks.splice(idx, 1);
      }
    };
  }

  reset(): void {
    this.config.clear();
    this.changeCallbacks.clear();
  }
}

/**
 * Mock Instance Config API
 */
export class MockInstanceConfigAPI implements InstanceConfigAPI {
  configs: Map<string, Map<string, unknown>> = new Map();
  changeCallbacks: Map<string, Map<string, ChangeCallback[]>> = new Map();

  get<T>(nodeId: string, key: string, defaultValue?: T): T {
    return (this.configs.get(nodeId)?.get(key) as T) ?? defaultValue!;
  }

  set<T>(nodeId: string, key: string, value: T): void {
    if (!this.configs.has(nodeId)) {
      this.configs.set(nodeId, new Map());
    }
    const oldValue = this.configs.get(nodeId)!.get(key);
    this.configs.get(nodeId)!.set(key, value);

    const nodeCallbacks = this.changeCallbacks.get(nodeId);
    if (nodeCallbacks) {
      const callbacks = nodeCallbacks.get(key);
      if (callbacks) {
        for (const cb of callbacks) {
          cb(value, oldValue);
        }
      }
    }
  }

  getForNode(nodeId: string): Record<string, unknown> {
    const nodeConfig = this.configs.get(nodeId);
    return nodeConfig ? Object.fromEntries(nodeConfig) : {};
  }

  getAll(): Map<string, Record<string, unknown>> {
    const result = new Map<string, Record<string, unknown>>();
    for (const [nodeId, config] of this.configs) {
      result.set(nodeId, Object.fromEntries(config));
    }
    return result;
  }

  onChange(nodeId: string, key: string, callback: ChangeCallback): Unsubscribe {
    if (!this.changeCallbacks.has(nodeId)) {
      this.changeCallbacks.set(nodeId, new Map());
    }
    const nodeCallbacks = this.changeCallbacks.get(nodeId)!;
    if (!nodeCallbacks.has(key)) {
      nodeCallbacks.set(key, []);
    }
    nodeCallbacks.get(key)!.push(callback);

    return () => {
      const callbacks = nodeCallbacks.get(key);
      if (callbacks) {
        const idx = callbacks.indexOf(callback);
        if (idx >= 0) callbacks.splice(idx, 1);
      }
    };
  }

  reset(): void {
    this.configs.clear();
    this.changeCallbacks.clear();
  }
}

/**
 * Mock Plugin Config API
 */
export class MockPluginConfigAPI implements PluginConfigAPI {
  readonly global: MockGlobalConfigAPI;
  readonly instance: MockInstanceConfigAPI;

  constructor() {
    this.global = new MockGlobalConfigAPI();
    this.instance = new MockInstanceConfigAPI();
  }

  reset(): void {
    this.global.reset();
    this.instance.reset();
  }
}

// ============================================================================
// MOCK CONTEXT FACTORY
// ============================================================================

/**
 * Options for creating a mock context
 */
export interface MockContextOptions {
  pluginId?: string;
  version?: string;
  initialNodes?: Array<{ id: string; name: string; props?: Partial<NodeProxy> }>;
  initialVars?: Record<string, unknown>;
  initialConsts?: Record<string, unknown>;
  initialGlobalConfig?: Record<string, unknown>;
}

/**
 * Mock context with all APIs accessible for testing
 */
export interface MockPluginContext extends PluginContext {
  mqtt: MockMqttAPI;
  opcua: MockOpcUaAPI;
  http: MockHttpAPI;
  nodes: MockNodesAPI;
  vars: MockVarsAPI;
  consts: MockConstsAPI;
  events: MockEventsAPI;
  ui: MockUiAPI;
  state: MockStateAPI;
  log: MockLogAPI;
  config: MockPluginConfigAPI;

  /** Reset all APIs to initial state */
  reset(): void;
}

/**
 * Create a mock plugin context for testing.
 *
 * @example
 * ```typescript
 * import { createMockContext } from '@3dviewer/plugin-sdk/testing';
 *
 * const ctx = createMockContext({
 *   pluginId: 'com.test.my-plugin',
 *   initialNodes: [
 *     { id: 'node1', name: 'Motor_01' },
 *     { id: 'node2', name: 'Motor_02' },
 *   ],
 * });
 *
 * // Test your plugin
 * plugin.onLoad?.(ctx);
 *
 * // Inspect API calls
 * expect(ctx.mqtt.subscriptions).toHaveLength(1);
 * expect(ctx.log.entries).toContainEqual(
 *   expect.objectContaining({ level: 'info', message: 'Plugin loaded' })
 * );
 * ```
 */
export function createMockContext(options: MockContextOptions = {}): MockPluginContext {
  const mqtt = new MockMqttAPI();
  const opcua = new MockOpcUaAPI();
  const http = new MockHttpAPI();
  const nodes = new MockNodesAPI();
  const vars = new MockVarsAPI();
  const consts = new MockConstsAPI();
  const events = new MockEventsAPI();
  const ui = new MockUiAPI();
  const state = new MockStateAPI();
  const log = new MockLogAPI();
  const config = new MockPluginConfigAPI();

  // Initialize nodes
  if (options.initialNodes) {
    for (const node of options.initialNodes) {
      nodes.addNode(node.id, node.name, node.props);
    }
  }

  // Initialize variables
  if (options.initialVars) {
    for (const [name, value] of Object.entries(options.initialVars)) {
      vars.variables.set(name, value);
    }
  }

  // Initialize constants
  if (options.initialConsts) {
    for (const [name, value] of Object.entries(options.initialConsts)) {
      consts.constants.set(name, value);
    }
  }

  // Initialize global config
  if (options.initialGlobalConfig) {
    for (const [key, value] of Object.entries(options.initialGlobalConfig)) {
      config.global.config.set(key, value);
    }
  }

  const ctx: MockPluginContext = {
    pluginId: options.pluginId ?? 'com.test.mock-plugin',
    version: options.version ?? '1.0.0',
    mqtt,
    opcua,
    http,
    nodes,
    vars,
    consts,
    events,
    ui,
    state,
    log,
    config,

    reset() {
      mqtt.reset();
      opcua.reset();
      http.reset();
      nodes.reset();
      vars.reset();
      consts.reset();
      events.reset();
      ui.reset();
      state.reset();
      log.reset();
      config.reset();

      // Re-initialize after reset
      if (options.initialNodes) {
        for (const node of options.initialNodes) {
          nodes.addNode(node.id, node.name, node.props);
        }
      }
      if (options.initialVars) {
        for (const [name, value] of Object.entries(options.initialVars)) {
          vars.variables.set(name, value);
        }
      }
      if (options.initialConsts) {
        for (const [name, value] of Object.entries(options.initialConsts)) {
          consts.constants.set(name, value);
        }
      }
      if (options.initialGlobalConfig) {
        for (const [key, value] of Object.entries(options.initialGlobalConfig)) {
          config.global.config.set(key, value);
        }
      }
    },
  };

  return ctx;
}
