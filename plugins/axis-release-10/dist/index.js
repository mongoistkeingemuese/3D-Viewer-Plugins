var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/react/cjs/react.production.min.js
var require_react_production_min = __commonJS({
  "../../node_modules/react/cjs/react.production.min.js"(exports) {
    "use strict";
    var l = Symbol.for("react.element");
    var n = Symbol.for("react.portal");
    var p = Symbol.for("react.fragment");
    var q = Symbol.for("react.strict_mode");
    var r = Symbol.for("react.profiler");
    var t = Symbol.for("react.provider");
    var u = Symbol.for("react.context");
    var v = Symbol.for("react.forward_ref");
    var w = Symbol.for("react.suspense");
    var x = Symbol.for("react.memo");
    var y = Symbol.for("react.lazy");
    var z = Symbol.iterator;
    function A(a) {
      if (null === a || "object" !== typeof a)
        return null;
      a = z && a[z] || a["@@iterator"];
      return "function" === typeof a ? a : null;
    }
    var B = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } };
    var C = Object.assign;
    var D = {};
    function E(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    E.prototype.isReactComponent = {};
    E.prototype.setState = function(a, b) {
      if ("object" !== typeof a && "function" !== typeof a && null != a)
        throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a, b, "setState");
    };
    E.prototype.forceUpdate = function(a) {
      this.updater.enqueueForceUpdate(this, a, "forceUpdate");
    };
    function F() {
    }
    F.prototype = E.prototype;
    function G(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    var H = G.prototype = new F();
    H.constructor = G;
    C(H, E.prototype);
    H.isPureReactComponent = true;
    var I = Array.isArray;
    var J = Object.prototype.hasOwnProperty;
    var K = { current: null };
    var L = { key: true, ref: true, __self: true, __source: true };
    function M(a, b, e) {
      var d, c = {}, k = null, h = null;
      if (null != b)
        for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b)
          J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
      var g = arguments.length - 2;
      if (1 === g)
        c.children = e;
      else if (1 < g) {
        for (var f = Array(g), m = 0; m < g; m++)
          f[m] = arguments[m + 2];
        c.children = f;
      }
      if (a && a.defaultProps)
        for (d in g = a.defaultProps, g)
          void 0 === c[d] && (c[d] = g[d]);
      return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
    }
    function N(a, b) {
      return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
    }
    function O(a) {
      return "object" === typeof a && null !== a && a.$$typeof === l;
    }
    function escape(a) {
      var b = { "=": "=0", ":": "=2" };
      return "$" + a.replace(/[=:]/g, function(a2) {
        return b[a2];
      });
    }
    var P = /\/+/g;
    function Q(a, b) {
      return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
    }
    function R(a, b, e, d, c) {
      var k = typeof a;
      if ("undefined" === k || "boolean" === k)
        a = null;
      var h = false;
      if (null === a)
        h = true;
      else
        switch (k) {
          case "string":
          case "number":
            h = true;
            break;
          case "object":
            switch (a.$$typeof) {
              case l:
              case n:
                h = true;
            }
        }
      if (h)
        return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
          return a2;
        })) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
      h = 0;
      d = "" === d ? "." : d + ":";
      if (I(a))
        for (var g = 0; g < a.length; g++) {
          k = a[g];
          var f = d + Q(k, g);
          h += R(k, b, e, f, c);
        }
      else if (f = A(a), "function" === typeof f)
        for (a = f.call(a), g = 0; !(k = a.next()).done; )
          k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
      else if ("object" === k)
        throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h;
    }
    function S(a, b, e) {
      if (null == a)
        return a;
      var d = [], c = 0;
      R(a, d, "", "", function(a2) {
        return b.call(e, a2, c++);
      });
      return d;
    }
    function T(a) {
      if (-1 === a._status) {
        var b = a._result;
        b = b();
        b.then(function(b2) {
          if (0 === a._status || -1 === a._status)
            a._status = 1, a._result = b2;
        }, function(b2) {
          if (0 === a._status || -1 === a._status)
            a._status = 2, a._result = b2;
        });
        -1 === a._status && (a._status = 0, a._result = b);
      }
      if (1 === a._status)
        return a._result.default;
      throw a._result;
    }
    var U = { current: null };
    var V = { transition: null };
    var W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
    function X() {
      throw Error("act(...) is not supported in production builds of React.");
    }
    exports.Children = { map: S, forEach: function(a, b, e) {
      S(a, function() {
        b.apply(this, arguments);
      }, e);
    }, count: function(a) {
      var b = 0;
      S(a, function() {
        b++;
      });
      return b;
    }, toArray: function(a) {
      return S(a, function(a2) {
        return a2;
      }) || [];
    }, only: function(a) {
      if (!O(a))
        throw Error("React.Children.only expected to receive a single React element child.");
      return a;
    } };
    exports.Component = E;
    exports.Fragment = p;
    exports.Profiler = r;
    exports.PureComponent = G;
    exports.StrictMode = q;
    exports.Suspense = w;
    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
    exports.act = X;
    exports.cloneElement = function(a, b, e) {
      if (null === a || void 0 === a)
        throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
      var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
      if (null != b) {
        void 0 !== b.ref && (k = b.ref, h = K.current);
        void 0 !== b.key && (c = "" + b.key);
        if (a.type && a.type.defaultProps)
          var g = a.type.defaultProps;
        for (f in b)
          J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
      }
      var f = arguments.length - 2;
      if (1 === f)
        d.children = e;
      else if (1 < f) {
        g = Array(f);
        for (var m = 0; m < f; m++)
          g[m] = arguments[m + 2];
        d.children = g;
      }
      return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
    };
    exports.createContext = function(a) {
      a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
      a.Provider = { $$typeof: t, _context: a };
      return a.Consumer = a;
    };
    exports.createElement = M;
    exports.createFactory = function(a) {
      var b = M.bind(null, a);
      b.type = a;
      return b;
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(a) {
      return { $$typeof: v, render: a };
    };
    exports.isValidElement = O;
    exports.lazy = function(a) {
      return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
    };
    exports.memo = function(a, b) {
      return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
    };
    exports.startTransition = function(a) {
      var b = V.transition;
      V.transition = {};
      try {
        a();
      } finally {
        V.transition = b;
      }
    };
    exports.unstable_act = X;
    exports.useCallback = function(a, b) {
      return U.current.useCallback(a, b);
    };
    exports.useContext = function(a) {
      return U.current.useContext(a);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(a) {
      return U.current.useDeferredValue(a);
    };
    exports.useEffect = function(a, b) {
      return U.current.useEffect(a, b);
    };
    exports.useId = function() {
      return U.current.useId();
    };
    exports.useImperativeHandle = function(a, b, e) {
      return U.current.useImperativeHandle(a, b, e);
    };
    exports.useInsertionEffect = function(a, b) {
      return U.current.useInsertionEffect(a, b);
    };
    exports.useLayoutEffect = function(a, b) {
      return U.current.useLayoutEffect(a, b);
    };
    exports.useMemo = function(a, b) {
      return U.current.useMemo(a, b);
    };
    exports.useReducer = function(a, b, e) {
      return U.current.useReducer(a, b, e);
    };
    exports.useRef = function(a) {
      return U.current.useRef(a);
    };
    exports.useState = function(a) {
      return U.current.useState(a);
    };
    exports.useSyncExternalStore = function(a, b, e) {
      return U.current.useSyncExternalStore(a, b, e);
    };
    exports.useTransition = function() {
      return U.current.useTransition();
    };
    exports.version = "18.3.1";
  }
});

