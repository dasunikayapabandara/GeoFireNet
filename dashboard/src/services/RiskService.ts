// Shared Types
export interface LocationQuery {
    country?: string;
    admin_region?: string;
}

export interface RiskMetric {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    status?: 'low' | 'moderate' | 'high' | 'extreme';
}

export interface Alert {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    severity: 'moderate' | 'high' | 'extreme';
    status: 'active' | 'resolved' | 'acknowledged';
    score: number;
    drivers: string[];
    region: string;
    country: string;
}

export interface RiskChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        fill?: boolean;
        borderColor?: string;
        backgroundColor?: string;
        borderDash?: number[];
    }[];
}


export let currentSystemStatus: string = 'UNKNOWN';

const mockChartData: RiskChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'Fire Risk Index',
            data: [35, 42, 38, 55, 68, 72, 65],
            fill: true,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#ef4444',
        },
        {
            label: 'Historical Avg',
            data: [30, 32, 35, 38, 40, 42, 41],
            fill: false,
            borderColor: '#3b82f6',
            borderDash: [5, 5],
        }
    ],
};

const currentConditions = {
    temp: 35,
    humidity: 15,
    wind: 25,
    veg_moisture: 0.2
};

const calculateFallbackRisk = (temp: number, humidity: number, wind: number, veg: number): number => {
    const n_temp = Math.min(temp / 50.0, 1);
    const n_hum = Math.min(humidity / 100.0, 1);
    const n_wind = Math.min(wind / 100.0, 1);
    const n_veg = Math.min(veg, 1);
    const score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40;
    return Math.max(0, Math.min(score, 100));
};

const getRiskStatus = (score: number): 'low' | 'moderate' | 'high' | 'extreme' => {
    if (score < 30) return 'low';
    if (score < 50) return 'moderate';
    if (score < 80) return 'high';
    return 'extreme';
};

// --- MOCK GLOBAL DATA GENERATOR ---
const MOCK_GLOBAL_LOCATIONS = [
    { name: 'Napa Valley Sector A', country: 'USA', admin_region: 'California' },
    { name: 'Sonoma County Zone 3', country: 'USA', admin_region: 'California' },
    { name: 'Sydney Outskirts', country: 'Australia', admin_region: 'New South Wales' },
    { name: 'Blue Mountains', country: 'Australia', admin_region: 'New South Wales' },
    { name: 'Athens Suburbs', country: 'Greece', admin_region: 'Attica' },
    { name: 'Faro District', country: 'Portugal', admin_region: 'Algarve' },
    { name: 'Alberta Forests', country: 'Canada', admin_region: 'Alberta' },
    { name: 'Amazon Basin Sector 1', country: 'Brazil', admin_region: 'Amazonas' }
];

const mockHistoryData = MOCK_GLOBAL_LOCATIONS.slice(0, 5).map((loc, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * i * 3).toISOString(),
    location: loc,
    risk_level: ['Low', 'Moderate', 'High', 'Extreme'][i % 4],
    risk_probability: 0.1 + (i * 0.15),
    primary_drivers: 'Dry Vegetation, High Wind'
}));

const mockActiveDetections: any[] = [];
let nextId = 100;

setInterval(() => {
    const randomLocation = MOCK_GLOBAL_LOCATIONS[Math.floor(Math.random() * MOCK_GLOBAL_LOCATIONS.length)];
    const risks = ['Low', 'Moderate', 'High', 'Extreme'];
    const randomRisk = risks[Math.floor(Math.random() * risks.length)];

    // Simulate Risk Prediction
    mockHistoryData.unshift({
        id: nextId++,
        timestamp: new Date().toISOString(),
        location: randomLocation,
        risk_level: randomRisk,
        risk_probability: Math.random(),
        primary_drivers: 'Global Simulation Generator'
    });
    if (mockHistoryData.length > 50) mockHistoryData.pop();

    // Randomly Simulate Active Detections (1/5 chance)
    if (Math.random() > 0.8) {
        mockActiveDetections.unshift({
            id: nextId + 1000,
            timestamp: new Date().toISOString(),
            location: randomLocation,
            detection_source: ['MODIS Satellite', 'VIIRS Sensor', 'Local Ground Hub'][Math.floor(Math.random() * 3)],
            confidence_score: 0.8 + Math.random() * 0.19,
            fire_radiative_power_mw: Math.random() * 500,
            containment_status: 'Active'
        });
        if (mockActiveDetections.length > 50) mockActiveDetections.pop();
    }
}, 5000);

