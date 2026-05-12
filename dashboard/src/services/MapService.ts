import { fetchJson } from '../config/api';
import type { HistoryRecord } from './RiskService';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';
export type ProjectCountry = 'USA' | 'Australia';
export type MapLayerMode = 'predictive' | 'active';

export interface RiskZoneQuery {
    country?: string;
    mode?: MapLayerMode;
}

export interface RiskZoneFeature {
    type: 'Feature';
    properties: {
        id: string;
        name: string;
        country: string;
        regionType: string;
        source: 'Regional wildfire alert' | 'Prediction history';
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

interface StaticWildfireRegion {
    id: string;
    name: string;
    country: ProjectCountry;
    regionType: string;
    latitude: number;
    longitude: number;
    riskLevel: RiskLevel;
    temperature: number;
    humidity: number;
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

const REGIONAL_ALERT_VISUALS: Record<RiskLevel, { radiusMeters: number; alpha: number }> = {
    low: { radiusMeters: 55000, alpha: 0.10 },
    moderate: { radiusMeters: 90000, alpha: 0.14 },
    high: { radiusMeters: 135000, alpha: 0.18 },
    extreme: { radiusMeters: 180000, alpha: 0.22 }
};

const USA_WILDFIRE_ALERT_REGIONS: StaticWildfireRegion[] = [
    { id: 'usa-al', name: 'Alabama', country: 'USA', regionType: 'State', latitude: 32.8067, longitude: -86.7911, riskLevel: 'moderate', temperature: 31, humidity: 42 },
    { id: 'usa-ak', name: 'Alaska', country: 'USA', regionType: 'State', latitude: 61.3707, longitude: -152.4044, riskLevel: 'moderate', temperature: 18, humidity: 45 },
    { id: 'usa-az', name: 'Arizona', country: 'USA', regionType: 'State', latitude: 33.7298, longitude: -111.4312, riskLevel: 'extreme', temperature: 41, humidity: 11 },
    { id: 'usa-ar', name: 'Arkansas', country: 'USA', regionType: 'State', latitude: 34.9697, longitude: -92.3731, riskLevel: 'moderate', temperature: 32, humidity: 39 },
    { id: 'usa-ca', name: 'California', country: 'USA', regionType: 'State', latitude: 36.1162, longitude: -119.6816, riskLevel: 'extreme', temperature: 39, humidity: 14 },
    { id: 'usa-co', name: 'Colorado', country: 'USA', regionType: 'State', latitude: 39.0598, longitude: -105.3111, riskLevel: 'high', temperature: 31, humidity: 18 },
    { id: 'usa-ct', name: 'Connecticut', country: 'USA', regionType: 'State', latitude: 41.5978, longitude: -72.7554, riskLevel: 'moderate', temperature: 27, humidity: 46 },
    { id: 'usa-de', name: 'Delaware', country: 'USA', regionType: 'State', latitude: 39.3185, longitude: -75.5071, riskLevel: 'moderate', temperature: 29, humidity: 48 },
    { id: 'usa-fl', name: 'Florida', country: 'USA', regionType: 'State', latitude: 27.7663, longitude: -81.6868, riskLevel: 'high', temperature: 34, humidity: 52 },
    { id: 'usa-ga', name: 'Georgia', country: 'USA', regionType: 'State', latitude: 33.0406, longitude: -83.6431, riskLevel: 'moderate', temperature: 32, humidity: 45 },
    { id: 'usa-hi', name: 'Hawaii', country: 'USA', regionType: 'State', latitude: 21.0943, longitude: -157.4983, riskLevel: 'high', temperature: 30, humidity: 50 },
    { id: 'usa-id', name: 'Idaho', country: 'USA', regionType: 'State', latitude: 44.2405, longitude: -114.4788, riskLevel: 'high', temperature: 30, humidity: 20 },
    { id: 'usa-il', name: 'Illinois', country: 'USA', regionType: 'State', latitude: 40.3495, longitude: -88.9861, riskLevel: 'moderate', temperature: 30, humidity: 43 },
    { id: 'usa-in', name: 'Indiana', country: 'USA', regionType: 'State', latitude: 39.8494, longitude: -86.2583, riskLevel: 'moderate', temperature: 29, humidity: 45 },
    { id: 'usa-ia', name: 'Iowa', country: 'USA', regionType: 'State', latitude: 42.0115, longitude: -93.2105, riskLevel: 'moderate', temperature: 29, humidity: 41 },
    { id: 'usa-ks', name: 'Kansas', country: 'USA', regionType: 'State', latitude: 38.5266, longitude: -96.7265, riskLevel: 'high', temperature: 35, humidity: 25 },
    { id: 'usa-ky', name: 'Kentucky', country: 'USA', regionType: 'State', latitude: 37.6681, longitude: -84.6701, riskLevel: 'moderate', temperature: 30, humidity: 44 },
    { id: 'usa-la', name: 'Louisiana', country: 'USA', regionType: 'State', latitude: 31.1695, longitude: -91.8678, riskLevel: 'moderate', temperature: 33, humidity: 55 },
    { id: 'usa-me', name: 'Maine', country: 'USA', regionType: 'State', latitude: 44.6939, longitude: -69.3819, riskLevel: 'moderate', temperature: 24, humidity: 48 },
    { id: 'usa-md', name: 'Maryland', country: 'USA', regionType: 'State', latitude: 39.0639, longitude: -76.8021, riskLevel: 'moderate', temperature: 29, humidity: 47 },
    { id: 'usa-ma', name: 'Massachusetts', country: 'USA', regionType: 'State', latitude: 42.2302, longitude: -71.5301, riskLevel: 'moderate', temperature: 26, humidity: 48 },
    { id: 'usa-mi', name: 'Michigan', country: 'USA', regionType: 'State', latitude: 43.3266, longitude: -84.5361, riskLevel: 'moderate', temperature: 27, humidity: 43 },
    { id: 'usa-mn', name: 'Minnesota', country: 'USA', regionType: 'State', latitude: 45.6945, longitude: -93.9002, riskLevel: 'moderate', temperature: 27, humidity: 40 },
    { id: 'usa-ms', name: 'Mississippi', country: 'USA', regionType: 'State', latitude: 32.7416, longitude: -89.6787, riskLevel: 'moderate', temperature: 32, humidity: 52 },
    { id: 'usa-mo', name: 'Missouri', country: 'USA', regionType: 'State', latitude: 38.4561, longitude: -92.2884, riskLevel: 'moderate', temperature: 31, humidity: 39 },
    { id: 'usa-mt', name: 'Montana', country: 'USA', regionType: 'State', latitude: 46.9219, longitude: -110.4544, riskLevel: 'high', temperature: 29, humidity: 21 },
    { id: 'usa-ne', name: 'Nebraska', country: 'USA', regionType: 'State', latitude: 41.1254, longitude: -98.2681, riskLevel: 'high', temperature: 33, humidity: 26 },
    { id: 'usa-nv', name: 'Nevada', country: 'USA', regionType: 'State', latitude: 38.3135, longitude: -117.0554, riskLevel: 'extreme', temperature: 40, humidity: 12 },
    { id: 'usa-nh', name: 'New Hampshire', country: 'USA', regionType: 'State', latitude: 43.4525, longitude: -71.5639, riskLevel: 'moderate', temperature: 25, humidity: 48 },
    { id: 'usa-nj', name: 'New Jersey', country: 'USA', regionType: 'State', latitude: 40.2989, longitude: -74.5210, riskLevel: 'moderate', temperature: 28, humidity: 47 },
    { id: 'usa-nm', name: 'New Mexico', country: 'USA', regionType: 'State', latitude: 34.8405, longitude: -106.2485, riskLevel: 'extreme', temperature: 38, humidity: 13 },
    { id: 'usa-ny', name: 'New York', country: 'USA', regionType: 'State', latitude: 42.1657, longitude: -74.9481, riskLevel: 'moderate', temperature: 27, humidity: 45 },
    { id: 'usa-nc', name: 'North Carolina', country: 'USA', regionType: 'State', latitude: 35.6301, longitude: -79.8064, riskLevel: 'moderate', temperature: 31, humidity: 46 },
    { id: 'usa-nd', name: 'North Dakota', country: 'USA', regionType: 'State', latitude: 47.5289, longitude: -99.7840, riskLevel: 'moderate', temperature: 27, humidity: 33 },
    { id: 'usa-oh', name: 'Ohio', country: 'USA', regionType: 'State', latitude: 40.3888, longitude: -82.7649, riskLevel: 'moderate', temperature: 28, humidity: 45 },
    { id: 'usa-ok', name: 'Oklahoma', country: 'USA', regionType: 'State', latitude: 35.5653, longitude: -96.9289, riskLevel: 'high', temperature: 36, humidity: 28 },
    { id: 'usa-or', name: 'Oregon', country: 'USA', regionType: 'State', latitude: 44.5720, longitude: -122.0709, riskLevel: 'high', temperature: 30, humidity: 23 },
    { id: 'usa-pa', name: 'Pennsylvania', country: 'USA', regionType: 'State', latitude: 40.5908, longitude: -77.2098, riskLevel: 'moderate', temperature: 28, humidity: 44 },
    { id: 'usa-ri', name: 'Rhode Island', country: 'USA', regionType: 'State', latitude: 41.6809, longitude: -71.5118, riskLevel: 'moderate', temperature: 26, humidity: 48 },
    { id: 'usa-sc', name: 'South Carolina', country: 'USA', regionType: 'State', latitude: 33.8569, longitude: -80.9450, riskLevel: 'moderate', temperature: 32, humidity: 48 },
    { id: 'usa-sd', name: 'South Dakota', country: 'USA', regionType: 'State', latitude: 44.2998, longitude: -99.4388, riskLevel: 'moderate', temperature: 29, humidity: 32 },
    { id: 'usa-tn', name: 'Tennessee', country: 'USA', regionType: 'State', latitude: 35.7478, longitude: -86.6923, riskLevel: 'moderate', temperature: 31, humidity: 43 },
    { id: 'usa-tx', name: 'Texas', country: 'USA', regionType: 'State', latitude: 31.0545, longitude: -97.5635, riskLevel: 'extreme', temperature: 40, humidity: 20 },
    { id: 'usa-ut', name: 'Utah', country: 'USA', regionType: 'State', latitude: 40.1500, longitude: -111.8624, riskLevel: 'extreme', temperature: 38, humidity: 12 },
    { id: 'usa-vt', name: 'Vermont', country: 'USA', regionType: 'State', latitude: 44.0459, longitude: -72.7107, riskLevel: 'moderate', temperature: 25, humidity: 49 },
    { id: 'usa-va', name: 'Virginia', country: 'USA', regionType: 'State', latitude: 37.7693, longitude: -78.1700, riskLevel: 'moderate', temperature: 30, humidity: 44 },
    { id: 'usa-wa', name: 'Washington', country: 'USA', regionType: 'State', latitude: 47.4009, longitude: -121.4905, riskLevel: 'high', temperature: 28, humidity: 25 },
    { id: 'usa-wv', name: 'West Virginia', country: 'USA', regionType: 'State', latitude: 38.4912, longitude: -80.9545, riskLevel: 'moderate', temperature: 28, humidity: 44 },
    { id: 'usa-wi', name: 'Wisconsin', country: 'USA', regionType: 'State', latitude: 44.2685, longitude: -89.6165, riskLevel: 'moderate', temperature: 27, humidity: 42 },
    { id: 'usa-wy', name: 'Wyoming', country: 'USA', regionType: 'State', latitude: 42.7560, longitude: -107.3025, riskLevel: 'high', temperature: 29, humidity: 19 }
];

const AUSTRALIA_WILDFIRE_ALERT_REGIONS: StaticWildfireRegion[] = [
    { id: 'aus-act', name: 'Australian Capital Territory', country: 'Australia', regionType: 'Territory', latitude: -35.4735, longitude: 149.0124, riskLevel: 'high', temperature: 33, humidity: 24 },
    { id: 'aus-nsw', name: 'New South Wales', country: 'Australia', regionType: 'State', latitude: -31.2532, longitude: 146.9211, riskLevel: 'extreme', temperature: 41, humidity: 14 },
    { id: 'aus-nt', name: 'Northern Territory', country: 'Australia', regionType: 'Territory', latitude: -19.4914, longitude: 132.5510, riskLevel: 'high', temperature: 39, humidity: 19 },
    { id: 'aus-qld', name: 'Queensland', country: 'Australia', regionType: 'State', latitude: -20.9176, longitude: 142.7028, riskLevel: 'high', temperature: 36, humidity: 31 },
    { id: 'aus-sa', name: 'South Australia', country: 'Australia', regionType: 'State', latitude: -30.0002, longitude: 136.2092, riskLevel: 'extreme', temperature: 42, humidity: 12 },
    { id: 'aus-tas', name: 'Tasmania', country: 'Australia', regionType: 'State', latitude: -42.0409, longitude: 146.8087, riskLevel: 'moderate', temperature: 26, humidity: 38 },
    { id: 'aus-vic', name: 'Victoria', country: 'Australia', regionType: 'State', latitude: -36.9848, longitude: 143.3906, riskLevel: 'high', temperature: 35, humidity: 23 },
    { id: 'aus-wa', name: 'Western Australia', country: 'Australia', regionType: 'State', latitude: -25.0423, longitude: 121.6283, riskLevel: 'extreme', temperature: 43, humidity: 11 }
];

const toRiskLevel = (riskLevel: string): RiskLevel => {
    const normalized = riskLevel.toLowerCase();
    return normalized === 'moderate' || normalized === 'high' || normalized === 'extreme'
        ? normalized
        : 'low';
};

const toRegionalAlertFeature = (region: StaticWildfireRegion): RiskZoneFeature => {
    const visual = REGIONAL_ALERT_VISUALS[region.riskLevel];
    return {
        type: 'Feature',
        properties: {
            id: region.id,
            name: region.name,
            country: region.country,
            regionType: region.regionType,
            source: 'Regional wildfire alert',
            riskLevel: region.riskLevel,
            temperature: region.temperature,
            humidity: region.humidity,
            radiusMeters: visual.radiusMeters,
            alpha: visual.alpha
        },
        geometry: {
            type: 'Point',
            coordinates: [region.longitude, region.latitude]
        }
    };
};

const regionalAlertFeatures = [
    ...USA_WILDFIRE_ALERT_REGIONS,
    ...AUSTRALIA_WILDFIRE_ALERT_REGIONS
].map(toRegionalAlertFeature);

const projectCountries = new Set<string>(['USA', 'Australia']);

const matchesCountry = (feature: RiskZoneFeature, country?: string) =>
    !country || feature.properties.country === country;

const matchesMode = (feature: RiskZoneFeature, mode: MapLayerMode = 'predictive') =>
    mode === 'predictive' || feature.properties.riskLevel === 'high' || feature.properties.riskLevel === 'extreme';

const isProjectCountry = (country?: string | null) => Boolean(country && projectCountries.has(country));

export const getRegionalAlertFeatures = (query?: RiskZoneQuery) =>
    regionalAlertFeatures.filter((feature) =>
        matchesCountry(feature, query?.country) && matchesMode(feature, query?.mode)
    );

export const MapService = {
    getRiskZones: async (query?: RiskZoneQuery): Promise<RiskGeoJSON> => {
        let historyFeatures: RiskZoneFeature[] = [];

        try {
            const history = await fetchJson<HistoryRecord[]>('/history?limit=50');
            historyFeatures = history
                .filter(hasMappedLocation)
                .filter((item) => query?.country
                    ? item.location.country === query.country
                    : isProjectCountry(item.location.country)
                )
                .map((item): RiskZoneFeature => {
                    const location = item.location;
                    const lat = Number(location.latitude);
                    const lon = Number(location.longitude);
                    const riskLevel = toRiskLevel(item.risk_level);
                    const visual = RISK_VISUALS[riskLevel];
                    return {
                        type: 'Feature',
                        properties: {
                            id: `history-${item.id}`,
                            name: location.admin_region || location.name || 'Prediction Zone',
                            country: location.country || 'Unknown',
                            regionType: location.admin_region ? 'Administrative region' : 'Prediction location',
                            source: 'Prediction history',
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
                })
                .filter((feature) => matchesMode(feature, query?.mode));
        } catch (error) {
            console.warn('Unable to load prediction history for map. Showing regional wildfire alert layer.', error);
        }

        return {
            type: 'FeatureCollection',
            features: [...getRegionalAlertFeatures(query), ...historyFeatures]
        };
    }
};
