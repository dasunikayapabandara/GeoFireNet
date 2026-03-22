import React, { useState, useMemo } from 'react';
import {
    BellRing, AlertOctagon, CheckCircle2, ShieldAlert,
    Filter, Map, Calendar, X, ThermometerSun, Wind, Droplets, Leaf
} from 'lucide-react';
import '../styles/Alerts.css';

interface AlertDetail {
    id: string;
    title: string;
    description: string;
    level: 'extreme' | 'high' | 'moderate';
    region: string;
    country: string;
    timestamp: string;
    score: number;
    drivers: string[];
    status: 'active' | 'resolved';
    weather: {
        temp: number;
        humidity: number;
        wind: number;
        veg: number;
    };
}

// Generate Realistic Mock Alert Data
const generateMockAlerts = (): AlertDetail[] => {
    return [
        {
            id: 'ALT-9021', title: 'Critical Wildfire Conditions', description: 'Immediate threat identified. Models predict highly volatile fire spread.',
            level: 'extreme', region: 'California', country: 'USA', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            score: 94, drivers: ['High Temperature', 'Severe Drought'], status: 'active',
            weather: { temp: 42, humidity: 8, wind: 45, veg: 0.15 }
        },
        {
            id: 'ALT-9020', title: 'Elevated Risk Pre-ignition', description: 'Vegetation moisture dropped below baseline thresholds. Expect elevated ignition risk.',
            level: 'high', region: 'New South Wales', country: 'Australia', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            score: 82, drivers: ['Dry Vegetation', 'High Wind'], status: 'active',
            weather: { temp: 37, humidity: 12, wind: 60, veg: 0.22 }
        },
        {
            id: 'ALT-9019', title: 'Moderate Dry Spell', description: 'Monitoring required. Dry conditions present but wind speeds are nominal.',
            level: 'moderate', region: 'Attica', country: 'Greece', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            score: 55, drivers: ['Low Humidity'], status: 'active',
            weather: { temp: 32, humidity: 20, wind: 15, veg: 0.40 }
        },
        {
            id: 'ALT-9018', title: 'High Wind Warning', description: 'Gale force winds expanding across dry brush zones.',
            level: 'high', region: 'Algarve', country: 'Portugal', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            score: 78, drivers: ['High Wind'], status: 'resolved',
            weather: { temp: 28, humidity: 25, wind: 85, veg: 0.35 }
        },
        {
            id: 'ALT-9017', title: 'Extreme Heat Dome', description: 'Multi-day heatwave causing explosive drying in top-soil.',
            level: 'extreme', region: 'Alberta', country: 'Canada', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            score: 91, drivers: ['High Temperature'], status: 'resolved',
            weather: { temp: 38, humidity: 15, wind: 20, veg: 0.18 }
        }
    ];
};

const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<AlertDetail[]>(generateMockAlerts());
    const [levelFilter, setLevelFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');
    const [regionFilter, setRegionFilter] = useState('');

    // Modal Details State
    const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);

    // Filter Logic
    const filteredAlerts = useMemo(() => {
        return alerts.filter(a => {
            if (levelFilter && a.level !== levelFilter) return false;
            if (statusFilter && a.status !== statusFilter) return false;
            if (regionFilter && a.country !== regionFilter) return false;
            return true;
        });
    }, [alerts, levelFilter, statusFilter, regionFilter]);

    // Metrics
    const activeCount = alerts.filter(a => a.status === 'active').length;
    const extremeCount = alerts.filter(a => a.level === 'extreme' && a.status === 'active').length;
    const highCount = alerts.filter(a => a.level === 'high' && a.status === 'active').length;

    const resolveAlert = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
        if (selectedAlert && selectedAlert.id === id) {
            setSelectedAlert({ ...selectedAlert, status: 'resolved' });
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
                    <span className="alert-metric-val">{activeCount}</span>
                </div>
                <div className="alert-metric-card" style={{ borderBottom: '4px solid var(--accent-risk-extreme)' }}>
                    <span className="alert-metric-title">Active Extreme Risk</span>
                    <span className="alert-metric-val" style={{ color: 'var(--accent-risk-extreme)' }}>{extremeCount}</span>
                </div>
                <div className="alert-metric-card" style={{ borderBottom: '4px solid var(--accent-risk-high)' }}>
                    <span className="alert-metric-title">Active High Risk</span>
                    <span className="alert-metric-val" style={{ color: 'var(--accent-risk-high)' }}>{highCount}</span>
                </div>
                <div className="alert-metric-card">
                    <span className="alert-metric-title">Alerts Generated Today</span>
                    <span className="alert-metric-val">12</span>
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
                <div style={{ marginLeft: 'auto' }}>
                    <button className="btn btn-ghost" onClick={() => setAlerts(generateMockAlerts())}>Refresh Data</button>
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
                        <div key={alert.id} className={`alert-card-row ${alert.level}`} onClick={() => setSelectedAlert(alert)}>
                            <div className="alert-icon-col">
                                {getIconForLevel(alert.level)}
                            </div>
                            <div className="alert-main-col">
                                <h3>{alert.title}</h3>
                                <p>{alert.id}</p>
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
                                <span className="alert-val" style={{ color: alert.level === 'extreme' ? 'var(--accent-risk-extreme)' : 'var(--text-primary)' }}>{alert.score}/100</span>
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
                                    <span className={`badge badge-${selectedAlert.level}`}>{selectedAlert.level.toUpperCase()}</span>
                                    <span className={`badge badge-${selectedAlert.status}`}>{selectedAlert.status.toUpperCase()}</span>
                                </div>
                                <h2>{selectedAlert.title} ({selectedAlert.id})</h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    {selectedAlert.region}, {selectedAlert.country} • {new Date(selectedAlert.timestamp).toLocaleString()}
                                </p>
                            </div>
                            <button className="close-btn" onClick={() => setSelectedAlert(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>{selectedAlert.description}</p>

                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Identified Drivers</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {selectedAlert.drivers.map((driver, idx) => (
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
