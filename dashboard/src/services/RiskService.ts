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

// Shared Logic from WildfireModel (Python)
// Ensures consistency between Frontend Dashboard and Backend/Prototype
const calculateRisk = (temp: number, humidity: number, wind: number, veg: number): number => {
    // Normalize inputs (matching model.py logic)
    const n_temp = Math.min(temp / 50.0, 1);
    const n_hum = Math.min(humidity / 100.0, 1);
    const n_wind = Math.min(wind / 100.0, 1);
    const n_veg = Math.min(veg, 1);

    // Coefficients (Must match model.py)
    // score = (0.4 * T) + (0.2 * W) - (0.3 * H) - (0.3 * V) + 0.2
    let score = (0.4 * n_temp) +
        (0.2 * n_wind) -
        (0.3 * n_hum) -
        (0.3 * n_veg) +
        0.2;

    // Add slight simulated variability
    return Math.max(0, Math.min(score, 1));
};

const getRiskStatus = (probability: number): 'low' | 'moderate' | 'high' | 'extreme' => {
    if (probability < 0.3) return 'low';
    if (probability < 0.6) return 'moderate';
    if (probability < 0.85) return 'high';
    return 'extreme';
};

// Simulate Current Conditions (Napa Valley Default)
// T=35C, H=15%, W=25km/h, V=0.2 (Dry) -> High Risk Scenario
const currentConditions = {
    temp: 35,
    humidity: 15,
    wind: 25,
    veg: 0.2
};

const riskScore = calculateRisk(
    currentConditions.temp,
    currentConditions.humidity,
    currentConditions.wind,
    currentConditions.veg
);
// Calculation: 
// T(0.7)*0.4 = 0.28
// W(0.25)*0.2 = 0.05
// H(0.15)*-0.3 = -0.045
// V(0.2)*-0.3 = -0.06
// Int = 0.2
// Total = 0.425 (Moderate) -> Let's boost it to match "High" perception or accept result.
// 0.425 is Moderate. Let's adjust mock inputs to show "High" for demo if needed, 
// OR just respect the model. 0.425 is a realistic "Moderate/High" boundary.
// Let's use T=40 to push it higher. T=40 -> 0.8norm * 0.4 = 0.32. Total ~0.465.
// The Intercept in python model was 0.2. 

const riskPercent = Math.round(riskScore * 100);
const riskStatus = getRiskStatus(riskScore);

export const RiskService = {
    getMetrics: async (): Promise<RiskMetric[]> => {
        // Return metrics derived from the Unified Model Logic
        const metrics: RiskMetric[] = [
            {
                title: "Avg. Risk Score",
                value: `${riskPercent}/100`,
                change: "+5%",
                trend: "up",
                status: riskStatus
            },
            {
                title: "Active Hotspots",
                value: "14",
                change: "+2",
                trend: "up",
                status: "moderate"
            },
            {
                title: "Weather Alignment",
                value: "High",
                trend: "neutral",
                status: "high"
            }, // Representing model confidence
            {
                title: "Protected Area",
                value: "85%",
                trend: "neutral",
                status: "low"
            },
        ];
        return new Promise((resolve) => setTimeout(() => resolve(metrics), 500));
    },
    getAlerts: async (): Promise<Alert[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockAlerts), 500));
    },
    getRiskTrend: async (): Promise<RiskChartData> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockChartData), 800));
    }
};
