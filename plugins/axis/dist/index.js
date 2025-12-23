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
function getMotionStateColor(state) {
  switch (state) {
    case 0:
      return "#ff4444";
    case 2:
      return "#00aaff";
    case 5:
    case 6:
    case 7:
      return "#00ff00";
    default:
      return "#888888";
  }
}
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
var StatusBit = ({
  label,
  active,
  warning = false
}) => /* @__PURE__ */ jsxs(
  "div",
  {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 8px",
      backgroundColor: active ? warning ? "#fff3cd" : "#d4edda" : "#f8f9fa",
      borderRadius: "4px",
      border: `1px solid ${active ? warning ? "#ffc107" : "#28a745" : "#dee2e6"}`,
      fontSize: "11px"
    },
    children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: active ? warning ? "#ffc107" : "#28a745" : "#dee2e6"
          }
        }
      ),
      /* @__PURE__ */ jsx("span", { style: { color: active ? "#000" : "#6c757d" }, children: label })
    ]
  }
);
var STEP_SIZES = [0.1, 1, 10, 100];
var AxisDetailsPopup = ({ data }) => {
  const nodeId = data?.nodeId;
  const [nodeState, setNodeState] = useState(() => getNodeState(nodeId));
  const [updateCounter, setUpdateCounter] = useState(0);
  const [selectedStep, setSelectedStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stepControlEnabled, setStepControlEnabled] = useState(() => isStepControlAvailable());
  const [mqttFormat, setMqttFormat] = useState(() => getCurrentMqttFormat());
  useEffect(() => {
    const interval = setInterval(() => {
      const newState = getNodeState(nodeId);
      setNodeState(newState);
      setStepControlEnabled(isStepControlAvailable());
      setMqttFormat(getCurrentMqttFormat());
      setUpdateCounter((c) => c + 1);
    }, 250);
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
  const handleStepSizeChange = (size) => {
    setSelectedStep(size);
    setStepSize(nodeId, size);
  };
  const handleStep = async (direction) => {
    setIsLoading(true);
    const stepValue = selectedStep * direction;
    await sendStepCommand(nodeId, stepValue);
    setIsLoading(false);
  };
  const motionStateName = MotionStateNames[nodeState.currentState] || "Unknown";
  const { activityBits, statusMask } = nodeState;
  return /* @__PURE__ */ jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.header, children: [
      /* @__PURE__ */ jsxs("h2", { style: styles.title, children: [
        "Axis: ",
        nodeState.axisName
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.headerInfo, children: [
        /* @__PURE__ */ jsx("span", { style: styles.formatLabel, children: mqttFormat === "release11" ? "Release 11" : "Release 10" }),
        stepControlEnabled && /* @__PURE__ */ jsxs("span", { style: styles.sfLabel, children: [
          "SF: ",
          nodeState.functionNo
        ] }),
        /* @__PURE__ */ jsx(
          "span",
          {
            style: {
              ...styles.statusBadge,
              backgroundColor: getMotionStateColor(nodeState.currentState)
            },
            children: motionStateName
          }
        )
      ] })
    ] }),
    mqttFormat === "release11" ? /* @__PURE__ */ jsxs(Fragment2, { children: [
      /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
        /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Status Flags (motMsk)" }),
        /* @__PURE__ */ jsxs("div", { style: styles.bitGrid, children: [
          /* @__PURE__ */ jsx(StatusBit, { label: "Ready", active: statusMask.isReady }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Enabled", active: statusMask.isEnabled }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Switched On", active: statusMask.isSwitchedOn }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Homed", active: statusMask.isHomed }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Commutated", active: statusMask.isCommutated }),
          /* @__PURE__ */ jsx(StatusBit, { label: "In Velocity", active: statusMask.isInVelocity }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Override", active: statusMask.overrideEnabled }),
          /* @__PURE__ */ jsx(StatusBit, { label: "HW Enable", active: statusMask.hardwareEnableActivated }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Internal Limit", active: statusMask.internalLimitIsActive, warning: true }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Warning", active: statusMask.hasWarning, warning: true }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Error", active: statusMask.hasError, warning: true }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Home Switch", active: statusMask.hardwareHomeSwitchActivated }),
          /* @__PURE__ */ jsx(StatusBit, { label: "HW Limit-", active: statusMask.hardwareLimitSwitchNegativeActivated, warning: true }),
          /* @__PURE__ */ jsx(StatusBit, { label: "HW Limit+", active: statusMask.hardwareLimitSwitchPositiveActivated, warning: true }),
          /* @__PURE__ */ jsx(StatusBit, { label: "SW Limit-", active: statusMask.softwareLimitSwitchNegativeActivated, warning: true }),
          /* @__PURE__ */ jsx(StatusBit, { label: "SW Limit+", active: statusMask.softwareLimitSwitchPositiveActivated, warning: true }),
          /* @__PURE__ */ jsx(StatusBit, { label: "SW Reached-", active: statusMask.softwareLimitSwitchNegativeReached, warning: true }),
          /* @__PURE__ */ jsx(StatusBit, { label: "SW Reached+", active: statusMask.softwareLimitSwitchPositiveReached, warning: true }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Emergency", active: statusMask.emergencyDetectedDelayedEnabled, warning: true })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
        /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Activity Status (mtAcMk)" }),
        /* @__PURE__ */ jsxs("div", { style: styles.bitGrid, children: [
          /* @__PURE__ */ jsx(StatusBit, { label: "Motion Active", active: activityBits.motionIsActive }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Jog-", active: activityBits.jogNegativeIsActive }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Jog+", active: activityBits.jogPositiveIsActive }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Homing", active: activityBits.homingIsActive }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Vel+", active: activityBits.velocityPositiveIsActive }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Vel-", active: activityBits.velocityNegativeIsActive }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Stopping", active: activityBits.stoppingIsActive }),
          /* @__PURE__ */ jsx(StatusBit, { label: "Reset Fault", active: activityBits.resetControllerFaultIsActive })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { style: styles.section, children: /* @__PURE__ */ jsxs("div", { style: styles.release10Notice, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "18px" }, children: "\u24D8" }),
      /* @__PURE__ */ jsx("span", { children: "Release 10 Format: Status-Bits (motMsk, mtAcMk) nicht verfuegbar" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
      /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Position & Velocity" }),
      /* @__PURE__ */ jsxs("div", { style: styles.dataGrid, children: [
        /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ jsx("span", { style: styles.dataLabel, children: "World Position:" }),
          /* @__PURE__ */ jsxs("span", { style: styles.dataValue, children: [
            nodeState.worldPosition.toFixed(3),
            " mm"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ jsx("span", { style: styles.dataLabel, children: "Actual Position:" }),
          /* @__PURE__ */ jsxs("span", { style: styles.dataValue, children: [
            nodeState.position.toFixed(3),
            " mm"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ jsx("span", { style: styles.dataLabel, children: "Velocity:" }),
          /* @__PURE__ */ jsxs("span", { style: styles.dataValue, children: [
            nodeState.velocity.toFixed(3),
            " mm/s"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ jsx("span", { style: styles.dataLabel, children: "Last Update:" }),
          /* @__PURE__ */ jsx("span", { style: styles.dataValue, children: nodeState.lastUpdate ? nodeState.lastUpdate.toLocaleTimeString() : "Never" })
        ] })
      ] })
    ] }),
    stepControlEnabled ? /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
      /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Step Control" }),
      /* @__PURE__ */ jsxs("div", { style: styles.stepControl, children: [
        /* @__PURE__ */ jsxs("div", { style: styles.stepSizeSelector, children: [
          /* @__PURE__ */ jsx("span", { style: styles.stepLabel, children: "Step Size:" }),
          /* @__PURE__ */ jsx("div", { style: styles.stepButtons, children: STEP_SIZES.map((size) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStepSizeChange(size),
              style: {
                ...styles.stepSizeButton,
                backgroundColor: selectedStep === size ? "#007bff" : "#e9ecef",
                color: selectedStep === size ? "#fff" : "#333"
              },
              children: size
            },
            size
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.stepActions, children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleStep(-1),
              disabled: isLoading,
              style: {
                ...styles.stepActionButton,
                backgroundColor: "#dc3545"
              },
              children: [
                "- ",
                selectedStep
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleStep(1),
              disabled: isLoading,
              style: {
                ...styles.stepActionButton,
                backgroundColor: "#28a745"
              },
              children: [
                "+ ",
                selectedStep
              ]
            }
          )
        ] }),
        isLoading && /* @__PURE__ */ jsx("div", { style: styles.loadingIndicator, children: "Sending command..." })
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
      /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Step Control" }),
      /* @__PURE__ */ jsxs("div", { style: styles.release10Notice, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: "18px" }, children: "\u24D8" }),
        /* @__PURE__ */ jsx("span", { children: "Step-Betrieb nur mit Release 11 Format verfuegbar" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
      /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Error Log (Last 5)" }),
      nodeState.errors.length === 0 ? /* @__PURE__ */ jsxs("div", { style: styles.noErrors, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: "24px" }, children: "\u2713" }),
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
    padding: "16px",
    backgroundColor: "#f9f9f9",
    height: "100%",
    overflowY: "auto",
    fontFamily: "Arial, sans-serif"
  },
  header: {
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "2px solid #ddd"
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    color: "#333"
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  sfLabel: {
    fontSize: "14px",
    color: "#666",
    fontFamily: "monospace",
    backgroundColor: "#e9ecef",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  formatLabel: {
    fontSize: "11px",
    color: "#fff",
    backgroundColor: "#6c757d",
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: "bold"
  },
  release10Notice: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#fff3cd",
    borderRadius: "4px",
    color: "#856404",
    fontSize: "13px"
  },
  statusBadge: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "12px"
  },
  section: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    color: "#444",
    borderBottom: "1px solid #eee",
    paddingBottom: "6px"
  },
  bitGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },
  dataGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  dataRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 8px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px"
  },
  dataLabel: {
    fontSize: "13px",
    color: "#666",
    fontWeight: "bold"
  },
  dataValue: {
    fontSize: "13px",
    color: "#333",
    fontFamily: "monospace"
  },
  stepControl: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  stepSizeSelector: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  stepLabel: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#666"
  },
  stepButtons: {
    display: "flex",
    gap: "6px"
  },
  stepSizeButton: {
    padding: "6px 14px",
    border: "none",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  stepActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center"
  },
  stepActionButton: {
    padding: "12px 32px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "opacity 0.2s",
    minWidth: "120px"
  },
  loadingIndicator: {
    textAlign: "center",
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic"
  },
  noErrors: {
    textAlign: "center",
    padding: "20px",
    color: "#28a745"
  },
  errorList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "200px",
    overflowY: "auto"
  },
  errorItem: {
    padding: "10px",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
  },
  errorHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px"
  },
  errorLevel: {
    fontSize: "11px",
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  errorTime: {
    fontSize: "10px",
    color: "#999"
  },
  errorMessage: {
    fontSize: "12px",
    color: "#333",
    marginBottom: "6px",
    lineHeight: "1.3"
  },
  errorFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px"
  },
  errorSource: {
    fontSize: "11px",
    color: "#666",
    fontStyle: "italic"
  },
  ackButton: {
    padding: "4px 10px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontSize: "11px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  acknowledgedBadge: {
    fontSize: "11px",
    color: "#28a745",
    fontWeight: "bold"
  },
  footer: {
    marginTop: "16px",
    paddingTop: "12px",
    borderTop: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#999"
  },
  footerInfo: {
    display: "flex",
    gap: "4px"
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
  addNode(nodeId, axisName, functionNo) {
    const state = {
      nodeId,
      axisName,
      functionNo,
      subscriptions: [],
      currentState: 4 /* Disabled */,
      activityBits: createEmptyActivityBits(),
      statusMask: createEmptyStatusMask(),
      position: 0,
      velocity: 0,
      worldPosition: 0,
      errors: [],
      lastUpdate: null,
      selectedStepSize: 1
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
function createEmptyActivityBits() {
  return {
    motionIsActive: false,
    jogNegativeIsActive: false,
    jogPositiveIsActive: false,
    homingIsActive: false,
    resetControllerFaultIsActive: false,
    velocityPositiveIsActive: false,
    velocityNegativeIsActive: false,
    stoppingIsActive: false
  };
}
function createEmptyStatusMask() {
  return {
    isReady: false,
    isEnabled: false,
    isSwitchedOn: false,
    isHomed: false,
    isCommutated: false,
    internalLimitIsActive: false,
    hasWarning: false,
    hasError: false,
    isInVelocity: false,
    overrideEnabled: false,
    hardwareLimitSwitchNegativeActivated: false,
    hardwareLimitSwitchPositiveActivated: false,
    hardwareHomeSwitchActivated: false,
    hardwareEnableActivated: false,
    emergencyDetectedDelayedEnabled: false,
    softwareLimitSwitchNegativeActivated: false,
    softwareLimitSwitchPositiveActivated: false,
    softwareLimitSwitchNegativeReached: false,
    softwareLimitSwitchPositiveReached: false
  };
}
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
  } catch {
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
function parseActivityBits(hexWord) {
  const value = hexToInt(hexWord);
  return {
    motionIsActive: !!(value & 1 << 0),
    jogNegativeIsActive: !!(value & 1 << 1),
    jogPositiveIsActive: !!(value & 1 << 2),
    homingIsActive: !!(value & 1 << 3),
    resetControllerFaultIsActive: !!(value & 1 << 4),
    velocityPositiveIsActive: !!(value & 1 << 5),
    velocityNegativeIsActive: !!(value & 1 << 6),
    stoppingIsActive: !!(value & 1 << 7)
  };
}
function parseStatusMask(hexDword) {
  const value = hexToInt(hexDword);
  return {
    isReady: !!(value & 1 << 0),
    isEnabled: !!(value & 1 << 1),
    isSwitchedOn: !!(value & 1 << 2),
    isHomed: !!(value & 1 << 3),
    isCommutated: !!(value & 1 << 4),
    internalLimitIsActive: !!(value & 1 << 5),
    hasWarning: !!(value & 1 << 6),
    hasError: !!(value & 1 << 7),
    isInVelocity: !!(value & 1 << 8),
    overrideEnabled: !!(value & 1 << 16),
    hardwareLimitSwitchNegativeActivated: !!(value & 1 << 19),
    hardwareLimitSwitchPositiveActivated: !!(value & 1 << 20),
    hardwareHomeSwitchActivated: !!(value & 1 << 21),
    hardwareEnableActivated: !!(value & 1 << 22),
    emergencyDetectedDelayedEnabled: !!(value & 1 << 23),
    softwareLimitSwitchNegativeActivated: !!(value & 1 << 24),
    softwareLimitSwitchPositiveActivated: !!(value & 1 << 25),
    softwareLimitSwitchNegativeReached: !!(value & 1 << 26),
    softwareLimitSwitchPositiveReached: !!(value & 1 << 27)
  };
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
function getMqttFormat(ctx) {
  const globalConfig = ctx.config.global.getAll();
  return globalConfig.mqttFormat || "release11";
}
function handleAxisDataRelease11(ctx, nodeId, payload) {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState)
    return false;
  if (!payload.data || payload.data.length === 0) {
    return false;
  }
  for (const axisData of payload.data) {
    if (axisData.typ !== "Axis")
      continue;
    const incomingAxisName = normalizeAxisName(axisData.name);
    if (incomingAxisName !== nodeState.axisName)
      continue;
    const motionState = hexToInt(axisData.sS);
    const activityBits = parseActivityBits(axisData.mtAcMk);
    const statusMask = parseStatusMask(axisData.motMsk);
    const worldPosition = hexToFloat(axisData.posS0);
    const position = hexToFloat(axisData.pos);
    const velocity = hexToFloat(axisData.vel);
    nodeState.currentState = motionState;
    nodeState.activityBits = activityBits;
    nodeState.statusMask = statusMask;
    nodeState.position = position;
    nodeState.velocity = velocity;
    nodeState.worldPosition = worldPosition;
    nodeState.lastUpdate = /* @__PURE__ */ new Date();
    updateNodeVisuals(ctx, nodeId, motionState);
    updateNodePosition(ctx, nodeId, worldPosition);
    ctx.log.debug("Axis data updated (Release 11)", {
      nodeId,
      axisName: incomingAxisName,
      motionState,
      position,
      velocity
    });
    return true;
  }
  return false;
}
function handleAxisDataRelease10(ctx, nodeId, payload) {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState)
    return false;
  if (!payload.pack || payload.pack.length === 0) {
    return false;
  }
  for (const packItem of payload.pack) {
    const axisData = packItem.Axis;
    if (!axisData)
      continue;
    const incomingAxisName = normalizeAxisName(axisData.name);
    if (incomingAxisName !== nodeState.axisName)
      continue;
    const motionState = hexToInt(axisData.sS.val);
    const worldPosition = hexToFloat(axisData.posS0.val);
    const position = hexToFloat(axisData.pos.val);
    const velocity = hexToFloat(axisData.vel.val);
    nodeState.activityBits = createEmptyActivityBits();
    nodeState.statusMask = createEmptyStatusMask();
    nodeState.currentState = motionState;
    nodeState.position = position;
    nodeState.velocity = velocity;
    nodeState.worldPosition = worldPosition;
    nodeState.lastUpdate = /* @__PURE__ */ new Date();
    updateNodeVisuals(ctx, nodeId, motionState);
    updateNodePosition(ctx, nodeId, worldPosition);
    ctx.log.debug("Axis data updated (Release 10)", {
      nodeId,
      axisName: incomingAxisName,
      motionState,
      position,
      velocity
    });
    return true;
  }
  return false;
}
function handleAxisData(ctx, nodeId, rawPayload) {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState)
    return;
  const configuredFormat = getMqttFormat(ctx);
  try {
    let parsedPayload;
    if (typeof rawPayload === "string") {
      parsedPayload = JSON.parse(rawPayload);
    } else {
      parsedPayload = rawPayload;
    }
    ctx.log.debug("MQTT payload received", {
      nodeId,
      axisName: nodeState.axisName,
      configuredFormat
    });
    let success = false;
    if (configuredFormat === "release11") {
      const payload = parsedPayload;
      if (payload.data && Array.isArray(payload.data)) {
        success = handleAxisDataRelease11(ctx, nodeId, payload);
      } else {
        ctx.log.error("Format mismatch: Expected Release 11 format (data array)", {
          nodeId,
          hasData: !!payload.data,
          hasPack: !!parsedPayload.pack
        });
        ctx.ui.notify("MQTT Format-Fehler: Release 11 erwartet, aber anderes Format empfangen", "error");
      }
    } else {
      const payload = parsedPayload;
      if (payload.pack && Array.isArray(payload.pack)) {
        success = handleAxisDataRelease10(ctx, nodeId, payload);
      } else {
        ctx.log.error("Format mismatch: Expected Release 10 format (pack array)", {
          nodeId,
          hasPack: !!payload.pack,
          hasData: !!parsedPayload.data
        });
        ctx.ui.notify("MQTT Format-Fehler: Release 10 erwartet, aber anderes Format empfangen", "error");
      }
    }
    if (!success) {
      ctx.log.debug("No matching axis found in payload", {
        nodeId,
        axisName: nodeState.axisName
      });
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
  const mqtt = getMqttApi(ctx);
  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.error("No MQTT sources available", { nodeId });
    ctx.ui.notify("Keine MQTT-Broker konfiguriert", "error");
    return;
  }
  const axisUnsub = mqtt.subscribe(mainTopic, (msg) => {
    handleAxisData(ctx, nodeId, msg.payload);
  });
  nodeState.subscriptions.push(axisUnsub);
  ctx.log.info("Axis subscription setup", {
    nodeId,
    axisName: nodeState.axisName,
    mainTopic
  });
}
function setupErrorSubscription(ctx) {
  const globalConfig = ctx.config.global.getAll();
  const errorTopic = globalConfig.errorTopic || "machine/errors";
  const mqtt = getMqttApi(ctx);
  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.warn("No MQTT sources available for error subscription");
    return;
  }
  const errorUnsub = mqtt.subscribe(errorTopic, (msg) => {
    handleErrorMessage(ctx, msg.payload);
  });
  pluginState.setErrorSubscription(errorUnsub);
  ctx.log.info("Error subscription setup", { errorTopic });
}
async function sendStepCommand(nodeId, stepValue) {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) {
    ctx.log.error("Node state not found for step command", { nodeId });
    return false;
  }
  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl = globalConfig.httpBaseUrl || "http://localhost:3021";
  const url = `${httpBaseUrl}/v1/commands/functioncall`;
  const payload = {
    functionNo: nodeState.functionNo,
    functionCommand: 83,
    functionInvokerCommand: "Start",
    inputs: [
      {
        functionNo: nodeState.functionNo,
        parameters: [
          {
            parameterIndex: 4,
            typeOfParameter: "float",
            parameter: stepValue
          }
        ]
      }
    ]
  };
  try {
    ctx.log.info("Sending step command", {
      nodeId,
      axisName: nodeState.axisName,
      functionNo: nodeState.functionNo,
      stepValue,
      url
    });
    const response = await ctx.http.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*"
      }
    });
    if (response.status >= 200 && response.status < 300) {
      ctx.log.info("Step command sent successfully", {
        nodeId,
        stepValue,
        status: response.status
      });
      ctx.ui.notify(`Step ${stepValue > 0 ? "+" : ""}${stepValue} gesendet`, "success");
      return true;
    } else {
      ctx.log.error("Step command failed", {
        nodeId,
        status: response.status,
        statusText: response.statusText
      });
      ctx.ui.notify(`Step-Befehl fehlgeschlagen: ${response.statusText}`, "error");
      return false;
    }
  } catch (error) {
    ctx.log.error("Step command error", { nodeId, error });
    ctx.ui.notify("Fehler beim Senden des Step-Befehls", "error");
    return false;
  }
}
function setStepSize(nodeId, stepSize) {
  const nodeState = pluginState.getNode(nodeId);
  if (nodeState) {
    nodeState.selectedStepSize = stepSize;
  }
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
function isStepControlAvailable() {
  const ctx = pluginState.getContext();
  const format = getMqttFormat(ctx);
  return format === "release11";
}
function getCurrentMqttFormat() {
  const ctx = pluginState.getContext();
  return getMqttFormat(ctx);
}
var plugin = {
  components: {
    AxisDetailsPopup
  },
  onLoad(ctx) {
    pluginState.initialize(ctx);
    ctx.log.info("Axis Plugin loaded", {
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
  onNodeBound(ctx, node) {
    const config = ctx.config.instance.getForNode(node.id);
    const axisName = config.axisName;
    const functionNo = config.functionNo || 5031;
    if (!axisName) {
      ctx.log.warn(`No axis name configured for node ${node.id}`);
      ctx.ui.notify(`Bitte Achsname f\xFCr ${node.name} konfigurieren`, "warning");
      return;
    }
    ctx.log.info(`Node bound: ${node.name} (${node.id}) -> Axis: ${axisName}, SF: ${functionNo}`);
    pluginState.addNode(node.id, axisName, functionNo);
    setupSubscriptions(ctx, node.id);
    ctx.ui.notify(`Monitoring: ${axisName}`, "success");
  },
  onNodeUnbound(ctx, node) {
    ctx.log.info(`Node unbound: ${node.name} (${node.id})`);
    pluginState.removeNode(node.id);
    const nodeProxy = ctx.nodes.get(node.id);
    if (nodeProxy) {
      nodeProxy.emissive = "#000000";
      nodeProxy.emissiveIntensity = 0;
    }
  },
  onConfigChange(ctx, type, key, nodeId) {
    ctx.log.debug(`Config changed: ${type}.${key}`, nodeId || "");
    if (type === "instance" && nodeId) {
      if (key === "axisName" || key === "functionNo") {
        const config = ctx.config.instance.getForNode(nodeId);
        const newAxisName = config.axisName;
        const newFunctionNo = config.functionNo || 5031;
        if (newAxisName) {
          pluginState.removeNode(nodeId);
          pluginState.addNode(nodeId, newAxisName, newFunctionNo);
          setupSubscriptions(ctx, nodeId);
          ctx.log.info(`Config updated for ${nodeId}: ${newAxisName}, SF: ${newFunctionNo}`);
        }
      }
    }
    if (type === "global" && (key === "errorColor" || key === "homingColor" || key === "motionColor")) {
      pluginState.getAllNodes().forEach((nodeState) => {
        updateNodeVisuals(ctx, nodeState.nodeId, nodeState.currentState);
      });
    }
  },
  onUnload(ctx) {
    ctx.log.info("Axis Plugin unloading...");
    pluginState.cleanup();
    ctx.log.info("Axis Plugin unloaded");
  }
};
var src_default = plugin;
export {
  acknowledgeError,
  src_default as default,
  getCurrentMqttFormat,
  getCurrentMqttSource,
  getMqttSources,
  getNodeState,
  isStepControlAvailable,
  sendStepCommand,
  setStepSize
};
