/**
 * Binding Configuration Popup
 *
 * Ermöglicht die Konfiguration von Daten-Bindings für einen Node.
 */

import React, { useState, useCallback } from 'react';

interface BindingConfigPopupProps {
  nodeId: string;
  nodeName: string;
  instanceConfig?: Record<string, unknown>;
  globalConfig?: Record<string, unknown>;
  onConfigChange?: (key: string, value: unknown) => void;
  onClose?: () => void;
}

export const BindingConfigPopup: React.FC<BindingConfigPopupProps> = ({
  nodeId,
  nodeName,
  instanceConfig = {},
  globalConfig = {},
  onConfigChange,
  onClose,
}) => {
  const [bindingType, setBindingType] = useState(
    (instanceConfig.bindingType as string) || 'none'
  );

  const handleBindingTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setBindingType(value);
      onConfigChange?.('bindingType', value);
    },
    [onConfigChange]
  );

  return (
    <div className="binding-config-popup">
      <style>{`
        .binding-config-popup {
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #fff;
          min-width: 400px;
        }
        .popup-header {
          margin-bottom: 20px;
        }
        .popup-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .popup-subtitle {
          color: #888;
          font-size: 13px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .form-input, .form-select {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
        }
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #00d4ff;
        }
        .form-help {
          font-size: 11px;
          color: #888;
          margin-top: 4px;
        }
        .binding-section {
          background: rgba(0,0,0,0.2);
          padding: 16px;
          border-radius: 8px;
          margin-top: 16px;
        }
        .binding-section-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .binding-icon {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .binding-icon.mqtt { background: #00a651; }
        .binding-icon.opcua { background: #0078d7; }
        .binding-icon.http { background: #ff6b35; }
        .button-row {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: linear-gradient(135deg, #00d4ff, #0096ff);
          color: #fff;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 150, 255, 0.4);
        }
        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.15);
        }
      `}</style>

      <div className="popup-header">
        <div className="popup-title">Binding konfigurieren</div>
        <div className="popup-subtitle">{nodeName} ({nodeId})</div>
      </div>

      <div className="form-group">
        <label className="form-label">Binding-Typ</label>
        <select
          className="form-select"
          value={bindingType}
          onChange={handleBindingTypeChange}
        >
          <option value="none">Kein Binding</option>
          <option value="mqtt">MQTT</option>
          <option value="opcua">OPC-UA</option>
          <option value="http">HTTP REST</option>
        </select>
      </div>

      {bindingType === 'mqtt' && (
        <div className="binding-section">
          <div className="binding-section-title">
            <span className="binding-icon mqtt">📡</span>
            MQTT Konfiguration
          </div>
          <div className="form-group">
            <label className="form-label">Topic</label>
            <input
              type="text"
              className="form-input"
              placeholder="z.B. sensors/temperature"
              value={instanceConfig.mqttTopic as string || ''}
              onChange={(e) => onConfigChange?.('mqttTopic', e.target.value)}
            />
            <div className="form-help">
              Relativ zu: {String(globalConfig.mqttBaseTopic || '3dviewer/nodes/')}
            </div>
          </div>
        </div>
      )}

      {bindingType === 'opcua' && (
        <div className="binding-section">
          <div className="binding-section-title">
            <span className="binding-icon opcua">🏭</span>
            OPC-UA Konfiguration
          </div>
          <div className="form-group">
            <label className="form-label">Node ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="z.B. ns=2;s=MyVariable"
              value={instanceConfig.opcuaNodeId as string || ''}
              onChange={(e) => onConfigChange?.('opcuaNodeId', e.target.value)}
            />
            <div className="form-help">
              Server: {String(globalConfig.opcuaEndpoint || 'opc.tcp://localhost:4840')}
            </div>
          </div>
        </div>
      )}

      {bindingType === 'http' && (
        <div className="binding-section">
          <div className="binding-section-title">
            <span className="binding-icon http">🌐</span>
            HTTP REST Konfiguration
          </div>
          <div className="form-group">
            <label className="form-label">Endpoint</label>
            <input
              type="text"
              className="form-input"
              placeholder="z.B. /sensors/123"
              value={instanceConfig.httpEndpoint as string || ''}
              onChange={(e) => onConfigChange?.('httpEndpoint', e.target.value)}
            />
            <div className="form-help">
              Basis-URL: {String(globalConfig.httpBaseUrl || 'http://localhost:8080/api')}
            </div>
          </div>
        </div>
      )}

      {bindingType !== 'none' && (
        <>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Wert-Property (JSON-Pfad)</label>
            <input
              type="text"
              className="form-input"
              placeholder="z.B. data.value"
              value={instanceConfig.valueProperty as string || 'value'}
              onChange={(e) => onConfigChange?.('valueProperty', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Farb-Property (JSON-Pfad)</label>
            <input
              type="text"
              className="form-input"
              placeholder="z.B. status.color"
              value={instanceConfig.colorProperty as string || ''}
              onChange={(e) => onConfigChange?.('colorProperty', e.target.value)}
            />
          </div>
        </>
      )}

      <div className="button-row">
        <button className="btn btn-secondary" onClick={onClose}>
          Abbrechen
        </button>
        <button className="btn btn-primary" onClick={onClose}>
          Speichern
        </button>
      </div>
    </div>
  );
};
