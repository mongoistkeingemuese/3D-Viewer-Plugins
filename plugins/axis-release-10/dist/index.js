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

// src/components/AxisDetailsPopup.tsx
var MotionStateNames = {
  0: "Error Stop",
  1: "Standstill",
  2: "Homing",
  3: "Stopping",
  4: "Disabled",
  5: "Discrete Motion",
  6: "Continuous Motion",
  7: "Synchronized Motion"
};
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}
function getErrorLevelColor(level) {
  switch (level) {
    case "ERR":
      return "#ff4444";
    case "WARN":
      return "#ffaa00";
    case "INFO":
      return "#4444ff";
    default:
      return "#888888";
  }
}
var AxisDetailsPopup = ({ data }) => {
  const nodeId = data?.nodeId;
  const [nodeState, setNodeState] = useState(() => getNodeState(nodeId));
  const [updateCounter, setUpdateCounter] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const newState = getNodeState(nodeId);
      setNodeState(newState);
      setUpdateCounter((c) => c + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [nodeId]);
  if (!nodeState) {
    return /* @__PURE__ */ jsx("div", { style: styles.container, children: /* @__PURE__ */ jsxs("div", { style: styles.error, children: [
      /* @__PURE__ */ jsx("h3", { children: "No Data Available" }),
      /* @__PURE__ */ jsx("p", { children: "Node state not found. Please ensure the axis is properly configured." })
    ] }) });
  }
  const handleAcknowledge = (errorIndex) => {
    acknowledgeError(nodeId, errorIndex);
    setUpdateCounter((c) => c + 1);
  };
  const motionStateName = MotionStateNames[nodeState.currentState] || "Unknown";
  return /* @__PURE__ */ jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.header, children: [
      /* @__PURE__ */ jsxs("h2", { style: styles.title, children: [
        "Axis: ",
        nodeState.axisName
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.statusBadge, children: [
        /* @__PURE__ */ jsx("span", { style: styles.statusLabel, children: "Motion State:" }),
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              ...styles.statusValue,
              color: nodeState.currentState === 0 ? "#ff4444" : "#00ff00"
            },
            children: motionStateName
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
      /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Position & Velocity" }),
      /* @__PURE__ */ jsxs("div", { style: styles.dataGrid, children: [
        /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ jsx("span", { style: styles.dataLabel, children: "World Position:" }),
          /* @__PURE__ */ jsxs("span", { style: styles.dataValue, children: [
            nodeState.worldPosition.toFixed(3),
            " units"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ jsx("span", { style: styles.dataLabel, children: "Actual Position:" }),
          /* @__PURE__ */ jsxs("span", { style: styles.dataValue, children: [
            nodeState.position.toFixed(3),
            " units"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ jsx("span", { style: styles.dataLabel, children: "Velocity:" }),
          /* @__PURE__ */ jsxs("span", { style: styles.dataValue, children: [
            nodeState.velocity.toFixed(3),
            " units/s"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ jsx("span", { style: styles.dataLabel, children: "Last Update:" }),
          /* @__PURE__ */ jsx("span", { style: styles.dataValue, children: nodeState.lastUpdate ? nodeState.lastUpdate.toLocaleTimeString() : "Never" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
      /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Error Log (Last 5)" }),
      nodeState.errors.length === 0 ? /* @__PURE__ */ jsxs("div", { style: styles.noErrors, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: "32px" }, children: "\u2713" }),
        /* @__PURE__ */ jsx("p", { children: "No errors recorded" })
      ] }) : /* @__PURE__ */ jsx("div", { style: styles.errorList, children: nodeState.errors.map((error, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            ...styles.errorItem,
            backgroundColor: error.acknowledged ? "#f0f0f0" : "#ffffff",
            borderLeft: `4px solid ${getErrorLevelColor(error.level)}`
          },
          children: [
            /* @__PURE__ */ jsxs("div", { style: styles.errorHeader, children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    ...styles.errorLevel,
                    color: getErrorLevelColor(error.level)
                  },
                  children: error.level
                }
              ),
              /* @__PURE__ */ jsx("span", { style: styles.errorTime, children: formatTimestamp(error.timestamp) })
            ] }),
            /* @__PURE__ */ jsx("div", { style: styles.errorMessage, children: error.message }),
            /* @__PURE__ */ jsxs("div", { style: styles.errorFooter, children: [
              /* @__PURE__ */ jsxs("span", { style: styles.errorSource, children: [
                "Source: ",
                error.source
              ] }),
              !error.acknowledged ? /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleAcknowledge(index),
                  style: styles.ackButton,
                  onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = "#0056b3";
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = "#007bff";
                  },
                  children: "Acknowledge"
                }
              ) : /* @__PURE__ */ jsx("span", { style: styles.acknowledgedBadge, children: "\u2713 Acknowledged" })
            ] })
          ]
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.footer, children: [
      /* @__PURE__ */ jsxs("div", { style: styles.footerInfo, children: [
        /* @__PURE__ */ jsx("span", { style: styles.footerLabel, children: "Node ID:" }),
        /* @__PURE__ */ jsx("span", { style: styles.footerValue, children: nodeId })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.footerInfo, children: [
        /* @__PURE__ */ jsx("span", { style: styles.footerLabel, children: "Updates:" }),
        /* @__PURE__ */ jsx("span", { style: styles.footerValue, children: updateCounter })
      ] })
    ] })
  ] });
};
var styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    height: "100%",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif"
  },
  header: {
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "2px solid #ddd"
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    color: "#333"
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  statusLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "bold"
  },
  statusValue: {
    fontSize: "16px",
    fontWeight: "bold"
  },
  section: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  sectionTitle: {
    margin: "0 0 15px 0",
    fontSize: "18px",
    color: "#444",
    borderBottom: "1px solid #eee",
    paddingBottom: "8px"
  },
  dataGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  dataRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px"
  },
  dataLabel: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "bold"
  },
  dataValue: {
    fontSize: "14px",
    color: "#333",
    fontFamily: "monospace"
  },
  noErrors: {
    textAlign: "center",
    padding: "30px",
    color: "#28a745"
  },
  errorList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  errorItem: {
    padding: "12px",
    borderRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  errorHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
  },
  errorLevel: {
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  errorTime: {
    fontSize: "11px",
    color: "#999"
  },
  errorMessage: {
    fontSize: "14px",
    color: "#333",
    marginBottom: "8px",
    lineHeight: "1.4"
  },
  errorFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px"
  },
  errorSource: {
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic"
  },
  ackButton: {
    padding: "6px 12px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s"
  },
  acknowledgedBadge: {
    fontSize: "12px",
    color: "#28a745",
    fontWeight: "bold"
  },
  footer: {
    marginTop: "20px",
    paddingTop: "15px",
    borderTop: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#999"
  },
  footerInfo: {
    display: "flex",
    gap: "5px"
  },
  footerLabel: {
    fontWeight: "bold"
  },
  footerValue: {
    fontFamily: "monospace"
  },
  error: {
    padding: "30px",
    textAlign: "center",
    color: "#ff4444"
  }
};

// src/index.ts
function normalizeAxisName(name) {
  return name.trim();
}
var PluginState = class {
  constructor() {
    this.nodes = /* @__PURE__ */ new Map();
    this.ctx = null;
    this.errorSubscription = null;
    this.mqttSources = [];
  }
  initialize(ctx) {
    this.ctx = ctx;
    this.mqttSources = ctx.mqtt.getSources();
    ctx.log.info("Available MQTT sources", { sources: this.mqttSources });
  }
  getMqttSources() {
    return this.mqttSources;
  }
  setErrorSubscription(unsub) {
    this.errorSubscription = unsub;
  }
  getContext() {
    if (!this.ctx)
      throw new Error("Plugin not initialized");
    return this.ctx;
  }
  addNode(nodeId, axisName) {
    const state = {
      nodeId,
      axisName,
      subscriptions: [],
      currentState: 4 /* Disabled */,
      position: 0,
      velocity: 0,
      worldPosition: 0,
      errors: [],
      lastUpdate: null
    };
    this.nodes.set(nodeId, state);
    return state;
  }
  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }
  getAllNodes() {
    return Array.from(this.nodes.values());
  }
  removeNode(nodeId) {
    const state = this.nodes.get(nodeId);
    if (state) {
      state.subscriptions.forEach((unsub) => unsub());
      this.nodes.delete(nodeId);
    }
  }
  cleanup() {
    this.nodes.forEach((state) => {
      state.subscriptions.forEach((unsub) => unsub());
    });
    this.nodes.clear();
    if (this.errorSubscription) {
      this.errorSubscription();
      this.errorSubscription = null;
    }
  }
};
var pluginState = new PluginState();
function hexToFloat(hexString) {
  if (!hexString || hexString.length !== 8) {
    return 0;
  }
  try {
    const int32 = parseInt(hexString, 16);
    const buffer = new ArrayBuffer(4);
    const intView = new Uint32Array(buffer);
    const floatView = new Float32Array(buffer);
    intView[0] = int32;
    return floatView[0];
  } catch (error) {
    return 0;
  }
}
function hexToInt(hexString) {
  if (!hexString)
    return 0;
  try {
    return parseInt(hexString, 16);
  } catch {
    return 0;
  }
}
function updateNodeVisuals(ctx, nodeId, motionState) {
  const node = ctx.nodes.get(nodeId);
  if (!node)
    return;
  const globalConfig = ctx.config.global.getAll();
  const errorColor = globalConfig.errorColor || "#ff0000";
  const homingColor = globalConfig.homingColor || "#00aaff";
  const motionColor = globalConfig.motionColor || "#00ff00";
  const intensity = globalConfig.emissiveIntensity || 0.6;
  node.emissive = "#000000";
  node.emissiveIntensity = 0;
  switch (motionState) {
    case 0 /* ErrorStop */:
      node.emissive = errorColor;
      node.emissiveIntensity = intensity;
      break;
    case 2 /* Homing */:
      node.emissive = homingColor;
      node.emissiveIntensity = intensity;
      break;
    case 5 /* DiscreteMotion */:
    case 6 /* ContinuousMotion */:
    case 7 /* SynchronizedMotion */:
      node.emissive = motionColor;
      node.emissiveIntensity = intensity;
      break;
    case 1 /* Standstill */:
    case 3 /* Stopping */:
    case 4 /* Disabled */:
    default:
      break;
  }
}
function updateNodePosition(ctx, nodeId, worldPosition) {
  const node = ctx.nodes.get(nodeId);
  if (!node)
    return;
  const config = ctx.config.instance.getForNode(nodeId);
  const conversionFactor = config.conversionFactor || 1;
  const transformAxis = config.transformAxis || "y";
  const invertDirection = config.invertDirection || false;
  let value = worldPosition * conversionFactor;
  if (invertDirection) {
    value *= -1;
  }
  switch (transformAxis) {
    case "x":
      node.position = { ...node.position, x: value };
      break;
    case "y":
      node.position = { ...node.position, y: value };
      break;
    case "z":
      node.position = { ...node.position, z: value };
      break;
    case "rotX":
      node.rotation = { ...node.rotation, x: value };
      break;
    case "rotY":
      node.rotation = { ...node.rotation, y: value };
      break;
    case "rotZ":
      node.rotation = { ...node.rotation, z: value };
      break;
  }
  node.duration = 100;
}
function handleAxisData(ctx, nodeId, rawPayload) {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState)
    return;
  try {
    let payload;
    if (typeof rawPayload === "string") {
      payload = JSON.parse(rawPayload);
    } else {
      payload = rawPayload;
    }
    ctx.log.info("MQTT payload received", {
      nodeId,
      axisName: nodeState.axisName,
      payloadType: typeof rawPayload,
      hasPack: !!payload.pack,
      packLength: payload.pack?.length ?? 0
    });
    if (!payload.pack || payload.pack.length === 0) {
      ctx.log.warn("Empty or missing pack array in payload");
      return;
    }
    for (const packItem of payload.pack) {
      const axisData = packItem.Axis;
      if (!axisData) {
        ctx.log.debug("Pack item has no Axis property", { packItem: JSON.stringify(packItem).slice(0, 200) });
        continue;
      }
      const incomingAxisName = normalizeAxisName(axisData.name);
      if (incomingAxisName !== nodeState.axisName) {
        ctx.log.debug("Axis name mismatch", {
          incoming: incomingAxisName,
          expected: nodeState.axisName
        });
        continue;
      }
      const motionState = hexToInt(axisData.sS.val);
      const worldPosition = hexToFloat(axisData.posS0.val);
      const position = hexToFloat(axisData.pos.val);
      const velocity = hexToFloat(axisData.vel.val);
      nodeState.currentState = motionState;
      nodeState.position = position;
      nodeState.velocity = velocity;
      nodeState.worldPosition = worldPosition;
      nodeState.lastUpdate = /* @__PURE__ */ new Date();
      updateNodeVisuals(ctx, nodeId, motionState);
      updateNodePosition(ctx, nodeId, worldPosition);
      ctx.log.debug("Axis data updated", {
        nodeId,
        axisName: normalizeAxisName(axisData.name),
        motionState,
        position,
        velocity,
        worldPosition
      });
      break;
    }
  } catch (error) {
    ctx.log.error("Failed to process axis data", { nodeId, error });
  }
}
function handleErrorMessage(ctx, payload) {
  try {
    const source = normalizeAxisName(payload.src);
    pluginState.getAllNodes().forEach((nodeState) => {
      if (source === nodeState.axisName) {
        const errorEntry = {
          timestamp: payload.utc,
          level: payload.lvl,
          source: payload.src,
          message: payload.msg.txt,
          acknowledged: false
        };
        nodeState.errors.unshift(errorEntry);
        if (nodeState.errors.length > 5) {
          nodeState.errors = nodeState.errors.slice(0, 5);
        }
        ctx.log.warn("Axis error received", {
          nodeId: nodeState.nodeId,
          axisName: nodeState.axisName,
          error: errorEntry
        });
        if (payload.lvl === "ERR") {
          ctx.ui.notify(`Axis Error: ${nodeState.axisName} - ${payload.msg.txt}`, "error");
        }
      }
    });
  } catch (error) {
    ctx.log.error("Failed to process error message", { error });
  }
}
function getMqttApi(ctx) {
  const globalConfig = ctx.config.global.getAll();
  const mqttSource = globalConfig.mqttSource;
  if (mqttSource) {
    const availableSources = pluginState.getMqttSources();
    if (!availableSources.includes(mqttSource)) {
      ctx.log.warn(`Configured MQTT source "${mqttSource}" not found`, {
        available: availableSources
      });
      ctx.ui.notify(`MQTT Broker "${mqttSource}" nicht gefunden`, "warning");
    }
    return ctx.mqtt.withSource(mqttSource);
  }
  return ctx.mqtt;
}
function setupSubscriptions(ctx, nodeId) {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState)
    return;
  const globalConfig = ctx.config.global.getAll();
  const mainTopic = globalConfig.mainTopic || "machine/axes";
  const configuredSource = globalConfig.mqttSource || "";
  const mqtt = getMqttApi(ctx);
  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.error("No MQTT sources available - cannot subscribe to axis data", {
      nodeId,
      axisName: nodeState.axisName
    });
    ctx.ui.notify("Keine MQTT-Broker konfiguriert. Bitte zuerst einen MQTT-Broker hinzuf\xFCgen.", "error");
    return;
  }
  ctx.log.debug("MQTT sources check", {
    configured: configuredSource || "(using default)",
    available: availableSources
  });
  console.log(`\u{1F50C} [AXIS-PLUGIN] SUBSCRIBING to topic "${mainTopic}" for axis "${nodeState.axisName}"`);
  const axisUnsub = mqtt.subscribe(mainTopic, (msg) => {
    console.log(`\u{1F4E8} [AXIS-PLUGIN] MESSAGE RECEIVED on "${mainTopic}":`, msg);
    logRawMqttMessage(ctx, mainTopic, msg);
    handleAxisData(ctx, nodeId, msg.payload);
  });
  nodeState.subscriptions.push(axisUnsub);
  console.log(`\u2705 [AXIS-PLUGIN] Subscription setup complete for "${nodeState.axisName}" on topic "${mainTopic}"`);
  ctx.log.info("Axis subscription setup - waiting for MQTT messages", {
    nodeId,
    axisName: nodeState.axisName,
    mainTopic,
    mqttSource: configuredSource || "(default)"
  });
}
function logRawMqttMessage(ctx, topic, msg) {
  ctx.log.info("RAW MQTT message received", {
    topic,
    payloadType: typeof msg.payload,
    payloadPreview: typeof msg.payload === "string" ? msg.payload.slice(0, 200) : JSON.stringify(msg.payload).slice(0, 200)
  });
}
function setupErrorSubscription(ctx) {
  const globalConfig = ctx.config.global.getAll();
  const errorTopic = globalConfig.errorTopic || "machine/errors";
  const configuredSource = globalConfig.mqttSource || "";
  const mqtt = getMqttApi(ctx);
  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.warn("No MQTT sources available - cannot subscribe to error messages");
    return;
  }
  const errorUnsub = mqtt.subscribe(errorTopic, (msg) => {
    handleErrorMessage(ctx, msg.payload);
  });
  pluginState.setErrorSubscription(errorUnsub);
  ctx.log.info("Error subscription setup", { errorTopic, mqttSource: configuredSource || "(default)" });
}
function acknowledgeError(nodeId, errorIndex) {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState || errorIndex < 0 || errorIndex >= nodeState.errors.length) {
    return;
  }
  nodeState.errors[errorIndex].acknowledged = true;
  ctx.log.info("Error acknowledged", { nodeId, errorIndex });
}
function getNodeState(nodeId) {
  return pluginState.getNode(nodeId);
}
function getMqttSources() {
  return pluginState.getMqttSources();
}
function getCurrentMqttSource() {
  const ctx = pluginState.getContext();
  const globalConfig = ctx.config.global.getAll();
  return globalConfig.mqttSource || "";
}
var plugin = {
  /**
   * React components provided by this plugin
   */
  components: {
    AxisDetailsPopup
  },
  /**
   * Called when the plugin is loaded
   */
  onLoad(ctx) {
    pluginState.initialize(ctx);
    ctx.log.info("Axis Release 10 Plugin loaded", {
      pluginId: ctx.pluginId
    });
    setupErrorSubscription(ctx);
    ctx.events.on("context-menu-action", (data) => {
      const event = data;
      if (event.action === "show-axis-details") {
        ctx.ui.showPopup("AxisDetails", {
          title: "Axis Details",
          data: { nodeId: event.nodeId }
        });
      }
    });
  },
  /**
   * Called when a node is bound to this plugin
   */
  onNodeBound(ctx, node) {
    const config = ctx.config.instance.getForNode(node.id);
    const axisName = config.axisName;
    if (!axisName) {
      ctx.log.warn(`No axis name configured for node ${node.id}`);
      ctx.ui.notify(`Please configure axis name for ${node.name}`, "warning");
      return;
    }
    ctx.log.info(`Node bound: ${node.name} (${node.id}) -> Axis: ${axisName}`);
    pluginState.addNode(node.id, axisName);
    setupSubscriptions(ctx, node.id);
    ctx.ui.notify(`Monitoring axis: ${axisName}`, "success");
  },
  /**
   * Called when a node is unbound from this plugin
   */
  onNodeUnbound(ctx, node) {
    ctx.log.info(`Node unbound: ${node.name} (${node.id})`);
    pluginState.removeNode(node.id);
    const nodeProxy = ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.emissive = "#000000";
      nodeProxy.emissiveIntensity = 0;
    }
  },
  /**
   * Called when configuration changes
   */
  onConfigChange(ctx, type, key, nodeId) {
    ctx.log.debug(`Config changed: ${type}.${key}`, nodeId || "");
    if (type === "instance" && nodeId) {
      if (key === "axisName") {
        const config = ctx.config.instance.getForNode(nodeId);
        const newAxisName = config.axisName;
        if (newAxisName) {
          pluginState.removeNode(nodeId);
          pluginState.addNode(nodeId, newAxisName);
          setupSubscriptions(ctx, nodeId);
          ctx.log.info(`Axis name changed for ${nodeId}: ${newAxisName}`);
        }
      }
    }
    if (type === "global" && (key === "errorColor" || key === "homingColor" || key === "motionColor")) {
      pluginState.getAllNodes().forEach((nodeState) => {
        updateNodeVisuals(ctx, nodeState.nodeId, nodeState.currentState);
      });
    }
  },
  /**
   * Called when the plugin is unloaded
   */
  onUnload(ctx) {
    ctx.log.info("Axis Release 10 Plugin unloading...");
    pluginState.cleanup();
    ctx.log.info("Axis Release 10 Plugin unloaded");
  }
};
var src_default = plugin;
export {
  acknowledgeError,
  src_default as default,
  getCurrentMqttSource,
  getMqttSources,
  getNodeState
};
