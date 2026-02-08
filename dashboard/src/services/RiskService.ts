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

const mockMetrics: RiskMetric[] = [
    { title: "Avg. Risk Score", value: "72/100", change: "+5%", trend: "up", status: "high" },
    { title: "Active Hotspots", value: "14", change: "+2", trend: "up", status: "moderate" },
    { title: "Weather Alert Level", value: "Orange", trend: "neutral", status: "high" },
    { title: "Protected Area", value: "85%", trend: "neutral", status: "low" },
];

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

export const RiskService = {
    getMetrics: async (): Promise<RiskMetric[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockMetrics), 500));
    },
    getAlerts: async (): Promise<Alert[]> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockAlerts), 500));
    },
    getRiskTrend: async (): Promise<RiskChartData> => {
        return new Promise((resolve) => setTimeout(() => resolve(mockChartData), 800));
    }
};
