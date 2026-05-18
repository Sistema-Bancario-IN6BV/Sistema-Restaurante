'use strict';

import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5105/api/v1';
const TIMEOUT = 5000;

const authServiceClient = axios.create({
    baseURL: AUTH_SERVICE_URL.endsWith('/') ? AUTH_SERVICE_URL : `${AUTH_SERVICE_URL}/`,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getUserRoles = async (userId, token) => {
    try {
        const response = await authServiceClient.get(`Users/${userId}/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`AuthService Error [${error.response.status}]:`, error.response.data);
        } else {
            console.error(`AuthService Connection Error:`, error.message);
        }
        return null;
    }
};

export const userExists = async (userId, token) => {
    try {
        const roles = await getUserRoles(userId, token);
        return roles !== null && Array.isArray(roles) && roles.length > 0;
    } catch (error) {
        return false;
    }
};

export default {
    getUserRoles,
    userExists
};
