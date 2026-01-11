function _isNull(v) {
    return v === null || v === undefined || (typeof v === "string" && v.length === 0);
}

// Oracle-like: "" -> null
function _norm(v) {
    if (typeof v === "string" && v.length === 0) return null;
    return v;
}

/* =======================
 * TO_NUMBER: parse fail -> null
 * - trims
 * - removes commas
 * ======================= */
function TO_NUMBER(v) {
    if (_isNull(v)) return null;

    if (typeof v === "number") {
        return Number.isFinite(v) ? v : null;
    }

    let s = String(v);
    s = s.trim();
    if (s.length === 0) return null;

    s = s.replace(/,/g, "");

    const n = Number(s);
    return Number.isFinite(n) ? n : null;
}

/* =======================
 * TO_CHAR(date): YYYY-MM-DD HH24:MI:SS
 * - JS Date uses local time by default
 * ======================= */
function TO_CHAR(v) {
    if (_isNull(v)) return null;

    if (v instanceof Date) {
        const yyyy = String(v.getFullYear()).padStart(4, "0");
        const mm = String(v.getMonth() + 1).padStart(2, "0");
        const dd = String(v.getDate()).padStart(2, "0");
        const hh = String(v.getHours()).padStart(2, "0");
        const mi = String(v.getMinutes()).padStart(2, "0");
        const ss = String(v.getSeconds()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    return String(v);
}

/* =======================
 * NVL / NVL2 / COALESCE / NULLIF / DECODE
 * ======================= */
function NVL(x, y) {
    return _isNull(x) ? y : x;
}

function NVL2(x, y, z) {
    return _isNull(x) ? z : y;
}

function COALESCE(...vals) {
    for (const v of vals) {
        if (!_isNull(v)) return v;
    }
    return null;
}

function NULLIF(a, b) {
    const aa = _norm(a);
    const bb = _norm(b);

    if (aa === null && bb === null) return null;
    if (aa === null || bb === null) return aa;
    return (aa === bb) ? null : aa;
}

function DECODE(expr, ...args) {
    if (!args || args.length === 0) return null;

    const e = _norm(expr);
    const hasDefault = (args.length % 2 === 1);
    const pairLen = hasDefault ? args.length - 1 : args.length;
    const def = hasDefault ? args[args.length - 1] : null;

    for (let i = 0; i < pairLen; i += 2) {
        const search = _norm(args[i]);
        const result = args[i + 1];

        const match = (e === null && search === null) || (e !== null && search !== null && e === search);
        if (match) return result;
    }
    return def;
}

/* =======================
 * REPLACE: if search null -> return str, if replacement null -> remove
 * (Oracle REPLACE semantics) :contentReference[oaicite:14]{index=14}
 * ======================= */
function REPLACE(str, search, replacement = null) {
    str = _norm(str);
    search = _norm(search);
    if (str === null) return null;
    if (search === null) return String(str);

    const repl = (replacement === null || replacement === undefined) ? "" : String(replacement);
    return String(str).split(String(search)).join(repl);
}

/* =======================
 * SUBSTR: Oracle 1-based, pos=0 => 1, pos<0 from end; len<1 => null :contentReference[oaicite:15]{index=15}
 * ======================= */
function SUBSTR(str, pos, len = null) {
    str = _norm(str);
    if (str === null) return null;

    const s = String(str);
    const n = s.length;

    let p = pos;
    if (p === 0) p = 1;

    let start1 = (p > 0) ? p : (n + p + 1);
    if (start1 < 1) start1 = 1;

    const start0 = start1 - 1;
    if (start0 >= n) return null;

    if (len === null || len === undefined) {
        return s.substring(start0);
    }
    if (len < 1) return null;

    const end0 = Math.min(start0 + len, n);
    return s.substring(start0, end0);
}

/* =======================
 * INSTR: 1-based, not found => 0, if string/sub is null => null :contentReference[oaicite:16]{index=16}
 * ======================= */
function INSTR(str, sub, pos = 1, occurrence = 1) {
    str = _norm(str);
    sub = _norm(sub);
    if (str === null || sub === null) return null;
    if (occurrence < 1) return 0;

    const s = String(str);
    const needle = String(sub);
    const n = s.length;

    let p = pos;
    if (p === 0) p = 1;

    if (p > 0) {
        let cursor = Math.min(Math.max(p - 1, 0), n);
        let idx = -1;
        for (let k = 0; k < occurrence; k++) {
            idx = s.indexOf(needle, cursor);
            if (idx < 0) return 0;
            cursor = idx + 1;
        }
        return idx + 1;
    } else {
        let cursor = n + p;
        if (cursor < 0) cursor = 0;
        if (cursor >= n) cursor = n - 1;

        let idx = -1;
        for (let k = 0; k < occurrence; k++) {
            idx = s.lastIndexOf(needle, cursor);
            if (idx < 0) return 0;
            cursor = idx - 1;
        }
        return idx + 1;
    }
}

/* =======================
 * TRIM/LTRIM/RTRIM, LOWER/UPPER/LENGTH
 * ======================= */
function TRIM(s) {
    s = _norm(s);
    if (s === null) return null;
    const t = String(s).trim();
    return t.length === 0 ? null : t;
}

function LTRIM(s) {
    s = _norm(s);
    if (s === null) return null;
    const t = String(s).replace(/^\s+/, "");
    return t.length === 0 ? null : t;
}

function RTRIM(s) {
    s = _norm(s);
    if (s === null) return null;
    const t = String(s).replace(/\s+$/, "");
    return t.length === 0 ? null : t;
}

function LOWER(s) {
    s = _norm(s);
    return (s === null) ? null : String(s).toLowerCase();
}

function UPPER(s) {
    s = _norm(s);
    return (s === null) ? null : String(s).toUpperCase();
}

function LENGTH(s) {
    s = _norm(s);
    return (s === null) ? null : String(s).length;
}

/* =======================
 * LPAD/RPAD: n<=0 => null; pad null => null :contentReference[oaicite:17]{index=17}
 * ======================= */
function LPAD(s, n, pad = " ") {
    s = _norm(s);
    pad = _norm(pad);
    if (s === null || pad === null) return null;
    if (n <= 0) return null;

    s = String(s);
    pad = String(pad);
    if (pad.length === 0) return null;

    if (s.length >= n) return s.substring(0, n);

    const need = n - s.length;
    let fill = "";
    while (fill.length < need) fill += pad;
    fill = fill.substring(0, need);
    return fill + s;
}

function RPAD(s, n, pad = " ") {
    s = _norm(s);
    pad = _norm(pad);
    if (s === null || pad === null) return null;
    if (n <= 0) return null;

    s = String(s);
    pad = String(pad);
    if (pad.length === 0) return null;

    if (s.length >= n) return s.substring(0, n);

    let out = s;
    while (out.length < n) out += pad;
    return out.substring(0, n);
}

/* =======================
 * Numeric helpers
 * ======================= */
function ABS(v) {
    const n = TO_NUMBER(v);
    return n === null ? null : Math.abs(n);
}

function CEIL(v) {
    const n = TO_NUMBER(v);
    return n === null ? null : Math.ceil(n);
}

function FLOOR(v) {
    const n = TO_NUMBER(v);
    return n === null ? null : Math.floor(n);
}

function ROUND(v, d = 0) {
    const n = TO_NUMBER(v);
    if (n === null) return null;
    const factor = Math.pow(10, d);
    return Math.round(n * factor) / factor;
}

function TRUNC(v, d = 0) {
    const n = TO_NUMBER(v);
    if (n === null) return null;
    const factor = Math.pow(10, d);
    return (n >= 0)
        ? Math.floor(n * factor) / factor
        : Math.ceil(n * factor) / factor;
}

/* =======================
 * SUM: NULL->0 then sum
 * MIN/MAX: ignore NULL; all NULL => NULL
 * LISTAGG: ignore NULL/""; all ignored => NULL
 * ======================= */
function SUM(...vals) {
    let sum = 0;
    for (const v of vals) {
        const n = TO_NUMBER(v);
        if (n !== null) sum += n; // null/""/parsefail => +0
    }
    return sum;
}

function MIN(...vals) {
    let best = null;
    for (const v of vals) {
        if (_isNull(v)) continue;
        const vv = v;
        if (best === null) {
            best = vv;
        } else {
            const a = TO_NUMBER(vv);
            const b = TO_NUMBER(best);
            const cmp = (a !== null && b !== null)
                ? (a - b)
                : String(vv).localeCompare(String(best));
            if (cmp < 0) best = vv;
        }
    }
    return best;
}

function MAX(...vals) {
    let best = null;
    for (const v of vals) {
        if (_isNull(v)) continue;
        const vv = v;
        if (best === null) {
            best = vv;
        } else {
            const a = TO_NUMBER(vv);
            const b = TO_NUMBER(best);
            const cmp = (a !== null && b !== null)
                ? (a - b)
                : String(vv).localeCompare(String(best));
            if (cmp > 0) best = vv;
        }
    }
    return best;
}

function LISTAGG(values, delim = ",", opts = {}) {
    if (values === null || values === undefined) return null;

    const d = (delim === null || delim === undefined) ? "" : String(delim);
    let list = Array.from(values)
        .map(v => (v === null || v === undefined) ? null : String(v))
        .filter(s => s !== null && s.length > 0);

    if (opts.orderBy && typeof opts.orderBy === "function") {
        const keyFn = opts.orderBy;
        list.sort((a, b) => String(keyFn(a)).localeCompare(String(keyFn(b))));
    }
    if (opts.distinct) {
        list = Array.from(new Set(list));
    }
    return list.length === 0 ? null : list.join(d);
}

export const UX = {
    TO_NUMBER,
    TO_CHAR,
    NVL,
    NVL2,
    COALESCE,
    NULLIF,
    DECODE,
    REPLACE,
    SUBSTR,
    INSTR,
    TRIM,
    LTRIM,
    RTRIM,
    LOWER,
    UPPER,
    LENGTH,
    LPAD,
    RPAD,
    ABS,
    CEIL,
    FLOOR,
    ROUND,
    TRUNC,
    SUM,
    MIN,
    MAX,
    LISTAGG,
};
