/**
 * Valve Plugin Unit Tests
 *
 * Tests error handling, acknowledgment, and MQTT error matching.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockContext, type MockPluginContext } from '@3dviewer/plugin-sdk/testing';
import type { BoundNode } from '@3dviewer/plugin-sdk';
import plugin, {
  getNodeState,
  sendMoveToBase,
  acknowledgeError,
  acknowledgeAllErrors,
  getUnacknowledgedErrorCount,
} from '../../plugins/valve/src/index';
import { GenericState } from '../../plugins/valve/src/types';

// Default command URL used by sendValveCommand
const COMMAND_URL = 'http://localhost:3021/v1/commands/functioncall';

/**
 * Helper: Set up plugin with a bound valve node
 */
function setupPlugin(ctx: MockPluginContext, options?: {
  valveName?: string;
  functionNo?: number;
  nodeId?: string;
  nodeName?: string;
}): string {
  const nodeId = options?.nodeId ?? 'valve-1';
  const nodeName = options?.nodeName ?? 'Valve_01';
  const valveName = options?.valveName ?? 'Ventil_1';
  const functionNo = options?.functionNo ?? 100;

  // Add node to mock nodes API
  ctx.nodes.addNode(nodeId, nodeName);

  // Set instance config for the node
  ctx.config.instance.set(nodeId, 'valveName', valveName);
  ctx.config.instance.set(nodeId, 'functionNo', functionNo);

  // Initialize plugin
  plugin.onLoad!(ctx);

  // Bind node
  const boundNode: BoundNode = { id: nodeId, name: nodeName };
  plugin.onNodeBound!(ctx, boundNode);

  return nodeId;
}

/**
 * Helper: Clean up plugin
 */
function teardownPlugin(ctx: MockPluginContext): void {
  plugin.onUnload!(ctx);
}

/**
 * Helper: Create an MQTT error payload
 */
function createMqttErrorPayload(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    utc: Date.now(),
    lvl: 'ERR',
    src: 'Ventil_1',
    typ: 'Valve',
    msg: { txt: 'Test error message' },
    ...overrides,
  };
}

