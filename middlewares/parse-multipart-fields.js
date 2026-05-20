"use strict";

const toNestedPath = (key) =>
    key
        .replace(/\[(\w*)\]/g, (_, segment) => (segment ? `.${segment}` : ""))
        .replace(/\.\.+/g, ".")
        .replace(/^\./, "")
        .replace(/\.$/, "");

const parseValue = (value) => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    if (!trimmed) return value;

    if (
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
        try {
            return JSON.parse(trimmed);
        } catch {
            return value;
        }
    }

    if (trimmed === "true") return true;
    if (trimmed === "false") return false;

    return value;
};

const setDeepValue = (target, path, value) => {
    const segments = path.split(".").filter(Boolean);
    if (segments.length === 0) return;

    let cursor = target;
    for (let index = 0; index < segments.length - 1; index += 1) {
        const segment = segments[index];
        if (!cursor[segment] || typeof cursor[segment] !== "object" || Array.isArray(cursor[segment])) {
            cursor[segment] = {};
        }
        cursor = cursor[segment];
    }

    cursor[segments[segments.length - 1]] = value;
};

export const parseMultipartFields = (req, _res, next) => {
    if (!req.body || typeof req.body !== "object") {
        return next();
    }

    const parsed = {};

    for (const [key, rawValue] of Object.entries(req.body)) {
        const path = toNestedPath(key);
        const value = parseValue(rawValue);
        setDeepValue(parsed, path, value);
    }

    req.body = parsed;
    next();
};
