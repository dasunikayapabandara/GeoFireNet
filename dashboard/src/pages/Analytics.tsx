import React, { useEffect, useState } from 'react';
import { RiskService } from '../services/RiskService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Analytics: React.FC = () => {
    const [summary, setSummary] = useState<{ risk_level: string, count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            const data = await RiskService.getRiskSummary();
            setSummary(data);
            setLoading(false);
        };
        fetchSummary();
    }, []);

    const data = {
        labels: summary.map(s => s.risk_level),
        datasets: [
            {
                data: summary.map(s => s.count),
                backgroundColor: [
                    '#22c55e', // Low (Green)
                    '#eab308', // Moderate (Yellow)
                    '#f97316', // High (Orange)
                    '#ef4444', // Extreme (Red)
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        plugins: {
            legend: { position: 'bottom' as const, labels: { color: '#f8fafc' } }
        },
        maintainAspectRatio: false
    };

    if (loading) return <div className="p-6">Loading Analytics...</div>;

    return (
        <div className="p-6">
            <h2>Analytics & Aggregation</h2>
            <p>Visual breakdown of risk trends across regions and timeframe.</p>

            <div className="card mt-6" style={{ height: '400px', maxWidth: '600px', margin: '2rem auto' }}>
                <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Prediction Distribution</h3>
                <Doughnut data={data} options={options} />
            </div>
        </div>
    );
};

export default Analytics;