describe('Valve Plugin', () => {
  let ctx: MockPluginContext;

  beforeEach(() => {
    ctx = createMockContext({
      pluginId: 'com.rexat.valve',
      initialGlobalConfig: {
        httpBaseUrl: 'http://localhost:3021',
        mainTopic: 'machine/valves',
        errorTopic: 'machine/errors',
      },
    });
  });

  // ========================================================================
  // HTTP Command Errors
  // ========================================================================

  describe('HTTP Command Errors', () => {
    let nodeId: string;

    beforeEach(() => {
      nodeId = setupPlugin(ctx);
    });

    afterEach(() => {
      teardownPlugin(ctx);
    });

    it('should add error to nodeState.errors on non-2xx response', async () => {
      ctx.http.setResponse(COMMAND_URL, {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await sendMoveToBase(nodeId);

      const state = getNodeState(nodeId);
      expect(state).toBeDefined();
      expect(state!.errors).toHaveLength(1);
      expect(state!.errors[0].level).toBe('ERR');
      expect(state!.errors[0].source).toBe('HTTP');
      expect(state!.errors[0].acknowledged).toBe(false);
    });

    it('should include command details in error rawPayload', async () => {
      ctx.http.setResponse(COMMAND_URL, {
        status: 500,
        statusText: 'Internal Server Error',
      });

      await sendMoveToBase(nodeId);

      const state = getNodeState(nodeId);
      const payload = JSON.parse(state!.errors[0].rawPayload);
      expect(payload.src).toBe('HTTP');
      expect(payload.lvl).toBe('ERR');
      expect(payload.msg.txt).toContain('500');
      expect(payload.status).toBe(500);
      expect(payload.url).toBe(COMMAND_URL);
    });

    it('should set genericState to Error on HTTP failure', async () => {
      ctx.http.setResponse(COMMAND_URL, { status: 500 });

      await sendMoveToBase(nodeId);

      const state = getNodeState(nodeId);
      expect(state!.genericState).toBe(GenericState.Error);
    });

    it('should set node emissive to error color', async () => {
      ctx.http.setResponse(COMMAND_URL, { status: 500 });

      await sendMoveToBase(nodeId);

      const node = ctx.nodes.get('valve-1');
      expect(node).toBeDefined();
      expect(node!.emissive).toBe('#ff0000');
      expect(node!.emissiveIntensity).toBe(1.0);
    });

    it('should log error with nodeId for Viewer Log integration', async () => {
      ctx.http.setResponse(COMMAND_URL, { status: 500 });

      await sendMoveToBase(nodeId);

      const errorLogs = ctx.log.getByLevel('error');
      expect(errorLogs.length).toBeGreaterThan(0);

      const httpError = errorLogs.find(e => e.message.includes('Ventil_1'));
      expect(httpError).toBeDefined();
      expect((httpError!.data as Record<string, unknown>).nodeId).toBe(nodeId);
    });

    it('should show error notification', async () => {
      ctx.http.setResponse(COMMAND_URL, { status: 500 });

      await sendMoveToBase(nodeId);

      const errorNotifications = ctx.ui.notifications.filter(n => n.type === 'error');
      expect(errorNotifications.length).toBeGreaterThan(0);
    });

    it('should add error on network exception', async () => {
      // Override http.post to throw (simulates network failure)
      const originalPost = ctx.http.post.bind(ctx.http);
      ctx.http.post = async () => {
        throw new Error('Network unreachable');
      };

      await sendMoveToBase(nodeId);

      const state = getNodeState(nodeId);
      expect(state!.errors).toHaveLength(1);
      expect(state!.errors[0].source).toBe('HTTP');

      const payload = JSON.parse(state!.errors[0].rawPayload);
      expect(payload.error).toBe('Network unreachable');

      // Restore
      ctx.http.post = originalPost;
    });

    it('should return false on command failure', async () => {
      ctx.http.setResponse(COMMAND_URL, { status: 500 });

      const result = await sendMoveToBase(nodeId);
      expect(result).toBe(false);
    });

    it('should limit errors to 20 entries', async () => {
      ctx.http.setResponse(COMMAND_URL, { status: 500 });

      // Send 25 failing commands
      for (let i = 0; i < 25; i++) {
        await sendMoveToBase(nodeId);
      }

      const state = getNodeState(nodeId);
      expect(state!.errors.length).toBeLessThanOrEqual(20);
    });
  });

  // ========================================================================
  // MQTT Error Matching (3-Pass)
  // ========================================================================

  describe('MQTT Error Matching', () => {
    it('should match error by src === valveName (pass 1)', () => {
      const nodeId = setupPlugin(ctx, { valveName: 'Ventil_1' });

      // Simulate MQTT error with matching src
      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({
        src: 'Ventil_1',
      }));

      const state = getNodeState(nodeId);
      expect(state!.errors).toHaveLength(1);
      expect(state!.errors[0].source).toBe('Ventil_1');

      teardownPlugin(ctx);
    });

    it('should match error by exe/functionNo when src does not match (pass 2)', () => {
      const nodeId = setupPlugin(ctx, {
        valveName: 'Ventil_1',
        functionNo: 100,
      });

      // PLC error: src is hardware name, not valve name
      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({
        src: 'PCB_3Extender',
        typ: 'Valve',
        exe: '100',
      }));

      const state = getNodeState(nodeId);
      expect(state!.errors).toHaveLength(1);

      teardownPlugin(ctx);
    });

    it('should broadcast to all valve nodes when typ=Valve and no match (pass 3)', () => {
      const nodeId1 = setupPlugin(ctx, {
        nodeId: 'valve-1',
        nodeName: 'V1',
        valveName: 'Ventil_1',
        functionNo: 100,
      });
      // Add second node
      ctx.nodes.addNode('valve-2', 'V2');
      ctx.config.instance.set('valve-2', 'valveName', 'Ventil_2');
      ctx.config.instance.set('valve-2', 'functionNo', 200);
      plugin.onNodeBound!(ctx, { id: 'valve-2', name: 'V2' });

      // Error with no matching src or exe
      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({
        src: 'Unknown_Source',
        typ: 'Valve',
        exe: '999',
      }));

      const state1 = getNodeState('valve-1');
      const state2 = getNodeState('valve-2');
      expect(state1!.errors).toHaveLength(1);
      expect(state2!.errors).toHaveLength(1);

      teardownPlugin(ctx);
    });

    it('should not match non-Valve type errors without src match', () => {
      const nodeId = setupPlugin(ctx, { valveName: 'Ventil_1' });

      // Error with different type and non-matching src
      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({
        src: 'Sensor_01',
        typ: 'Sensor',
      }));

      const state = getNodeState(nodeId);
      expect(state!.errors).toHaveLength(0);

      teardownPlugin(ctx);
    });

    it('should set genericState to Error on MQTT ERR level', () => {
      const nodeId = setupPlugin(ctx, { valveName: 'Ventil_1' });

      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({
        src: 'Ventil_1',
        lvl: 'ERR',
      }));

      const state = getNodeState(nodeId);
      expect(state!.genericState).toBe(GenericState.Error);

      teardownPlugin(ctx);
    });

    it('should not change genericState on WARN level', () => {
      const nodeId = setupPlugin(ctx, { valveName: 'Ventil_1' });

      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({
        src: 'Ventil_1',
        lvl: 'WARN',
      }));

      const state = getNodeState(nodeId);
      expect(state!.genericState).not.toBe(GenericState.Error);

      teardownPlugin(ctx);
    });
  });

  // ========================================================================
  // Error Acknowledgment
  // ========================================================================

  describe('Error Acknowledgment', () => {
    let nodeId: string;

    beforeEach(() => {
      nodeId = setupPlugin(ctx, { valveName: 'Ventil_1' });

      // Add two MQTT errors
      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({
        src: 'Ventil_1',
        msg: { txt: 'Error 1' },
      }));
      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({
        src: 'Ventil_1',
        msg: { txt: 'Error 2' },
      }));
    });

    afterEach(() => {
      teardownPlugin(ctx);
    });

    it('should mark single error as acknowledged', () => {
      acknowledgeError(nodeId, 0);

      const state = getNodeState(nodeId);
      expect(state!.errors[0].acknowledged).toBe(true);
      expect(state!.errors[1].acknowledged).toBe(false);
    });

    it('should mark all errors as acknowledged (preserving history)', () => {
      acknowledgeAllErrors(nodeId);

      const state = getNodeState(nodeId);
      // Errors are still there, just marked as acknowledged
      expect(state!.errors).toHaveLength(2);
      expect(state!.errors.every(e => e.acknowledged)).toBe(true);
    });

    it('should reset visual state when all errors acknowledged', () => {
      acknowledgeAllErrors(nodeId);

      const node = ctx.nodes.get('valve-1');
      expect(node!.emissiveIntensity).toBe(0);
    });

    it('should not reset visual state if unacknowledged errors remain', () => {
      // Acknowledge only the first error
      acknowledgeError(nodeId, 0);

      const node = ctx.nodes.get('valve-1');
      // Still has unacknowledged error → stays red
      expect(node!.emissive).toBe('#ff0000');
      expect(node!.emissiveIntensity).toBe(1.0);
    });

    it('should handle Viewer Log acknowledgment via onLogAcknowledged', () => {
      const events = ctx.events;

      // Simulate Viewer Log acknowledging entries for this node
      events.simulateLogAcknowledged([
        { nodeId, nodeName: 'Ventil_1' },
      ]);

      const state = getNodeState(nodeId);
      expect(state!.errors.every(e => e.acknowledged)).toBe(true);
    });

    it('should handle mixed HTTP and MQTT errors in acknowledgeAll', async () => {
      // Add an HTTP error on top of existing MQTT errors
      ctx.http.setResponse(COMMAND_URL, { status: 500 });
      await sendMoveToBase(nodeId);

      const state = getNodeState(nodeId);
      expect(state!.errors.length).toBe(3);

      // Acknowledge all
      acknowledgeAllErrors(nodeId);

      expect(state!.errors.every(e => e.acknowledged)).toBe(true);
      expect(state!.errors).toHaveLength(3); // History preserved
    });
  });

  // ========================================================================
  // Error Count
  // ========================================================================

  describe('Error Count', () => {
    it('should return 0 when no errors', () => {
      const nodeId = setupPlugin(ctx);
      expect(getUnacknowledgedErrorCount(nodeId)).toBe(0);
      teardownPlugin(ctx);
    });

    it('should return correct unacknowledged count', () => {
      const nodeId = setupPlugin(ctx, { valveName: 'Ventil_1' });

      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({ src: 'Ventil_1' }));
      ctx.mqtt.simulateMessage('machine/errors', createMqttErrorPayload({ src: 'Ventil_1' }));

      expect(getUnacknowledgedErrorCount(nodeId)).toBe(2);

      acknowledgeError(nodeId, 0);
      expect(getUnacknowledgedErrorCount(nodeId)).toBe(1);

      acknowledgeError(nodeId, 1);
      expect(getUnacknowledgedErrorCount(nodeId)).toBe(0);

      teardownPlugin(ctx);
    });

    it('should return 0 for unknown nodeId', () => {
      expect(getUnacknowledgedErrorCount('nonexistent')).toBe(0);
    });
  });
});
