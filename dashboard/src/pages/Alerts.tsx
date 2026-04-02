import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    BellRing, AlertOctagon, CheckCircle2, ShieldAlert,
    Map, X, ThermometerSun, Wind, Droplets, Leaf
} from 'lucide-react';
import { RiskService } from '../services/RiskService';
import '../styles/Alerts.css';

const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({ active_total: 0, active_extreme: 0, active_high: 0, generated_today: 0 });
    const [loading, setLoading] = useState(true);
    const [levelFilter, setLevelFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');
    const [regionFilter, setRegionFilter] = useState('');

    // Modal Details State
    const [selectedAlert, setSelectedAlert] = useState<any | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const data = await RiskService.getAlerts({ country: regionFilter || undefined });
        const sumData = await RiskService.getAlertsSummary();
        setAlerts(data);
        setSummary(sumData);
        setLoading(false);
    }, [regionFilter]);

    useEffect(() => {
        fetchData();
        // Fallback polling for the dashboard showcase
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // Filter Logic
    const filteredAlerts = useMemo(() => {
        return alerts.filter(a => {
            if (levelFilter && a.severity !== levelFilter) return false;
            if (statusFilter && a.status !== statusFilter) return false;
            return true;
        });
    }, [alerts, levelFilter, statusFilter]);

    const resolveAlert = async (id: string) => {
        const success = await RiskService.resolveAlert(id);
        if (success) {
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
            if (selectedAlert && selectedAlert.id === id) {
                setSelectedAlert({ ...selectedAlert, status: 'resolved' });
            }
            fetchData();
        }
    };

    const getIconForLevel = (level: string) => {
        switch (level) {
            case 'extreme': return <ShieldAlert size={24} color="var(--accent-risk-extreme)" />;
            case 'high': return <AlertOctagon size={24} color="var(--accent-risk-high)" />;
            default: return <BellRing size={24} color="var(--accent-risk-med)" />;
        }
    };

    return (
        <div className="alerts-page-container">
            <div className="alerts-header">
                <div className="alerts-title">
                    <h1><BellRing size={32} color="var(--accent-primary)" /> Alert Center</h1>
                    <p>Manage, review, and acknowledge predictive warnings.</p>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="alerts-summary-grid">
                <div className="alert-metric-card">
                    <span className="alert-metric-title">Total Active Alerts</span>
                    <span className="alert-metric-val">{summary.active_total}</span>
                </div>
                <div className="alert-metric-card" style={{ borderBottom: '4px solid var(--accent-risk-extreme)' }}>
                    <span className="alert-metric-title">Active Extreme Risk</span>
                    <span className="alert-metric-val" style={{ color: 'var(--accent-risk-extreme)' }}>{summary.active_extreme}</span>
                </div>
                <div className="alert-metric-card" style={{ borderBottom: '4px solid var(--accent-risk-high)' }}>
                    <span className="alert-metric-title">Active High Risk</span>
                    <span className="alert-metric-val" style={{ color: 'var(--accent-risk-high)' }}>{summary.active_high}</span>
                </div>
                <div className="alert-metric-card">
                    <span className="alert-metric-title">Alerts Generated Today</span>
                    <span className="alert-metric-val">{summary.generated_today}</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="alerts-filter-bar">
                <div className="alerts-filter-group">
                    <ShieldAlert size={18} color="var(--text-secondary)" />
                    <select title="Severity Filter" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
                        <option value="">All Severities</option>
                        <option value="extreme">Extreme</option>
                        <option value="high">High</option>
                        <option value="moderate">Moderate</option>
                    </select>
                </div>
                <div className="alerts-filter-group">
                    <CheckCircle2 size={18} color="var(--text-secondary)" />
                    <select title="Status Filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                        <option value="acknowledged">Acknowledged</option>
                    </select>
                </div>
                <div className="alerts-filter-group">
                    <Map size={18} color="var(--text-secondary)" />
                    <select title="Region Filter" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
                        <option value="">Global</option>
                        <option value="USA">USA</option>
                        <option value="Australia">Australia</option>
                        <option value="Greece">Greece</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Canada">Canada</option>
                    </select>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {loading && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fetching...</span>}
                    <button className="btn btn-ghost" onClick={fetchData}>Refresh Data</button>
                </div>
            </div>

            {/* Alert List */}
            <div className="alerts-list-container">
                {filteredAlerts.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle2 size={48} color="var(--accent-risk-low)" />
                        <h3>No matching alerts</h3>
                        <p>Your filter parameters yielded zero active alerts. Everything looks clear.</p>
                    </div>
                ) : (
                    filteredAlerts.map(alert => (
                        <div key={alert.id} className={`alert-card-row ${alert.severity}`} onClick={() => setSelectedAlert(alert)}>
                            <div className="alert-icon-col">
                                {getIconForLevel(alert.severity)}
                            </div>
                            <div className="alert-main-col">
                                <h3>{alert.title}</h3>
                                <p>ID: {alert.id}</p>
                            </div>
                            <div className="alert-meta-col">
                                <span className="alert-label">Location</span>
                                <span className="alert-val">{alert.region}, {alert.country}</span>
                            </div>
                            <div className="alert-meta-col">
                                <span className="alert-label">Time Logged</span>
                                <span className="alert-val">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="alert-meta-col">
                                <span className="alert-label">Risk Score</span>
                                <span className="alert-val" style={{ color: alert.severity === 'extreme' ? 'var(--accent-risk-extreme)' : 'var(--text-primary)' }}>{alert.score.toFixed(1)}/100</span>
                            </div>
                            <div className="alert-meta-col">
                                <span className="alert-label">Status</span>
                                <span className={`badge badge-${alert.status}`}>{alert.status.toUpperCase()}</span>
                            </div>
                            <div>
                                <button className="btn btn-ghost" style={{ width: '100%' }}>View Details</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            {selectedAlert && (
                <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span className={`badge badge-${selectedAlert.severity}`}>{selectedAlert.severity.toUpperCase()}</span>
                                    <span className={`badge badge-${selectedAlert.status}`}>{selectedAlert.status.toUpperCase()}</span>
                                </div>
                                <h2>{selectedAlert.title} </h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    {selectedAlert.region}, {selectedAlert.country} • {new Date(selectedAlert.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedAlert(null)} title="Close Modal">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>{selectedAlert.description}</p>

                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Identified Drivers</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {selectedAlert.drivers.map((driver: string, idx: number) => (
                                        <span key={idx} className="badge" style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}>
                                            {driver}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="weather-grid">
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        <ThermometerSun size={16} /> Temperature
                                    </div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedAlert.weather.temp}°C</span>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        <Droplets size={16} /> Humidity
                                    </div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedAlert.weather.humidity}%</span>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        <Wind size={16} /> Wind Speed
                                    </div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedAlert.weather.wind} km/h</span>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                        <Leaf size={16} /> Veg Moisture
                                    </div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{(selectedAlert.weather.veg * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setSelectedAlert(null)}>Close</button>
                            {selectedAlert.status === 'active' && (
                                <button className="btn btn-primary" onClick={() => resolveAlert(selectedAlert.id)}>
                                    Mark as Resolved
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Alerts;
