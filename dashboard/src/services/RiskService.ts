// Shared Types
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

// API Response Type
interface ApiRiskResponse {
    risk_score: number;
    risk_level: string;
    baseline_score: number;
    baseline_level: string;
    primary_drivers: string[];
}

const mockAlerts: Alert[] = [
    { id: '1', title: 'High Wind Warning', description: 'Gusts up to 45mph in Northern Sector.', timestamp: '2h ago', severity: 'high' },
    { id: '2', title: 'Dry Lightning Potential', description: 'Forecasted for late afternoon.', timestamp: '4h ago', severity: 'moderate' },
];

const mockChartData: RiskChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
        {
            label: 'Fire Risk Index',
            data: [35, 42, 38, 55, 68, 72, 65],
            fill: true,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: '#ef4444',
        },
        {
            label: 'Historical Avg',
            data: [30, 32, 35, 38, 40, 42, 41],
            fill: false,
            borderColor: '#3b82f6',
            borderDash: [5, 5],
        }
    ],
};

// Simulate Current Conditions (Napa Valley Default)
const currentConditions = {
    temp: 35,
    humidity: 15,
    wind: 25,
    veg_moisture: 0.2 // Renamed to match backend Pydantic model
};

// Fallback Logic (Client-Side)
const calculateFallbackRisk = (temp: number, humidity: number, wind: number, veg: number): number => {
    const n_temp = Math.min(temp / 50.0, 1);
    const n_hum = Math.min(humidity / 100.0, 1);
    const n_wind = Math.min(wind / 100.0, 1);
    const n_veg = Math.min(veg, 1);
    // Linear Baseline Formula
    const score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40;
    return Math.max(0, Math.min(score, 100));
};

const getRiskStatus = (score: number): 'low' | 'moderate' | 'high' | 'extreme' => {
    if (score < 30) return 'low';
    if (score < 50) return 'moderate';
    if (score < 80) return 'high';
    return 'extreme';
};

export const RiskService = {
    getMetrics: async (): Promise<RiskMetric[]> => {
        let mlScore: number;
        let baselineScore: number;
        let mlStatus: 'low' | 'moderate' | 'high' | 'extreme';
        let baselineStatus: 'low' | 'moderate' | 'high' | 'extreme';
        let drivers: string[] = [];

        try {
            // Validating Backend Connection
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentConditions)
            });

            if (!response.ok) throw new Error('API Error');

            const data: ApiRiskResponse = await response.json();
            mlScore = data.risk_score;
            mlStatus = data.risk_level.toLowerCase() as any;
            baselineScore = data.baseline_score;
            baselineStatus = data.baseline_level.toLowerCase() as any;
            drivers = data.primary_drivers || [];

        } catch (error) {
            console.warn("Backend API unreachable. Using fallback logic.", error);
            // Fallback: Calculate locally
            baselineScore = calculateFallbackRisk(currentConditions.temp, currentConditions.humidity, currentConditions.wind, currentConditions.veg_moisture);
            mlScore = baselineScore; // Fallback assumes they are same if model down
            baselineStatus = getRiskStatus(baselineScore);
            mlStatus = baselineStatus;
            drivers = ["Data Unavailable"];
        }

        return [
            {
                title: "Avg. Risk Score (ML)",
                value: `${Math.round(mlScore)}/100`,
                change: drivers.length > 0 ? `Drivers: ${drivers[0]}` : "Stable", // Display top driver as 'change' text for visibility
                trend: "up",
                status: mlStatus
            },
            {
                title: "Heuristic Baseline",
                value: `${Math.round(baselineScore)}/100`,
                change: "0%",
                trend: "neutral",
                status: baselineStatus
            },
            {
                title: "Active Hotspots",
                value: "14",
                change: "+2",
                trend: "up",
                status: "moderate"
            },
            {
                title: "Model Confidence",
                value: "High",
                trend: "neutral",
                status: "low"
            },
        ];
    },
    getAlerts: async (): Promise<Alert[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockAlerts), 500));
    },
    getRiskTrend: async (): Promise<RiskChartData> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockChartData), 800));
    }
};
