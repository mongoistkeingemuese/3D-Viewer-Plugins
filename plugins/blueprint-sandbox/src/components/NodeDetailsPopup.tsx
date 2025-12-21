/**
 * Node Details Popup
 *
 * Zeigt detaillierte Informationen über einen gebundenen Node.
 */

import React from 'react';

interface NodeDetailsPopupProps {
  nodeId: string;
  nodeName: string;
  data?: {
    lastValue?: unknown;
    lastUpdate?: Date;
    bindingType?: string;
  };
  onClose?: () => void;
}

export const NodeDetailsPopup: React.FC<NodeDetailsPopupProps> = ({
  nodeId,
  nodeName,
  data = {},
  onClose,
}) => {
  return (
    <div className="node-details-popup">
      <style>{`
        .node-details-popup {
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #fff;
          min-width: 300px;
        }
        .popup-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .popup-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #00d4ff, #0096ff);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-right: 12px;
        }
        .popup-title {
          font-size: 16px;
          font-weight: 600;
        }
        .popup-subtitle {
          font-size: 12px;
          color: #888;
          font-family: monospace;
        }
        .detail-row {
          display: flex;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .detail-label {
          flex: 1;
          color: #888;
          font-size: 13px;
        }
        .detail-value {
          font-size: 13px;
          font-weight: 500;
        }
        .detail-value.mono {
          font-family: monospace;
        }
        .binding-badge {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(0, 150, 255, 0.2);
          border-radius: 4px;
          font-size: 11px;
          text-transform: uppercase;
        }
        .close-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: #888;
          font-size: 18px;
          cursor: pointer;
        }
        .close-btn:hover {
          color: #fff;
        }
        .value-preview {
          background: rgba(0,0,0,0.3);
          padding: 12px;
          border-radius: 6px;
          margin-top: 12px;
          font-family: monospace;
          font-size: 12px;
          max-height: 150px;
          overflow: auto;
        }
      `}</style>

      <button className="close-btn" onClick={onClose}>×</button>

      <div className="popup-header">
        <div className="popup-icon">📦</div>
        <div>
          <div className="popup-title">{nodeName}</div>
          <div className="popup-subtitle">{nodeId}</div>
        </div>
      </div>

      <div className="detail-row">
        <span className="detail-label">Binding</span>
        <span className="detail-value">
          <span className="binding-badge">
            {data.bindingType || 'Keines'}
          </span>
        </span>
      </div>

      <div className="detail-row">
        <span className="detail-label">Letztes Update</span>
        <span className="detail-value mono">
          {data.lastUpdate
            ? new Date(data.lastUpdate).toLocaleTimeString()
            : '-'}
        </span>
      </div>

      {data.lastValue !== undefined && (
        <div>
          <div className="detail-label" style={{ marginTop: 12 }}>
            Aktueller Wert
          </div>
          <div className="value-preview">
            {typeof data.lastValue === 'object'
              ? JSON.stringify(data.lastValue, null, 2)
              : String(data.lastValue)}
          </div>
        </div>
      )}
    </div>
  );
};
