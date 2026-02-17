const BASE_URL = 'https://app.absence.io/api/v2';
const AUTH_URL = 'https://app.absence.io/api/oauth/accesstoken';
const USE_MOCK = false;

const mockLabels = [
    { _id: 'l1', name: 'Grant A' },
    { _id: 'l2', name: 'Grant B' },
    { _id: 'l3', name: 'Research' },
    { _id: 'l4', name: 'Admin' },
];

const mockTimespans = [
    { _id: 't1', start: '2026-02-16T09:00:00Z', end: '2026-02-16T11:00:00Z', duration: 7200, labelIds: ['l1'], commentary: 'Deep focus work' },
    { _id: 't2', start: '2026-02-16T12:00:00Z', end: '2026-02-16T14:30:00Z', duration: 9000, labelIds: ['l2', 'l3'], commentary: 'Grant meeting' },
    { _id: 't3', start: '2026-02-15T10:00:00Z', end: '2026-02-15T18:00:00Z', duration: 28800, labelIds: [], commentary: 'All day research' },
];

export const absenceApi = {
    /**
     * Exchange Client ID/Secret for an Access Token
     */
    async login({ clientId, clientSecret }) {
        if (USE_MOCK) return { access_token: 'mock-token' };

        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'client_credentials');

        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Authentication failed');
        }

        return response.json();
    },

    /**
     * Fetch with Bearer token authentication
     */
    async request(endpoint, options = {}, auth) {
        if (USE_MOCK) {
            console.log(`[MOCK API] ${options.method || 'GET'} ${endpoint}`, options.body);
            return new Promise((res) => setTimeout(res, 800)); // Simulate lag
        }
        const token = auth.access_token || auth.token;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API request failed: ${response.status}`);
        }

        return response.json();
    },

    /**
     * List labels
     */
    async listLabels(auth) {
        if (USE_MOCK) return { data: mockLabels };
        return this.request('/labels', {
            method: 'POST',
            body: JSON.stringify({
                skip: 0,
                limit: 100, // Reasonable limit for labels
            }),
        }, auth);
    },

    /**
     * Query timespans with date filter
     */
    async queryTimespans(auth, { startDate, endDate }) {
        if (USE_MOCK) return { data: mockTimespans };
        return this.request('/timespans', {
            method: 'POST',
            body: JSON.stringify({
                skip: 0,
                limit: 1000,
                filter: {
                    start: { $gte: startDate },
                    end: { $lte: endDate },
                },
            }),
        }, auth);
    },

    /**
     * Update a timespan (labelIds)
     */
    async updateTimespan(auth, id, data) {
        return this.request(`/timespans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }, auth);
    },

    /**
     * Batch update timespans
     */
    async batchUpdateLabels(auth, ids, labelIds) {
        const results = [];
        for (const id of ids) {
            try {
                const result = await this.updateTimespan(auth, id, { labelIds });
                results.push({ id, status: 'success', data: result });
            } catch (error) {
                results.push({ id, status: 'error', error: error.message });
            }
        }
        return results;
    }
};
