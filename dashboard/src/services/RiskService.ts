import { API_BASE_URL, fetchJson } from '../config/api';
import { getAlertSeverityForScore, loadStoredSettings } from '../config/settings';
import { getRegionalAlertFeatures, type MapLayerMode, type RiskZoneFeature } from './MapService';
import type { PredictionInput, PredictionResult } from '../types/prediction';

// Shared Types
export interface LocationQuery {
    country?: string;
    admin_region?: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Extreme';
export type AlertSeverity = 'moderate' | 'high' | 'extreme';
export type AlertStatus = 'active' | 'resolved' | 'acknowledged';
export type HistorySource = 'backend' | 'local' | 'reference';

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

export interface BackendLocation {
    id: number;
    name: string | null;
    continent?: string | null;
    country: string | null;
    admin_region: string | null;
    local_region?: string | null;
    latitude: number | null;
    longitude: number | null;
}

export interface BackendWeatherInput {
    id: number;
    temp: number;
    humidity: number;
    wind: number;
    veg_moisture: number;
}

interface BackendAlert {
    id: number;
    alert_message: string;
    triggered_at: string;
    severity: string;
    status: string;
    risk_score: number;
    key_drivers: string | null;
    location?: BackendLocation | null;
    weather_input?: BackendWeatherInput | null;
}

export interface HistoryRecord {
    id: number;
    timestamp: string;
    risk_level: RiskLevel;
    risk_probability: number;
    primary_drivers: string | null;
    location: BackendLocation | null;
    weather_input: BackendWeatherInput;
    source?: HistorySource;
}

export interface PredictionSummary {
    level: RiskLevel;
    count: number;
}

export interface ActiveDetectionSummary {
    status: string;
    count: number;
}

export interface GlobalSummary {
    predictions_summary: PredictionSummary[];
    active_detections_summary: ActiveDetectionSummary[];
}

export interface AlertsSummary {
    active_total: number;
    active_high: number;
    active_extreme: number;
    generated_today: number;
}

export interface ActiveDetectionLog {
    id: number;
    timestamp: string;
    location_id: number;
    detection_source: string;
    confidence_score: number;
    fire_radiative_power_mw: number | null;
    containment_status: string;
    location?: BackendLocation | null;
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

const PROJECT_COUNTRIES = ['USA', 'Australia'] as const;

const countryLabel = (country?: string) => {
    if (country === 'USA') return 'United States';
    if (country === 'Australia') return 'Australia';
    return 'USA + Australia';
};

const isProjectCountry = (country?: string | null) =>
    Boolean(country && PROJECT_COUNTRIES.includes(country as typeof PROJECT_COUNTRIES[number]));

const riskLevelScore = (level: string) => {
    switch (level.toLowerCase()) {
        case 'extreme': return 92;
        case 'high': return 76;
        case 'moderate': return 48;
        default: return 22;
    }
};

const titleCaseRiskLevel = (level: string): RiskLevel => {
    switch (level.toLowerCase()) {
        case 'extreme': return 'Extreme';
        case 'high': return 'High';
        case 'moderate': return 'Moderate';
        default: return 'Low';
    }
};

const getProjectAlertFeatures = (query?: LocationQuery, mode: MapLayerMode = 'predictive') =>
    getRegionalAlertFeatures({ country: query?.country, mode });

const buildSummaryFromFeatures = (features: RiskZoneFeature[]): GlobalSummary => {
    const levels: RiskLevel[] = ['Low', 'Moderate', 'High', 'Extreme'];
    const predictions_summary = levels.map((level) => ({
        level,
        count: features.filter((feature) => titleCaseRiskLevel(feature.properties.riskLevel) === level).length
    }));

    const activeCount = features.filter((feature) =>
        feature.properties.riskLevel === 'high' || feature.properties.riskLevel === 'extreme'
    ).length;

    return {
        predictions_summary,
        active_detections_summary: [
            { status: 'active', count: activeCount },
            { status: 'monitored', count: Math.max(features.length - activeCount, 0) }
        ]
    };
};

const fallbackAlerts = (query?: LocationQuery, mode: MapLayerMode = 'predictive'): Alert[] =>
    getProjectAlertFeatures(query, mode)
        .map((feature, index) => {
            const severity = normalizeSeverity(feature.properties.riskLevel);
            return {
                id: `regional-${feature.properties.id}`,
                title: `${severity.toUpperCase()} Wildfire Alert`,
                description: `${feature.properties.name} is under ${severity} wildfire monitoring based on regional temperature, humidity, and vegetation stress indicators.`,
                timestamp: new Date(Date.now() - index * 11 * 60 * 1000).toISOString(),
                severity,
                status: 'active',
                score: riskLevelScore(feature.properties.riskLevel),
                drivers: [
                    'Regional heat stress',
                    'Low fuel moisture',
                    'Dry wind exposure'
                ],
                region: feature.properties.name,
                country: feature.properties.country,
                weather: {
                    temp: feature.properties.temperature,
                    humidity: feature.properties.humidity,
                    wind: feature.properties.riskLevel === 'extreme' ? 54 : feature.properties.riskLevel === 'high' ? 38 : 24,
                    veg: feature.properties.riskLevel === 'extreme' ? 0.12 : feature.properties.riskLevel === 'high' ? 0.22 : 0.36
                }
            };
        });

const fallbackTrend = (query?: LocationQuery, mode: MapLayerMode = 'predictive'): RiskChartData => {
    const features = getProjectAlertFeatures(query, mode);
    const averageScore = features.length
        ? Math.round(features.reduce((total, feature) => total + riskLevelScore(feature.properties.riskLevel), 0) / features.length)
        : 0;
    const labels = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date.toLocaleDateString();
    });
    const data = labels.map((_, index) => Math.max(0, Math.min(100, averageScore + ((index % 3) - 1) * 4 + index)));

