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

// src/components/ControlPanel.tsx
var import_react = __toESM(require_react());
var import_jsx_runtime = __toESM(require_jsx_runtime());
var ControlPanel = ({
  pluginId: _pluginId,
  boundNodes = [],
  globalConfig = {},
  onConfigChange
}) => {
  const [selectedNode, setSelectedNode] = (0, import_react.useState)(null);
  const handleRefreshIntervalChange = (0, import_react.useCallback)(
    (e) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && onConfigChange) {
        onConfigChange("refreshInterval", value);
      }
    },
    [onConfigChange]
  );
  const handleColorChange = (0, import_react.useCallback)(
    (e) => {
      if (onConfigChange) {
        onConfigChange("defaultColor", e.target.value);
      }
    },
    [onConfigChange]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "blueprint-control-panel", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "section-title", children: "\xDCbersicht" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "stat-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "stat-value", children: boundNodes.length }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "stat-label", children: "Nodes" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "stat-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "stat-value", children: globalConfig.refreshInterval ? `${globalConfig.refreshInterval / 1e3}s` : "-" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "stat-label", children: "Intervall" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "section-title", children: [
        "Gebundene Nodes (",
        boundNodes.length,
        ")"
      ] }),
      boundNodes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "empty-state", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "empty-state-icon", children: "\u{1F527}" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "empty-state-text", children: [
          "Keine Nodes gebunden.",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
          "Klicke auf einen Node und w\xE4hle dieses Plugin."
        ] })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "node-list", children: boundNodes.map((node) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "li",
        {
          className: `node-item ${selectedNode === node.id ? "selected" : ""}`,
          onClick: () => setSelectedNode(node.id === selectedNode ? null : node.id),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "node-icon", children: "\u{1F4E6}" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "node-name", children: node.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "node-status" })
          ]
        },
        node.id
      )) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "section-title", children: "Globale Einstellungen" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "config-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "config-label", children: "Aktualisierung" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { marginLeft: 8, color: "#888", fontSize: 12 }, children: "ms" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "config-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "config-label", children: "Standard-Farbe" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "color",
            className: "color-input",
            value: globalConfig.defaultColor || "#00ff00",
            onChange: handleColorChange
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "config-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "config-label", children: "Animationen" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var NodeDetailsPopup = ({
  nodeId,
  nodeName,
  data = {},
  onClose
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "node-details-popup", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("style", { children: `
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
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { className: "close-btn", onClick: onClose, children: "\xD7" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "popup-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "popup-icon", children: "\u{1F4E6}" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "popup-title", children: nodeName }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "popup-subtitle", children: nodeId })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "detail-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "detail-label", children: "Binding" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "detail-value", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "binding-badge", children: data.bindingType || "Keines" }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "detail-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "detail-label", children: "Letztes Update" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "detail-value mono", children: data.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString() : "-" })
    ] }),
    data.lastValue !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "detail-label", style: { marginTop: 12 }, children: "Aktueller Wert" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "value-preview", children: typeof data.lastValue === "object" ? JSON.stringify(data.lastValue, null, 2) : String(data.lastValue) })
    ] })
  ] });
};

// src/components/BindingConfigPopup.tsx
var import_react2 = __toESM(require_react());
var import_jsx_runtime3 = __toESM(require_jsx_runtime());
var BindingConfigPopup = ({
  nodeId,
  nodeName,
  instanceConfig = {},
  globalConfig = {},
  onConfigChange,
  onClose
}) => {
  const [bindingType, setBindingType] = (0, import_react2.useState)(
    instanceConfig.bindingType || "none"
  );
  const handleBindingTypeChange = (0, import_react2.useCallback)(
    (e) => {
      const value = e.target.value;
      setBindingType(value);
      onConfigChange?.("bindingType", value);
    },
    [onConfigChange]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "binding-config-popup", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("style", { children: `
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
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "popup-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "popup-title", children: "Binding konfigurieren" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "popup-subtitle", children: [
        nodeName,
        " (",
        nodeId,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "form-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "form-label", children: "Binding-Typ" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "select",
        {
          className: "form-select",
          value: bindingType,
          onChange: handleBindingTypeChange,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "none", children: "Kein Binding" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "mqtt", children: "MQTT" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "opcua", children: "OPC-UA" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "http", children: "HTTP REST" })
          ]
        }
      )
    ] }),
    bindingType === "mqtt" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "binding-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "binding-section-title", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "binding-icon mqtt", children: "\u{1F4E1}" }),
        "MQTT Konfiguration"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "form-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "form-label", children: "Topic" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            type: "text",
            className: "form-input",
            placeholder: "z.B. sensors/temperature",
            value: instanceConfig.mqttTopic || "",
            onChange: (e) => onConfigChange?.("mqttTopic", e.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "form-help", children: [
          "Relativ zu: ",
          String(globalConfig.mqttBaseTopic || "3dviewer/nodes/")
        ] })
      ] })
    ] }),
    bindingType === "opcua" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "binding-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "binding-section-title", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "binding-icon opcua", children: "\u{1F3ED}" }),
        "OPC-UA Konfiguration"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "form-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "form-label", children: "Node ID" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            type: "text",
            className: "form-input",
            placeholder: "z.B. ns=2;s=MyVariable",
            value: instanceConfig.opcuaNodeId || "",
            onChange: (e) => onConfigChange?.("opcuaNodeId", e.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "form-help", children: [
          "Server: ",
          String(globalConfig.opcuaEndpoint || "opc.tcp://localhost:4840")
        ] })
      ] })
    ] }),
    bindingType === "http" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "binding-section", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "binding-section-title", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "binding-icon http", children: "\u{1F310}" }),
        "HTTP REST Konfiguration"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "form-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "form-label", children: "Endpoint" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "input",
          {
            type: "text",
            className: "form-input",
            placeholder: "z.B. /sensors/123",
            value: instanceConfig.httpEndpoint || "",
            onChange: (e) => onConfigChange?.("httpEndpoint", e.target.value)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "form-help", children: [
          "Basis-URL: ",
          String(globalConfig.httpBaseUrl || "http://localhost:8080/api")
        ] })
      ] })
    ] }),
    bindingType !== "none" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "form-group", style: { marginTop: 16 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "form-label", children: "Wert-Property (JSON-Pfad)" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "form-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { className: "form-label", children: "Farb-Property (JSON-Pfad)" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "button-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn btn-secondary", onClick: onClose, children: "Abbrechen" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "btn btn-primary", onClick: onClose, children: "Speichern" })
    ] })
  ] });
};

