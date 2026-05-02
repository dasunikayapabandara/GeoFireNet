import React, { useState, useEffect, useMemo } from 'react';
import {
    Flame, TrendingUp, AlertOctagon, Activity,
    Map, Filter, ThermometerSun, Wind, AlertTriangle, ArrowUpRight
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
import { Doughnut } from 'react-chartjs-2';
import { RiskService } from '../services/RiskService';
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
    const [timeRange, setTimeRange] = useState('7d');
    const [region, setRegion] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<any>(null);
    const [alertsSummary, setAlertsSummary] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [summaryData, alertsSum] = await Promise.all([
                RiskService.getGlobalSummary({ country: region || undefined }),
                RiskService.getAlertsSummary()
            ]);
            setSummary(summaryData);
            setAlertsSummary(alertsSum);
        } catch (err) {
            setError("Failed to fetch analytics from backend.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [region, timeRange]);

    const distData = useMemo(() => {
        if (!summary) return null;
        const levels = ['Low', 'Moderate', 'High', 'Extreme'];
        const data = levels.map(level => {
            const found = summary.predictions_summary.find((r: any) => r.level === level);
            return found ? found.count : 0;
        });

        return {
            labels: levels,
            datasets: [{
                data: data,
                backgroundColor: [colors.low, colors.moderate, colors.high, colors.extreme],
                borderWidth: 0
            }]
        };
    }, [summary]);

    const kpis = useMemo(() => {
        if (!summary || !alertsSummary) return { predictions: '0', avgRisk: '0', extremeCount: '0', activeAlerts: '0' };
        
        const totalPredictions = summary.predictions_summary.reduce((acc: number, curr: any) => acc + curr.count, 0);
        const extremeCount = summary.predictions_summary
            .filter((r: any) => r.level === 'Extreme')
            .reduce((acc: number, curr: any) => acc + curr.count, 0);
        
        const highExtreme = summary.predictions_summary
            .filter((r: any) => r.level === 'High' || r.level === 'Extreme')
            .reduce((acc: number, curr: any) => acc + curr.count, 0);
        
        const avgRisk = totalPredictions > 0 ? Math.round((highExtreme / totalPredictions) * 100) : 0;

        return {
            predictions: totalPredictions.toLocaleString(),
            avgRisk: avgRisk.toString(),
            extremeCount: extremeCount.toLocaleString(),
            activeAlerts: alertsSummary.active_total.toString()
        };
    }, [summary, alertsSummary]);

    if (loading) return <div className="analytics-container flex-center"><h3>Loading Neural Intelligence...</h3></div>;
    if (error) return <div className="analytics-container flex-center"><div className="settings-alert error">{error}</div></div>;

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <div className="analytics-title">
                    <h1><Activity size={32} color="var(--accent-primary)" /> Risk Analytics</h1>
                    <p>Live backend-driven intelligence for predictive and active fire risk monitoring.</p>
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
                            <option value="USA">USA</option>
                            <option value="Australia">Australia</option>
                            <option value="Greece">Greece</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header"><span>Total Predictions</span><Activity size={18} /></div>
                    <div className="kpi-value">{kpis.predictions}</div>
                    <div className="kpi-trend trend-up"><ArrowUpRight size={14} /> Total DB Logs</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header"><span>High/Extreme Ratio</span><Activity size={18} /></div>
                    <div className="kpi-value">{kpis.avgRisk}%</div>
                    <div className="kpi-trend trend-up"><ArrowUpRight size={14} /> Critical Mass</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header"><span>Extreme Count</span><Flame size={18} color="var(--accent-risk-extreme)" /></div>
                    <div className="kpi-value">{kpis.extremeCount}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-header"><span>Active Alerts</span><AlertOctagon size={18} color="var(--accent-risk-high)" /></div>
                    <div className="kpi-value">{kpis.activeAlerts}</div>
                </div>
            </div>

            <div className="charts-grid-2">
                <div className="chart-card">
                    <div className="chart-header">
                        <TrendingUp size={20} color="var(--accent-primary)" /> Risk Trend Over Time
                    </div>
                    <div className="pending-overlay">
                        <TrendingUp size={48} className="pending-icon" />
                        <p>Temporal Aggregation Pending Backend Integration</p>
                    </div>
                </div>
                <div className="chart-card">
                    <div className="chart-header">
                        <Activity size={20} color="var(--accent-risk-med)" /> Risk Distribution (Live)
                    </div>
                    <div className="chart-container">
                        {distData && <Doughnut data={distData} options={{ ...chartOptions, scales: undefined }} />}
                    </div>
                </div>
            </div>

            <div className="charts-grid-3">
                <div className="chart-card">
                    <div className="chart-header"><Map size={20} color="var(--accent-primary)" /> Regional Distribution</div>
                    <div className="pending-overlay">
                        <Map size={32} className="pending-icon" />
                        <p>Spatial Grouping Pending</p>
                    </div>
                </div>
                <div className="chart-card">
                    <div className="chart-header"><ThermometerSun size={20} color="var(--accent-risk-high)" /> Top Risk Drivers</div>
                    <div className="pending-overlay">
                        <Wind size={32} className="pending-icon" />
                        <p>Driver Correlation API Pending</p>
                    </div>
                </div>
                <div className="chart-card">
                    <div className="chart-header"><AlertTriangle size={20} color="var(--accent-risk-extreme)" /> Recent Alerts Feed</div>
                    <div className="pending-overlay">
                        <AlertTriangle size={32} className="pending-icon" />
                        <p>Stream Integration Pending</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