    return {
        labels,
        datasets: [{
            label: mode === 'active' ? 'Active Detection Confidence' : 'Average Risk Probability',
            data,
            fill: true,
            borderColor: mode === 'active' ? '#ef4444' : '#3b82f6',
            backgroundColor: mode === 'active' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(59, 130, 246, 0.18)'
        }]
    };
};

const normalizeSeverity = (severity: string): AlertSeverity => {
    const normalized = severity.toLowerCase();
    if (normalized === 'extreme' || normalized === 'high' || normalized === 'moderate') {
        return normalized;
    }
    return 'moderate';
};

const normalizeStatus = (status: string): AlertStatus => {
    const normalized = status.toLowerCase();
    if (normalized === 'active' || normalized === 'resolved' || normalized === 'acknowledged') {
        return normalized;
    }
    return 'active';
};

const LOCAL_HISTORY_KEY = 'geofirenet_local_risk_history';

const canUseLocalStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const matchesHistoryQuery = (item: HistoryRecord, query?: LocationQuery) => {
    if (query?.country && item.location?.country !== query.country) return false;
    if (query?.admin_region && item.location?.admin_region !== query.admin_region) return false;
    return query?.country ? true : isProjectCountry(item.location?.country);
};

const sortHistory = (items: HistoryRecord[], limit: number) =>
    [...items]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

const readLocalHistory = (): HistoryRecord[] => {
    if (!canUseLocalStorage()) return [];

    try {
        const raw = window.localStorage.getItem(LOCAL_HISTORY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as HistoryRecord[];
        return Array.isArray(parsed)
            ? parsed.map((item) => ({
                ...item,
                risk_level: titleCaseRiskLevel(item.risk_level),
                risk_probability: Number(item.risk_probability || 0),
                primary_drivers: item.primary_drivers ?? null,
                source: 'local'
            }))
            : [];
    } catch {
        window.localStorage.removeItem(LOCAL_HISTORY_KEY);
        return [];
    }
};

const writeLocalHistory = (items: HistoryRecord[]) => {
    if (!canUseLocalStorage()) return;
    window.localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(sortHistory(items, 50)));
};

const fallbackHistory = (query?: LocationQuery, limit = 12): HistoryRecord[] =>
    getProjectAlertFeatures(query)
        .slice(0, limit)
        .map((feature, index) => {
            const id = -900000 - index;
            const timestamp = new Date(Date.now() - (index + 1) * 3 * 60 * 60 * 1000).toISOString();
            const riskLevel = titleCaseRiskLevel(feature.properties.riskLevel);
            const coordinates = feature.geometry.coordinates;

            return {
                id,
                timestamp,
                risk_level: riskLevel,
                risk_probability: Number((riskLevelScore(riskLevel) / 100).toFixed(2)),
                primary_drivers: 'Regional reference layer, heat stress, vegetation dryness',
                location: {
                    id,
                    name: feature.properties.name,
                    continent: null,
                    country: feature.properties.country,
                    admin_region: feature.properties.name,
                    local_region: null,
                    latitude: coordinates[1],
                    longitude: coordinates[0]
                },
                weather_input: {
                    id,
                    temp: feature.properties.temperature,
                    humidity: feature.properties.humidity,
                    wind: feature.properties.riskLevel === 'extreme' ? 58 : feature.properties.riskLevel === 'high' ? 42 : 26,
                    veg_moisture: feature.properties.riskLevel === 'extreme' ? 0.1 : feature.properties.riskLevel === 'high' ? 0.22 : 0.38
                },
                source: 'reference'
            };
        });

