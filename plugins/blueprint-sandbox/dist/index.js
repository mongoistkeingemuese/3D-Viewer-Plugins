// react-global:react
var React = window.React;
var {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
  createContext,
  Fragment,
  createElement,
  Component,
  PureComponent,
  memo,
  forwardRef,
  lazy,
  Suspense
} = React;

// react-global:react/jsx-runtime
var React2 = window.React;
var jsx = React2.createElement;
var jsxs = React2.createElement;
var Fragment2 = React2.Fragment;

// src/components/ControlPanel.tsx
var ControlPanel = ({
  pluginId: _pluginId,
  boundNodes = [],
  globalConfig = {},
  onConfigChange
}) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const handleRefreshIntervalChange = useCallback(
    (e) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && onConfigChange) {
        onConfigChange("refreshInterval", value);
      }
    },
    [onConfigChange]
  );
  const handleColorChange = useCallback(
    (e) => {
      if (onConfigChange) {
        onConfigChange("defaultColor", e.target.value);
      }
    },
    [onConfigChange]
  );
  return /* @__PURE__ */ jsxs("div", { className: "blueprint-control-panel", children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "section", children: [
      /* @__PURE__ */ jsx("div", { className: "section-title", children: "\xDCbersicht" }),
      /* @__PURE__ */ jsxs("div", { className: "stats", children: [
        /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-value", children: boundNodes.length }),
          /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Nodes" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-value", children: globalConfig.refreshInterval ? `${globalConfig.refreshInterval / 1e3}s` : "-" }),
          /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Intervall" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "section", children: [
      /* @__PURE__ */ jsxs("div", { className: "section-title", children: [
        "Gebundene Nodes (",
        boundNodes.length,
        ")"
      ] }),
      boundNodes.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
        /* @__PURE__ */ jsx("div", { className: "empty-state-icon", children: "\u{1F527}" }),
        /* @__PURE__ */ jsxs("div", { className: "empty-state-text", children: [
          "Keine Nodes gebunden.",
          /* @__PURE__ */ jsx("br", {}),
          "Klicke auf einen Node und w\xE4hle dieses Plugin."
        ] })
      ] }) : /* @__PURE__ */ jsx("ul", { className: "node-list", children: boundNodes.map((node) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: `node-item ${selectedNode === node.id ? "selected" : ""}`,
          onClick: () => setSelectedNode(node.id === selectedNode ? null : node.id),
          children: [
            /* @__PURE__ */ jsx("div", { className: "node-icon", children: "\u{1F4E6}" }),
            /* @__PURE__ */ jsx("span", { className: "node-name", children: node.name }),
            /* @__PURE__ */ jsx("div", { className: "node-status" })
          ]
        },
        node.id
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "section", children: [
      /* @__PURE__ */ jsx("div", { className: "section-title", children: "Globale Einstellungen" }),
      /* @__PURE__ */ jsxs("div", { className: "config-row", children: [
        /* @__PURE__ */ jsx("span", { className: "config-label", children: "Aktualisierung" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            className: "config-input",
            value: globalConfig.refreshInterval || 1e3,
            onChange: handleRefreshIntervalChange,
            min: 100,
            max: 6e4,
            step: 100
          }
        ),
        /* @__PURE__ */ jsx("span", { style: { marginLeft: 8, color: "#888", fontSize: 12 }, children: "ms" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "config-row", children: [
        /* @__PURE__ */ jsx("span", { className: "config-label", children: "Standard-Farbe" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "color",
            className: "color-input",
            value: globalConfig.defaultColor || "#00ff00",
            onChange: handleColorChange
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "config-row", children: [
        /* @__PURE__ */ jsx("span", { className: "config-label", children: "Animationen" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: globalConfig.enableAnimations ?? true,
            onChange: (e) => onConfigChange?.("enableAnimations", e.target.checked)
          }
        )
      ] })
    ] })
  ] });
};

// src/components/NodeDetailsPopup.tsx
var NodeDetailsPopup = ({
  nodeId,
  nodeName,
  data = {},
  onClose
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "node-details-popup", children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsx("button", { className: "close-btn", onClick: onClose, children: "\xD7" }),
    /* @__PURE__ */ jsxs("div", { className: "popup-header", children: [
      /* @__PURE__ */ jsx("div", { className: "popup-icon", children: "\u{1F4E6}" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "popup-title", children: nodeName }),
        /* @__PURE__ */ jsx("div", { className: "popup-subtitle", children: nodeId })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
      /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Binding" }),
      /* @__PURE__ */ jsx("span", { className: "detail-value", children: /* @__PURE__ */ jsx("span", { className: "binding-badge", children: data.bindingType || "Keines" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
      /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Letztes Update" }),
      /* @__PURE__ */ jsx("span", { className: "detail-value mono", children: data.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString() : "-" })
    ] }),
    data.lastValue !== void 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "detail-label", style: { marginTop: 12 }, children: "Aktueller Wert" }),
      /* @__PURE__ */ jsx("div", { className: "value-preview", children: typeof data.lastValue === "object" ? JSON.stringify(data.lastValue, null, 2) : String(data.lastValue) })
    ] })
  ] });
};

