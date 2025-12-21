/**
 * Control Panel Component
 *
 * Haupt-Seitenpanel für das Blueprint Plugin.
 * Zeigt Übersicht aller gebundenen Nodes und ermöglicht Steuerung.
 */

import React, { useState, useCallback } from 'react';

interface ControlPanelProps {
  pluginId: string;
  // These props are injected by the plugin system
  boundNodes?: Array<{ id: string; name: string }>;
  globalConfig?: Record<string, unknown>;
  onConfigChange?: (key: string, value: unknown) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  pluginId,
  boundNodes = [],
  globalConfig = {},
  onConfigChange,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleRefreshIntervalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && onConfigChange) {
        onConfigChange('refreshInterval', value);
      }
    },
    [onConfigChange]
  );

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onConfigChange) {
        onConfigChange('defaultColor', e.target.value);
      }
    },
    [onConfigChange]
  );

  return (
    <div className="blueprint-control-panel">
      <style>{`
        .blueprint-control-panel {
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #fff;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 12px;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .node-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .node-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          margin-bottom: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .node-item:hover {
          background: rgba(255,255,255,0.1);
        }
        .node-item.selected {
          background: rgba(0, 150, 255, 0.2);
          border: 1px solid rgba(0, 150, 255, 0.5);
        }
        .node-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #00d4ff, #0096ff);
          border-radius: 4px;
          margin-right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        .node-name {
          flex: 1;
          font-size: 13px;
        }
        .node-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
        }
        .node-status.warning {
          background: #ffaa00;
        }
        .node-status.error {
          background: #ff4444;
        }
        .config-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        .config-label {
          flex: 1;
          font-size: 13px;
        }
        .config-input {
          width: 100px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          color: #fff;
          font-size: 13px;
        }
        .config-input:focus {
          outline: none;
          border-color: #00d4ff;
        }
        .color-input {
          width: 40px;
          height: 30px;
          padding: 0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }
        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        .empty-state-text {
          font-size: 13px;
        }
        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .stat-card {
          background: rgba(255,255,255,0.05);
          padding: 12px;
          border-radius: 6px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #00d4ff;
        }
        .stat-label {
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
        }
      `}</style>

      {/* Stats Section */}
      <div className="section">
        <div className="section-title">Übersicht</div>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{boundNodes.length}</div>
            <div className="stat-label">Nodes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {globalConfig.refreshInterval ? `${(globalConfig.refreshInterval as number) / 1000}s` : '-'}
            </div>
            <div className="stat-label">Intervall</div>
          </div>
        </div>
      </div>

      {/* Bound Nodes List */}
      <div className="section">
        <div className="section-title">Gebundene Nodes ({boundNodes.length})</div>
        {boundNodes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔧</div>
            <div className="empty-state-text">
              Keine Nodes gebunden.
              <br />
              Klicke auf einen Node und wähle dieses Plugin.
            </div>
          </div>
        ) : (
          <ul className="node-list">
            {boundNodes.map((node) => (
              <li
                key={node.id}
                className={`node-item ${selectedNode === node.id ? 'selected' : ''}`}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
              >
                <div className="node-icon">📦</div>
                <span className="node-name">{node.name}</span>
                <div className="node-status" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Global Config */}
      <div className="section">
        <div className="section-title">Globale Einstellungen</div>

        <div className="config-row">
          <span className="config-label">Aktualisierung</span>
          <input
            type="number"
            className="config-input"
            value={globalConfig.refreshInterval as number || 1000}
            onChange={handleRefreshIntervalChange}
            min={100}
            max={60000}
            step={100}
          />
          <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>ms</span>
        </div>

        <div className="config-row">
          <span className="config-label">Standard-Farbe</span>
          <input
            type="color"
            className="color-input"
            value={globalConfig.defaultColor as string || '#00ff00'}
            onChange={handleColorChange}
          />
        </div>

        <div className="config-row">
          <span className="config-label">Animationen</span>
          <input
            type="checkbox"
            checked={globalConfig.enableAnimations as boolean ?? true}
            onChange={(e) => onConfigChange?.('enableAnimations', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};