// ../../node_modules/react/index.js
var require_react = __commonJS({
  "../../node_modules/react/index.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_react_production_min();
    } else {
      module.exports = null;
    }
  }
});

// ../../node_modules/react/cjs/react-jsx-runtime.production.min.js
var require_react_jsx_runtime_production_min = __commonJS({
  "../../node_modules/react/cjs/react-jsx-runtime.production.min.js"(exports) {
    "use strict";
    var f = require_react();
    var k = Symbol.for("react.element");
    var l = Symbol.for("react.fragment");
    var m = Object.prototype.hasOwnProperty;
    var n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
    var p = { key: true, ref: true, __self: true, __source: true };
    function q(c, a, g) {
      var b, d = {}, e = null, h = null;
      void 0 !== g && (e = "" + g);
      void 0 !== a.key && (e = "" + a.key);
      void 0 !== a.ref && (h = a.ref);
      for (b in a)
        m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
      if (c && c.defaultProps)
        for (b in a = c.defaultProps, a)
          void 0 === d[b] && (d[b] = a[b]);
      return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
    }
    exports.Fragment = l;
    exports.jsx = q;
    exports.jsxs = q;
  }
});

// ../../node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "../../node_modules/react/jsx-runtime.js"(exports, module) {
    "use strict";
    if (true) {
      module.exports = require_react_jsx_runtime_production_min();
    } else {
      module.exports = null;
    }
  }
});

