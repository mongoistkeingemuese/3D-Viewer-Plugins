/**
 * Settings Popup for IFrame Plugin
 */

import React from 'react';

interface SettingsPopupProps {
  nodeId: string;
  data?: {
    value?: unknown;
  };
  instanceConfig?: Record<string, unknown>;
  onConfigChange?: (key: string, value: unknown) => void;
  onClose?: () => void;
}

export const SettingsPopup: React.FC<SettingsPopupProps> = ({
  nodeId,
  data = {},
  instanceConfig = {},
  onConfigChange,
  onClose,
}) => {
  return (
    <div style={{ padding: 20, fontFamily: 'system-ui', color: '#fff', minWidth: 350 }}>
      <h3 style={{ margin: '0 0 16px' }}>Node Settings</h3>
      <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>{nodeId}</p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
          Datenquelle
        </label>
        <select
          value={instanceConfig.dataSource as string || 'manual'}
          onChange={(e) => onConfigChange?.('dataSource', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            color: '#fff',
          }}
        >
          <option value="manual">Manuell</option>
          <option value="mqtt">MQTT</option>
          <option value="http">HTTP</option>
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
          Endpoint/Topic
        </label>
        <input
          type="text"
          value={instanceConfig.endpoint as string || ''}
          onChange={(e) => onConfigChange?.('endpoint', e.target.value)}
          placeholder="z.B. sensors/temp oder /api/data"
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            color: '#fff',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
          Anzeigemodus
        </label>
        <select
          value={instanceConfig.displayMode as string || 'badge'}
          onChange={(e) => onConfigChange?.('displayMode', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            color: '#fff',
          }}
        >
          <option value="badge">Badge</option>
          <option value="label">Label</option>
          <option value="none">Kein Overlay</option>
        </select>
      </div>

      {data.value !== undefined && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          padding: 12,
          borderRadius: 6,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
            Aktueller Wert
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 14 }}>
            {typeof data.value === 'object'
              ? JSON.stringify(data.value, null, 2)
              : String(data.value)}
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #00d4ff, #0096ff)',
          border: 'none',
          borderRadius: 6,
          color: '#fff',
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Schließen
      </button>
    </div>
  );
};
