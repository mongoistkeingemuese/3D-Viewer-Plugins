/**
 * Node Status Overlay
 *
 * 3D-Overlay das über einem Node schwebt und Status anzeigt.
 */

import React from 'react';

interface NodeStatusOverlayProps {
  nodeId: string;
  data?: {
    value?: unknown;
    bindingType?: string;
    timestamp?: Date;
  };
}

export const NodeStatusOverlay: React.FC<NodeStatusOverlayProps> = ({
  nodeId: _nodeId,
  data = {},
}) => {
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return value.toFixed(2);
    if (typeof value === 'boolean') return value ? 'ON' : 'OFF';
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  };

  const getStatusColor = (value: unknown): string => {
    if (typeof value === 'number') {
      if (value >= 90) return '#ff4444';
      if (value >= 70) return '#ffaa00';
      return '#00ff88';
    }
    if (typeof value === 'boolean') {
      return value ? '#00ff88' : '#888';
    }
    return '#00d4ff';
  };

  return (
    <div className="node-status-overlay">
      <style>{`
        .node-status-overlay {
          background: rgba(20, 20, 35, 0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 8px 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #fff;
          min-width: 80px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          pointer-events: none;
        }
        .overlay-value {
          font-size: 18px;
          font-weight: bold;
          font-family: monospace;
        }
        .overlay-label {
          font-size: 10px;
          color: #888;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .overlay-binding {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 4px;
        }
        .binding-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div
        className="overlay-value"
        style={{ color: getStatusColor(data.value) }}
      >
        {formatValue(data.value)}
      </div>

      {data.bindingType && data.bindingType !== 'none' && (
        <div className="overlay-binding">
          <span
            className="binding-dot"
            style={{ background: getStatusColor(data.value) }}
          />
          <span className="overlay-label">{data.bindingType}</span>
        </div>
      )}
    </div>
  );
};
