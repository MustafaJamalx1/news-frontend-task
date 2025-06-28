const API_BASE_URL = 'http://164.92.187.207:5005/api';

export async function apiAuthRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${await response.text()}`);
    }

    return response.json();
}

export async function apiRequest(endpoint: string) {
  

    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${await response.text()}`);
    }

    return response.json();
}
export const newsApi = {
    getTags: async () => {
        return apiRequest('/app/tag?language=ar&maxResultCount=1000');
    },

    getContentStatus: async () => {
        return apiAuthRequest('/app/content-status/granted/7?language=ar');
    },

    getDecisions: async () => {
        return apiAuthRequest('/app/category/by-filters?Language=ar&contentTypeId=7&maxResultCount=1000');
    },

    createNews: async (payload: any) => {
        return apiAuthRequest('/app/dynamic-content', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    getNewsList: async (page: number = 1, pageSize: number = 10, filter?: string) => {
        let url = `/app/dynamic-content?SkipCount=${(page - 1) * pageSize}&MaxResultCount=${pageSize}`;
        if (filter) url += `&Filter=${filter}`;
        return apiRequest(url);
    },

    getNewsBySlug: async (Slug: string) => {
        return apiRequest(`/app/dynamic-content/${Slug}`);
    }
};

export const authApi = {
    login: async (username: string, password: string) => {
             const params = new URLSearchParams({
            grant_type: 'password',
            username: username,
            password: password,
            client_id: 'AlMurabaCMS_App',
        });

        const response = await fetch('http://164.92.187.207:5005/connect/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });
return response;
    }
};
