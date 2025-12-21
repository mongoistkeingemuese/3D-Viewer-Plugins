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

// src/components/IFramePanel.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime());
var IFramePanel = ({
  boundNodes = [],
  globalConfig = {},
  onConfigChange
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: 16, fontFamily: "system-ui", color: "#fff" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 16, padding: 12, background: "rgba(0,150,255,0.1)", borderRadius: 8, borderLeft: "3px solid #00d4ff" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u{1F512} IFrame Plugin" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { margin: "8px 0 0", fontSize: 12, color: "#888" }, children: "Dieses Plugin l\xE4uft in einem isolierten IFrame f\xFCr maximale Sicherheit." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: "#888", marginBottom: 8 }, children: [
        "GEBUNDENE NODES (",
        boundNodes.length,
        ")"
      ] }),
      boundNodes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { color: "#666", fontSize: 13 }, children: "Keine Nodes gebunden" }) : boundNodes.map((node) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: "#888", marginBottom: 8 }, children: "EINSTELLUNGEN" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "flex", alignItems: "center", marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, fontSize: 13 }, children: "Polling Intervall" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { marginLeft: 8, color: "#888", fontSize: 12 }, children: "ms" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "flex", alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, fontSize: 13 }, children: "Theme" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "light", children: "Hell" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "dark", children: "Dunkel" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "auto", children: "Auto" })
            ]
          }
        )
      ] })
    ] })
  ] });
};

// src/components/SettingsPopup.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var SettingsPopup = ({
  nodeId,
  data = {},
  instanceConfig = {},
  onConfigChange,
  onClose
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { padding: 20, fontFamily: "system-ui", color: "#fff", minWidth: 350 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { style: { margin: "0 0 16px" }, children: "Node Settings" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: { color: "#888", fontSize: 12, marginBottom: 16 }, children: nodeId }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: { display: "block", fontSize: 13, marginBottom: 6 }, children: "Datenquelle" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "manual", children: "Manuell" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "mqtt", children: "MQTT" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "http", children: "HTTP" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: { display: "block", fontSize: 13, marginBottom: 6 }, children: "Endpoint/Topic" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { marginBottom: 20 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: { display: "block", fontSize: 13, marginBottom: 6 }, children: "Anzeigemodus" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
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
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "badge", children: "Badge" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "label", children: "Label" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "none", children: "Kein Overlay" })
          ]
        }
      )
    ] }),
    data.value !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: {
      background: "rgba(0,0,0,0.3)",
      padding: 12,
      borderRadius: 6,
      marginBottom: 16
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { fontSize: 12, color: "#888", marginBottom: 4 }, children: "Aktueller Wert" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { fontFamily: "monospace", fontSize: 14 }, children: typeof data.value === "object" ? JSON.stringify(data.value, null, 2) : String(data.value) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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

// src/components/StatusBadgeOverlay.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
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
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: {
      background: "rgba(0,0,0,0.8)",
      padding: "2px 6px",
      borderRadius: 3,
      fontSize: 11,
      fontFamily: "monospace",
      color: "#00d4ff"
    }, children: formatValue(data.value) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: {
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

// src/index.ts
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
