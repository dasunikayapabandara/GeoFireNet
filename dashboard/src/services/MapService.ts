import { fetchJson } from '../config/api';
import type { HistoryRecord } from './RiskService';

export interface RiskZoneFeature {
    type: 'Feature';
    properties: {
        id: string;
        name: string;
        riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
        temperature: number;
        humidity: number;
    };
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
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

export const MapService = {
    getRiskZones: async (): Promise<RiskGeoJSON> => {
        const history = await fetchJson<HistoryRecord[]>('/history?limit=50');
        const features = history
            .filter(hasMappedLocation)
            .map((item): RiskZoneFeature => {
                const location = item.location;
                const lat = Number(location.latitude);
                const lon = Number(location.longitude);
                const delta = 0.08;
                return {
                    type: 'Feature',
                    properties: {
                        id: item.id.toString(),
                        name: location.admin_region || location.name || 'Prediction Zone',
                        riskLevel: item.risk_level.toLowerCase() as RiskZoneFeature['properties']['riskLevel'],
                        temperature: item.weather_input?.temp ?? 0,
                        humidity: item.weather_input?.humidity ?? 0
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [lon - delta, lat + delta],
                            [lon + delta, lat + delta],
                            [lon + delta, lat - delta],
                            [lon - delta, lat - delta],
                            [lon - delta, lat + delta]
                        ]]
                    }
                };
            });

        return {
            type: 'FeatureCollection',
            features
        };
    }
};
