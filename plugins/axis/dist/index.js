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

// src/types.ts
var MotionStateNames = {
  [0]: "Error Stop",
  [1]: "Standstill",
  [2]: "Homing",
  [3]: "Stopping",
  [4]: "Disabled",
  [5]: "Discrete Motion",
  [6]: "Continuous Motion",
  [7]: "Synchronized Motion"
};

// src/utils.ts
function hexToInt(hexString) {
  if (!hexString)
    return 0;
  try {
    return parseInt(hexString, 16);
  } catch {
    return 0;
  }
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
function normalizeAxisName(name) {
  return name.trim();
}
function formatTime(date) {
  if (!date) {
    return "\u2014";
  }
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

// react-global:react/jsx-runtime
var React2 = window.React;
var jsx = React2.createElement;
var jsxs = React2.createElement;
var Fragment2 = React2.Fragment;

// src/components/AxisDetailsPopup.tsx
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
  const [isSwitchOnLoading, setIsSwitchOnLoading] = useState(false);
  const [isHomingLoading, setIsHomingLoading] = useState(false);
  const [isMoveToLoading, setIsMoveToLoading] = useState(false);
  const [targetPosition, setTargetPosition] = useState(0);
  const [stepControlEnabled, setStepControlEnabled] = useState(() => isStepControlAvailable());
  const [mqttFormat, setMqttFormat] = useState(() => getCurrentMqttFormat());
  const [activeTab, setActiveTab] = useState("control");
  const [selectedErrorIdx, setSelectedErrorIdx] = useState(null);
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
  const handleSwitchOn = async () => {
    setIsSwitchOnLoading(true);
    await sendSwitchOnCommand(nodeId);
    setIsSwitchOnLoading(false);
  };
  const handleHoming = async () => {
    setIsHomingLoading(true);
    await sendHomingCommand(nodeId);
    setIsHomingLoading(false);
  };
  const handleMoveTo = async () => {
    setIsMoveToLoading(true);
    await sendMoveToPositionCommand(nodeId, targetPosition);
    setIsMoveToLoading(false);
  };
  const motionStateName = MotionStateNames[nodeState.currentState] || "Unknown";
  const { activityBits, statusMask } = nodeState;
  const unacknowledgedCount = getUnacknowledgedErrorCount(nodeId);
  return /* @__PURE__ */ jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.header, children: [
      /* @__PURE__ */ jsxs("h2", { style: styles.title, children: [
        "Axis: ",
        nodeState.axisName
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.headerInfo, children: [
        /* @__PURE__ */ jsx("span", { style: styles.formatLabel, children: mqttFormat === "release11" ? "Release 11" : "Release 10" }),
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
    /* @__PURE__ */ jsxs("div", { style: styles.tabContainer, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("control"),
          style: {
            ...styles.tabButton,
            ...activeTab === "control" ? styles.tabButtonActive : {}
          },
          children: "Control & Position"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("status"),
          style: {
            ...styles.tabButton,
            ...activeTab === "status" ? styles.tabButtonActive : {},
            ...mqttFormat !== "release11" ? styles.tabButtonDisabled : {}
          },
          disabled: mqttFormat !== "release11",
          children: "Status Flags"
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("errors"),
          style: {
            ...styles.tabButton,
            ...activeTab === "errors" ? styles.tabButtonActive : {}
          },
          children: [
            "Errors",
            unacknowledgedCount > 0 && /* @__PURE__ */ jsx("span", { style: styles.errorBadge, children: unacknowledgedCount })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.tabContent, children: [
      activeTab === "control" && /* @__PURE__ */ jsxs(Fragment2, { children: [
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
              /* @__PURE__ */ jsx("span", { style: styles.dataValue, children: formatTime(nodeState.lastUpdate) })
            ] })
          ] })
        ] }),
        stepControlEnabled ? /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
          /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Step Control" }),
          /* @__PURE__ */ jsxs("div", { style: styles.stepControlRow, children: [
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
            /* @__PURE__ */ jsxs("div", { style: styles.stepSizePanel, children: [
              /* @__PURE__ */ jsx("div", { style: styles.stepPresets, children: STEP_SIZES.map((size) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleStepSizeChange(size),
                  style: {
                    ...styles.stepPresetButton,
                    backgroundColor: selectedStep === size ? "#007bff" : "#e9ecef",
                    color: selectedStep === size ? "#fff" : "#333"
                  },
                  children: size
                },
                size
              )) }),
              /* @__PURE__ */ jsxs("div", { style: styles.customStepRow, children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    value: selectedStep,
                    onChange: (e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        handleStepSizeChange(val);
                      }
                    },
                    style: styles.customStepInput,
                    min: "0.001",
                    step: "0.1"
                  }
                ),
                /* @__PURE__ */ jsx("span", { style: styles.stepUnit, children: "mm" })
              ] })
            ] })
          ] }),
          isLoading && /* @__PURE__ */ jsx("div", { style: styles.loadingIndicator, children: "Sending command..." })
        ] }) : /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
          /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Step Control" }),
          /* @__PURE__ */ jsxs("div", { style: styles.release10Notice, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: "18px" }, children: "\u24D8" }),
            /* @__PURE__ */ jsx("span", { children: "Step-Betrieb nur mit Release 11 Format verfuegbar" })
          ] })
        ] }),
        stepControlEnabled && /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
          /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Move Absolut" }),
          /* @__PURE__ */ jsxs("div", { style: styles.moveToRow, children: [
            /* @__PURE__ */ jsxs("div", { style: styles.moveToInputGroup, children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: targetPosition,
                  onChange: (e) => setTargetPosition(parseFloat(e.target.value) || 0),
                  style: styles.moveToInput,
                  step: "0.1"
                }
              ),
              /* @__PURE__ */ jsx("span", { style: styles.stepUnit, children: "mm" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleMoveTo,
                disabled: isMoveToLoading,
                style: styles.moveToButton,
                children: isMoveToLoading ? "Sending..." : "Move To"
              }
            )
          ] })
        ] }),
        stepControlEnabled && /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
          /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: "Axis Commands" }),
          /* @__PURE__ */ jsxs("div", { style: styles.axisCommandsRow, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleSwitchOn,
                disabled: isSwitchOnLoading,
                style: styles.axisCommandButton,
                children: isSwitchOnLoading ? "Sending..." : "Switch On"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleHoming,
                disabled: isHomingLoading,
                style: {
                  ...styles.axisCommandButton,
                  backgroundColor: "#17a2b8"
                },
                children: isHomingLoading ? "Sending..." : "Homing"
              }
            )
          ] })
        ] })
      ] }),
      activeTab === "status" && mqttFormat === "release11" && /* @__PURE__ */ jsxs(Fragment2, { children: [
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
      ] }),
      activeTab === "errors" && /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
        /* @__PURE__ */ jsxs("h3", { style: styles.sectionTitle, children: [
          "Fehlermeldungen (",
          nodeState.errors.length,
          ") - ",
          unacknowledgedCount,
          " offen"
        ] }),
        unacknowledgedCount > 0 && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              acknowledgeAllErrors(nodeId);
              setSelectedErrorIdx(null);
              setUpdateCounter((c) => c + 1);
            },
            style: {
              marginBottom: "12px",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              width: "100%"
            },
            children: [
              "Alle Quittieren (",
              unacknowledgedCount,
              ")"
            ]
          }
        ),
        nodeState.errors.length === 0 ? /* @__PURE__ */ jsx("pre", { style: { color: "#28a745", padding: "20px", textAlign: "center", margin: 0 }, children: "Keine Fehlermeldungen" }) : /* @__PURE__ */ jsxs(Fragment2, { children: [
          /* @__PURE__ */ jsx("pre", { style: {
            margin: "0 0 8px 0",
            padding: "10px",
            backgroundColor: "#2d2d2d",
            color: "#fff",
            fontSize: "12px",
            fontFamily: "Consolas, Monaco, monospace",
            borderRadius: "4px",
            border: "1px solid #555",
            whiteSpace: "pre-wrap",
            maxHeight: "150px",
            overflow: "auto"
          }, children: nodeState.errors.map((err, idx) => {
            try {
              const p = JSON.parse(err.rawPayload || "{}");
              const msg = p.msg?.txt || p.msg?.text || p.msg || "No message";
              const ack = err.acknowledged ? "\u2713" : "\u25CB";
              const sel = selectedErrorIdx === idx ? "\u25B6" : " ";
              return `${sel}[${idx}] ${ack} ${err.level}: ${msg}
`;
            } catch {
              return ` [${idx}] \u25CB ${err.level}: Parse error
`;
            }
          }).join("") }),
          /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }, children: Array.from({ length: nodeState.errors.length }, (_, idx) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSelectedErrorIdx(selectedErrorIdx === idx ? null : idx),
              style: {
                padding: "4px 8px",
                backgroundColor: selectedErrorIdx === idx ? "#007bff" : "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "11px"
              },
              children: [
                "#",
                idx
              ]
            },
            idx
          )) }),
          selectedErrorIdx !== null && nodeState.errors[selectedErrorIdx] && /* @__PURE__ */ jsxs(Fragment2, { children: [
            /* @__PURE__ */ jsx("pre", { style: {
              margin: 0,
              padding: "10px",
              backgroundColor: "#1a1a1a",
              color: "#0f0",
              fontSize: "11px",
              fontFamily: "Consolas, Monaco, monospace",
              borderRadius: "4px",
              border: `2px solid ${getErrorLevelColor(nodeState.errors[selectedErrorIdx].level)}`,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              maxHeight: "200px",
              overflow: "auto"
            }, children: (() => {
              const err = nodeState.errors[selectedErrorIdx];
              try {
                return JSON.stringify(JSON.parse(err.rawPayload || "{}"), null, 2);
              } catch {
                return err.rawPayload || "No payload";
              }
            })() }),
            !nodeState.errors[selectedErrorIdx].acknowledged && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleAcknowledge(selectedErrorIdx),
                style: {
                  marginTop: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                },
                children: "Quittieren"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.footer, children: [
      /* @__PURE__ */ jsxs("div", { style: styles.footerInfo, children: [
        /* @__PURE__ */ jsx("span", { style: styles.footerLabel, children: "Node ID:" }),
        /* @__PURE__ */ jsx("span", { style: styles.footerValue, children: nodeId })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.footerInfo, children: [
        /* @__PURE__ */ jsx("span", { style: styles.footerLabel, children: "AxisCmd:" }),
        /* @__PURE__ */ jsx("span", { style: styles.footerValue, children: nodeState.axisCommandNo })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.footerInfo, children: [
        /* @__PURE__ */ jsx("span", { style: styles.footerLabel, children: "MoveCmd:" }),
        /* @__PURE__ */ jsx("span", { style: styles.footerValue, children: nodeState.moveCommandNo })
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
    marginBottom: "12px",
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
  formatLabel: {
    fontSize: "11px",
    color: "#fff",
    backgroundColor: "#6c757d",
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: "bold"
  },
  tabContainer: {
    display: "flex",
    gap: "4px",
    marginBottom: "16px",
    borderBottom: "2px solid #dee2e6",
    paddingBottom: "0"
  },
  tabButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px 6px 0 0",
    backgroundColor: "#e9ecef",
    color: "#495057",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "-2px",
    borderBottom: "2px solid transparent",
    position: "relative"
  },
  tabButtonActive: {
    backgroundColor: "#007bff",
    color: "#fff",
    borderBottom: "2px solid #007bff"
  },
  tabButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  tabContent: {
    minHeight: "200px"
  },
  errorBadge: {
    backgroundColor: "#dc3545",
    color: "#fff",
    borderRadius: "10px",
    padding: "2px 6px",
    fontSize: "10px",
    marginLeft: "6px",
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
  stepControlRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px"
  },
  stepActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0
  },
  stepActionButton: {
    padding: "14px 24px",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "opacity 0.2s",
    minWidth: "100px"
  },
  stepSizePanel: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "flex-end"
  },
  stepPresets: {
    display: "flex",
    gap: "4px"
  },
  stepPresetButton: {
    padding: "4px 10px",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  customStepRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  customStepInput: {
    width: "80px",
    padding: "6px 8px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    fontFamily: "monospace",
    textAlign: "right"
  },
  stepUnit: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "bold"
  },
  moveToRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  moveToInputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flex: 1
  },
  moveToInput: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "16px",
    fontFamily: "monospace",
    textAlign: "right"
  },
  moveToButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#6f42c1",
    cursor: "pointer",
    transition: "opacity 0.2s"
  },
  axisCommandsRow: {
    display: "flex",
    gap: "12px"
  },
  axisCommandButton: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#ffc107",
    cursor: "pointer",
    transition: "opacity 0.2s"
  },
  loadingIndicator: {
    textAlign: "center",
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic"
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
  hasErrorSubscription() {
    return this.errorSubscription !== null;
  }
  getContext() {
    if (!this.ctx)
      throw new Error("Plugin not initialized");
    return this.ctx;
  }
  addNode(nodeId, axisName, axisCommandNo, moveCommandNo) {
    const state = {
      nodeId,
      axisName,
      axisCommandNo,
      moveCommandNo,
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
function setupGlobalErrorSubscription(ctx) {
  if (pluginState.hasErrorSubscription()) {
    ctx.log.debug("Global error subscription already exists, skipping");
    return;
  }
  const globalConfig = ctx.config.global.getAll();
  const errorTopic = globalConfig.errorTopic || "machine/errors";
  const mqtt = getMqttApi(ctx);
  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.warn("No MQTT sources available for error subscription");
    return;
  }
  ctx.log.info("Setting up global error subscription", { errorTopic });
  const errorUnsub = mqtt.subscribe(errorTopic, (msg) => {
    handleErrorMessage(ctx, msg.payload);
  });
  pluginState.setErrorSubscription(errorUnsub);
}
function getMqttFormat(ctx) {
  const globalConfig = ctx.config.global.getAll();
  return globalConfig.mqttFormat || "release11";
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
function updateNodeVisuals(ctx, nodeId, motionState, hasError = false) {
  const node = ctx.nodes.get(nodeId);
  if (!node)
    return;
  const globalConfig = ctx.config.global.getAll();
  const errorColor = globalConfig.errorColor || "#ff0000";
  const homingColor = globalConfig.homingColor || "#00aaff";
  const motionColor = globalConfig.motionColor || "#00ff00";
  const intensity = globalConfig.emissiveIntensity || 0.6;
  const nodeState = pluginState.getNode(nodeId);
  const hasUnacknowledgedErrors = nodeState?.errors.some((e) => !e.acknowledged) ?? false;
  if (hasUnacknowledgedErrors || hasError || motionState === 0 /* ErrorStop */) {
    node.emissive = errorColor;
    node.emissiveIntensity = 1;
    return;
  }
  node.emissive = "#000000";
  node.emissiveIntensity = 0;
  switch (motionState) {
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
    const hasUnacknowledgedErrors = nodeState.errors.some((e) => !e.acknowledged);
    updateNodeVisuals(ctx, nodeId, motionState, hasUnacknowledgedErrors);
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
    const hasUnacknowledgedErrors = nodeState.errors.some((e) => !e.acknowledged);
    updateNodeVisuals(ctx, nodeId, motionState, hasUnacknowledgedErrors);
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
function handleErrorMessage(ctx, rawPayload) {
  try {
    const payloadString = typeof rawPayload === "string" ? rawPayload : JSON.stringify(rawPayload, null, 2);
    let payload;
    if (typeof rawPayload === "string") {
      payload = JSON.parse(rawPayload);
    } else {
      payload = rawPayload;
    }
    ctx.log.info("Error message received", { src: payload.src, lvl: payload.lvl });
    const source = normalizeAxisName(payload.src || "");
    const allNodes = pluginState.getAllNodes();
    allNodes.forEach((nodeState) => {
      const expectedAxisName = normalizeAxisName(nodeState.axisName);
      if (source === expectedAxisName) {
        const errorEntry = {
          timestamp: payload.utc,
          level: payload.lvl,
          source: payload.src,
          rawPayload: payloadString,
          acknowledged: false
        };
        nodeState.errors.unshift(errorEntry);
        if (nodeState.errors.length > 20) {
          nodeState.errors = nodeState.errors.slice(0, 20);
        }
        let msgText = "Unknown error";
        if (typeof payload.msg === "string") {
          msgText = payload.msg;
        } else if (payload.msg?.txt) {
          msgText = payload.msg.txt;
        } else if (payload.msg?.text) {
          msgText = payload.msg.text;
        }
        if (payload.lvl === "ERR") {
          ctx.log.error(`[${nodeState.axisName}] ${msgText}`, {
            nodeId: nodeState.nodeId,
            nodeName: nodeState.axisName,
            payload
          });
          updateNodeVisuals(ctx, nodeState.nodeId, nodeState.currentState, true);
          ctx.ui.notify(`Error: ${nodeState.axisName} - ${msgText}`, "error");
        } else if (payload.lvl === "WARN") {
          ctx.log.warn(`[${nodeState.axisName}] ${msgText}`, {
            nodeId: nodeState.nodeId,
            nodeName: nodeState.axisName,
            payload
          });
          ctx.ui.notify(`Warning: ${nodeState.axisName} - ${msgText}`, "warning");
        } else {
          ctx.log.info(`[${nodeState.axisName}] ${msgText}`, {
            nodeId: nodeState.nodeId,
            nodeName: nodeState.axisName,
            payload
          });
        }
      }
    });
  } catch (error) {
    ctx.log.error("Failed to process error message", { error });
  }
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
  ctx.log.info("Setting up axis subscription", { nodeId, mainTopic });
  const axisUnsub = mqtt.subscribe(mainTopic, (msg) => {
    handleAxisData(ctx, nodeId, msg.payload);
  });
  nodeState.subscriptions.push(axisUnsub);
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
    functionNo: nodeState.moveCommandNo,
    functionCommand: 83,
    functionInvokerCommand: "Start",
    inputs: [
      {
        functionNo: nodeState.moveCommandNo,
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
      moveCommandNo: nodeState.moveCommandNo,
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
async function sendSwitchOnCommand(nodeId) {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) {
    ctx.log.error("Node state not found for switch on command", { nodeId });
    return false;
  }
  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl = globalConfig.httpBaseUrl || "http://localhost:3021";
  const url = `${httpBaseUrl}/v1/commands/functioncall`;
  const payload = {
    functionNo: nodeState.axisCommandNo,
    functionCommand: 9,
    functionInvokerCommand: "Start",
    inputs: []
  };
  try {
    ctx.log.info("Sending switch on command", {
      nodeId,
      axisName: nodeState.axisName,
      axisCommandNo: nodeState.axisCommandNo,
      url
    });
    const response = await ctx.http.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*"
      }
    });
    if (response.status >= 200 && response.status < 300) {
      ctx.log.info("Switch on command sent successfully", { nodeId, status: response.status });
      ctx.ui.notify("Switch On gesendet", "success");
      return true;
    } else {
      ctx.log.error("Switch on command failed", {
        nodeId,
        status: response.status,
        statusText: response.statusText
      });
      ctx.ui.notify(`Switch On fehlgeschlagen: ${response.statusText}`, "error");
      return false;
    }
  } catch (error) {
    ctx.log.error("Switch on command error", { nodeId, error });
    ctx.ui.notify("Fehler beim Senden des Switch On-Befehls", "error");
    return false;
  }
}
async function sendHomingCommand(nodeId) {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) {
    ctx.log.error("Node state not found for homing command", { nodeId });
    return false;
  }
  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl = globalConfig.httpBaseUrl || "http://localhost:3021";
  const url = `${httpBaseUrl}/v1/commands/functioncall`;
  const payload = {
    functionNo: nodeState.moveCommandNo,
    functionCommand: 13,
    functionInvokerCommand: "Start",
    inputs: []
  };
  try {
    ctx.log.info("Sending homing command", {
      nodeId,
      axisName: nodeState.axisName,
      moveCommandNo: nodeState.moveCommandNo,
      url
    });
    const response = await ctx.http.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*"
      }
    });
    if (response.status >= 200 && response.status < 300) {
      ctx.log.info("Homing command sent successfully", { nodeId, status: response.status });
      ctx.ui.notify("Homing gestartet", "success");
      return true;
    } else {
      ctx.log.error("Homing command failed", {
        nodeId,
        status: response.status,
        statusText: response.statusText
      });
      ctx.ui.notify(`Homing fehlgeschlagen: ${response.statusText}`, "error");
      return false;
    }
  } catch (error) {
    ctx.log.error("Homing command error", { nodeId, error });
    ctx.ui.notify("Fehler beim Senden des Homing-Befehls", "error");
    return false;
  }
}
async function sendMoveToPositionCommand(nodeId, targetPosition) {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) {
    ctx.log.error("Node state not found for move to position command", { nodeId });
    return false;
  }
  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl = globalConfig.httpBaseUrl || "http://localhost:3021";
  const url = `${httpBaseUrl}/v1/commands/functioncall`;
  const payload = {
    functionNo: nodeState.moveCommandNo,
    functionCommand: 93,
    functionInvokerCommand: "Start",
    inputs: [
      {
        functionNo: nodeState.moveCommandNo,
        parameters: [
          {
            parameterIndex: 0,
            typeOfParameter: "float",
            parameter: targetPosition
          }
        ]
      }
    ]
  };
  try {
    ctx.log.info("Sending move to position command", {
      nodeId,
      axisName: nodeState.axisName,
      moveCommandNo: nodeState.moveCommandNo,
      targetPosition,
      url
    });
    const response = await ctx.http.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*"
      }
    });
    if (response.status >= 200 && response.status < 300) {
      ctx.log.info("Move to position command sent successfully", {
        nodeId,
        targetPosition,
        status: response.status
      });
      ctx.ui.notify(`Move To ${targetPosition} mm gesendet`, "success");
      return true;
    } else {
      ctx.log.error("Move to position command failed", {
        nodeId,
        status: response.status,
        statusText: response.statusText
      });
      ctx.ui.notify(`Move To fehlgeschlagen: ${response.statusText}`, "error");
      return false;
    }
  } catch (error) {
    ctx.log.error("Move to position command error", { nodeId, error });
    ctx.ui.notify("Fehler beim Senden des Move To-Befehls", "error");
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
  const error = nodeState.errors[errorIndex];
  error.acknowledged = true;
  ctx.log.info("Error acknowledged", {
    nodeId,
    axisName: nodeState.axisName,
    errorIndex,
    level: error.level,
    acknowledgedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  const hasUnacknowledgedErrors = nodeState.errors.some((e) => !e.acknowledged);
  if (!hasUnacknowledgedErrors) {
    updateNodeVisuals(ctx, nodeId, nodeState.currentState, false);
    ctx.log.info("Node error state reset after acknowledgement", {
      nodeId,
      axisName: nodeState.axisName
    });
    ctx.ui.notify(`${nodeState.axisName}: Fehler quittiert`, "success");
  }
}
function acknowledgeAllErrors(nodeId) {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) {
    return;
  }
  const errorCount = nodeState.errors.length;
  if (errorCount === 0) {
    return;
  }
  ctx.log.info("All errors acknowledged and cleared", {
    nodeId,
    axisName: nodeState.axisName,
    count: errorCount,
    acknowledgedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  nodeState.errors = [];
  updateNodeVisuals(ctx, nodeId, nodeState.currentState, false);
  ctx.log.info("Node state reset after acknowledgement", {
    nodeId,
    axisName: nodeState.axisName,
    newState: "Normal"
  });
  ctx.ui.notify(`${nodeState.axisName}: ${errorCount} Fehler quittiert`, "success");
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
function getUnacknowledgedErrorCount(nodeId) {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState)
    return 0;
  return nodeState.errors.filter((e) => !e.acknowledged).length;
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
    setupGlobalErrorSubscription(ctx);
    ctx.events.on("context-menu-action", (data) => {
      const event = data;
      if (event.action === "show-axis-details") {
        ctx.ui.showPopup("AxisDetails", {
          title: "Axis Details",
          data: { nodeId: event.nodeId }
        });
      }
    });
    ctx.events.onLogAcknowledged((entries) => {
      entries.forEach((entry) => {
        if (entry.nodeId) {
          const nodeState = pluginState.getNode(entry.nodeId);
          if (nodeState) {
            let hasUnacknowledged = false;
            nodeState.errors.forEach((err) => {
              if (!err.acknowledged) {
                err.acknowledged = true;
                hasUnacknowledged = true;
              }
            });
            if (hasUnacknowledged) {
              updateNodeVisuals(ctx, entry.nodeId, nodeState.currentState, false);
              ctx.log.info("Node error state reset via Viewer Log acknowledgement", {
                nodeId: entry.nodeId,
                axisName: nodeState.axisName
              });
            }
          }
        }
      });
    });
  },
  onNodeBound(ctx, node) {
    const config = ctx.config.instance.getForNode(node.id);
    const axisName = config.axisName;
    const axisCommandNo = config.axisCommandNo || 5031;
    const moveCommandNo = config.moveCommandNo || 5031;
    if (!axisName) {
      ctx.log.warn(`No axis name configured for node ${node.id}`);
      ctx.ui.notify(`Bitte Achsname f\xFCr ${node.name} konfigurieren`, "warning");
      return;
    }
    ctx.log.info(`Node bound: ${node.name} (${node.id}) -> Axis: ${axisName}, AxisCmd: ${axisCommandNo}, MoveCmd: ${moveCommandNo}`);
    pluginState.addNode(node.id, axisName, axisCommandNo, moveCommandNo);
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
      if (key === "axisName" || key === "axisCommandNo" || key === "moveCommandNo") {
        const config = ctx.config.instance.getForNode(nodeId);
        const newAxisName = config.axisName;
        const newAxisCommandNo = config.axisCommandNo || 5031;
        const newMoveCommandNo = config.moveCommandNo || 5031;
        if (newAxisName) {
          pluginState.removeNode(nodeId);
          pluginState.addNode(nodeId, newAxisName, newAxisCommandNo, newMoveCommandNo);
          setupSubscriptions(ctx, nodeId);
          ctx.log.info(`Config updated for ${nodeId}: ${newAxisName}, AxisCmd: ${newAxisCommandNo}, MoveCmd: ${newMoveCommandNo}`);
        }
      }
    }
    if (type === "global" && (key === "errorColor" || key === "homingColor" || key === "motionColor")) {
      pluginState.getAllNodes().forEach((nodeState) => {
        const hasUnacknowledgedErrors = nodeState.errors.some((e) => !e.acknowledged);
        updateNodeVisuals(ctx, nodeState.nodeId, nodeState.currentState, hasUnacknowledgedErrors);
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
  acknowledgeAllErrors,
  acknowledgeError,
  src_default as default,
  getCurrentMqttFormat,
  getCurrentMqttSource,
  getMqttSources,
  getNodeState,
  getUnacknowledgedErrorCount,
  isStepControlAvailable,
  sendHomingCommand,
  sendMoveToPositionCommand,
  sendStepCommand,
  sendSwitchOnCommand,
  setStepSize
};
