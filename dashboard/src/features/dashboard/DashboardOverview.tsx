import React, { useCallback, useEffect, useState } from 'react';
import RiskCard from './RiskCard';
import RiskChart from './RiskChart';
import MapComponent from '../map/MapComponent';
import { AlertCircle, RefreshCw, Activity, Map, RadioTower, ShieldAlert } from 'lucide-react';
import { RiskService, type RiskMetric, type Alert, type RiskChartData } from '../../services/RiskService';
import { API_BASE_URL, checkBackendStatus } from '../../config/api';
import {
    loadStoredSettings,
    preferredRegionToCountry,
    refreshIntervalMs,
    SETTINGS_CHANGED_EVENT,
    type DashboardSettings
} from '../../config/settings';
import '../../styles/DashboardOverview.css';

interface DashboardError {
    message: string;
    details: string[];
}

interface DashboardOverviewProps {
    onOpenLiveMap: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onOpenLiveMap }) => {
    const [metrics, setMetrics] = useState<RiskMetric[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [chartData, setChartData] = useState<RiskChartData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<DashboardError | null>(null);
    const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>(loadStoredSettings);
    const [countryFilter, setCountryFilter] = useState<string>(() => preferredRegionToCountry(loadStoredSettings()));
    const [viewMode, setViewMode] = useState<'predictive' | 'active'>('predictive');
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const query = countryFilter ? { country: countryFilter } : undefined;
            const [metricsData, alertsData, trendData] = await Promise.all([
                RiskService.getMetrics(query, viewMode),
                RiskService.getAlerts(query, viewMode),
                RiskService.getRiskTrend(query, viewMode)
            ]);

            setMetrics(metricsData);
            setAlerts(alertsData);
            setChartData(trendData);
            setLastRefreshed(new Date());
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
    }, [countryFilter, viewMode]);

    useEffect(() => {
        const handleSettingsChanged = (event: Event) => {
            const nextSettings = (event as CustomEvent<DashboardSettings>).detail ?? loadStoredSettings();
            setDashboardSettings(nextSettings);
            setCountryFilter(preferredRegionToCountry(nextSettings));
        };

        window.addEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged);
        return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged);
    }, []);

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
        }, refreshIntervalMs(dashboardSettings));
        return () => {
            window.clearTimeout(initialFetch);
            window.clearInterval(interval);
        };
    }, [dashboardSettings, fetchData]);

    if (loading && metrics.length === 0) {
        return <div className="dashboard-container flex-center">
            <div className="dashboard-loading">
                <RefreshCw size={22} className="animate-spin" />
                <h3>Loading dashboard...</h3>
                <p>Checking the latest risk signals for the project area.</p>
            </div>
        </div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title-block">
                    <span className="eyebrow">Wildfire Operations</span>
                    <h2>Risk Overview</h2>
                    <p className="last-updated">
                        {viewMode === 'predictive'
                            ? 'Projected risk based on current environmental inputs.'
                            : 'Confirmed active thermal detections from the monitoring layer.'}
                        {lastRefreshed ? ` Updated ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.` : ''}
                    </p>
                </div>
                <div className="dashboard-controls">
                    <button className="btn btn-ghost icon-action" onClick={() => void fetchData()} title="Refresh data" disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="segmented-control" aria-label="Risk view mode">
                        <button
                            className={`btn ${viewMode === 'predictive' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setViewMode('predictive')}
                        >
                            <ShieldAlert size={16} />
                            Risk Forecast
                        </button>
                        <button
                            className={`btn ${viewMode === 'active' ? 'btn-danger-mode' : 'btn-ghost'}`}
                            onClick={() => setViewMode('active')}
                        >
                            <RadioTower size={16} />
                            Active Detections
                        </button>
                    </div>
                    <select
                        className="region-select"
                        title="Region filter"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                    >
                        <option value="">USA + Australia</option>
                        <option value="USA">United States</option>
                        <option value="Australia">Australia</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="settings-alert error dashboard-error">
                    <AlertCircle size={20} />
                    <div>
                        <strong>{error.message}</strong>
                        <ul>
                            {error.details.map(detail => (
                                <li key={detail}>{detail}</li>
                            ))}
                        </ul>
                        <button className="btn btn-outline" onClick={fetchData}>
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
                <div className="forecast-column">
                    <div className="overview-map-section card">
                        <div className="section-header">
                            <h3>{countryFilter ? `${countryFilter === 'USA' ? 'United States' : countryFilter} Risk Map` : 'Project Risk Map'}</h3>
                            <button
                                type="button"
                                className="btn btn-outline overview-map-link"
                                onClick={onOpenLiveMap}
                            >
                                <Map size={16} />
                                <span>Open Live Map</span>
                            </button>
                        </div>
                        <div className="overview-map-shell">
                            <MapComponent countryFilter={countryFilter || undefined} mode={viewMode} />
                        </div>
                    </div>

                    <div className="chart-section card">
                        <div className="section-header">
                            <h3>
                                {viewMode === 'active' ? 'Active Detection Trend' : 'Risk Forecast'} {countryFilter ? `for ${countryFilter === 'USA' ? 'United States' : countryFilter}` : 'for USA + Australia'}
                            </h3>
                        </div>
                        {chartData?.labels.length === 0 ? (
                            <div className="empty-state-placeholder">
                                <Activity size={42} />
                                <p>No risk history is available for this view yet.</p>
                            </div>
                        ) : (
                            <RiskChart data={chartData} />
                        )}
                    </div>
                </div>

                <div className="alerts-section card">
                    <div className="section-header">
                        <h3>{viewMode === 'active' ? 'Recent Active Detections' : 'Recent Alerts'}</h3>
                    </div>
                    <ul className="alerts-list">
                        {alerts.length === 0 ? (
                            <div className="empty-alerts">
                                <AlertCircle size={32} />
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
