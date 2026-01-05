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
var GenericStateKeys = {
  [-1]: "state.unknown",
  [0]: "state.idle",
  [1]: "state.executing",
  [2]: "state.done",
  [3]: "state.error",
  [4]: "state.pausing",
  [5]: "state.paused",
  [6]: "state.aborting",
  [7]: "state.aborted",
  [8]: "state.resetting",
  [9]: "state.preparing",
  [10]: "state.initialising"
};
var ValvePositionKeys = {
  [0]: "position.pressureFree",
  [1]: "position.movingToBase",
  [2]: "position.movingToWork",
  [3]: "position.inBase",
  [4]: "position.inWork",
  [5]: "position.undefined"
};
var DefaultTranslations = {
  de: {
    // GenericState
    "state.unknown": "Unbekannt",
    "state.idle": "Bereit",
    "state.executing": "Ausf\xFChren",
    "state.done": "Fertig",
    "state.error": "Fehler",
    "state.pausing": "Pausieren",
    "state.paused": "Pausiert",
    "state.aborting": "Abbrechen",
    "state.aborted": "Abgebrochen",
    "state.resetting": "Zur\xFCcksetzen",
    "state.preparing": "Vorbereiten",
    "state.initialising": "Initialisieren",
    // ValvePosition
    "position.pressureFree": "Drucklos",
    "position.movingToBase": "F\xE4hrt zu GST",
    "position.movingToWork": "F\xE4hrt zu AST",
    "position.inBase": "In GST",
    "position.inWork": "In AST",
    "position.undefined": "Undefiniert",
    // FunctionCommand
    "command.moveToBase": "GST fahren",
    "command.moveToWork": "AST fahren",
    "command.togglePosition": "Position wechseln",
    "command.pressureFree": "Drucklos",
    "command.modeMonostable": "Monostabil",
    "command.modeBistablePulsed": "Bistabil Pulsed",
    "command.modeBistablePermanent": "Bistabil Permanent",
    "command.modeBistableMiddle": "Bistabil Mittelstellung",
    // UI Labels
    "ui.valve": "Ventil",
    "ui.status": "Status",
    "ui.control": "Bedienung",
    "ui.errors": "Fehler",
    "ui.valveStatus": "Ventilstatus",
    "ui.generalStatus": "Allgemeiner Status",
    "ui.specificStatus": "Spezifischer Status",
    "ui.recipe": "Rezept",
    "ui.runtimes": "Laufzeiten",
    "ui.lastBaseToWork": "Letzte Grund \u2192 Arbeit",
    "ui.lastWorkToBase": "Letzte Arbeit \u2192 Grund",
    "ui.lastUpdate": "Letztes Update",
    "ui.mainControl": "Hauptbedienung",
    "ui.operatingMode": "Betriebsmodus",
    "ui.errorMessages": "Fehlermeldungen",
    "ui.open": "offen",
    "ui.acknowledgeAll": "Alle Quittieren",
    "ui.noErrors": "Keine Fehlermeldungen",
    "ui.noDataAvailable": "Keine Daten verf\xFCgbar",
    "ui.nodeStatusNotFound": "Knotenstatus nicht gefunden. Bitte stellen Sie sicher, dass das Ventil korrekt konfiguriert ist.",
    "ui.noFunctionNumber": "Keine Funktionsnummer konfiguriert - Befehle deaktiviert",
    "ui.modeHint": "Hinweis: Modi werden ohne Feedback vom PLC gesendet",
    "ui.sending": "Sende...",
    "ui.moveToWork": "Arbeitsstellung fahren",
    "ui.moveToBase": "Grundstellung fahren",
    "ui.pressureFree": "Drucklos",
    // Notifications
    "notify.noMqttBroker": "Keine MQTT-Broker konfiguriert",
    "notify.sendError": "Fehler beim Senden des Befehls",
    "notify.commandFailed": "Befehl fehlgeschlagen",
    "notify.moveToBaseSent": "GST fahren gesendet",
    "notify.moveToWorkSent": "AST fahren gesendet",
    "notify.togglePositionSent": "Position wechseln gesendet",
    "notify.pressureFreeSent": "Drucklos gesendet",
    "notify.modeMonostable": "Monostabil aktiviert",
    "notify.modeBistablePulsed": "Bistabil Pulsed aktiviert",
    "notify.modeBistablePermanent": "Bistabil Permanent aktiviert",
    "notify.modeBistableMiddle": "Bistabil Mittelstellung aktiviert",
    "notify.errorsAcknowledged": "Fehler quittiert",
    "notify.configureValveName": "Bitte Ventilname f\xFCr {name} konfigurieren",
    "notify.monitoringActive": "Monitoring: {name}",
    "notify.monitoringCommandsDisabled": "Monitoring: {name} (Befehle deaktiviert - keine Funktionsnummer)",
    "notify.mqttBrokerNotFound": 'MQTT Broker "{source}" nicht gefunden',
    "notify.errorAcknowledged": "{name}: Fehler quittiert",
    "notify.errorsAcknowledgedCount": "{name}: {count} Fehler quittiert"
  },
  en: {
    // GenericState
    "state.unknown": "Unknown",
    "state.idle": "Idle",
    "state.executing": "Executing",
    "state.done": "Done",
    "state.error": "Error",
    "state.pausing": "Pausing",
    "state.paused": "Paused",
    "state.aborting": "Aborting",
    "state.aborted": "Aborted",
    "state.resetting": "Resetting",
    "state.preparing": "Preparing",
    "state.initialising": "Initialising",
    // ValvePosition
    "position.pressureFree": "Pressure Free",
    "position.movingToBase": "Moving to Base",
    "position.movingToWork": "Moving to Work",
    "position.inBase": "In Base Position",
    "position.inWork": "In Work Position",
    "position.undefined": "Undefined",
    // FunctionCommand
    "command.moveToBase": "Move to Base",
    "command.moveToWork": "Move to Work",
    "command.togglePosition": "Toggle Position",
    "command.pressureFree": "Pressure Free",
    "command.modeMonostable": "Monostable",
    "command.modeBistablePulsed": "Bistable Pulsed",
    "command.modeBistablePermanent": "Bistable Permanent",
    "command.modeBistableMiddle": "Bistable Middle",
    // UI Labels
    "ui.valve": "Valve",
    "ui.status": "Status",
    "ui.control": "Control",
    "ui.errors": "Errors",
    "ui.valveStatus": "Valve Status",
    "ui.generalStatus": "General Status",
    "ui.specificStatus": "Specific Status",
    "ui.recipe": "Recipe",
    "ui.runtimes": "Runtimes",
    "ui.lastBaseToWork": "Last Base \u2192 Work",
    "ui.lastWorkToBase": "Last Work \u2192 Base",
    "ui.lastUpdate": "Last Update",
    "ui.mainControl": "Main Control",
    "ui.operatingMode": "Operating Mode",
    "ui.errorMessages": "Error Messages",
    "ui.open": "open",
    "ui.acknowledgeAll": "Acknowledge All",
    "ui.noErrors": "No error messages",
    "ui.noDataAvailable": "No data available",
    "ui.nodeStatusNotFound": "Node status not found. Please make sure the valve is configured correctly.",
    "ui.noFunctionNumber": "No function number configured - commands disabled",
    "ui.modeHint": "Note: Modes are sent without PLC feedback",
    "ui.sending": "Sending...",
    "ui.moveToWork": "Move to Work Position",
    "ui.moveToBase": "Move to Base Position",
    "ui.pressureFree": "Pressure Free",
    // Notifications
    "notify.noMqttBroker": "No MQTT broker configured",
    "notify.sendError": "Error sending command",
    "notify.commandFailed": "Command failed",
    "notify.moveToBaseSent": "Move to base sent",
    "notify.moveToWorkSent": "Move to work sent",
    "notify.togglePositionSent": "Toggle position sent",
    "notify.pressureFreeSent": "Pressure free sent",
    "notify.modeMonostable": "Monostable activated",
    "notify.modeBistablePulsed": "Bistable Pulsed activated",
    "notify.modeBistablePermanent": "Bistable Permanent activated",
    "notify.modeBistableMiddle": "Bistable Middle activated",
    "notify.errorsAcknowledged": "Errors acknowledged",
    "notify.configureValveName": "Please configure valve name for {name}",
    "notify.monitoringActive": "Monitoring: {name}",
    "notify.monitoringCommandsDisabled": "Monitoring: {name} (commands disabled - no function number)",
    "notify.mqttBrokerNotFound": 'MQTT Broker "{source}" not found',
    "notify.errorAcknowledged": "{name}: Error acknowledged",
    "notify.errorsAcknowledgedCount": "{name}: {count} errors acknowledged"
  }
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
function parseMqttTimestamp(timestamp) {
  if (!timestamp || timestamp.length !== 16) {
    return Date.now();
  }
  try {
    const fileTime = BigInt(`0x${timestamp}`);
    const unixNs = fileTime - BigInt("116444736000000000");
    const unixMs = Number(unixNs / BigInt(1e4));
    return unixMs;
  } catch {
    return Date.now();
  }
}
function normalizeValveName(name) {
  return name.trim().toLowerCase();
}
function formatDuration(durationMs) {
  if (durationMs === null) {
    return "\u2014";
  }
  return `${(durationMs / 1e3).toFixed(3)} s`;
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

// src/components/ValveDetailsPopup.tsx
function usePluginI18n() {
  const hook = window.usePluginI18n;
  if (hook) {
    return hook();
  }
  return {
    language: "de",
    t: (text) => text,
    getLanguages: () => ["de", "en"],
    formatNumber: (value) => value.toString(),
    formatDate: (date) => new Date(date).toLocaleString()
  };
}
function translateKey(key, language) {
  const translations = DefaultTranslations[language] || DefaultTranslations["de"];
  return translations[key] || key;
}
function getPositionStateColor(state) {
  switch (state) {
    case 3 /* IsInBasePosition */:
    case 4 /* IsInWorkPosition */:
      return "#28a745";
    case 1 /* MovingToBasePosition */:
    case 2 /* MovingToWorkPosition */:
      return "#007bff";
    case 0 /* IsPressureFree */:
      return "#6c757d";
    case 5 /* IsInUndefinedPosition */:
    default:
      return "#ffc107";
  }
}
function getGenericStateColor(state) {
  switch (state) {
    case 3 /* Error */:
      return "#dc3545";
    case 0 /* Idle */:
    case 2 /* Done */:
      return "#28a745";
    case 1 /* Executing */:
    case 8 /* Resetting */:
    case 10 /* Initialising */:
    case 9 /* Preparing */:
      return "#007bff";
    case 4 /* Pausing */:
    case 5 /* Paused */:
    case 6 /* Aborting */:
    case 7 /* Aborted */:
      return "#ffc107";
    default:
      return "#6c757d";
  }
}
var ValveDetailsPopup = ({ data }) => {
  const nodeId = data?.nodeId;
  const i18n = usePluginI18n();
  const t = (key) => translateKey(key, i18n.language);
  const [nodeState, setNodeState] = useState(() => getNodeState(nodeId));
  const [updateCounter, setUpdateCounter] = useState(0);
  const [activeTab, setActiveTab] = useState("status");
  const [mqttFormat, setMqttFormat] = useState(() => getCurrentMqttFormat());
  const [selectedErrorIdx, setSelectedErrorIdx] = useState(null);
  const [isLoadingGst, setIsLoadingGst] = useState(false);
  const [isLoadingAst, setIsLoadingAst] = useState(false);
  const [isLoadingPressureFree, setIsLoadingPressureFree] = useState(false);
  const [isLoadingMode, setIsLoadingMode] = useState(null);
  useEffect(() => {
    const interval = setInterval(() => {
      const newState = getNodeState(nodeId);
      setNodeState(newState);
      setMqttFormat(getCurrentMqttFormat());
      setUpdateCounter((c) => c + 1);
    }, 250);
    return () => clearInterval(interval);
  }, [nodeId]);
  if (!nodeState) {
    return /* @__PURE__ */ jsx("div", { style: styles.container, children: /* @__PURE__ */ jsxs("div", { style: styles.error, children: [
      /* @__PURE__ */ jsx("h3", { children: t("ui.noDataAvailable") }),
      /* @__PURE__ */ jsx("p", { children: t("ui.nodeStatusNotFound") })
    ] }) });
  }
  const handleMoveToGst = async () => {
    setIsLoadingGst(true);
    await sendMoveToBase(nodeId);
    setIsLoadingGst(false);
  };
  const handleMoveToAst = async () => {
    setIsLoadingAst(true);
    await sendMoveToWork(nodeId);
    setIsLoadingAst(false);
  };
  const handlePressureFree = async () => {
    setIsLoadingPressureFree(true);
    await sendPressureFree(nodeId);
    setIsLoadingPressureFree(false);
  };
  const handleModeChange = async (mode, sendFn) => {
    setIsLoadingMode(mode);
    await sendFn(nodeId);
    setIsLoadingMode(null);
  };
  const positionKey = ValvePositionKeys[nodeState.specificState] || "position.undefined";
  const genericKey = GenericStateKeys[nodeState.genericState] || "state.unknown";
  const positionStateName = translateKey(positionKey, i18n.language);
  const genericStateName = translateKey(genericKey, i18n.language);
  const unacknowledgedCount = getUnacknowledgedErrorCount(nodeId);
  return /* @__PURE__ */ jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.statusRow, children: [
      /* @__PURE__ */ jsx("span", { style: styles.formatLabel, children: mqttFormat }),
      /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            ...styles.statusBadge,
            backgroundColor: getPositionStateColor(nodeState.specificState)
          },
          children: positionStateName
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.tabContainer, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("status"),
          style: {
            ...styles.tabButton,
            ...activeTab === "status" ? styles.tabButtonActive : {}
          },
          children: t("ui.status")
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("control"),
          style: {
            ...styles.tabButton,
            ...activeTab === "control" ? styles.tabButtonActive : {}
          },
          children: t("ui.control")
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
            t("ui.errors"),
            unacknowledgedCount > 0 && /* @__PURE__ */ jsx("span", { style: styles.errorBadge, children: unacknowledgedCount })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.tabContent, children: [
      activeTab === "status" && /* @__PURE__ */ jsxs(Fragment2, { children: [
        /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
          /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: t("ui.valveStatus") }),
          /* @__PURE__ */ jsxs("div", { style: styles.dataGrid, children: [
            /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
              /* @__PURE__ */ jsxs("span", { style: styles.dataLabel, children: [
                t("ui.generalStatus"),
                ":"
              ] }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    ...styles.dataValue,
                    color: getGenericStateColor(nodeState.genericState),
                    fontWeight: "bold"
                  },
                  children: genericStateName
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
              /* @__PURE__ */ jsxs("span", { style: styles.dataLabel, children: [
                t("ui.specificStatus"),
                ":"
              ] }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    ...styles.dataValue,
                    color: getPositionStateColor(nodeState.specificState),
                    fontWeight: "bold"
                  },
                  children: positionStateName
                }
              )
            ] }),
            nodeState.recipe > 0 && /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
              /* @__PURE__ */ jsxs("span", { style: styles.dataLabel, children: [
                t("ui.recipe"),
                ":"
              ] }),
              /* @__PURE__ */ jsx("span", { style: styles.dataValue, children: nodeState.recipe })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
          /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: t("ui.runtimes") }),
          /* @__PURE__ */ jsxs("div", { style: styles.dataGrid, children: [
            /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
              /* @__PURE__ */ jsxs("span", { style: styles.dataLabel, children: [
                t("ui.lastBaseToWork"),
                ":"
              ] }),
              /* @__PURE__ */ jsx("span", { style: styles.dataValue, children: formatDuration(nodeState.lastDurationGstToAst) })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
              /* @__PURE__ */ jsxs("span", { style: styles.dataLabel, children: [
                t("ui.lastWorkToBase"),
                ":"
              ] }),
              /* @__PURE__ */ jsx("span", { style: styles.dataValue, children: formatDuration(nodeState.lastDurationAstToGst) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { style: styles.section, children: /* @__PURE__ */ jsxs("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ jsxs("span", { style: styles.dataLabel, children: [
            t("ui.lastUpdate"),
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { style: styles.dataValue, children: formatTime(nodeState.lastUpdate) })
        ] }) })
      ] }),
      activeTab === "control" && /* @__PURE__ */ jsxs(Fragment2, { children: [
        !nodeState.functionNo && /* @__PURE__ */ jsx("div", { style: styles.section, children: /* @__PURE__ */ jsx("div", { style: styles.warningBox, children: t("ui.noFunctionNumber") }) }),
        /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
          /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: t("ui.mainControl") }),
          /* @__PURE__ */ jsxs("div", { style: styles.controlGrid, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleMoveToAst,
                disabled: isLoadingAst || !nodeState.functionNo,
                style: {
                  ...styles.controlButton,
                  backgroundColor: "#28a745",
                  opacity: !nodeState.functionNo ? 0.5 : 1
                },
                children: isLoadingAst ? t("ui.sending") : t("ui.moveToWork")
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleMoveToGst,
                disabled: isLoadingGst || !nodeState.functionNo,
                style: {
                  ...styles.controlButton,
                  backgroundColor: "#007bff",
                  opacity: !nodeState.functionNo ? 0.5 : 1
                },
                children: isLoadingGst ? t("ui.sending") : t("ui.moveToBase")
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handlePressureFree,
                disabled: isLoadingPressureFree || !nodeState.functionNo,
                style: {
                  ...styles.controlButton,
                  backgroundColor: "#6c757d",
                  opacity: !nodeState.functionNo ? 0.5 : 1
                },
                children: isLoadingPressureFree ? t("ui.sending") : t("ui.pressureFree")
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
          /* @__PURE__ */ jsx("h3", { style: styles.sectionTitle, children: t("ui.operatingMode") }),
          /* @__PURE__ */ jsxs("div", { style: styles.modeGrid, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleModeChange("mono", sendModeMonostable),
                disabled: isLoadingMode !== null || !nodeState.functionNo,
                style: {
                  ...styles.modeButton,
                  ...isLoadingMode === "mono" ? styles.modeButtonLoading : {},
                  opacity: !nodeState.functionNo ? 0.5 : 1
                },
                children: isLoadingMode === "mono" ? "..." : "Mono"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleModeChange("biPuls", sendModeBistablePulsed),
                disabled: isLoadingMode !== null || !nodeState.functionNo,
                style: {
                  ...styles.modeButton,
                  ...isLoadingMode === "biPuls" ? styles.modeButtonLoading : {},
                  opacity: !nodeState.functionNo ? 0.5 : 1
                },
                children: isLoadingMode === "biPuls" ? "..." : "BiPuls"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleModeChange("biPerm", sendModeBistablePermanent),
                disabled: isLoadingMode !== null || !nodeState.functionNo,
                style: {
                  ...styles.modeButton,
                  ...isLoadingMode === "biPerm" ? styles.modeButtonLoading : {},
                  opacity: !nodeState.functionNo ? 0.5 : 1
                },
                children: isLoadingMode === "biPerm" ? "..." : "BiPerm"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleModeChange("biMitte", sendModeBistableMiddle),
                disabled: isLoadingMode !== null || !nodeState.functionNo,
                style: {
                  ...styles.modeButton,
                  ...isLoadingMode === "biMitte" ? styles.modeButtonLoading : {},
                  opacity: !nodeState.functionNo ? 0.5 : 1
                },
                children: isLoadingMode === "biMitte" ? "..." : "BiMitte"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { style: styles.modeHint, children: t("ui.modeHint") })
        ] })
      ] }),
      activeTab === "errors" && /* @__PURE__ */ jsxs("div", { style: styles.section, children: [
        /* @__PURE__ */ jsxs("h3", { style: styles.sectionTitle, children: [
          t("ui.errorMessages"),
          " (",
          nodeState.errors.length,
          ") - ",
          unacknowledgedCount,
          " ",
          t("ui.open")
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
              t("ui.acknowledgeAll"),
              " (",
              unacknowledgedCount,
              ")"
            ]
          }
        ),
        nodeState.errors.length === 0 ? /* @__PURE__ */ jsx("pre", { style: { color: "#28a745", padding: "20px", textAlign: "center", margin: 0 }, children: t("ui.noErrors") }) : /* @__PURE__ */ jsxs(Fragment2, { children: [
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
          selectedErrorIdx !== null && nodeState.errors[selectedErrorIdx] && /* @__PURE__ */ jsx("pre", { style: {
            margin: 0,
            padding: "10px",
            backgroundColor: "#1a1a1a",
            color: "#0f0",
            fontSize: "11px",
            fontFamily: "Consolas, Monaco, monospace",
            borderRadius: "4px",
            border: "2px solid #dc3545",
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
          })() })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.footer, children: [
      /* @__PURE__ */ jsxs("div", { style: styles.footerInfo, children: [
        /* @__PURE__ */ jsx("span", { style: styles.footerLabel, children: "Node ID:" }),
        /* @__PURE__ */ jsx("span", { style: styles.footerValue, children: nodeId })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.footerInfo, children: [
        /* @__PURE__ */ jsx("span", { style: styles.footerLabel, children: "FunctionNo:" }),
        /* @__PURE__ */ jsx("span", { style: styles.footerValue, children: nodeState.functionNo })
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
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px"
  },
  formatLabel: {
    fontSize: "11px",
    color: "#fff",
    backgroundColor: "#6c757d",
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: "bold"
  },
  statusBadge: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "12px"
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
  warningBox: {
    padding: "12px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "4px",
    color: "#856404",
    fontSize: "13px",
    textAlign: "center"
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
  controlGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  controlButton: {
    padding: "14px 20px",
    border: "none",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#fff",
    cursor: "pointer",
    transition: "opacity 0.2s"
  },
  modeGrid: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  modeButton: {
    flex: 1,
    minWidth: "80px",
    padding: "10px 12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "bold",
    backgroundColor: "#fff",
    color: "#495057",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  modeButtonLoading: {
    backgroundColor: "#007bff",
    color: "#fff",
    borderColor: "#007bff"
  },
  modeHint: {
    marginTop: "10px",
    fontSize: "11px",
    color: "#6c757d",
    fontStyle: "italic"
  },
  noErrors: {
    textAlign: "center",
    padding: "20px",
    color: "#28a745"
  },
  errorSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    paddingBottom: "6px",
    borderBottom: "1px solid #eee"
  },
  ackAllButton: {
    padding: "6px 12px",
    backgroundColor: "#28a745",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  errorList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  errorItem: {
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    overflow: "hidden"
  },
  errorDropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.15s"
  },
  errorHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    minWidth: 0
  },
  errorHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0
  },
  expandIcon: {
    fontSize: "10px",
    color: "#666",
    width: "12px"
  },
  errorLevelBadge: {
    fontSize: "10px",
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "3px",
    flexShrink: 0
  },
  errorNumber: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#333",
    fontFamily: "monospace",
    flexShrink: 0
  },
  errorMessagePreview: {
    fontSize: "12px",
    color: "#333",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
    minWidth: 0
  },
  errorTime: {
    fontSize: "11px",
    color: "#666",
    flexShrink: 0
  },
  ackButtonSmall: {
    width: "24px",
    height: "24px",
    padding: 0,
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  acknowledgedIcon: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#28a745",
    fontSize: "14px"
  },
  errorExpandedContent: {
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #dee2e6"
  },
  errorDetailSection: {
    marginBottom: "12px"
  },
  errorDetailLabel: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#666",
    marginBottom: "4px",
    textTransform: "uppercase"
  },
  errorDetailValue: {
    fontSize: "13px",
    color: "#212529",
    lineHeight: "1.4",
    wordBreak: "break-word"
  },
  errorPayload: {
    fontSize: "11px",
    fontFamily: "monospace",
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
    padding: "12px",
    borderRadius: "4px",
    overflow: "auto",
    maxHeight: "200px",
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word"
  },
  errorActions: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #dee2e6"
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
  errorMessage: {
    fontSize: "14px",
    color: "#212529",
    marginBottom: "8px",
    marginTop: "8px",
    lineHeight: "1.4",
    fontWeight: "normal",
    padding: "8px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    wordBreak: "break-word"
  },
  errorValues: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "6px",
    padding: "4px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px"
  },
  errorValueItem: {
    fontSize: "11px",
    color: "#555",
    backgroundColor: "#e9ecef",
    padding: "2px 6px",
    borderRadius: "3px",
    fontFamily: "monospace"
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
    color: "#dc3545"
  }
};

// src/index.ts
function getPositionName(position) {
  const key = ValvePositionKeys[position] || "position.undefined";
  return DefaultTranslations.en[key] || key;
}
function getCurrentLanguage() {
  try {
    const hostI18n = window.__i18n__ || window.i18n;
    if (hostI18n?.language) {
      return hostI18n.language.split("-")[0];
    }
  } catch {
  }
  const stored = localStorage.getItem("i18n_language");
  return stored || "de";
}
function translateNotify(key, params) {
  const lang = getCurrentLanguage();
  const translations = DefaultTranslations[lang] || DefaultTranslations["de"];
  let text = translations[key] || key;
  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${param}\\}`, "g"), String(value));
    }
  }
  return text;
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
  hasErrorSubscription() {
    return this.errorSubscription !== null;
  }
  getContext() {
    if (!this.ctx)
      throw new Error("Plugin not initialized");
    return this.ctx;
  }
  addNode(nodeId, valveName, functionNo) {
    const state = {
      nodeId,
      valveName,
      functionNo,
      subscriptions: [],
      genericState: 0 /* Idle */,
      specificState: 5 /* IsInUndefinedPosition */,
      previousSpecificState: 5 /* IsInUndefinedPosition */,
      recipe: 0,
      moveStartTimestamp: null,
      lastDurationGstToAst: null,
      lastDurationAstToGst: null,
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
function getMqttFormat(ctx) {
  const globalConfig = ctx.config.global.getAll();
  return globalConfig.mqttFormat || "release10";
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
      ctx.ui.notify(translateNotify("notify.mqttBrokerNotFound", { source: mqttSource }), "warning");
    }
    return ctx.mqtt.withSource(mqttSource);
  }
  return ctx.mqtt;
}
function getAstPosition(ctx, nodeId) {
  const config = ctx.config.instance.getForNode(nodeId);
  return {
    x: config.astPosX || 0,
    y: config.astPosY || 0,
    z: config.astPosZ || 0,
    rotX: config.astRotX || 0,
    rotY: config.astRotY || 0,
    rotZ: config.astRotZ || 0
  };
}
function updateNodePosition(ctx, nodeId, position) {
  const node = ctx.nodes.get(nodeId);
  if (!node)
    return;
  const config = ctx.config.instance.getForNode(nodeId);
  const astPos = getAstPosition(ctx, nodeId);
  let duration;
  let targetPosition;
  let targetRotation;
  switch (position) {
    case 1 /* MovingToBasePosition */:
    case 3 /* IsInBasePosition */:
      targetPosition = { x: 0, y: 0, z: 0 };
      targetRotation = { x: 0, y: 0, z: 0 };
      duration = config.durationMoveGST || 500;
      break;
    case 2 /* MovingToWorkPosition */:
    case 4 /* IsInWorkPosition */:
      targetPosition = { x: astPos.x, y: astPos.y, z: astPos.z };
      targetRotation = { x: astPos.rotX, y: astPos.rotY, z: astPos.rotZ };
      duration = config.durationMoveAST || 500;
      break;
    default:
      return;
  }
  node.position = targetPosition;
  node.rotation = targetRotation;
  node.duration = duration;
  ctx.log.debug("Node position updated", {
    nodeId,
    position,
    targetPosition,
    targetRotation,
    duration
  });
}
function updateNodeVisuals(ctx, nodeId, genericState, specificState) {
  const node = ctx.nodes.get(nodeId);
  if (!node)
    return;
  const globalConfig = ctx.config.global.getAll();
  const highlightColor = globalConfig.highlightColor || "#00aaff";
  const errorColor = globalConfig.errorColor || "#ff0000";
  const intensity = globalConfig.highlightIntensity || 0.6;
  const nodeState = pluginState.getNode(nodeId);
  const hasUnacknowledgedErrors = nodeState?.errors.some((e) => !e.acknowledged) ?? false;
  if (hasUnacknowledgedErrors || genericState === 3 /* Error */) {
    node.emissive = errorColor;
    node.emissiveIntensity = 1;
    return;
  }
  node.emissive = "#000000";
  node.emissiveIntensity = 0;
  if (specificState === 1 /* MovingToBasePosition */ || specificState === 2 /* MovingToWorkPosition */) {
    node.emissive = highlightColor;
    node.emissiveIntensity = intensity;
  }
}
function handleValveData(ctx, nodeId, rawPayload) {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState)
    return;
  try {
    let parsedPayload;
    if (typeof rawPayload === "string") {
      parsedPayload = JSON.parse(rawPayload);
    } else {
      parsedPayload = rawPayload;
    }
    if (!parsedPayload.pack || parsedPayload.pack.length === 0) {
      return;
    }
    for (const packItem of parsedPayload.pack) {
      const valveData = packItem.Valve;
      if (!valveData)
        continue;
      const incomingValveName = normalizeValveName(valveData.name);
      const expectedValveName = normalizeValveName(nodeState.valveName);
      if (incomingValveName !== expectedValveName)
        continue;
      const genericState = hexToInt(valveData.gS.val);
      const specificState = hexToInt(valveData.sS.val);
      const recipe = valveData.recipe ? hexToInt(valveData.recipe.val) : 0;
      const timestamp = parseMqttTimestamp(packItem.t);
      const previousState = nodeState.specificState;
      if ((specificState === 1 /* MovingToBasePosition */ || specificState === 2 /* MovingToWorkPosition */) && previousState !== specificState) {
        nodeState.moveStartTimestamp = timestamp;
        ctx.log.info("Movement started", {
          nodeId,
          previousState,
          previousStateName: getPositionName(previousState),
          specificState,
          specificStateName: getPositionName(specificState),
          startTimestamp: timestamp
        });
      } else if ((specificState === 3 /* IsInBasePosition */ || specificState === 4 /* IsInWorkPosition */) && nodeState.moveStartTimestamp !== null) {
        const duration = timestamp - nodeState.moveStartTimestamp;
        ctx.log.info("Movement completed - calculating duration", {
          nodeId,
          previousState,
          previousStateName: getPositionName(previousState),
          specificState,
          specificStateName: getPositionName(specificState),
          startTimestamp: nodeState.moveStartTimestamp,
          endTimestamp: timestamp,
          durationMs: duration
        });
        if (previousState === 2 /* MovingToWorkPosition */) {
          nodeState.lastDurationGstToAst = duration;
          ctx.log.info("GST\u2192AST duration stored", {
            nodeId,
            durationMs: duration,
            durationSec: duration / 1e3
          });
        } else if (previousState === 1 /* MovingToBasePosition */) {
          nodeState.lastDurationAstToGst = duration;
          ctx.log.info("AST\u2192GST duration stored", {
            nodeId,
            durationMs: duration,
            durationSec: duration / 1e3
          });
        } else {
          ctx.log.warn("Duration calculated but previousState not a moving state", {
            nodeId,
            previousState,
            previousStateName: getPositionName(previousState),
            durationMs: duration
          });
        }
        nodeState.moveStartTimestamp = null;
      }
      nodeState.previousSpecificState = previousState;
      nodeState.genericState = genericState;
      nodeState.specificState = specificState;
      nodeState.recipe = recipe;
      nodeState.lastUpdate = /* @__PURE__ */ new Date();
      updateNodeVisuals(ctx, nodeId, genericState, specificState);
      updateNodePosition(ctx, nodeId, specificState);
      ctx.log.debug("Valve data updated", {
        nodeId,
        valveName: incomingValveName,
        genericState,
        specificState,
        recipe
      });
      return;
    }
  } catch (error) {
    ctx.log.error("Failed to process valve data", { nodeId, error });
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
    const source = normalizeValveName(payload.src || "");
    const allNodes = pluginState.getAllNodes();
    allNodes.forEach((nodeState) => {
      const expectedValveName = normalizeValveName(nodeState.valveName);
      if (source === expectedValveName) {
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
          ctx.log.error(`[${nodeState.valveName}] ${msgText}`, {
            nodeId: nodeState.nodeId,
            nodeName: nodeState.valveName,
            payload
          });
          nodeState.genericState = 3 /* Error */;
          updateNodeVisuals(ctx, nodeState.nodeId, 3 /* Error */, nodeState.specificState);
          ctx.ui.notify(`Error: ${nodeState.valveName} - ${msgText}`, "error");
        } else if (payload.lvl === "WARN") {
          ctx.log.warn(`[${nodeState.valveName}] ${msgText}`, {
            nodeId: nodeState.nodeId,
            nodeName: nodeState.valveName,
            payload
          });
          ctx.ui.notify(`Warning: ${nodeState.valveName} - ${msgText}`, "warning");
        } else {
          ctx.log.info(`[${nodeState.valveName}] ${msgText}`, {
            nodeId: nodeState.nodeId,
            nodeName: nodeState.valveName,
            payload
          });
        }
      }
    });
  } catch (error) {
    ctx.log.error("Failed to process error message", { error });
  }
}
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
function setupSubscriptions(ctx, nodeId) {
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState)
    return;
  const globalConfig = ctx.config.global.getAll();
  const mainTopic = globalConfig.mainTopic || "machine/valves";
  const mqtt = getMqttApi(ctx);
  const availableSources = ctx.mqtt.getSources();
  if (availableSources.length === 0) {
    ctx.log.error("No MQTT sources available", { nodeId });
    ctx.ui.notify(translateNotify("notify.noMqttBroker"), "error");
    return;
  }
  ctx.log.info("Setting up valve subscription", { nodeId, mainTopic });
  const valveUnsub = mqtt.subscribe(mainTopic, (msg) => {
    handleValveData(ctx, nodeId, msg.payload);
  });
  nodeState.subscriptions.push(valveUnsub);
}
async function sendValveCommand(nodeId, functionCommand) {
  const ctx = pluginState.getContext();
  const nodeState = pluginState.getNode(nodeId);
  if (!nodeState) {
    ctx.log.error("Node state not found for valve command", { nodeId });
    return false;
  }
  const globalConfig = ctx.config.global.getAll();
  const httpBaseUrl = globalConfig.httpBaseUrl || "http://localhost:3021";
  const url = `${httpBaseUrl}/v1/commands/functioncall`;
  const payload = {
    functionNo: nodeState.functionNo,
    functionCommand,
    functionInvokerCommand: "Start",
    inputs: []
  };
  try {
    ctx.log.info("Sending valve command", {
      nodeId,
      valveName: nodeState.valveName,
      functionNo: nodeState.functionNo,
      functionCommand,
      url
    });
    const response = await ctx.http.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*"
      }
    });
    if (response.status >= 200 && response.status < 300) {
      ctx.log.info("Valve command sent successfully", {
        nodeId,
        functionCommand,
        status: response.status
      });
      return true;
    } else {
      ctx.log.error("Valve command failed", {
        nodeId,
        status: response.status,
        statusText: response.statusText
      });
      ctx.ui.notify(`${translateNotify("notify.commandFailed")}: ${response.statusText}`, "error");
      return false;
    }
  } catch (error) {
    ctx.log.error("Valve command error", { nodeId, error });
    ctx.ui.notify(translateNotify("notify.sendError"), "error");
    return false;
  }
}
async function sendMoveToBase(nodeId) {
  const result = await sendValveCommand(nodeId, 0 /* MoveToBasePosition */);
  if (result) {
    pluginState.getContext().ui.notify(translateNotify("notify.moveToBaseSent"), "success");
  }
  return result;
}
async function sendMoveToWork(nodeId) {
  const result = await sendValveCommand(nodeId, 1 /* MoveToWorkPosition */);
  if (result) {
    pluginState.getContext().ui.notify(translateNotify("notify.moveToWorkSent"), "success");
  }
  return result;
}
async function sendTogglePosition(nodeId) {
  const result = await sendValveCommand(nodeId, 2 /* TogglePosition */);
  if (result) {
    pluginState.getContext().ui.notify(translateNotify("notify.togglePositionSent"), "success");
  }
  return result;
}
async function sendPressureFree(nodeId) {
  const result = await sendValveCommand(nodeId, 3 /* SwitchToPressureFree */);
  if (result) {
    pluginState.getContext().ui.notify(translateNotify("notify.pressureFreeSent"), "success");
  }
  return result;
}
async function sendModeMonostable(nodeId) {
  const result = await sendValveCommand(nodeId, 50 /* SwitchToOptionMonostable */);
  if (result) {
    pluginState.getContext().ui.notify(translateNotify("notify.modeMonostable"), "success");
  }
  return result;
}
async function sendModeBistablePulsed(nodeId) {
  const result = await sendValveCommand(nodeId, 51 /* SwitchToOptionBistablePulsed */);
  if (result) {
    pluginState.getContext().ui.notify(translateNotify("notify.modeBistablePulsed"), "success");
  }
  return result;
}
async function sendModeBistablePermanent(nodeId) {
  const result = await sendValveCommand(nodeId, 52 /* SwitchToOptionBistablePermanent */);
  if (result) {
    pluginState.getContext().ui.notify(translateNotify("notify.modeBistablePermanent"), "success");
  }
  return result;
}
async function sendModeBistableMiddle(nodeId) {
  const result = await sendValveCommand(nodeId, 53 /* SwitchToOptionBistableMiddlePositionOpen */);
  if (result) {
    pluginState.getContext().ui.notify(translateNotify("notify.modeBistableMiddle"), "success");
  }
  return result;
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
    valveName: nodeState.valveName,
    errorIndex,
    level: error.level,
    acknowledgedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  const hasUnacknowledgedErrors = nodeState.errors.some((e) => !e.acknowledged);
  if (!hasUnacknowledgedErrors && nodeState.genericState === 3 /* Error */) {
    nodeState.genericState = 0 /* Idle */;
    updateNodeVisuals(ctx, nodeId, 0 /* Idle */, nodeState.specificState);
    ctx.log.info("Node error state reset after acknowledgement", {
      nodeId,
      valveName: nodeState.valveName
    });
    ctx.ui.notify(translateNotify("notify.errorAcknowledged", { name: nodeState.valveName }), "success");
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
    valveName: nodeState.valveName,
    count: errorCount,
    acknowledgedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  nodeState.errors = [];
  nodeState.genericState = 0 /* Idle */;
  updateNodeVisuals(ctx, nodeId, 0 /* Idle */, nodeState.specificState);
  ctx.log.info("Node state reset after acknowledgement", {
    nodeId,
    valveName: nodeState.valveName,
    newState: "Idle"
  });
  ctx.ui.notify(translateNotify("notify.errorsAcknowledgedCount", { name: nodeState.valveName, count: errorCount }), "success");
}
function getNodeState(nodeId) {
  return pluginState.getNode(nodeId);
}
function getMqttSources() {
  return pluginState.getMqttSources();
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
    ValveDetailsPopup
  },
  onLoad(ctx) {
    pluginState.initialize(ctx);
    ctx.log.info("Valve Plugin loaded", {
      pluginId: ctx.pluginId
    });
    setupGlobalErrorSubscription(ctx);
    ctx.events.on("context-menu-action", (data) => {
      const event = data;
      if (event.action === "show-valve-details") {
        ctx.ui.showPopup("ValveDetails", {
          title: "Valve Details",
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
            if (hasUnacknowledged && nodeState.genericState === 3 /* Error */) {
              nodeState.genericState = 0 /* Idle */;
              updateNodeVisuals(ctx, entry.nodeId, 0 /* Idle */, nodeState.specificState);
              ctx.log.info("Node error state reset via Viewer Log acknowledgement", {
                nodeId: entry.nodeId,
                valveName: nodeState.valveName
              });
            }
          }
        }
      });
    });
  },
  onNodeBound(ctx, node) {
    const config = ctx.config.instance.getForNode(node.id);
    const valveName = config.valveName;
    const functionNo = config.functionNo || 0;
    if (!valveName) {
      ctx.log.warn(`No valve name configured for node ${node.id}`);
      ctx.ui.notify(translateNotify("notify.configureValveName", { name: node.name }), "warning");
      return;
    }
    ctx.log.info(
      `Node bound: ${node.name} (${node.id}) -> Valve: ${valveName}, FunctionNo: ${functionNo || "not set"}`
    );
    pluginState.addNode(node.id, valveName, functionNo);
    setupSubscriptions(ctx, node.id);
    if (!functionNo) {
      ctx.ui.notify(translateNotify("notify.monitoringCommandsDisabled", { name: valveName }), "warning");
    } else {
      ctx.ui.notify(translateNotify("notify.monitoringActive", { name: valveName }), "success");
    }
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
      if (key === "valveName" || key === "functionNo") {
        const config = ctx.config.instance.getForNode(nodeId);
        const newValveName = config.valveName;
        const newFunctionNo = config.functionNo;
        if (newValveName && newFunctionNo) {
          pluginState.removeNode(nodeId);
          pluginState.addNode(nodeId, newValveName, newFunctionNo);
          setupSubscriptions(ctx, nodeId);
          ctx.log.info(
            `Config updated for ${nodeId}: ${newValveName}, FunctionNo: ${newFunctionNo}`
          );
        }
      }
    }
    if (type === "global" && (key === "highlightColor" || key === "errorColor")) {
      pluginState.getAllNodes().forEach((nodeState) => {
        updateNodeVisuals(
          ctx,
          nodeState.nodeId,
          nodeState.genericState,
          nodeState.specificState
        );
      });
    }
  },
  onUnload(ctx) {
    ctx.log.info("Valve Plugin unloading...");
    pluginState.cleanup();
    ctx.log.info("Valve Plugin unloaded");
  }
};
var src_default = plugin;
export {
  acknowledgeAllErrors,
  acknowledgeError,
  src_default as default,
  getCurrentMqttFormat,
  getMqttSources,
  getNodeState,
  getUnacknowledgedErrorCount,
  sendModeBistableMiddle,
  sendModeBistablePermanent,
  sendModeBistablePulsed,
  sendModeMonostable,
  sendMoveToBase,
  sendMoveToWork,
  sendPressureFree,
  sendTogglePosition
};
