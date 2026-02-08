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

// Mock GeoJSON for California region
const mockRiskZones: RiskGeoJSON = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                id: 'z1',
                name: 'Napa Valley North',
                riskLevel: 'high',
                temperature: 32,
                humidity: 15
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [-122.5, 38.5],
                    [-122.3, 38.5],
                    [-122.3, 38.3],
                    [-122.5, 38.3],
                    [-122.5, 38.5]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 'z2',
                name: 'Sonoma Coast',
                riskLevel: 'moderate',
                temperature: 24,
                humidity: 45
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [-123.0, 38.4],
                    [-122.8, 38.4],
                    [-122.8, 38.2],
                    [-123.0, 38.2],
                    [-123.0, 38.4]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 'z3',
                name: 'Sierra Foothills',
                riskLevel: 'extreme',
                temperature: 35,
                humidity: 10
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [-121.0, 39.0],
                    [-120.5, 39.0],
                    [-120.5, 38.5],
                    [-121.0, 38.5],
                    [-121.0, 39.0]
                ]]
            }
        }
    ]
};

export const MapService = {
    getRiskZones: async (): Promise<RiskGeoJSON> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockRiskZones), 600));
    }
};