export const RiskService = {
    getMetrics: async (query?: LocationQuery): Promise<RiskMetric[]> => {
        let mlScore = calculateFallbackRisk(currentConditions.temp, currentConditions.humidity, currentConditions.wind, currentConditions.veg_moisture);
        currentSystemStatus = 'DEGRADED (Client Fallback)';
        return [
            {
                title: query?.country ? `Avg Risk: ${query.country}` : "Global Avg Risk",
                value: `${Math.round(mlScore)}/100`,
                change: "Stable",
                trend: "neutral",
                status: getRiskStatus(mlScore)
            },
            {
                title: "Active Hotspots globally",
                value: mockActiveDetections.length.toString(),
                trend: "up",
                status: mockActiveDetections.length > 5 ? "high" : "low"
            }
        ];
    },

    getAlerts: async (query?: LocationQuery): Promise<Alert[]> => {
        try {
            let url = 'http://localhost:8000/alerts?limit=50';
            if (query?.country) url += `&country=${query.country}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            return data.map((alert: any) => ({
                id: alert.id.toString(),
                title: `${alert.severity.toUpperCase()} Risk Alert`,
                description: alert.alert_message,
                timestamp: alert.triggered_at,
                severity: alert.severity.toLowerCase(),
                status: alert.status,
                score: alert.risk_score,
                drivers: alert.key_drivers ? alert.key_drivers.split(',') : [],
                region: alert.location?.admin_region || 'Unknown',
                country: alert.location?.country || 'Unknown',
                weather: {
                    temp: Math.floor(Math.random() * 20) + 25,
                    humidity: Math.floor(Math.random() * 30) + 10,
                    wind: Math.floor(Math.random() * 50) + 15,
                    veg: Math.random() * 0.3 + 0.1
                }
            }));
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    resolveAlert: async (alertId: string): Promise<boolean> => {
        try {
            const response = await fetch(`http://localhost:8000/alerts/${alertId}/resolve`, {
                method: 'PATCH'
            });
            return response.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    getAlertsSummary: async (): Promise<any> => {
        try {
            const response = await fetch(`http://localhost:8000/alerts/summary`);
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (e) {
            return {
                active_total: 0,
                active_high: 0,
                active_extreme: 0,
                generated_today: 0
            };
        }
    },

    getRiskTrend: async (query?: LocationQuery): Promise<RiskChartData> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockChartData), 800));
    },

    getGlobalSummary: async (query?: LocationQuery): Promise<any> => {
        let url = 'http://localhost:8000/analytics/global_summary';
        const params = new URLSearchParams();
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        if (params.toString()) url += `?${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (e) {
            // Mock Fallback
            return {
                predictions_summary: [
                    { level: 'Extreme', count: mockHistoryData.filter(d => d.risk_level === 'Extreme').length },
                    { level: 'High', count: mockHistoryData.filter(d => d.risk_level === 'High').length }
                ],
                active_detections_summary: [
                    { status: 'Active', count: mockActiveDetections.length }
                ]
            };
        }
    },

    getHistory: async (query?: LocationQuery): Promise<any[]> => {
        let url = 'http://localhost:8000/history?limit=50';
        const params = new URLSearchParams();
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        if (params.toString()) url += `&${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (e) {
            return mockHistoryData.filter(d =>
                (!query?.country || d.location.country === query.country) &&
                (!query?.admin_region || d.location.admin_region === query.admin_region)
            );
        }
    },

    getActiveDetections: async (query?: LocationQuery): Promise<any[]> => {
        let url = 'http://localhost:8000/detections?limit=100';
        const params = new URLSearchParams();
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        if (params.toString()) url += `&${params.toString()}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (e) {
            return mockActiveDetections.filter(d =>
                (!query?.country || d.location.country === query.country) &&
                (!query?.admin_region || d.location.admin_region === query.admin_region)
            );
        }
    }
};
