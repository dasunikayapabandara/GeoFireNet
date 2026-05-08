import { API_BASE_URL, fetchJson } from '../config/api';

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

export const API_BASE = API_BASE_URL;

export const RiskService = {
    getMetrics: async (query?: LocationQuery): Promise<RiskMetric[]> => {
        try {
            const summary = await RiskService.getGlobalSummary(query);
            const alertsSummary = await RiskService.getAlertsSummary(query);
            
            // Calculate an aggregate risk value from global summary if possible
            const totalPredictions = summary.predictions_summary.reduce((acc: number, curr: any) => acc + curr.count, 0);
            const highExtreme = summary.predictions_summary
                .filter((r: any) => r.level === 'High' || r.level === 'Extreme')
                .reduce((acc: number, curr: any) => acc + curr.count, 0);
            
            if (totalPredictions === 0) {
                return [
                    {
                        title: query?.country ? `${query.country} Risk Index` : "Global Risk Index",
                        value: "No Data",
                        change: "No recent prediction",
                        trend: "neutral"
                    },
                    {
                        title: "Active Alerts",
                        value: alertsSummary.active_total.toString(),
                        trend: "neutral",
                        status: alertsSummary.active_total > 5 ? "high" : "low"
                    }
                ];
            }

            const riskValue = Math.round((highExtreme / totalPredictions) * 100);

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
        const params = new URLSearchParams({ limit: '50' });
        if (query?.country) params.append('country', query.country);
        const data = await fetchJson<any[]>(`/alerts?${params.toString()}`);
        
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
        try {
            await fetchJson(`/alerts/${alertId}/resolve`, { method: 'PATCH' });
            return true;
        } catch (error) {
            console.error('Failed to resolve alert', error);
            return false;
        }
    },

    getAlertsSummary: async (query?: LocationQuery): Promise<any> => {
        const params = new URLSearchParams();
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        const suffix = params.toString() ? `?${params.toString()}` : '';
        return fetchJson(`/alerts/summary${suffix}`);
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
        const params = new URLSearchParams();
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        const suffix = params.toString() ? `?${params.toString()}` : '';
        return fetchJson(`/analytics/global_summary${suffix}`);
    },

    getHistory: async (query?: LocationQuery): Promise<any[]> => {
        const params = new URLSearchParams({ limit: '50' });
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        return fetchJson(`/history?${params.toString()}`);
    },

    getActiveDetections: async (query?: LocationQuery): Promise<any[]> => {
        const params = new URLSearchParams({ limit: '100' });
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        return fetchJson(`/detections?${params.toString()}`);
    }
};
