import React from 'react';
import {
    Info, Flame, ShieldAlert, Cpu, BarChart3, Database,
    Wind, ThermometerSun, AlertTriangle, Layers, Target, Activity, CheckCircle2
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
                    A Predictive Wildfire Risk Assessment Subsystem for proactive monitoring of vulnerable environments.
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
                            Traditional wildfire management relies on <strong>reactive detection</strong>—spotting fires via cameras or satellites <em>after</em> ignition. This severely limits the critical response window for emergency operations.
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
                            <CheckCircle2 size={20} color="var(--accent-risk-low)" /> The Solution
                        </h3>
                        <p className="about-text">
                            GeoFireNet shifts to <strong>predictive assessment</strong>. By using Artificial Intelligence to analyze environmental telemetry, it forecasts the probability of an outbreak <em>before</em> it happens.
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
                            An uncontrolled fire in combustible vegetation. They feature rapid spread, intense heat, and destructive capabilities, scaling drastically with dry weather.
                        </p>
                    </div>
                    <div className="card info-card">
                        <ThermometerSun className="info-card-icon" size={28} />
                        <h3>Common Causes</h3>
                        <p className="about-text" style={{ fontSize: '0.95rem' }}>
                            They can be natural (e.g., lightning strikes) or human-caused (e.g., equipment failures, arson). High temperatures and extreme winds rapidly accelerate them.
                        </p>
                    </div>
                    <div className="card info-card">
                        <ShieldAlert className="info-card-icon" size={28} />
                        <h3>Why Predict Early?</h3>
                        <p className="about-text" style={{ fontSize: '0.95rem' }}>
                            Early prediction provides invaluable lead time to evacuate communities, pre-position suppression crews, and mitigate ultimate disaster scale.
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
                        A trained <strong>Random Forest Classification model</strong> ingests these dynamic inputs. It cross-references current atmospheric synergistic patterns against historical data to pinpoint the exact conditions that precede severe fires.
                    </p>
                </div>
            </section>

            <section className="about-section">
                <h2><BarChart3 size={24} /> Risk Calculation & Output</h2>

                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', margin: '1.5rem 0', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Core ML Data Pipeline</h4>
                    <div className="flex-center" style={{ flexWrap: 'wrap', gap: '1rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <span className="card" style={{ padding: '0.5rem 1rem' }}>Telemetry Read</span>
                        <span style={{ color: 'var(--accent-primary)' }}>→</span>
                        <span className="card" style={{ padding: '0.5rem 1rem' }}>Feature Prep</span>
                        <span style={{ color: 'var(--accent-primary)' }}>→</span>
                        <span className="card" style={{ padding: '0.5rem 1rem' }}>Model Inference</span>
                        <span style={{ color: 'var(--accent-primary)' }}>→</span>
                        <span className="card" style={{ padding: '0.5rem 1rem', borderColor: 'var(--accent-risk-high)' }}>Risk Output</span>
                    </div>
                </div>

                <div className="about-grid">
                    <div className="card risk-card risk-low">
                        <h3><ShieldAlert size={20} /> Low Risk</h3>
                        <p className="about-text" style={{ fontSize: '0.9rem' }}>Ignition highly unlikely. Standard monitoring persists.</p>
                    </div>
                    <div className="card risk-card risk-moderate">
                        <h3><ShieldAlert size={20} /> Moderate Risk</h3>
                        <p className="about-text" style={{ fontSize: '0.9rem' }}>Surface fires can start. Control is straightforward.</p>
                    </div>
                    <div className="card risk-card risk-high">
                        <h3><ShieldAlert size={20} /> High Risk</h3>
                        <p className="about-text" style={{ fontSize: '0.9rem' }}>Fires ignite easily and spread rapidly. Prompt response needed.</p>
                    </div>
                    <div className="card risk-card risk-extreme">
                        <h3><ShieldAlert size={20} /> Extreme Risk</h3>
                        <p className="about-text" style={{ fontSize: '0.9rem' }}>Fires spread furiously. Massive, erratic behavior expected.</p>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <h2><Layers size={24} /> System Methodology Workflow</h2>
                <div className="about-grid">
                    <div className="workflow-step">
                        <div className="step-icon">1</div>
                        <div className="step-content">
                            <h4>Data Collection</h4>
                            <p>Ingesting local telemetry and climate APIs.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">2</div>
                        <div className="step-content">
                            <h4>Validation</h4>
                            <p>Ensuring incoming structural data meets schemas.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">3</div>
                        <div className="step-content">
                            <h4>Feature Prep</h4>
                            <p>Scaling variables for algorithmic digestion.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">4</div>
                        <div className="step-content">
                            <h4>Model Inference</h4>
                            <p>Scoring the matrix via the Random Forest.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">5</div>
                        <div className="step-content">
                            <h4>Visualization</h4>
                            <p>Rendering exact risk probabilities to the UI.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">6</div>
                        <div className="step-content">
                            <h4>Alerting</h4>
                            <p>Dispatching automated warnings for severe threats.</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="about-grid" style={{ marginBottom: '4rem' }}>
                <section className="about-section" style={{ marginBottom: 0 }}>
                    <h2><Database size={24} /> Technology Stack</h2>
                    <div className="card" style={{ height: '100%' }}>
                        <ul className="tech-list">
                            <li>React / TypeScript / Vite</li>
                            <li>FastAPI Backend Node</li>
                            <li>scikit-learn (Random Forest)</li>
                            <li>Leaflet Interactive Maps</li>
                        </ul>
                    </div>
                </section>

                <section className="about-section" style={{ marginBottom: 0 }}>
                    <h2><Target size={24} /> Future Enhancements</h2>
                    <div className="card" style={{ height: '100%' }}>
                        <ul className="future-list" style={{ fontSize: '0.95rem' }}>
                            <li>Live optical satellite API integration (MODIS)</li>
                            <li>Real-time topographical wind channeling</li>
                            <li>Geospatial database integrations (PostGIS)</li>
                            <li>End-user SMS/Email alerting sub-hooks</li>
                        </ul>
                    </div>
                </section>
            </div>

        </div>
    );
};

export default About;
