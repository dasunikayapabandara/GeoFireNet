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
        // This endpoint is not yet implemented in the backend.
        // Returning empty collection to trigger clean "No data" or "Pending" state.
        console.warn("MapService.getRiskZones: Backend endpoint not implemented. GIS integration pending.");
        return {
            type: 'FeatureCollection',
            features: []
        };
    }
};