// src/components/NodeStatusOverlay.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime());
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "node-status-overlay", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("style", { children: `
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
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "div",
      {
        className: "overlay-value",
        style: { color: getStatusColor(data.value) },
        children: formatValue(data.value)
      }
    ),
    data.bindingType && data.bindingType !== "none" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "overlay-binding", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "span",
        {
          className: "binding-dot",
          style: { background: getStatusColor(data.value) }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "overlay-label", children: data.bindingType })
    ] })
  ] });
};

// src/components/DataLabelOverlay.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime());
var DataLabelOverlay = ({
  data = {}
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "data-label-overlay", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("style", { children: `
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
    data.label && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "label-text", children: [
      data.label,
      ":"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "label-value", children: data.value !== void 0 ? String(data.value) : "-" }),
    data.unit && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "label-unit", children: data.unit })
  ] });
};

// src/components/NodePropertiesSection.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime());
var NodePropertiesSection = ({
  nodeId: _nodeId,
  nodeName,
  instanceConfig = {},
  onConfigChange,
  onShowPopup
}) => {
  const bindingType = instanceConfig.bindingType || "none";
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "node-properties-section", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("style", { children: `
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
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "prop-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "prop-label", children: "Binding" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "prop-value", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "binding-badge", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: `binding-dot ${bindingType === "none" ? "inactive" : ""}` }),
        bindingType === "none" ? "Nicht verbunden" : bindingType.toUpperCase()
      ] }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "prop-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "prop-label", children: "Overlay anzeigen" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "input",
        {
          type: "checkbox",
          className: "prop-checkbox",
          checked: instanceConfig.showOverlay ?? true,
          onChange: (e) => onConfigChange?.("showOverlay", e.target.checked)
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "prop-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "prop-label", children: "Custom Label" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        className: "config-btn",
        onClick: () => onShowPopup?.("BindingConfig"),
        children: "\u{1F517} Binding konfigurieren"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
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
