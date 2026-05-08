export const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '');

export const apiUrl = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

const toWebSocketBaseUrl = (baseUrl: string) => {
    const url = new URL(baseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.origin;
};

export const wsUrl = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${toWebSocketBaseUrl(API_BASE_URL)}${normalizedPath}`;
};

export class ApiRequestError extends Error {
    url: string;
    status?: number;
    detail?: string;

    constructor(message: string, url: string, status?: number, detail?: string) {
        super(message);
        this.name = 'ApiRequestError';
        this.url = url;
        this.status = status;
        this.detail = detail;
    }
}

export const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const url = apiUrl(path);
    let response: Response;

    try {
        response = await fetch(url, init);
    } catch (error) {
        throw new ApiRequestError(`Unable to reach GeoFireNet API at ${url}`, url, undefined, String(error));
    }

    if (!response.ok) {
        const detail = await response.text();
        throw new ApiRequestError(`GeoFireNet API returned ${response.status} for ${url}`, url, response.status, detail);
    }

    return response.json() as Promise<T>;
};

export interface BackendStatusCheck {
    apiBaseUrl: string;
    health: string;
    system: string;
}

export const checkBackendStatus = async (): Promise<BackendStatusCheck> => {
    const status: BackendStatusCheck = {
        apiBaseUrl: API_BASE_URL,
        health: 'unreachable',
        system: 'not checked'
    };

    try {
        const health = await fetchJson<{ status: string; version?: string }>('/health');
        status.health = `${health.status}${health.version ? ` (${health.version})` : ''}`;
    } catch (error) {
        status.health = error instanceof ApiRequestError ? error.message : String(error);
        return status;
    }

    try {
        const system = await fetchJson<{ status: string }>('/system/status');
        status.system = system.status;
    } catch (error) {
        status.system = error instanceof ApiRequestError ? error.message : String(error);
    }

    return status;
};
