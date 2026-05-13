import React from 'react';
import {
    Info, Flame, ShieldAlert, Cpu, BarChart3,
    Wind, ThermometerSun, AlertTriangle, Target, Activity, CheckCircle2
} from 'lucide-react';
import '../styles/About.css';

const About: React.FC = () => {
    return (
        <div className="about-container">
            <div className="about-header">
                <h1>
                    <Flame size={36} color="var(--accent-risk-high)" />
                    GeoFireNet
                </h1>
                <p>
                    A wildfire risk dashboard for monitoring vulnerable regions and planning earlier response.
                </p>
            </div>

            <section className="about-section">
                <h2><Info size={24} /> Project Overview</h2>
                <div className="about-grid">
                    <div className="card">
                        <h3 className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
                            <AlertTriangle size={20} color="var(--accent-risk-extreme)" /> The Problem
                        </h3>
                        <p className="about-text">
                            Many wildfire workflows depend on <strong>reactive detection</strong>: spotting fires through cameras, field reports, or satellites after ignition. That leaves emergency teams with a shorter response window.
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
                            <CheckCircle2 size={20} color="var(--accent-risk-low)" /> The Solution
                        </h3>
                        <p className="about-text">
                            GeoFireNet brings weather, vegetation, and location signals into one place so operators can estimate risk before conditions escalate.
                        </p>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <h2><AlertTriangle size={24} /> Wildfire Background</h2>
                <div className="about-grid">
                    <div className="card info-card">
                        <Flame className="info-card-icon" size={28} />
                        <h3>What is a Wildfire?</h3>
                        <p className="about-text" style={{ fontSize: '0.95rem' }}>
                            A wildfire is an uncontrolled fire in vegetation. Dry fuel, heat, and wind can turn a small ignition into a fast-moving incident.
                        </p>
                    </div>
                    <div className="card info-card">
                        <ThermometerSun className="info-card-icon" size={28} />
                        <h3>Common Causes</h3>
                        <p className="about-text" style={{ fontSize: '0.95rem' }}>
                            Fires may start from lightning, equipment, power lines, unattended burning, or deliberate ignition. Hot, dry, windy conditions increase spread.
                        </p>
                    </div>
                    <div className="card info-card">
                        <ShieldAlert className="info-card-icon" size={28} />
                        <h3>Why Predict Early?</h3>
                        <p className="about-text" style={{ fontSize: '0.95rem' }}>
                            Earlier risk awareness gives teams more time to prepare crews, communicate with communities, and monitor high-risk areas.
                        </p>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <h2><Cpu size={24} /> How GeoFireNet Works</h2>
                <div className="card">
                    <h3 style={{ marginBottom: '1.25rem' }}>Environmental Telemetry Inputs</h3>
                    <div className="about-grid" style={{ marginTop: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '1.5rem' }}>
                        <div className="flex-center border" style={{ gap: '0.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem' }}><ThermometerSun size={20} color="var(--accent-risk-high)" /> Temperature</div>
                        <div className="flex-center border" style={{ gap: '0.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem' }}><Activity size={20} color="var(--accent-primary)" /> Humidity</div>
                        <div className="flex-center border" style={{ gap: '0.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem' }}><Wind size={20} color="var(--text-secondary)" /> Wind Speed</div>
                        <div className="flex-center border" style={{ gap: '0.5rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem' }}><Target size={20} color="var(--accent-risk-med)" /> Vegetation Dryness</div>
                    </div>
                    <p className="about-text">
                        The backend scores these inputs against historical wildfire patterns and returns a risk level, confidence value, and the main conditions behind the result.
                    </p>
                </div>
            </section>

            <section className="about-section">
                <h2><BarChart3 size={24} /> Risk Calculation & Output</h2>

                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', margin: '1.5rem 0', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Risk Scoring Flow</h4>
                    <div className="flex-center" style={{ flexWrap: 'wrap', gap: '1rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <span className="card" style={{ padding: '0.5rem 1rem' }}>Telemetry Read</span>
                        <span style={{ color: 'var(--accent-primary)' }}>→</span>
                        <span className="card" style={{ padding: '0.5rem 1rem' }}>Feature Prep</span>
                        <span style={{ color: 'var(--accent-primary)' }}>→</span>
                        <span className="card" style={{ padding: '0.5rem 1rem' }}>Risk Score</span>
                        <span style={{ color: 'var(--accent-primary)' }}>→</span>
                        <span className="card" style={{ padding: '0.5rem 1rem', borderColor: 'var(--accent-risk-high)' }}>Risk Output</span>
                    </div>
                </div>

                <div className="about-grid">
                    <div className="card risk-card risk-low">
                        <h3><ShieldAlert size={20} /> Low Risk</h3>
                        <p className="about-text" style={{ fontSize: '0.9rem' }}>Ignition is unlikely. Continue normal monitoring.</p>
                    </div>
                    <div className="card risk-card risk-moderate">
                        <h3><ShieldAlert size={20} /> Moderate Risk</h3>
                        <p className="about-text" style={{ fontSize: '0.9rem' }}>Surface fires are possible. Watch for weather changes.</p>
                    </div>
                    <div className="card risk-card risk-high">
                        <h3><ShieldAlert size={20} /> High Risk</h3>
                        <p className="about-text" style={{ fontSize: '0.9rem' }}>Fires can start easily and spread quickly. Prepare response coverage.</p>
                    </div>
                    <div className="card risk-card risk-extreme">
                        <h3><ShieldAlert size={20} /> Extreme Risk</h3>
                        <p className="about-text" style={{ fontSize: '0.9rem' }}>Rapid, difficult-to-control spread is likely if ignition occurs.</p>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default About;
