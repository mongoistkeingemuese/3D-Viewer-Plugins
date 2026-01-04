// react-global:react/jsx-runtime
var React = window.React;
var jsx = React.createElement;
var jsxs = React.createElement;
var Fragment = React.Fragment;

// plugins/blueprint-iframe/src/components/IFramePanel.tsx
var IFramePanel = ({
  boundNodes = [],
  globalConfig = {},
  onConfigChange
}) => {
  return /* @__PURE__ */ jsxs("div", { style: { padding: 16, fontFamily: "system-ui", color: "#fff" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 16, padding: 12, background: "rgba(0,150,255,0.1)", borderRadius: 8, borderLeft: "3px solid #00d4ff" }, children: [
      /* @__PURE__ */ jsx("strong", { children: "\u{1F512} IFrame Plugin" }),
      /* @__PURE__ */ jsx("p", { style: { margin: "8px 0 0", fontSize: 12, color: "#888" }, children: "Dieses Plugin l\xE4uft in einem isolierten IFrame f\xFCr maximale Sicherheit." })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#888", marginBottom: 8 }, children: [
        "GEBUNDENE NODES (",
        boundNodes.length,
        ")"
      ] }),
      boundNodes.length === 0 ? /* @__PURE__ */ jsx("div", { style: { color: "#666", fontSize: 13 }, children: "Keine Nodes gebunden" }) : boundNodes.map((node) => /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            padding: "8px 12px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: 4,
            marginBottom: 4,
            fontSize: 13
          },
          children: node.name
        },
        node.id
      ))
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#888", marginBottom: 8 }, children: "EINSTELLUNGEN" }),
      /* @__PURE__ */ jsxs("label", { style: { display: "flex", alignItems: "center", marginBottom: 10 }, children: [
        /* @__PURE__ */ jsx("span", { style: { flex: 1, fontSize: 13 }, children: "Polling Intervall" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "number",
            value: globalConfig.pollingInterval || 2e3,
            onChange: (e) => onConfigChange?.("pollingInterval", parseInt(e.target.value)),
            style: {
              width: 80,
              padding: "6px 8px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              color: "#fff"
            }
          }
        ),
        /* @__PURE__ */ jsx("span", { style: { marginLeft: 8, color: "#888", fontSize: 12 }, children: "ms" })
      ] }),
      /* @__PURE__ */ jsxs("label", { style: { display: "flex", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx("span", { style: { flex: 1, fontSize: 13 }, children: "Theme" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: globalConfig.theme || "dark",
            onChange: (e) => onConfigChange?.("theme", e.target.value),
            style: {
              padding: "6px 8px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 4,
              color: "#fff"
            },
            children: [
              /* @__PURE__ */ jsx("option", { value: "light", children: "Hell" }),
              /* @__PURE__ */ jsx("option", { value: "dark", children: "Dunkel" }),
              /* @__PURE__ */ jsx("option", { value: "auto", children: "Auto" })
            ]
          }
        )
      ] })
    ] })
  ] });
};

// plugins/blueprint-iframe/src/components/SettingsPopup.tsx
var SettingsPopup = ({
  nodeId,
  data = {},
  instanceConfig = {},
  onConfigChange,
  onClose
}) => {
  return /* @__PURE__ */ jsxs("div", { style: { padding: 20, fontFamily: "system-ui", color: "#fff", minWidth: 350 }, children: [
    /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 16px" }, children: "Node Settings" }),
    /* @__PURE__ */ jsx("p", { style: { color: "#888", fontSize: 12, marginBottom: 16 }, children: nodeId }),
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, marginBottom: 6 }, children: "Datenquelle" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: instanceConfig.dataSource || "manual",
          onChange: (e) => onConfigChange?.("dataSource", e.target.value),
          style: {
            width: "100%",
            padding: "8px 12px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 4,
            color: "#fff"
          },
          children: [
            /* @__PURE__ */ jsx("option", { value: "manual", children: "Manuell" }),
            /* @__PURE__ */ jsx("option", { value: "mqtt", children: "MQTT" }),
            /* @__PURE__ */ jsx("option", { value: "http", children: "HTTP" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, marginBottom: 6 }, children: "Endpoint/Topic" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: instanceConfig.endpoint || "",
          onChange: (e) => onConfigChange?.("endpoint", e.target.value),
          placeholder: "z.B. sensors/temp oder /api/data",
          style: {
            width: "100%",
            padding: "8px 12px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 4,
            color: "#fff",
            boxSizing: "border-box"
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 20 }, children: [
      /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, marginBottom: 6 }, children: "Anzeigemodus" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          value: instanceConfig.displayMode || "badge",
          onChange: (e) => onConfigChange?.("displayMode", e.target.value),
          style: {
            width: "100%",
            padding: "8px 12px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 4,
            color: "#fff"
          },
          children: [
            /* @__PURE__ */ jsx("option", { value: "badge", children: "Badge" }),
            /* @__PURE__ */ jsx("option", { value: "label", children: "Label" }),
            /* @__PURE__ */ jsx("option", { value: "none", children: "Kein Overlay" })
          ]
        }
      )
    ] }),
    data.value !== void 0 && /* @__PURE__ */ jsxs("div", { style: {
      background: "rgba(0,0,0,0.3)",
      padding: 12,
      borderRadius: 6,
      marginBottom: 16
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#888", marginBottom: 4 }, children: "Aktueller Wert" }),
      /* @__PURE__ */ jsx("div", { style: { fontFamily: "monospace", fontSize: 14 }, children: typeof data.value === "object" ? JSON.stringify(data.value, null, 2) : String(data.value) })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        style: {
          width: "100%",
          padding: "10px 16px",
          background: "linear-gradient(135deg, #00d4ff, #0096ff)",
          border: "none",
          borderRadius: 6,
          color: "#fff",
          fontSize: 14,
          cursor: "pointer"
        },
        children: "Schlie\xDFen"
      }
    )
  ] });
};