// src/components/BindingConfigPopup.tsx
var BindingConfigPopup = ({
  nodeId,
  nodeName,
  instanceConfig = {},
  globalConfig = {},
  onConfigChange,
  onClose
}) => {
  const [bindingType, setBindingType] = useState(
    instanceConfig.bindingType || "none"
  );
  const handleBindingTypeChange = useCallback(
    (e) => {
      const value = e.target.value;
      setBindingType(value);
      onConfigChange?.("bindingType", value);
    },
    [onConfigChange]
  );
  return /* @__PURE__ */ jsxs("div", { className: "binding-config-popup", children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "popup-header", children: [
      /* @__PURE__ */ jsx("div", { className: "popup-title", children: "Binding konfigurieren" }),
      /* @__PURE__ */ jsxs("div", { className: "popup-subtitle", children: [
        nodeName,
        " (",
        nodeId,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
      /* @__PURE__ */ jsx("label", { className: "form-label", children: "Binding-Typ" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "form-select",
          value: bindingType,
          onChange: handleBindingTypeChange,
          children: [
            /* @__PURE__ */ jsx("option", { value: "none", children: "Kein Binding" }),
            /* @__PURE__ */ jsx("option", { value: "mqtt", children: "MQTT" }),
            /* @__PURE__ */ jsx("option", { value: "opcua", children: "OPC-UA" }),
            /* @__PURE__ */ jsx("option", { value: "http", children: "HTTP REST" })
          ]
        }
      )
    ] }),
    bindingType === "mqtt" && /* @__PURE__ */ jsxs("div", { className: "binding-section", children: [
      /* @__PURE__ */ jsxs("div", { className: "binding-section-title", children: [
        /* @__PURE__ */ jsx("span", { className: "binding-icon mqtt", children: "\u{1F4E1}" }),
        "MQTT Konfiguration"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Topic" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "form-input",
            placeholder: "z.B. sensors/temperature",
            value: instanceConfig.mqttTopic || "",
            onChange: (e) => onConfigChange?.("mqttTopic", e.target.value)
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "form-help", children: [
          "Relativ zu: ",
          String(globalConfig.mqttBaseTopic || "3dviewer/nodes/")
        ] })
      ] })
    ] }),
    bindingType === "opcua" && /* @__PURE__ */ jsxs("div", { className: "binding-section", children: [
      /* @__PURE__ */ jsxs("div", { className: "binding-section-title", children: [
        /* @__PURE__ */ jsx("span", { className: "binding-icon opcua", children: "\u{1F3ED}" }),
        "OPC-UA Konfiguration"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Node ID" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "form-input",
            placeholder: "z.B. ns=2;s=MyVariable",
            value: instanceConfig.opcuaNodeId || "",
            onChange: (e) => onConfigChange?.("opcuaNodeId", e.target.value)
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "form-help", children: [
          "Server: ",
          String(globalConfig.opcuaEndpoint || "opc.tcp://localhost:4840")
        ] })
      ] })
    ] }),
    bindingType === "http" && /* @__PURE__ */ jsxs("div", { className: "binding-section", children: [
      /* @__PURE__ */ jsxs("div", { className: "binding-section-title", children: [
        /* @__PURE__ */ jsx("span", { className: "binding-icon http", children: "\u{1F310}" }),
        "HTTP REST Konfiguration"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Endpoint" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "form-input",
            placeholder: "z.B. /sensors/123",
            value: instanceConfig.httpEndpoint || "",
            onChange: (e) => onConfigChange?.("httpEndpoint", e.target.value)
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "form-help", children: [
          "Basis-URL: ",
          String(globalConfig.httpBaseUrl || "http://localhost:8080/api")
        ] })
      ] })
    ] }),
    bindingType !== "none" && /* @__PURE__ */ jsxs(Fragment2, { children: [
      /* @__PURE__ */ jsxs("div", { className: "form-group", style: { marginTop: 16 }, children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Wert-Property (JSON-Pfad)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "form-input",
            placeholder: "z.B. data.value",
            value: instanceConfig.valueProperty || "value",
            onChange: (e) => onConfigChange?.("valueProperty", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: "Farb-Property (JSON-Pfad)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "form-input",
            placeholder: "z.B. status.color",
            value: instanceConfig.colorProperty || "",
            onChange: (e) => onConfigChange?.("colorProperty", e.target.value)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "button-row", children: [
      /* @__PURE__ */ jsx("button", { className: "btn btn-secondary", onClick: onClose, children: "Abbrechen" }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: onClose, children: "Speichern" })
    ] })
  ] });
};

