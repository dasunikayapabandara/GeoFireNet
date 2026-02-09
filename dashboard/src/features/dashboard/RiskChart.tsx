import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { RiskChartData } from '../../services/RiskService';
import styles from './RiskChart.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface RiskChartProps {
    data?: RiskChartData;
}

const RiskChart: React.FC<RiskChartProps> = ({ data }) => {
    const chartData = data ? {
        labels: data.labels,
        datasets: data.datasets.map(dataset => ({
            ...dataset,
            tension: 0.4, // Keep styling consistent
            pointRadius: dataset.fill ? 3 : 0,
        }))
    } : { labels: [], datasets: [] };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#cbd5e1',
                    usePointStyle: true,
                }
            },
            title: { display: false },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    if (!data) {
        return <div className={`flex-center ${styles.loadingContainer}`}>Loading Chart...</div>;
    }

    return <div className={styles.chartContainer}><Line options={options} data={chartData} /></div>;
};

export default RiskChart;