// plugins/blueprint-iframe/src/components/StatusBadgeOverlay.tsx
var StatusBadgeOverlay = ({
  data = {}
}) => {
  const formatValue = (v) => {
    if (v === null || v === void 0)
      return "?";
    if (typeof v === "number")
      return v.toFixed(1);
    if (typeof v === "boolean")
      return v ? "\u2713" : "\u2717";
    return String(v).substring(0, 10);
  };
  const mode = data.mode || "badge";
  if (mode === "label") {
    return /* @__PURE__ */ jsx("div", { style: {
      background: "rgba(0,0,0,0.8)",
      padding: "2px 6px",
      borderRadius: 3,
      fontSize: 11,
      fontFamily: "monospace",
      color: "#00d4ff"
    }, children: formatValue(data.value) });
  }
  return /* @__PURE__ */ jsx("div", { style: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(0,150,255,0.9), rgba(0,100,200,0.9))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
    border: "2px solid rgba(255,255,255,0.3)"
  }, children: formatValue(data.value) });
};

// plugins/blueprint-iframe/src/index.ts
var IFramePluginState = class {
  constructor() {
    this.nodes = /* @__PURE__ */ new Map();
    this.subscriptions = [];
    this.ctx = null;
  }
  initialize(ctx) {
    this.ctx = ctx;
  }
  getContext() {
    if (!this.ctx)
      throw new Error("Not initialized");
    return this.ctx;
  }
  addNode(nodeId) {
    const data = {
      nodeId,
      value: null,
      lastUpdate: null
    };
    this.nodes.set(nodeId, data);
    return data;
  }
  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }
  removeNode(nodeId) {
    const data = this.nodes.get(nodeId);
    if (data?.subscription) {
      data.subscription();
    }
    this.nodes.delete(nodeId);
  }
  addSubscription(unsub) {
    this.subscriptions.push(unsub);
  }
  cleanup() {
    this.nodes.forEach((data) => {
      if (data.subscription)
        data.subscription();
    });
    this.nodes.clear();
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions = [];
  }
};
var state = new IFramePluginState();
async function fetchNodeData(ctx, nodeId) {
  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();
  const dataSource = config.dataSource || "manual";
  if (dataSource === "manual")
    return;
  const endpoint = config.endpoint;
  if (!endpoint)
    return;
  const nodeData = state.getNode(nodeId);
  if (!nodeData)
    return;
  try {
    if (dataSource === "http") {
      const baseUrl = globalConfig.apiUrl || "http://localhost:8080/api";
      const response = await ctx.http.get(`${baseUrl}/${endpoint}`);
      if (response.status === 200) {
        nodeData.value = response.data;
        nodeData.lastUpdate = /* @__PURE__ */ new Date();
        await updateNodeVisuals(ctx, nodeId, response.data);
      }
    }
  } catch (error) {
    ctx.log.error(`Failed to fetch data for ${nodeId}:`, error);
  }
}
async function updateNodeVisuals(ctx, nodeId, data) {
  const node = ctx.nodes.get(nodeId);
  if (!node)
    return;
  let numericValue = null;
  if (typeof data === "number") {
    numericValue = data;
  } else if (data && typeof data === "object") {
    const obj = data;
    if (typeof obj.value === "number") {
      numericValue = obj.value;
    }
  }
  if (numericValue !== null) {
    if (numericValue >= 90) {
      node.color = "#ff4444";
      node.emissive = "#ff4444";
      node.emissiveIntensity = 0.5;
    } else if (numericValue >= 70) {
      node.color = "#ffaa00";
      node.emissive = "#ffaa00";
      node.emissiveIntensity = 0.3;
    } else {
      node.color = "#00ff88";
      node.emissive = "#000000";
      node.emissiveIntensity = 0;
    }
  }
}
function setupDataSubscription(ctx, nodeId) {
  const config = ctx.config.instance.getForNode(nodeId);
  const globalConfig = ctx.config.global.getAll();
  const dataSource = config.dataSource || "manual";
  const endpoint = config.endpoint;
  if (dataSource === "manual" || !endpoint)
    return;
  const nodeData = state.getNode(nodeId);
  if (!nodeData)
    return;
  if (nodeData.subscription) {
    nodeData.subscription();
    nodeData.subscription = void 0;
  }
  if (dataSource === "mqtt") {
    nodeData.subscription = ctx.mqtt.subscribe(endpoint, (message) => {
      nodeData.value = message.payload;
      nodeData.lastUpdate = /* @__PURE__ */ new Date();
      updateNodeVisuals(ctx, nodeId, message.payload);
    });
  } else if (dataSource === "http") {
    const interval = globalConfig.pollingInterval || 2e3;
    nodeData.subscription = ctx.http.poll(
      `${globalConfig.apiUrl}/${endpoint}`,
      interval,
      (response) => {
        if (response.status === 200) {
          nodeData.value = response.data;
          nodeData.lastUpdate = /* @__PURE__ */ new Date();
          updateNodeVisuals(ctx, nodeId, response.data);
        }
      }
    );
  }
}
var plugin = {
  /**
   * Components für IFrame werden anders registriert,
   * aber wir exportieren sie trotzdem für Typsicherheit
   */
  components: {
    IFramePanel,
    SettingsPopup,
    StatusBadgeOverlay
  },
  /**
   * Plugin initialization
   * NOTE: In iframe context, many API calls are async!
   */
  async onLoad(ctx) {
    state.initialize(ctx);
    ctx.log.info("Blueprint IFrame Plugin loaded", {
      version: ctx.version,
      sandbox: "iframe"
    });
    const unsubClick = await ctx.events.onNodeClick((event) => {
      ctx.log.debug("Click in IFrame plugin:", event.nodeId);
      const nodeData = state.getNode(event.nodeId);
      if (nodeData) {
        ctx.ui.showPopup("Settings", {
          title: "Node Settings",
          data: {
            nodeId: event.nodeId,
            value: nodeData.value
          }
        });
      }
    });
    state.addSubscription(unsubClick);
    const savedNodes = await ctx.state.get("nodes", []);
    ctx.log.debug("Restored nodes:", savedNodes);
  },
  /**
   * Node bound to plugin
   * NOTE: In iframe context, this is async!
   */
  async onNodeBound(ctx, node) {
    ctx.log.info(`IFrame Plugin: Node bound - ${node.name}`);
    state.addNode(node.id);
    setupDataSubscription(ctx, node.id);
    fetchNodeData(ctx, node.id);
    const nodeProxy = await ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.color = "#00d4ff";
      nodeProxy.duration = 300;
    }
    const config = await ctx.config.instance.getForNode(node.id);
    if (config.displayMode !== "none") {
      ctx.ui.showOverlay("StatusBadge", {
        nodeId: node.id,
        data: { value: null, mode: config.displayMode }
      });
    }
    const nodes = await ctx.state.get("nodes", []);
    if (!nodes.includes(node.id)) {
      nodes.push(node.id);
      await ctx.state.set("nodes", nodes);
    }
  },
  /**
   * Node unbound from plugin
   * NOTE: In iframe context, this is async!
   */
  async onNodeUnbound(ctx, node) {
    ctx.log.info(`IFrame Plugin: Node unbound - ${node.name}`);
    state.removeNode(node.id);
    const nodeProxy = await ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.color = "#ffffff";
      nodeProxy.emissive = "#000000";
      nodeProxy.emissiveIntensity = 0;
    }
    const nodes = await ctx.state.get("nodes", []);
    const filtered = nodes.filter((id) => id !== node.id);
    await ctx.state.set("nodes", filtered);
  },
  /**
   * Config changed
   */
  onConfigChange(ctx, type, key, nodeId) {
    ctx.log.debug(`IFrame Config change: ${type}.${key}`, nodeId);
    if (type === "instance" && nodeId) {
      if (key === "dataSource" || key === "endpoint") {
        setupDataSubscription(ctx, nodeId);
        fetchNodeData(ctx, nodeId);
      }
    }
    if (type === "global" && key === "pollingInterval") {
      ctx.log.info("Polling interval changed, restart required");
    }
  },
  /**
   * Plugin unload
   */
  onUnload(ctx) {
    ctx.log.info("Blueprint IFrame Plugin unloading...");
    state.cleanup();
    ctx.log.info("Blueprint IFrame Plugin unloaded");
  }
};
var src_default = plugin;
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
