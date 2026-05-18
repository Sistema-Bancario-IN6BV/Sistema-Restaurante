// src/helpers/response.helper.js
'use strict';

export const ok = (res, data, message, status = 200) =>
    res.status(status).json({ success: true, message, data });

export const fail = (res, message, status = 400, error) =>
    res.status(status).json({ success: false, message, ...(error && { error }) });