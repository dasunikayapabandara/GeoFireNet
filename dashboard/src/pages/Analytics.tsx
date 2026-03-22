import React, { useState, useEffect } from 'react';
import {
    Flame, TrendingUp, AlertOctagon, Activity,
    Map, Filter, Lightbulb, ThermometerSun, Wind, AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import '../styles/Analytics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

// Theme Colors
const colors = {
    extreme: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#22c55e',
    primary: '#3b82f6',
    border: 'rgba(255, 255, 255, 0.1)',
    textBase: '#94a3b8'
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: colors.textBase,
    scales: {
        x: { grid: { color: colors.border }, ticks: { color: colors.textBase } },
        y: { grid: { color: colors.border }, ticks: { color: colors.textBase } }
    },
    plugins: {
        legend: { labels: { color: '#f8fafc' } }
    }
};

const Analytics: React.FC = () => {
    // Filters State
    const [timeRange, setTimeRange] = useState('7d');
    const [region, setRegion] = useState('');
    const [isDetectionMode, setIsDetectionMode] = useState(false);

    // Mock Data Generators for Dashboard
    const trendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Avg Risk Score',
                data: [42, 45, 55, 68, 74, 82, 78],
                borderColor: colors.primary,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const distData = {
        labels: ['Low', 'Moderate', 'High', 'Extreme'],
        datasets: [{
            data: [45, 30, 15, 10],
            backgroundColor: [colors.low, colors.moderate, colors.high, colors.extreme],
            borderWidth: 0
        }]
    };

    const regionData = {
        labels: ['Napa Valley', 'Sonoma', 'Mendocino', 'Lake County', 'Santa Cruz', 'Marin'],
        datasets: [{
            label: 'Extreme Risk Count',
            data: [24, 18, 12, 8, 15, 5],
            backgroundColor: colors.extreme,
            borderRadius: 4
        }]
    };

    const driversData = {
        labels: ['Dry Vegetation', 'High Wind', 'Low Humidity', 'High Temp'],
        datasets: [{
            label: 'Driver Influence %',
            data: [45, 30, 15, 10],
            backgroundColor: colors.primary,
            borderRadius: 4
        }]
    };

    const recentAlerts = [
        { id: 1, title: 'Extreme Fire Weather', region: 'Napa Valley Sector A', time: '10 mins ago', level: 'extreme' },
        { id: 2, title: 'Elevated High Winds', region: 'Sonoma Ridge', time: '1 hour ago', level: 'high' },
        { id: 3, title: 'Dry Vegetation Threshold', region: 'Santa Cruz Mountains', time: '3 hours ago', level: 'moderate' },
    ];

    return (
        <div className="analytics-container">
            {/* Header & Filters */}
            <div className="analytics-header">
                <div className="analytics-title">
                    <h1><Activity size={32} color="var(--accent-primary)" /> Risk Analytics</h1>
                    <p>Comprehensive breakdown of predictive models and regional intelligence.</p>
                </div>

                <div className="filters-bar">
                    <div className="filter-group">
                        <Filter size={18} color="var(--text-secondary)" />
                        <select title="Time Range Filter" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <Map size={18} color="var(--text-secondary)" />
                        <select title="Region Filter" value={region} onChange={(e) => setRegion(e.target.value)}>
                            <option value="">Global Coverage</option>
                            <option value="USA">North America (USA)</option>
                            <option value="Australia">Oceania (Australia)</option>
                            <option value="Greece">Europe (Greece)</option>
                        </select>
                    </div>
                    <div className="filter-group" style={{ marginLeft: 'auto' }}>
                        <button
                            onClick={() => setIsDetectionMode(!isDetectionMode)}
                            style={{
                                background: isDetectionMode ? 'var(--accent-risk-extreme)' : 'var(--bg-tertiary)',
                                padding: '0.5rem 1rem', borderRadius: '0.375rem',
                                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'white'
                            }}
                        >
                            Mode: {isDetectionMode ? 'Live Active Detections' : 'Predictive Risk Algorithms'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Insights Panel */}
            <div className="insight-panel">
                <h3><Lightbulb size={20} /> AI Generated Insights</h3>
                <ul className="insight-list">
                    <li className="insight-item">
                        <TrendingUp size={18} color="var(--accent-risk-extreme)" />
                        <span>Average risk score increased by <strong>12%</strong> over the last 48 hours due to incoming warm fronts.</span>
                    </li>
                    <li className="insight-item">
                        <Map size={18} color="var(--accent-primary)" />
                        <span><strong>Napa Valley</strong> holds the highest concentration of Extreme Risk predictions this week.</span>
                    </li>
                    <li className="insight-item">
                        <Wind size={18} color="var(--accent-risk-med)" />
                        <span><strong>Dry Vegetation</strong> and <strong>High Winds</strong> are the leading synergistic drivers forcing alerts.</span>
                    </li>
                </ul>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span>Total Predictions</span>
                        <Activity size={18} />
                    </div>
                    <div className="kpi-value">14,230</div>
                    <div className="kpi-trend trend-up"><ArrowUpRight size={14} /> +5.2% vs last week</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span>Avg Risk Score</span>
                        <Activity size={18} />
                    </div>
                    <div className="kpi-value">68/100</div>
                    <div className="kpi-trend trend-up"><ArrowUpRight size={14} /> +2.1%</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span>High/Extreme Count</span>
                        <Flame size={18} color="var(--accent-risk-extreme)" />
                    </div>
                    <div className="kpi-value">1,402</div>
                    <div className="kpi-trend trend-down"><ArrowDownRight size={14} /> -1.5%</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span>Active Alerts</span>
                        <AlertOctagon size={18} color="var(--accent-risk-high)" />
                    </div>
                    <div className="kpi-value">24</div>
                    <div className="kpi-trend trend-up"><ArrowUpRight size={14} /> +12%</div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="charts-grid-2">
                <div className="chart-card">
                    <div className="chart-header">
                        <TrendingUp size={20} color="var(--accent-primary)" /> Risk Trend Over Time
                    </div>
                    <div className="chart-container">
                        <Line data={trendData} options={chartOptions} />
                    </div>
                </div>
                <div className="chart-card">
                    <div className="chart-header">
                        <Activity size={20} color="var(--accent-risk-med)" /> Risk Distribution
                    </div>
                    <div className="chart-container">
                        <Doughnut data={distData} options={{ ...chartOptions, scales: undefined }} />
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="charts-grid-3">
                <div className="chart-card">
                    <div className="chart-header">
                        <Map size={20} color="var(--accent-primary)" /> Region-Wise Extreme Risk
                    </div>
                    <div className="chart-container">
                        <Bar data={regionData} options={{ ...chartOptions, indexAxis: 'y' }} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <ThermometerSun size={20} color="var(--accent-risk-high)" /> Top Risk Drivers
                    </div>
                    <div className="chart-container">
                        <Bar data={driversData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card" style={{ overflowY: 'auto' }}>
                    <div className="chart-header">
                        <AlertTriangle size={20} color="var(--accent-risk-extreme)" /> Recent Alerts
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        {recentAlerts.map(alert => (
                            <div key={alert.id} className={`alert-item alert-${alert.level}`}>
                                <div className="alert-info">
                                    <h4 style={{ color: `var(--accent-risk-${alert.level === 'extreme' ? 'extreme' : alert.level === 'high' ? 'high' : 'med'})` }}>
                                        {alert.title}
                                    </h4>
                                    <p>{alert.region}</p>
                                </div>
                                <div className="alert-time">{alert.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Analytics;