// src/components/NodeStatusOverlay.tsx
var NodeStatusOverlay = ({
  nodeId: _nodeId,
  data = {}
}) => {
  const formatValue = (value) => {
    if (value === null || value === void 0)
      return "-";
    if (typeof value === "number")
      return value.toFixed(2);
    if (typeof value === "boolean")
      return value ? "ON" : "OFF";
    if (typeof value === "string")
      return value;
    return JSON.stringify(value);
  };
  const getStatusColor = (value) => {
    if (typeof value === "number") {
      if (value >= 90)
        return "#ff4444";
      if (value >= 70)
        return "#ffaa00";
      return "#00ff88";
    }
    if (typeof value === "boolean") {
      return value ? "#00ff88" : "#888";
    }
    return "#00d4ff";
  };
  return /* @__PURE__ */ jsxs("div", { className: "node-status-overlay", children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "overlay-value",
        style: { color: getStatusColor(data.value) },
        children: formatValue(data.value)
      }
    ),
    data.bindingType && data.bindingType !== "none" && /* @__PURE__ */ jsxs("div", { className: "overlay-binding", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "binding-dot",
          style: { background: getStatusColor(data.value) }
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "overlay-label", children: data.bindingType })
    ] })
  ] });
};

// src/components/DataLabelOverlay.tsx
var DataLabelOverlay = ({
  data = {}
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "data-label-overlay", children: [
    /* @__PURE__ */ jsx("style", { children: `
        .data-label-overlay {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 4px;
          padding: 4px 8px;
          font-family: monospace;
          font-size: 12px;
          color: #fff;
          white-space: nowrap;
        }
        .label-text {
          color: #888;
          margin-right: 4px;
        }
        .label-value {
          color: #00d4ff;
          font-weight: bold;
        }
        .label-unit {
          color: #888;
          margin-left: 2px;
        }
      ` }),
    data.label && /* @__PURE__ */ jsxs("span", { className: "label-text", children: [
      data.label,
      ":"
    ] }),
    /* @__PURE__ */ jsx("span", { className: "label-value", children: data.value !== void 0 ? String(data.value) : "-" }),
    data.unit && /* @__PURE__ */ jsx("span", { className: "label-unit", children: data.unit })
  ] });
};

