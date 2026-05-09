import React, { useCallback, useEffect, useState } from 'react';
import RiskCard from './RiskCard';
import RiskChart from './RiskChart';
import { AlertCircle, RefreshCw, Activity } from 'lucide-react';
import { RiskService, type RiskMetric, type Alert, type RiskChartData } from '../../services/RiskService';
import { API_BASE_URL, checkBackendStatus } from '../../config/api';
import '../../styles/DashboardOverview.css';

interface DashboardError {
    message: string;
    details: string[];
}

const DashboardOverview: React.FC = () => {
    const [metrics, setMetrics] = useState<RiskMetric[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [chartData, setChartData] = useState<RiskChartData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<DashboardError | null>(null);
    const [countryFilter, setCountryFilter] = useState<string>('');
    const [viewMode, setViewMode] = useState<'predictive' | 'active'>('predictive');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Check health first when retrying or fetching data
            const status = await checkBackendStatus();
            if (status.health.includes('Unable to reach') || status.health.includes('failed') || status.health === 'unreachable') {
                throw new Error("Backend unreachable");
            }
            
            const query = countryFilter ? { country: countryFilter } : undefined;
            const [metricsData, alertsData, trendData] = await Promise.all([
                RiskService.getMetrics(query),
                RiskService.getAlerts(query),
                RiskService.getRiskTrend(query)
            ]);

            setMetrics(metricsData);
            setAlerts(alertsData);
            setChartData(trendData);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            const status = await checkBackendStatus();
            setError({
                message: `Backend request failed for ${API_BASE_URL}.`,
                details: [
                    `Health check: ${status.health}`,
                    `System status: ${status.system}`,
                    'Start the API with: PYTHONPATH=. .venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000',
                    'Confirm dashboard/.env contains VITE_API_BASE_URL=http://localhost:8000'
                ]
            });
        } finally {
            setLoading(false);
        }
    }, [countryFilter]);

    useEffect(() => {
        // Clear old data when filters change to prevent stale views
        const initialFetch = window.setTimeout(() => {
            setMetrics([]);
            setAlerts([]);
            setChartData(undefined);
            void fetchData();
        }, 0);
        
        const interval = window.setInterval(() => {
            void fetchData();
        }, 30000); // Auto-refresh every 30s
        return () => {
            window.clearTimeout(initialFetch);
            window.clearInterval(interval);
        };
    }, [fetchData]);

    if (loading && metrics.length === 0) {
        return <div className="dashboard-container flex-center">
            <h3>Initializing Global Terminal...</h3>
        </div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                    <h2>GeoFireNet Global Terminal</h2>
                    <span className="last-updated">
                        {viewMode === 'predictive' 
                            ? 'Future simulation: AI-driven predictive risk intelligence.' 
                            : 'Live monitoring: Confirmed active thermal satellite detections.'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost" onClick={fetchData} title="Refresh Data">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
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
                    </select>
                </div>
            </div>

            {error && (
                <div className="settings-alert error" style={{ marginBottom: '2rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} />
                    <div>
                        <strong>{error.message}</strong>
                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                            {error.details.map(detail => (
                                <li key={detail}>{detail}</li>
                            ))}
                        </ul>
                        <button className="btn btn-outline" onClick={fetchData} style={{ marginTop: '0.75rem' }}>
                            Retry Connection
                        </button>
                    </div>
                </div>
            )}

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
                <div className="chart-section card" style={{ opacity: viewMode === 'active' ? 0.3 : 1, transition: 'opacity 0.3s ease' }}>
                    <div className="section-header">
                        <h3>Risk Forecast {countryFilter ? `for ${countryFilter}` : 'Globally'}</h3>
                    </div>
                    {chartData?.labels.length === 0 ? (
                        <div className="empty-state-placeholder" style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                            <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>No prediction history available for trend analysis yet.</p>
                        </div>
                    ) : (
                        <RiskChart data={chartData} />
                    )}
                </div>

                <div className="alerts-section card">
                    <div className="section-header">
                        <h3>Recent Alerts</h3>
                    </div>
                    <ul className="alerts-list">
                        {alerts.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <AlertCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>No active alerts detected.</p>
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <li key={alert.id} className={`alert-item ${alert.severity}`}>
                                    <AlertCircle size={16} />
                                    <div>
                                        <strong>{alert.title}</strong>
                                        <p>{alert.description}</p>
                                    </div>
                                    <span className="alert-time">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
