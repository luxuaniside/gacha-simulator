const API_BASE_URL = "http://localhost:8000";

export async function apiFetch(endpoint, options = {}){
    return fetch(`${API_BASE_URL}${endpoint}`, options)
}