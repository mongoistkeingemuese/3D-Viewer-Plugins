/**
 * IFrame Panel Component
 */

import React from 'react';

interface IFramePanelProps {
  pluginId: string;
  boundNodes?: Array<{ id: string; name: string }>;
  globalConfig?: Record<string, unknown>;
  onConfigChange?: (key: string, value: unknown) => void;
}

export const IFramePanel: React.FC<IFramePanelProps> = ({
  boundNodes = [],
  globalConfig = {},
  onConfigChange,
}) => {
  return (
    <div style={{ padding: 16, fontFamily: 'system-ui', color: '#fff' }}>
      <div style={{ marginBottom: 16, padding: 12, background: 'rgba(0,150,255,0.1)', borderRadius: 8, borderLeft: '3px solid #00d4ff' }}>
        <strong>🔒 IFrame Plugin</strong>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#888' }}>
          Dieses Plugin läuft in einem isolierten IFrame für maximale Sicherheit.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
          GEBUNDENE NODES ({boundNodes.length})
        </div>
        {boundNodes.length === 0 ? (
          <div style={{ color: '#666', fontSize: 13 }}>
            Keine Nodes gebunden
          </div>
        ) : (
          boundNodes.map((node) => (
            <div
              key={node.id}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 4,
                marginBottom: 4,
                fontSize: 13,
              }}
            >
              {node.name}
            </div>
          ))
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
          EINSTELLUNGEN
        </div>

        <label style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ flex: 1, fontSize: 13 }}>Polling Intervall</span>
          <input
            type="number"
            value={globalConfig.pollingInterval as number || 2000}
            onChange={(e) => onConfigChange?.('pollingInterval', parseInt(e.target.value))}
            style={{
              width: 80,
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
              color: '#fff',
            }}
          />
          <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>ms</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1, fontSize: 13 }}>Theme</span>
          <select
            value={globalConfig.theme as string || 'dark'}
            onChange={(e) => onConfigChange?.('theme', e.target.value)}
            style={{
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 4,
              color: '#fff',
            }}
          >
            <option value="light">Hell</option>
            <option value="dark">Dunkel</option>
            <option value="auto">Auto</option>
          </select>
        </label>
      </div>
    </div>
  );
};