// src/components/AxisDetailsPopup.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
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
  const [nodeState, setNodeState] = (0, import_react.useState)(() => getNodeState(nodeId));
  const [updateCounter, setUpdateCounter] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    const interval = setInterval(() => {
      const newState = getNodeState(nodeId);
      setNodeState(newState);
      setUpdateCounter((c) => c + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [nodeId]);
  if (!nodeState) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.container, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.error, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "No Data Available" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Node state not found. Please ensure the axis is properly configured." })
    ] }) });
  }
  const handleAcknowledge = (errorIndex) => {
    acknowledgeError(nodeId, errorIndex);
    setUpdateCounter((c) => c + 1);
  };
  const motionStateName = MotionStateNames[nodeState.currentState] || "Unknown";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.container, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.header, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { style: styles.title, children: [
        "Axis: ",
        nodeState.axisName
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.statusBadge, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.statusLabel, children: "Motion State:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: styles.sectionTitle, children: "Position & Velocity" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.dataGrid, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.dataLabel, children: "World Position:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: styles.dataValue, children: [
            nodeState.worldPosition.toFixed(3),
            " units"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.dataLabel, children: "Actual Position:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: styles.dataValue, children: [
            nodeState.position.toFixed(3),
            " units"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.dataLabel, children: "Velocity:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: styles.dataValue, children: [
            nodeState.velocity.toFixed(3),
            " units/s"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.dataRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.dataLabel, children: "Last Update:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.dataValue, children: nodeState.lastUpdate ? nodeState.lastUpdate.toLocaleTimeString() : "Never" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: styles.sectionTitle, children: "Error Log (Last 5)" }),
      nodeState.errors.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.noErrors, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: "32px" }, children: "\u2713" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No errors recorded" })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.errorList, children: nodeState.errors.map((error, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          style: {
            ...styles.errorItem,
            backgroundColor: error.acknowledged ? "#f0f0f0" : "#ffffff",
            borderLeft: `4px solid ${getErrorLevelColor(error.level)}`
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.errorHeader, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "span",
                {
                  style: {
                    ...styles.errorLevel,
                    color: getErrorLevelColor(error.level)
                  },
                  children: error.level
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.errorTime, children: formatTimestamp(error.timestamp) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: styles.errorMessage, children: error.message }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.errorFooter, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: styles.errorSource, children: [
                "Source: ",
                error.source
              ] }),
              !error.acknowledged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
              ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.acknowledgedBadge, children: "\u2713 Acknowledged" })
            ] })
          ]
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.footer, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.footerInfo, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.footerLabel, children: "Node ID:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.footerValue, children: nodeId })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: styles.footerInfo, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.footerLabel, children: "Updates:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: styles.footerValue, children: updateCounter })
      ] })
    ] })
  ] });
};
var styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    height: "100%",
    overflow: "auto",
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
  }
  initialize(ctx) {
    this.ctx = ctx;
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
  const mqttSource = globalConfig.mqttSource || "default";
  const mqtt = getMqttApi(ctx);
  const axisUnsub = mqtt.subscribe(mainTopic, (msg) => {
    logRawMqttMessage(ctx, mainTopic, msg);
    handleAxisData(ctx, nodeId, msg.payload);
  });
  nodeState.subscriptions.push(axisUnsub);
  ctx.log.info("Axis subscription setup - waiting for MQTT messages", {
    nodeId,
    axisName: nodeState.axisName,
    mainTopic,
    mqttSource
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
  const mqttSource = globalConfig.mqttSource || "default";
  const mqtt = getMqttApi(ctx);
  const errorUnsub = mqtt.subscribe(errorTopic, (msg) => {
    handleErrorMessage(ctx, msg.payload);
  });
  pluginState.setErrorSubscription(errorUnsub);
  ctx.log.info("Error subscription setup", { errorTopic, mqttSource });
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
      version: "1.0.0",
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
  getNodeState
};
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
