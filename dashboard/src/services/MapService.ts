import { fetchJson } from '../config/api';
import type { HistoryRecord } from './RiskService';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface RiskZoneFeature {
    type: 'Feature';
    properties: {
        id: string;
        name: string;
        riskLevel: RiskLevel;
        temperature: number;
        humidity: number;
        radiusMeters: number;
        alpha: number;
    };
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
}

export interface RiskGeoJSON {
    type: 'FeatureCollection';
    features: RiskZoneFeature[];
}

type MappedHistoryRecord = HistoryRecord & {
    location: NonNullable<HistoryRecord['location']>;
};

const hasMappedLocation = (item: HistoryRecord): item is MappedHistoryRecord =>
    item.location?.latitude != null && item.location?.longitude != null;

const RISK_VISUALS: Record<RiskLevel, { radiusMeters: number; alpha: number }> = {
    low: { radiusMeters: 8000, alpha: 0.14 },
    moderate: { radiusMeters: 12000, alpha: 0.18 },
    high: { radiusMeters: 18000, alpha: 0.23 },
    extreme: { radiusMeters: 26000, alpha: 0.28 }
};

const toRiskLevel = (riskLevel: string): RiskLevel => {
    const normalized = riskLevel.toLowerCase();
    return normalized === 'moderate' || normalized === 'high' || normalized === 'extreme'
        ? normalized
        : 'low';
};

export const MapService = {
    getRiskZones: async (): Promise<RiskGeoJSON> => {
        const history = await fetchJson<HistoryRecord[]>('/history?limit=50');
        const features = history
            .filter(hasMappedLocation)
            .map((item): RiskZoneFeature => {
                const location = item.location;
                const lat = Number(location.latitude);
                const lon = Number(location.longitude);
                const riskLevel = toRiskLevel(item.risk_level);
                const visual = RISK_VISUALS[riskLevel];
                return {
                    type: 'Feature',
                    properties: {
                        id: item.id.toString(),
                        name: location.admin_region || location.name || 'Prediction Zone',
                        riskLevel,
                        temperature: item.weather_input?.temp ?? 0,
                        humidity: item.weather_input?.humidity ?? 0,
                        radiusMeters: visual.radiusMeters,
                        alpha: visual.alpha
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [lon, lat]
                    }
                };
            });

        return {
            type: 'FeatureCollection',
            features
        };
    }
};
