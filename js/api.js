import { API_BASE_URL } from "./config.js";

export async function apiFetch(endpoint, options = {}) {
    return fetch(`${API_BASE_URL}${endpoint}`, options)
}