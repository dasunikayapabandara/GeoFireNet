export interface PredictionInput {
    temp: number;
    humidity: number;
    wind: number;
    veg_moisture: number;
    country: string;
    admin_region: string;
}

export interface PredictionResult {
    risk_score: number;
    risk_probability: number;
    risk_level: string;
    baseline_score: number;
    baseline_level: string;
    explanation: string[];
    system_status: string;
}

export interface HistoryItem {
    id: number;
    timestamp: string;
    risk_level: string;
    risk_probability: number;
    primary_drivers: string;
    location: {
        name: string | null;
        country: string | null;
        admin_region: string | null;
        latitude: number | null;
        longitude: number | null;
    } | null;
    weather_input: {
        temp: number;
        humidity: number;
        wind: number;
        veg_moisture: number;
    };
}
