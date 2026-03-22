import React, { useEffect, useState } from 'react';
import RiskCard from './RiskCard';
import RiskChart from './RiskChart';
import { AlertCircle } from 'lucide-react';
import { RiskService, type RiskMetric, type Alert, type RiskChartData } from '../../services/RiskService';
import '../../styles/DashboardOverview.css';

const DashboardOverview: React.FC = () => {
    const [metrics, setMetrics] = useState<RiskMetric[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [chartData, setChartData] = useState<RiskChartData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [viewMode, setViewMode] = useState<'predictive' | 'active'>('predictive');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const query = countryFilter ? { country: countryFilter } : undefined;
                const [metricsData, alertsData, trendData] = await Promise.all([
                    RiskService.getMetrics(query),
                    RiskService.getAlerts(query),
                    RiskService.getRiskTrend(query)
                ]);

                setMetrics(metricsData);
                setAlerts(alertsData);
                setChartData(trendData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [countryFilter, viewMode]);

    if (loading) {
        return <div className="dashboard-container flex-center">Loading Dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                    <h2>GeoFireNet Global Terminal</h2>
                    <span className="last-updated">Real-time geospatial intelligence</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '0.375rem', display: 'flex', gap: '0.5rem' }}>
                        <button
                            className={`btn ${viewMode === 'predictive' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setViewMode('predictive')}
                        >Predictive Risk</button>
                        <button
                            className={`btn ${viewMode === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setViewMode('active')}
                            style={{ background: viewMode === 'active' ? 'var(--accent-risk-extreme)' : 'transparent' }}
                        >Active Detections</button>
                    </div>
                    <select
                        title="Global Region Filter"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '0.375rem' }}
                    >
                        <option value="">World (Global Scale)</option>
                        <option value="USA">United States</option>
                        <option value="Australia">Australia</option>
                        <option value="Greece">Greece</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Canada">Canada</option>
                        <option value="Brazil">Brazil</option>
                    </select>
                </div>
            </div>

            <div className="metrics-grid">
                {metrics.map((metric, index) => (
                    <RiskCard
                        key={index}
                        title={metric.title}
                        value={metric.value}
                        change={metric.change}
                        trend={metric.trend}
                        status={metric.status}
                    />
                ))}
            </div>

            <div className="dashboard-main-content">
                <div className="chart-section card">
                    <div className="section-header">
                        <h3>7-Day Risk Forecast</h3>
                    </div>
                    <RiskChart data={chartData} />
                </div>

                <div className="alerts-section card">
                    <div className="section-header">
                        <h3>Recent Alerts</h3>
                    </div>
                    <ul className="alerts-list">
                        {alerts.map((alert) => (
                            <li key={alert.id} className={`alert-item ${alert.severity}`}>
                                <AlertCircle size={16} />
                                <div>
                                    <strong>{alert.title}</strong>
                                    <p>{alert.description}</p>
                                </div>
                                <span className="alert-time">{alert.timestamp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
