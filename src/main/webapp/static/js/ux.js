/**
 * ux.js
 * - Non-module (no export/import)
 * - Provides:
 *   1) Global functions: NVL(), COALESCE(), ...
 *   2) Namespaced object: UX.NVL(), UX.COALESCE(), ... (fallback when name conflicts)
 *
 * Policy:
 * - By default, does NOT overwrite existing globals.
 * - To force overwrite: window.UX_FORCE_OVERWRITE = true; (set before loading this file)
 */
(function (global) {
  "use strict";

  var FORCE = !!global.UX_FORCE_OVERWRITE;

  function defineGlobal(name, fn) {
    // Always attach to UX namespace
    UX[name] = fn;

    // Global direct function (NVL(), etc.)
    if (FORCE || typeof global[name] === "undefined") {
      global[name] = fn;
    } else {
      // Do not overwrite; keep only UX.name
      // (Optional) log once
      if (!defineGlobal._warned) defineGlobal._warned = {};
      if (!defineGlobal._warned[name]) {
        defineGlobal._warned[name] = true;
        try { console.warn("[UX] Global name exists, not overwriting:", name, "-> use UX." + name + "(...)"); } catch (e) {}
      }
    }
  }

  // Namespace
  var UX = global.UX || {};
  global.UX = UX;

  // ===== Core helpers =====

  function NVL(a, b) {
    return (a === null || a === undefined || a === "") ? b : a;
  }

  function NVL2(a, b, c) {
    return (a === null || a === undefined || a === "") ? c : b;
  }

  function COALESCE() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v !== null && v !== undefined && v !== "") return v;
    }
    return null;
  }

  function NULLIF(a, b) {
    return (a === b) ? null : a;
  }

  /**
   * DECODE(expr, search1, result1, search2, result2, ..., default)
   * - Oracle style
   */
  function DECODE(expr) {
    var len = arguments.length;
    if (len < 3) return null;

    var i = 1;
    while (i + 1 < len) {
      var search = arguments[i];
      var result = arguments[i + 1];
      if (expr === search) return result;
      i += 2;
    }
    // default (if odd count)
    if (i < len) return arguments[i];
    return null;
  }

  // ===== String-ish helpers (DB/Back/Front 동일 함수명) =====

  function REPLACE(str, from, to) {
    if (str === null || str === undefined) return str;
    return String(str).split(String(from)).join(String(to));
  }

  /**
   * SUBSTR(str, start, len)
   * - Oracle style start: 1-based, negative allowed
   */
  function SUBSTR(str, start, len) {
    if (str === null || str === undefined) return null;
    var s = String(str);
    var n = Number(start);

    if (!isFinite(n) || n === 0) return "";

    var idx;
    if (n > 0) idx = n - 1;
    else idx = s.length + n;

    if (idx < 0) idx = 0;
    if (idx > s.length) return "";

    if (len === null || len === undefined) return s.substring(idx);
    var l = Number(len);
    if (!isFinite(l) || l <= 0) return "";
    return s.substring(idx, idx + l);
  }

  // ===== Number/date formatting =====

  /**
   * TO_NUMBER("1,234") -> 1234
   * parse fail -> null
   */
  function TO_NUMBER(str) {
    if (str === null || str === undefined) return null;
    var v = String(str).trim();
    if (v === "") return null;
    v = v.replace(/,/g, "");
    var n = Number(v);
    return isFinite(n) ? n : null;
  }

  /**
   * TO_CHAR(date|timestamp) -> "YYYY-MM-DD HH:mm:ss"
   * - JS Date only (string/number도 Date로 시도)
   */
  function TO_CHAR(dt) {
    if (dt === null || dt === undefined || dt === "") return null;

    var d;
    if (dt instanceof Date) d = dt;
    else {
      // try parse
      d = new Date(dt);
    }
    if (isNaN(d.getTime())) return null;

    function pad2(x) { return (x < 10 ? "0" : "") + x; }

    var yyyy = d.getFullYear();
    var MM = pad2(d.getMonth() + 1);
    var dd = pad2(d.getDate());
    var HH = pad2(d.getHours());
    var mi = pad2(d.getMinutes());
    var ss = pad2(d.getSeconds());

    return yyyy + "-" + MM + "-" + dd + " " + HH + ":" + mi + ":" + ss;
  }

  // ===== List helpers (front에서도 단순 유틸로 사용 가능) =====

  function SUM(list) {
    if (!Array.isArray(list)) return null;
    var s = 0;
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      if (v === null || v === undefined || v === "") continue;
      var n = Number(v);
      if (isFinite(n)) s += n;
    }
    return s;
  }

  function MIN(list) {
    if (!Array.isArray(list)) return null;
    var m = null;
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      if (v === null || v === undefined || v === "") continue;
      var n = Number(v);
      if (!isFinite(n)) continue;
      if (m === null || n < m) m = n;
    }
    return m;
  }

  function MAX(list) {
    if (!Array.isArray(list)) return null;
    var m = null;
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      if (v === null || v === undefined || v === "") continue;
      var n = Number(v);
      if (!isFinite(n)) continue;
      if (m === null || n > m) m = n;
    }
    return m;
  }

  /**
   * LIST_AGG(list, delim, order)
   * - list: array of strings
   * - delim: default ","
   * - order: "Y" => sort by value, else keep original order
   */
  function LIST_AGG(list, delim, order) {
    if (!Array.isArray(list)) return null;
    var d = (delim === null || delim === undefined) ? "," : String(delim);

    var arr = [];
    for (var i = 0; i < list.length; i++) {
      var v = list[i];
      if (v === null || v === undefined) continue;
      v = String(v);
      if (v === "") continue;
      arr.push(v);
    }
    if (order === "Y") arr.sort();
    return arr.join(d);
  }

  // ===== export to global + UX namespace =====
  defineGlobal("NVL", NVL);
  defineGlobal("NVL2", NVL2);
  defineGlobal("COALESCE", COALESCE);
  defineGlobal("NULLIF", NULLIF);
  defineGlobal("DECODE", DECODE);

  defineGlobal("REPLACE", REPLACE);
  defineGlobal("SUBSTR", SUBSTR);

  defineGlobal("TO_NUMBER", TO_NUMBER);
  defineGlobal("TO_CHAR", TO_CHAR);

  defineGlobal("SUM", SUM);
  defineGlobal("MIN", MIN);
  defineGlobal("MAX", MAX);
  defineGlobal("LIST_AGG", LIST_AGG);

})(window);