export const recordLocalRiskCheck = (input: PredictionInput, result: PredictionResult) => {
    const id = -Math.round(Date.now() + Math.random() * 1000);
    const record: HistoryRecord = {
        id,
        timestamp: result.timestamp || new Date().toISOString(),
        risk_level: titleCaseRiskLevel(result.risk_level),
        risk_probability: Number(result.risk_probability || 0),
        primary_drivers: result.key_drivers.length > 0 ? result.key_drivers.join(', ') : null,
        location: {
            id,
            name: `${input.admin_region}, ${input.country}`,
            continent: null,
            country: input.country,
            admin_region: input.admin_region,
            local_region: null,
            latitude: null,
            longitude: null
        },
        weather_input: {
            id,
            temp: input.temp,
            humidity: input.humidity,
            wind: input.wind,
            veg_moisture: input.veg_moisture
        },
        source: 'local'
    };

    writeLocalHistory([record, ...readLocalHistory()]);
};

export const deleteLocalHistoryRecord = (id: number) => {
    writeLocalHistory(readLocalHistory().filter((item) => item.id !== id));
};

export const RiskService = {
    getMetrics: async (query?: LocationQuery, mode: MapLayerMode = 'predictive'): Promise<RiskMetric[]> => {
        try {
            const summary = await RiskService.getGlobalSummary(query);
            const alertsSummary = await RiskService.getAlertsSummary(query, mode);
            
            // Calculate an aggregate risk value from global summary if possible
            const totalPredictions = summary.predictions_summary.reduce((acc, curr) => acc + curr.count, 0);
            const highExtreme = summary.predictions_summary
                .filter((r) => r.level === 'High' || r.level === 'Extreme')
                .reduce((acc, curr) => acc + curr.count, 0);
            
            const riskValue = totalPredictions > 0 ? Math.round((highExtreme / totalPredictions) * 100) : 0;
            const scope = countryLabel(query?.country);
            const modePrefix = mode === 'active' ? 'Active Detection' : 'Risk';

            return [
                {
                    title: `${scope} ${modePrefix} Index`,
                    value: `${riskValue}/100`,
                    change: mode === 'active' ? 'High/Extreme regions only' : 'Project regional layer',
                    trend: riskValue > 45 ? "up" : "neutral",
                    status: riskValue > 80 ? 'extreme' : riskValue > 50 ? 'high' : riskValue > 30 ? 'moderate' : 'low'
                },
                {
                    title: mode === 'active' ? "Active Detections" : "Active Alerts",
                    value: alertsSummary.active_total.toString(),
                    trend: "neutral",
                    change: `${scope} scope`,
                    status: alertsSummary.active_extreme > 0 ? "extreme" : alertsSummary.active_high > 0 ? "high" : alertsSummary.active_total > 0 ? "moderate" : "low"
                }
            ];
        } catch (e) {
            console.error("Failed to fetch metrics", e);
            throw e;
        }
    },

    getAlerts: async (query?: LocationQuery, mode: MapLayerMode = 'predictive'): Promise<Alert[]> => {
        const settings = loadStoredSettings();
        const params = new URLSearchParams({ limit: '50' });
        if (query?.country) params.append('country', query.country);
        let backendAlerts: Alert[] = [];

        try {
            const data = await fetchJson<BackendAlert[]>(`/alerts?${params.toString()}`);
            backendAlerts = data
                .filter((alert) => query?.country
                    ? alert.location?.country === query.country
                    : isProjectCountry(alert.location?.country)
                )
                .map((alert) => {
                    const severity = normalizeSeverity(alert.severity);
                    return {
                        id: alert.id.toString(),
                        title: `${severity.toUpperCase()} Risk Alert`,
                        description: alert.alert_message,
                        timestamp: alert.triggered_at,
                        severity,
                        status: normalizeStatus(alert.status),
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
                    };
                });
        } catch (error) {
            console.warn('Unable to load backend alerts. Using regional wildfire alert layer.', error);
        }

        const regionalAlerts = fallbackAlerts(query, mode);
        const merged = [...backendAlerts, ...regionalAlerts]
            .map((alert) => {
                const configuredSeverity = getAlertSeverityForScore(alert.score, settings);
                return configuredSeverity
                    ? { ...alert, severity: configuredSeverity, title: `${configuredSeverity.toUpperCase()} Risk Alert` }
                    : null;
            })
            .filter((alert): alert is Alert => Boolean(alert));

        return mode === 'active'
            ? merged.filter((alert) => alert.severity === 'high' || alert.severity === 'extreme')
            : merged;
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

    getAlertsSummary: async (query?: LocationQuery, mode: MapLayerMode = 'predictive'): Promise<AlertsSummary> => {
        const alerts = await RiskService.getAlerts(query, mode);
        const activeAlerts = alerts.filter((alert) => alert.status === 'active');
        const today = new Date().toLocaleDateString();

        return {
            active_total: activeAlerts.length,
            active_high: activeAlerts.filter((alert) => alert.severity === 'high').length,
            active_extreme: activeAlerts.filter((alert) => alert.severity === 'extreme').length,
            generated_today: alerts.filter((alert) => new Date(alert.timestamp).toLocaleDateString() === today).length
        };
    },

    getRiskTrend: async (query?: LocationQuery, mode: MapLayerMode = 'predictive'): Promise<RiskChartData> => {
        let history: HistoryRecord[] = [];
        try {
            history = await RiskService.getHistory(query);
        } catch (error) {
            console.warn('Unable to load prediction history trend. Using regional wildfire trend.', error);
            return fallbackTrend(query, mode);
        }

        const grouped = new Map<string, { total: number; count: number }>();

        history.forEach((item) => {
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

        if (labels.length === 0) {
            return fallbackTrend(query, mode);
        }

        return {
            labels,
            datasets: [{
                label: mode === 'active' ? 'Active Detection Confidence' : 'Average Risk Probability',
                data,
                fill: true,
                borderColor: mode === 'active' ? '#ef4444' : '#3b82f6',
                backgroundColor: mode === 'active' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(59, 130, 246, 0.18)'
            }]
        };
    },

    getGlobalSummary: async (query?: LocationQuery): Promise<GlobalSummary> => {
        const regionalSummary = buildSummaryFromFeatures(getProjectAlertFeatures(query));
        const regionalTotal = regionalSummary.predictions_summary.reduce((total, item) => total + item.count, 0);

        if (regionalTotal > 0) {
            return regionalSummary;
        }

        const params = new URLSearchParams();
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        const suffix = params.toString() ? `?${params.toString()}` : '';
        return fetchJson<GlobalSummary>(`/analytics/global_summary${suffix}`);
    },

    getHistory: async (query?: LocationQuery, limit = 50): Promise<HistoryRecord[]> => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        const localHistory = readLocalHistory().filter((item) => matchesHistoryQuery(item, query));
        let backendHistory: HistoryRecord[] = [];

        try {
            const history = await fetchJson<HistoryRecord[]>(`/history?${params.toString()}`);
            backendHistory = history
                .filter((item) => matchesHistoryQuery(item, query))
                .map((item) => ({ ...item, risk_level: titleCaseRiskLevel(item.risk_level), source: 'backend' }));
        } catch (error) {
            console.warn('Unable to load backend history. Using local or reference history.', error);
        }

        const merged = sortHistory([...localHistory, ...backendHistory], limit);
        return merged.length > 0 ? merged : fallbackHistory(query, limit);
    },

    deleteHistoryRecord: async (id: number): Promise<boolean> => {
        if (id < 0) {
            deleteLocalHistoryRecord(id);
            return true;
        }

        try {
            await fetchJson(`/history/${id}`, { method: 'DELETE' });
            return true;
        } catch (error) {
            console.error('Failed to delete history item', error);
            return false;
        }
    },

    getActiveDetections: async (query?: LocationQuery): Promise<ActiveDetectionLog[]> => {
        const params = new URLSearchParams({ limit: '100' });
        if (query?.country) params.append('country', query.country);
        if (query?.admin_region) params.append('admin_region', query.admin_region);
        return fetchJson<ActiveDetectionLog[]>(`/detections?${params.toString()}`);
    }
};
