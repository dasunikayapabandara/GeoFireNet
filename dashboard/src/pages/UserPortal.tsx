import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Flame, MapPin, Phone, ShieldCheck, Siren, Send, Users } from 'lucide-react';
import MapComponent from '../features/map/MapComponent';
import { RiskService, type Alert } from '../services/RiskService';
import '../styles/UserPortal.css';

const REGIONS: Record<string, string[]> = {
    USA: ['California', 'Texas', 'Utah', 'Arizona', 'Colorado', 'Oregon', 'Washington'],
    Australia: ['New South Wales', 'Queensland', 'South Australia', 'Victoria', 'Western Australia', 'Northern Territory']
};

const getSeverityScore = (severity: string) => {
    if (severity === 'extreme') return 92;
    if (severity === 'high') return 76;
    return 48;
};

const UserPortal: React.FC = () => {
    const [country, setCountry] = useState('USA');
    const [region, setRegion] = useState(REGIONS.USA[0]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportText, setReportText] = useState('');
    const [reportLocation, setReportLocation] = useState('');
    const [reportStatus, setReportStatus] = useState<string | null>(null);

    useEffect(() => {
        setRegion(REGIONS[country][0]);
    }, [country]);

    useEffect(() => {
        const loadAlerts = async () => {
            setLoading(true);
            try {
                const data = await RiskService.getAlerts({ country });
                setAlerts(data.slice(0, 8));
            } finally {
                setLoading(false);
            }
        };

        void loadAlerts();
    }, [country]);

    const localAlerts = useMemo(() => {
        const matching = alerts.filter((alert) => alert.region === region);
        return matching.length > 0 ? matching : alerts.slice(0, 4);
    }, [alerts, region]);

    const highestAlert = localAlerts[0];
    const riskScore = highestAlert ? getSeverityScore(highestAlert.severity) : 22;
    const riskLabel = highestAlert ? highestAlert.severity.toUpperCase() : 'LOW';

    const submitReport = (event: React.FormEvent) => {
        event.preventDefault();
        const reference = `GFN-${Date.now().toString().slice(-6)}`;
        setReportStatus(`Report ${reference} submitted for operator review.`);
        setReportText('');
        setReportLocation('');
    };

    return (
        <div className="user-portal">
            <div className="user-portal-header">
                <div>
                    <span className="portal-eyebrow"><Users size={16} /> Public User Side</span>
                    <h2>Community Wildfire Safety Portal</h2>
                    <p>Check local wildfire risk, review public alerts, and send field reports to GeoFireNet operators.</p>
                </div>
                <div className="portal-filter-card">
                    <label>Country</label>
                    <select value={country} onChange={(event) => setCountry(event.target.value)}>
                        <option value="USA">United States</option>
                        <option value="Australia">Australia</option>
                    </select>
                    <label>Region</label>
                    <select value={region} onChange={(event) => setRegion(event.target.value)}>
                        {REGIONS[country].map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>
            </div>

            <div className="user-kpi-grid">
                <div className={`user-risk-card risk-${highestAlert?.severity ?? 'low'}`}>
                    <span><Flame size={18} /> Local Risk</span>
                    <strong>{riskLabel}</strong>
                    <p>{riskScore}/100 public risk index for {region}</p>
                </div>
                <div className="user-risk-card">
                    <span><Bell size={18} /> Public Alerts</span>
                    <strong>{localAlerts.length}</strong>
                    <p>Visible warnings for your selected area</p>
                </div>
                <div className="user-risk-card">
                    <span><ShieldCheck size={18} /> Recommended Action</span>
                    <strong>{riskScore >= 76 ? 'Prepare' : riskScore >= 48 ? 'Monitor' : 'Normal'}</strong>
                    <p>{riskScore >= 76 ? 'Review evacuation route and stay ready.' : 'Keep watch on local conditions.'}</p>
                </div>
            </div>

            <div className="user-main-grid">
                <section className="card user-map-card">
                    <div className="user-section-header">
                        <h3><MapPin size={20} /> Public Risk Map</h3>
                    </div>
                    <div className="user-map-shell">
                        <MapComponent countryFilter={country} mode="predictive" />
                    </div>
                </section>

                <section className="card user-alert-card">
                    <div className="user-section-header">
                        <h3><Siren size={20} /> Current Public Alerts</h3>
                    </div>
                    {loading ? (
                        <div className="user-empty-state">Loading public alerts...</div>
                    ) : (
                        <div className="public-alert-list">
                            {localAlerts.map((alert) => (
                                <div key={alert.id} className={`public-alert-item ${alert.severity}`}>
                                    <div>
                                        <strong>{alert.region}</strong>
                                        <p>{alert.description}</p>
                                    </div>
                                    <span>{alert.severity}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <div className="user-secondary-grid">
                <section className="card report-card">
                    <div className="user-section-header">
                        <h3><Send size={20} /> Report Smoke or Fire</h3>
                    </div>
                    <form onSubmit={submitReport} className="public-report-form">
                        <label>Location or landmark</label>
                        <input value={reportLocation} onChange={(event) => setReportLocation(event.target.value)} placeholder="Road, town, or nearby landmark" required />
                        <label>What do you see?</label>
                        <textarea value={reportText} onChange={(event) => setReportText(event.target.value)} placeholder="Smoke color, flame size, wind direction, people at risk..." required />
                        <button className="btn btn-primary" type="submit">Submit Report</button>
                        {reportStatus && <div className="report-success"><CheckCircle2 size={16} /> {reportStatus}</div>}
                    </form>
                </section>

                <section className="card safety-card">
                    <div className="user-section-header">
                        <h3><AlertTriangle size={20} /> Safety Guidance</h3>
                    </div>
                    <ul className="safety-list">
                        <li>Keep phone charged and monitor official emergency channels.</li>
                        <li>Prepare medication, ID, water, mask, and essential documents.</li>
                        <li>Leave early if authorities warn of evacuation or visibility drops.</li>
                        <li>Do not drive toward smoke to inspect the fire.</li>
                    </ul>
                    <div className="emergency-box">
                        <Phone size={18} />
                        <span>Emergency: call local fire/emergency services immediately for active flame or trapped people.</span>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default UserPortal;
