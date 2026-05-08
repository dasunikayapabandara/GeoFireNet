import { fetchJson } from '../config/api';

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

export const MapService = {
    getRiskZones: async (): Promise<RiskGeoJSON> => {
        const history = await fetchJson<any[]>('/history?limit=50');
        const features = history
            .filter((item: any) => item.location?.latitude != null && item.location?.longitude != null)
            .map((item: any): RiskZoneFeature => {
                const lat = Number(item.location.latitude);
                const lon = Number(item.location.longitude);
                const delta = 0.08;
                return {
                    type: 'Feature',
                    properties: {
                        id: item.id.toString(),
                        name: item.location.admin_region || item.location.name || 'Prediction Zone',
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