// src/components/NodePropertiesSection.tsx
var NodePropertiesSection = ({
  nodeId: _nodeId,
  nodeName,
  instanceConfig = {},
  onConfigChange,
  onShowPopup
}) => {
  const bindingType = instanceConfig.bindingType || "none";
  return /* @__PURE__ */ jsxs("div", { className: "node-properties-section", children: [
    /* @__PURE__ */ jsx("style", { children: `
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
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "prop-row", children: [
      /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Binding" }),
      /* @__PURE__ */ jsx("span", { className: "prop-value", children: /* @__PURE__ */ jsxs("span", { className: "binding-badge", children: [
        /* @__PURE__ */ jsx("span", { className: `binding-dot ${bindingType === "none" ? "inactive" : ""}` }),
        bindingType === "none" ? "Nicht verbunden" : bindingType.toUpperCase()
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "prop-row", children: [
      /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Overlay anzeigen" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          className: "prop-checkbox",
          checked: instanceConfig.showOverlay ?? true,
          onChange: (e) => onConfigChange?.("showOverlay", e.target.checked)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "prop-row", children: [
      /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Custom Label" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: "prop-select",
          style: { minWidth: 140 },
          placeholder: nodeName,
          value: instanceConfig.customLabel || "",
          onChange: (e) => onConfigChange?.("customLabel", e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "config-btn",
        onClick: () => onShowPopup?.("BindingConfig"),
        children: "\u{1F517} Binding konfigurieren"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "config-btn",
        onClick: () => onShowPopup?.("NodeDetails"),
        children: "\u{1F4CB} Details anzeigen"
      }
    )
  ] });
};

// src/index.ts
var PluginState = class {
  constructor() {
    this.nodes = /* @__PURE__ */ new Map();
    this.globalSubscriptions = [];
    this.ctx = null;
  }
  initialize(ctx) {
    this.ctx = ctx;
  }
  getContext() {
    if (!this.ctx)
      throw new Error("Plugin not initialized");
    return this.ctx;
  }
  addNode(nodeId) {
    const state2 = {
      nodeId,
      bindingType: "none",
      lastValue: null,
      lastUpdate: null,
      subscriptions: []
    };
    this.nodes.set(nodeId, state2);
    return state2;
  }
  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }
  removeNode(nodeId) {
    const state2 = this.nodes.get(nodeId);
    if (state2) {
      state2.subscriptions.forEach((unsub) => unsub());
      this.nodes.delete(nodeId);
    }
  }
  addGlobalSubscription(unsub) {
    this.globalSubscriptions.push(unsub);
  }
  cleanup() {
    this.nodes.forEach((state2) => {
      state2.subscriptions.forEach((unsub) => unsub());
    });
    this.nodes.clear();
    this.globalSubscriptions.forEach((unsub) => unsub());
    this.globalSubscriptions = [];
  }
};
var state = new PluginState();
function setupMqttBinding(ctx, nodeId) {
  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();
  const baseTopic = globalConfig.mqttBaseTopic || "3dviewer/nodes/";
  const nodeTopic = config.mqttTopic || nodeId;
  const fullTopic = `${baseTopic}${nodeTopic}`;
  ctx.log.debug(`Setting up MQTT binding for ${nodeId} on topic ${fullTopic}`);
  return ctx.mqtt.subscribe(fullTopic, (message) => {
    handleDataUpdate(ctx, nodeId, message.payload, "mqtt");
  });
}
function setupOpcUaBinding(ctx, nodeId) {
  const config = ctx.config.instance.getForNode(nodeId);
  const opcuaNodeId = config.opcuaNodeId;
  if (!opcuaNodeId) {
    ctx.log.warn(`No OPC-UA Node ID configured for ${nodeId}`);
    return () => {
    };
  }
  ctx.log.debug(`Setting up OPC-UA binding for ${nodeId} on node ${opcuaNodeId}`);
  return ctx.opcua.subscribe(opcuaNodeId, (value) => {
    handleDataUpdate(ctx, nodeId, value.value, "opcua");
  });
}
function setupHttpBinding(ctx, nodeId) {
  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();
  const baseUrl = globalConfig.httpBaseUrl || "http://localhost:8080/api";
  const endpoint = config.httpEndpoint || nodeId;
  const fullUrl = `${baseUrl}/${endpoint}`;
  const interval = globalConfig.refreshInterval || 1e3;
  ctx.log.debug(`Setting up HTTP binding for ${nodeId} on ${fullUrl} every ${interval}ms`);
  return ctx.http.poll(fullUrl, interval, (response) => {
    if (response.status === 200) {
      handleDataUpdate(ctx, nodeId, response.data, "http");
    } else {
      ctx.log.warn(`HTTP polling failed for ${nodeId}: ${response.statusText}`);
    }
  });
}
function handleDataUpdate(ctx, nodeId, data, source) {
  const nodeState = state.getNode(nodeId);
  if (!nodeState)
    return;
  nodeState.lastValue = data;
  nodeState.lastUpdate = /* @__PURE__ */ new Date();
  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();
  const node = ctx.nodes.get(nodeId);
  if (!node)
    return;
  const valuePath = config.valueProperty || "value";
  const value = getNestedValue(data, valuePath);
  if (typeof value === "number") {
    const thresholds = config.thresholds || { warning: 70, critical: 90 };
    if (value >= thresholds.critical) {
      node.color = "#ff0000";
      node.emissive = "#ff0000";
      node.emissiveIntensity = 0.5;
    } else if (value >= thresholds.warning) {
      node.color = "#ffaa00";
      node.emissive = "#ffaa00";
      node.emissiveIntensity = 0.3;
    } else {
      node.color = globalConfig.defaultColor || "#00ff00";
      node.emissive = "#000000";
      node.emissiveIntensity = 0;
    }
  }
  const colorPath = config.colorProperty;
  if (colorPath) {
    const colorValue = getNestedValue(data, colorPath);
    if (typeof colorValue === "string" && colorValue.startsWith("#")) {
      node.color = colorValue;
    }
  }
  if (config.showOverlay && nodeState.overlayHandle) {
    ctx.ui.updateOverlay(nodeState.overlayHandle, {
      data: { value, source, timestamp: nodeState.lastUpdate }
    });
  }
  ctx.events.emit("data-update", { nodeId, value, source });
  ctx.log.debug(`Data update for ${nodeId} from ${source}:`, value);
}
function getNestedValue(obj, path) {
  if (!obj || typeof obj !== "object")
    return void 0;
  return path.split(".").reduce((current, key) => {
    if (current && typeof current === "object") {
      return current[key];
    }
    return void 0;
  }, obj);
}
function setupNodeBinding(ctx, nodeId) {
  const nodeState = state.getNode(nodeId);
  if (!nodeState)
    return;
  nodeState.subscriptions.forEach((unsub) => unsub());
  nodeState.subscriptions = [];
  const config = ctx.config.instance.getForNode(nodeId);
  const bindingType = config.bindingType || "none";
  nodeState.bindingType = bindingType;
  switch (bindingType) {
    case "mqtt":
      nodeState.subscriptions.push(setupMqttBinding(ctx, nodeId));
      break;
    case "opcua":
      nodeState.subscriptions.push(setupOpcUaBinding(ctx, nodeId));
      break;
    case "http":
      nodeState.subscriptions.push(setupHttpBinding(ctx, nodeId));
      break;
    default:
      ctx.log.debug(`No binding configured for ${nodeId}`);
  }
  if (config.showOverlay) {
    nodeState.overlayHandle = ctx.ui.showOverlay("NodeStatus", {
      nodeId,
      data: { value: null, bindingType }
    });
  }
}
var plugin = {
  /**
   * React components provided by this plugin
   */
  components: {
    ControlPanel,
    NodeDetailsPopup,
    BindingConfigPopup,
    NodeStatusOverlay,
    DataLabelOverlay,
    NodePropertiesSection
  },
  /**
   * Called when the plugin is loaded
   */
  onLoad(ctx) {
    state.initialize(ctx);
    ctx.log.info("Blueprint Sandbox Plugin loaded", {
      version: ctx.version,
      pluginId: ctx.pluginId
    });
    const persistedNodes = ctx.state.get("boundNodes", []);
    ctx.log.debug("Restored bound nodes:", persistedNodes);
    state.addGlobalSubscription(
      ctx.events.onNodeClick((event) => {
        ctx.log.debug("Node clicked:", event.nodeId);
      })
    );
    state.addGlobalSubscription(
      ctx.events.onNodeHover((event) => {
        ctx.log.debug("Node hover:", event.nodeId);
      })
    );
    state.addGlobalSubscription(
      ctx.events.on("external-data", (data) => {
        ctx.log.info("Received external data:", data);
      })
    );
    state.addGlobalSubscription(
      ctx.config.global.onChange("refreshInterval", (newVal, oldVal) => {
        ctx.log.info(`Refresh interval changed: ${oldVal} -> ${newVal}`);
      })
    );
    ctx.events.onActivate(() => {
      ctx.log.info("Plugin activated");
      ctx.ui.notify("Blueprint Plugin aktiviert", "success");
    });
    ctx.events.onDeactivate(() => {
      ctx.log.info("Plugin deactivated");
    });
  },
  /**
   * Called when a node is bound to this plugin
   */
  onNodeBound(ctx, node) {
    ctx.log.info(`Node bound: ${node.name} (${node.id})`);
    state.addNode(node.id);
    setupNodeBinding(ctx, node.id);
    const boundNodes = ctx.state.get("boundNodes", []);
    if (!boundNodes.includes(node.id)) {
      boundNodes.push(node.id);
      ctx.state.set("boundNodes", boundNodes);
    }
    const nodeProxy = ctx.nodes.get(node.id);
    if (nodeProxy) {
      const config = ctx.config.global.getAll();
      nodeProxy.color = config.defaultColor || "#00ff00";
      if (config.enableAnimations) {
        nodeProxy.duration = 500;
      }
    }
    ctx.ui.notify(`${node.name} wurde an Blueprint gebunden`, "info");
  },
  /**
   * Called when a node is unbound from this plugin
   */
  onNodeUnbound(ctx, node) {
    ctx.log.info(`Node unbound: ${node.name} (${node.id})`);
    const nodeState = state.getNode(node.id);
    if (nodeState?.overlayHandle) {
      ctx.ui.hideOverlay(nodeState.overlayHandle);
    }
    state.removeNode(node.id);
    const boundNodes = ctx.state.get("boundNodes", []);
    const filtered = boundNodes.filter((id) => id !== node.id);
    ctx.state.set("boundNodes", filtered);
    const nodeProxy = ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.color = "#ffffff";
      nodeProxy.emissive = "#000000";
      nodeProxy.emissiveIntensity = 0;
    }
  },
  /**
   * Called when configuration changes
   */
  onConfigChange(ctx, type, key, nodeId) {
    ctx.log.debug(`Config changed: ${type}.${key}`, nodeId ? `for ${nodeId}` : "");
    if (type === "instance" && nodeId) {
      if (key === "bindingType" || key.startsWith("mqtt") || key.startsWith("opcua") || key.startsWith("http")) {
        setupNodeBinding(ctx, nodeId);
      }
      if (key === "showOverlay") {
        const config = ctx.config.instance.getForNode(nodeId);
        const nodeState = state.getNode(nodeId);
        if (nodeState) {
          if (config.showOverlay && !nodeState.overlayHandle) {
            nodeState.overlayHandle = ctx.ui.showOverlay("NodeStatus", {
              nodeId,
              data: { value: nodeState.lastValue }
            });
          } else if (!config.showOverlay && nodeState.overlayHandle) {
            ctx.ui.hideOverlay(nodeState.overlayHandle);
            nodeState.overlayHandle = void 0;
          }
        }
      }
    }
    if (type === "global") {
      if (key === "defaultColor") {
        ctx.nodes.getAll().forEach((node) => {
          const nodeState = state.getNode(node.id);
          if (nodeState && !nodeState.lastValue) {
            node.color = ctx.config.global.get("defaultColor", "#00ff00");
          }
        });
      }
    }
  },
  /**
   * Called when the plugin is unloaded
   */
  onUnload(ctx) {
    ctx.log.info("Blueprint Sandbox Plugin unloading...");
    state.cleanup();
    ctx.log.info("Blueprint Sandbox Plugin unloaded");
  }
};
var src_default = plugin;
export {
  src_default as default
};
