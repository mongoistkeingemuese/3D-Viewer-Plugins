/**
 * Node Properties Section
 *
 * Wird im Node Properties Panel des 3DViewers angezeigt.
 */

import React from 'react';

interface NodePropertiesSectionProps {
  nodeId: string;
  nodeName: string;
  instanceConfig?: Record<string, unknown>;
  onConfigChange?: (key: string, value: unknown) => void;
  onShowPopup?: (popupName: string) => void;
}

export const NodePropertiesSection: React.FC<NodePropertiesSectionProps> = ({
  nodeId: _nodeId,
  nodeName,
  instanceConfig = {},
  onConfigChange,
  onShowPopup,
}) => {
  const bindingType = (instanceConfig.bindingType as string) || 'none';

  return (
    <div className="node-properties-section">
      <style>{`
        .node-properties-section {
          padding: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .prop-row {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .prop-label {
          flex: 1;
          font-size: 13px;
          color: #ccc;
        }
        .prop-value {
          font-size: 13px;
        }
        .prop-select {
          padding: 6px 10px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          color: #fff;
          font-size: 13px;
          min-width: 120px;
        }
        .prop-checkbox {
          width: 18px;
          height: 18px;
        }
        .binding-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(0, 150, 255, 0.2);
          border-radius: 4px;
          font-size: 12px;
        }
        .binding-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
        }
        .binding-dot.inactive {
          background: #888;
        }
        .config-btn {
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          color: #fff;
          font-size: 13px;
          cursor: pointer;
          width: 100%;
          margin-top: 10px;
          transition: all 0.2s;
        }
        .config-btn:hover {
          background: rgba(255,255,255,0.15);
          border-color: #00d4ff;
        }
      `}</style>

      <div className="prop-row">
        <span className="prop-label">Binding</span>
        <span className="prop-value">
          <span className="binding-badge">
            <span className={`binding-dot ${bindingType === 'none' ? 'inactive' : ''}`} />
            {bindingType === 'none' ? 'Nicht verbunden' : bindingType.toUpperCase()}
          </span>
        </span>
      </div>

      <div className="prop-row">
        <span className="prop-label">Overlay anzeigen</span>
        <input
          type="checkbox"
          className="prop-checkbox"
          checked={instanceConfig.showOverlay as boolean ?? true}
          onChange={(e) => onConfigChange?.('showOverlay', e.target.checked)}
        />
      </div>

      <div className="prop-row">
        <span className="prop-label">Custom Label</span>
        <input
          type="text"
          className="prop-select"
          style={{ minWidth: 140 }}
          placeholder={nodeName}
          value={instanceConfig.customLabel as string || ''}
          onChange={(e) => onConfigChange?.('customLabel', e.target.value)}
        />
      </div>

      <button
        className="config-btn"
        onClick={() => onShowPopup?.('BindingConfig')}
      >
        🔗 Binding konfigurieren
      </button>

      <button
        className="config-btn"
        onClick={() => onShowPopup?.('NodeDetails')}
      >
        📋 Details anzeigen
      </button>
    </div>
  );
};
