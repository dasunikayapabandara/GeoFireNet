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
    weather?: {
        temp: number;
        humidity: number;
        wind: number;
        veg: number;
    };
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

const API_BASE = 'http://localhost:8000';

export const RiskService = {
    getMetrics: async (query?: LocationQuery): Promise<RiskMetric[]> => {
        try {
            const summary = await RiskService.getGlobalSummary(query);
            const alertsSummary = await RiskService.getAlertsSummary();
            
            // Calculate an aggregate risk value from global summary if possible
            const totalPredictions = summary.predictions_summary.reduce((acc: number, curr: any) => acc + curr.count, 0);
            const highExtreme = summary.predictions_summary
                .filter((r: any) => r.level === 'High' || r.level === 'Extreme')
                .reduce((acc: number, curr: any) => acc + curr.count, 0);
            
            const riskValue = totalPredictions > 0 ? Math.round((highExtreme / totalPredictions) * 100) : 0;

            return [
                {
                    title: query?.country ? `${query.country} Risk Index` : "Global Risk Index",
                    value: `${riskValue}/100`,
                    change: "Live API",
                    trend: "neutral",
                    status: riskValue > 80 ? 'extreme' : riskValue > 50 ? 'high' : riskValue > 30 ? 'moderate' : 'low'
                },
                {
                    title: "Active Alerts",
                    value: alertsSummary.active_total.toString(),
                    trend: "neutral",
                    status: alertsSummary.active_total > 5 ? "high" : "low"
                }
            ];
        } catch (e) {
            console.error("Failed to fetch metrics", e);
            throw e;
        }
    },

    getAlerts: async (query?: LocationQuery): Promise<Alert[]> => {
        let url = `${API_BASE}/alerts?limit=50`;
        if (query?.country) url += `&country=${query.country}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch alerts');
        const data = await response.json();
        
        return data.map((alert: any) => ({
            id: alert.id.toString(),
            title: `${alert.severity.toUpperCase()} Risk Alert`,
            description: alert.alert_message,
            timestamp: alert.triggered_at,
            severity: alert.severity.toLowerCase(),
            status: alert.status,
            score: alert.risk_score,
            drivers: alert.key_drivers ? alert.key_drivers.split(',').map((driver: string) => driver.trim()).filter(Boolean) : [],
            region: alert.location?.admin_region || 'Unknown',
            country: alert.location?.country || 'Unknown',
            weather: alert.weather_input ? {
                temp: alert.weather_input.temp,
                humidity: alert.weather_input.humidity,
                wind: alert.weather_input.wind,
                veg: alert.weather_input.veg_moisture
            } : undefined
        }));
    },

    resolveAlert: async (alertId: string): Promise<boolean> => {
        const response = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
            method: 'PATCH'
        });
        return response.ok;
    },

    getAlertsSummary: async (): Promise<any> => {
        const response = await fetch(`${API_BASE}/alerts/summary`);
        if (!response.ok) throw new Error('Failed to fetch alerts summary');
        return await response.json();
    },

    getRiskTrend: async (query?: LocationQuery): Promise<RiskChartData> => {
        const history = await RiskService.getHistory(query);
        const grouped = new Map<string, { total: number; count: number }>();

        history.forEach((item: any) => {
            const label = new Date(item.timestamp).toLocaleDateString();
            const current = grouped.get(label) || { total: 0, count: 0 };
            current.total += Number(item.risk_probability || 0) * 100;
            current.count += 1;
            grouped.set(label, current);
        });

        const labels = Array.from(grouped.keys()).reverse();
        const data = labels.map(label => {
            const bucket = grouped.get(label);
            return bucket ? Math.round(bucket.total / bucket.count) : 0;
        });

        return {
            labels,
            datasets: [{
                label: 'Average Risk Probability',
                data,
                fill: true,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.18)'
            }]
        };
    },

    getGlobalSummary: async (query?: LocationQuery): Promise<any> => {
        let url = `${API_BASE}/analytics/global_summary`;
        const params = new URLSearchParams();
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch global summary');
        return await response.json();
    },

    getHistory: async (query?: LocationQuery): Promise<any[]> => {
        let url = `${API_BASE}/history?limit=50`;
        const params = new URLSearchParams();
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        if (params.toString()) url += `&${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch history');
        return await response.json();
    },

    getActiveDetections: async (query?: LocationQuery): Promise<any[]> => {
        let url = `${API_BASE}/detections?limit=100`;
        const params = new URLSearchParams();
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        if (params.toString()) url += `&${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch detections');
        return await response.json();
    }
};
