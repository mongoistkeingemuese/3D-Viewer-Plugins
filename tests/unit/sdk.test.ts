/**
 * SDK Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMockContext,
  MockMqttAPI,
  MockNodesAPI,
  MockPluginContext,
} from '@3dviewer/plugin-sdk/testing';
import { definePlugin, validateManifest } from '@3dviewer/plugin-sdk';

describe('SDK Core', () => {
  describe('definePlugin', () => {
    it('should return the plugin unchanged', () => {
      const plugin = { onLoad: () => {} };
      const result = definePlugin(plugin);
      expect(result).toBe(plugin);
    });
  });

  describe('validateManifest', () => {
    it('should validate a correct manifest', () => {
      const manifest = {
        id: 'com.example.test',
        name: 'Test Plugin',
        version: '1.0.0',
        entryPoint: 'dist/index.js',
        permissions: ['nodes:read'],
      };

      expect(() => validateManifest(manifest)).not.toThrow();
    });

    it('should throw on missing id', () => {
      const manifest = {
        name: 'Test',
        version: '1.0.0',
        entryPoint: 'dist/index.js',
        permissions: [],
      };

      expect(() => validateManifest(manifest)).toThrow('id');
    });

    it('should throw on invalid permission', () => {
      const manifest = {
        id: 'com.test.plugin',
        name: 'Test',
        version: '1.0.0',
        entryPoint: 'dist/index.js',
        permissions: ['invalid:permission'],
      };

      expect(() => validateManifest(manifest)).toThrow('invalid:permission');
    });
  });
});

describe('Mock Context', () => {
  let ctx: MockPluginContext;

  beforeEach(() => {
    ctx = createMockContext({
      pluginId: 'com.test.plugin',
      version: '1.0.0',
      initialNodes: [
        { id: 'node-1', name: 'Motor_01' },
        { id: 'node-2', name: 'Sensor_01' },
      ],
      initialVars: {
        globalCounter: 0,
      },
    });
  });

  it('should create context with plugin info', () => {
    expect(ctx.pluginId).toBe('com.test.plugin');
    expect(ctx.version).toBe('1.0.0');
  });

  it('should have initialized nodes', () => {
    const nodes = ctx.nodes.getAll();
    expect(nodes).toHaveLength(2);
    expect(ctx.nodes.get('Motor_01')).toBeDefined();
  });

  it('should have initialized variables', () => {
    expect(ctx.vars.get('globalCounter')).toBe(0);
  });
});

describe('Mock MQTT API', () => {
  let mqtt: MockMqttAPI;

  beforeEach(() => {
    mqtt = new MockMqttAPI();
  });

  it('should track subscriptions', () => {
    const callback = () => {};
    mqtt.subscribe('test/topic', callback);

    expect(mqtt.subscriptions).toHaveLength(1);
    expect(mqtt.subscriptions[0].topic).toBe('test/topic');
  });

  it('should unsubscribe correctly', () => {
    const unsub = mqtt.subscribe('test/topic', () => {});
    expect(mqtt.subscriptions).toHaveLength(1);

    unsub();
    expect(mqtt.subscriptions).toHaveLength(0);
  });

  it('should track publications', () => {
    mqtt.publish('test/topic', { value: 42 });

    expect(mqtt.publications).toHaveLength(1);
    expect(mqtt.publications[0].topic).toBe('test/topic');
    expect(mqtt.publications[0].payload).toEqual({ value: 42 });
  });

  it('should simulate messages', () => {
    const received: unknown[] = [];
    mqtt.subscribe('sensors/#', (msg) => {
      received.push(msg.payload);
    });

    mqtt.simulateMessage('sensors/temp', { value: 25 });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ value: 25 });
  });

  it('should match topic patterns', () => {
    const received: string[] = [];

    mqtt.subscribe('sensors/+/value', (msg) => {
      received.push(msg.topic);
    });

    mqtt.simulateMessage('sensors/temp/value', 1);
    mqtt.simulateMessage('sensors/humidity/value', 2);
    mqtt.simulateMessage('sensors/temp/status', 3); // Should not match

    expect(received).toEqual(['sensors/temp/value', 'sensors/humidity/value']);
  });
});

describe('Mock Nodes API', () => {
  let nodes: MockNodesAPI;

  beforeEach(() => {
    nodes = new MockNodesAPI();
    nodes.addNode('node-1', 'Motor_01');
    nodes.addNode('node-2', 'Motor_02');
    nodes.addNode('node-3', 'Sensor_01');
  });

  it('should get node by id', () => {
    const node = nodes.get('node-1');
    expect(node).toBeDefined();
    expect(node?.name).toBe('Motor_01');
  });

  it('should get node by name', () => {
    const node = nodes.get('Motor_01');
    expect(node).toBeDefined();
    expect(node?.id).toBe('node-1');
  });

  it('should find nodes by pattern', () => {
    const motors = nodes.find({ namePattern: /^Motor_/ });
    expect(motors).toHaveLength(2);
  });

  it('should allow property changes', () => {
    const node = nodes.get('node-1');
    expect(node).toBeDefined();

    node!.color = '#ff0000';
    expect(node!.color).toBe('#ff0000');
  });

  it('should trigger change callbacks', () => {
    const changes: Array<{ newVal: unknown; oldVal: unknown }> = [];

    nodes.onChange('node-1', 'color', (newVal, oldVal) => {
      changes.push({ newVal, oldVal });
    });

    nodes.simulateChange('node-1', 'color', '#ff0000', '#ffffff');

    expect(changes).toHaveLength(1);
    expect(changes[0].newVal).toBe('#ff0000');
    expect(changes[0].oldVal).toBe('#ffffff');
  });
});

describe('Mock Events API', () => {
  let ctx: MockPluginContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('should track click callbacks', () => {
    const clicks: string[] = [];
    ctx.events.onNodeClick((event) => clicks.push(event.nodeId));

    ctx.events.simulateClick({ nodeId: 'node-1', nodeName: 'Motor' });

    expect(clicks).toEqual(['node-1']);
  });

  it('should track emitted events', () => {
    ctx.events.emit('custom-event', { data: 'test' });

    expect(ctx.events.emittedEvents).toHaveLength(1);
    expect(ctx.events.emittedEvents[0].name).toBe('custom-event');
    expect(ctx.events.emittedEvents[0].data).toEqual({ data: 'test' });
  });

  it('should handle custom events', () => {
    const received: unknown[] = [];
    ctx.events.on('my-event', (data) => received.push(data));

    ctx.events.emit('my-event', { value: 42 });

    expect(received).toEqual([{ value: 42 }]);
  });
});

describe('Mock UI API', () => {
  let ctx: MockPluginContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('should track popups', () => {
    const handle = ctx.ui.showPopup('TestPopup', { title: 'Test' });

    expect(ctx.ui.popups).toHaveLength(1);
    expect(ctx.ui.popups[0].componentName).toBe('TestPopup');
    expect(handle.id).toBeDefined();
  });

  it('should close popups', () => {
    const handle = ctx.ui.showPopup('TestPopup', {});
    expect(ctx.ui.popups).toHaveLength(1);

    ctx.ui.closePopup(handle);
    expect(ctx.ui.popups).toHaveLength(0);
  });

  it('should track notifications', () => {
    ctx.ui.notify('Test message', 'success');

    expect(ctx.ui.notifications).toHaveLength(1);
    expect(ctx.ui.notifications[0].message).toBe('Test message');
    expect(ctx.ui.notifications[0].type).toBe('success');
  });

  it('should handle confirm dialogs', async () => {
    ctx.ui.confirmResponse = true;
    const result = await ctx.ui.confirm('Are you sure?');

    expect(result).toBe(true);
    expect(ctx.ui.confirms).toHaveLength(1);
  });
});

describe('Mock State API', () => {
  let ctx: MockPluginContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('should persist state', () => {
    ctx.state.set('myKey', { count: 42 });
    const value = ctx.state.get<{ count: number }>('myKey');

    expect(value).toEqual({ count: 42 });
  });

  it('should return default for missing keys', () => {
    const value = ctx.state.get('missing', 'default');
    expect(value).toBe('default');
  });

  it('should handle session state separately', () => {
    ctx.state.set('persistent', 'value1');
    ctx.state.session.set('session', 'value2');

    expect(ctx.state.get('persistent')).toBe('value1');
    expect(ctx.state.session.get('session')).toBe('value2');
  });
});

describe('Mock Log API', () => {
  let ctx: MockPluginContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('should track log entries', () => {
    ctx.log.info('Info message');
    ctx.log.warn('Warning message');
    ctx.log.error('Error message');

    expect(ctx.log.entries).toHaveLength(3);
    expect(ctx.log.getByLevel('info')).toHaveLength(1);
    expect(ctx.log.getByLevel('warn')).toHaveLength(1);
    expect(ctx.log.getByLevel('error')).toHaveLength(1);
  });

  it('should include data in log entries', () => {
    ctx.log.info('Message', { extra: 'data' });

    expect(ctx.log.entries[0].data).toEqual({ extra: 'data' });
  });
});

describe('Integration: Plugin Testing', () => {
  it('should test a complete plugin flow', () => {
    // Create a simple plugin
    const boundNodes: string[] = [];

    const plugin = definePlugin({
      onLoad(ctx) {
        ctx.log.info('Plugin loaded');
        ctx.mqtt.subscribe('sensors/#', (msg) => {
          ctx.log.debug('Received', msg.payload);
        });
      },

      onNodeBound(ctx, node) {
        boundNodes.push(node.id);
        const proxy = ctx.nodes.get(node.id);
        if (proxy) {
          proxy.color = '#00ff00';
        }
      },

      onUnload(ctx) {
        ctx.log.info('Plugin unloaded');
      },
    });

    // Create mock context
    const ctx = createMockContext({
      initialNodes: [
        { id: 'motor-1', name: 'Motor_01' },
      ],
    });

    // Test onLoad
    plugin.onLoad?.(ctx);
    expect(ctx.mqtt.subscriptions).toHaveLength(1);
    expect(ctx.log.entries[0].message).toBe('Plugin loaded');

    // Test onNodeBound
    plugin.onNodeBound?.(ctx, { id: 'motor-1', name: 'Motor_01', metadata: {} });
    expect(boundNodes).toContain('motor-1');
    expect(ctx.nodes.get('motor-1')?.color).toBe('#00ff00');

    // Simulate MQTT message
    ctx.mqtt.simulateMessage('sensors/temp', { value: 25 });
    expect(ctx.log.getByLevel('debug')).toHaveLength(1);

    // Test onUnload
    plugin.onUnload?.(ctx);
    expect(ctx.log.entries.find((e) => e.message === 'Plugin unloaded')).toBeDefined();
  });
});
