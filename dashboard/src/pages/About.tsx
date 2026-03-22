import React from 'react';
import {
    Info, Flame, ShieldAlert, Cpu, BarChart3, Database,
    Wind, ThermometerSun, AlertTriangle, Layers, Target, Activity
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
                    A Predictive Wildfire Risk Assessment Subsystem designed for early warning, strategic preparedness, and proactive monitoring of wildland-urban interfaces.
                </p>
            </div>

            <section className="about-section">
                <h2><Info size={24} /> Project Overview</h2>
                <div className="card">
                    <p className="about-text">
                        <strong>GeoFireNet</strong> was developed to shift the paradigm of wildfire management from <em>reactive detection</em> to <em>predictive assessment</em>. Traditional systems often rely on detecting fires after ignition has already occurred (via optical cameras or satellite thermal anomalies), which limits the response window.
                    </p>
                    <p className="about-text">
                        By integrating Artificial Intelligence and Machine Learning, GeoFireNet analyzes environmental conditions to estimate the probability of a wildfire breaking out before it happens. This allows authorities to allocate resources efficiently, issue early warnings, and mitigate damage.
                    </p>
                </div>
            </section>

            <section className="about-section">
                <h2><AlertTriangle size={24} /> Wildfire Background</h2>
                <div className="info-cards">
                    <div className="card info-card">
                        <Flame className="info-card-icon" size={32} />
                        <h3>What is a Wildfire?</h3>
                        <p className="about-text" style={{ margin: 0 }}>
                            An uncontrolled fire in combustible vegetation that occurs in the countryside or a wilderness area. They are characterized by rapid spread, intense heat, and destructive capabilities.
                        </p>
                    </div>
                    <div className="card info-card">
                        <ThermometerSun className="info-card-icon" size={32} />
                        <h3>Common Causes</h3>
                        <p className="about-text" style={{ margin: 0 }}>
                            Wildfires can be natural (lightning strikes) or human-caused (campfires, equipment malfunctions, arson). Vulnerability heavily scales with prolonged dry and hot conditions.
                        </p>
                    </div>
                </div>
                <div className="card mt-4">
                    <h3 style={{ marginBottom: '0.5rem' }}>Why Early Prediction Matters</h3>
                    <p className="about-text">
                        Once ignited, aggressive wildfires can spread at alarming rates, causing massive environmental damage, loss of wildlife, destruction of property, and tragically, loss of human life. Predictive monitoring gives emergency services standard lead times to evacuate areas and pre-position suppression crews.
                    </p>
                </div>
            </section>

            <section className="about-section">
                <h2><Cpu size={24} /> How GeoFireNet Works</h2>
                <p className="about-text">
                    GeoFireNet harnesses the power of data by ingesting continuous streams of meteorological and environmental inputs.
                </p>
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Key Inputs Monitored</h3>
                    <div className="about-grid" style={{ marginTop: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}><ThermometerSun size={20} color="var(--accent-risk-high)" /> Temperature</div>
                        <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}><Activity size={20} color="var(--accent-primary)" /> Humidity Levels</div>
                        <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}><Wind size={20} color="var(--text-secondary)" /> Wind Speed</div>
                        <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}><Target size={20} color="var(--accent-risk-med)" /> Vegetation Dryness</div>
                    </div>
                    <p className="about-text" style={{ marginTop: '1.5rem' }}>
                        The system feeds these dynamic values into a trained Random Forest Classification model. By comparing current environmental combinations to historical fire data, the model effectively identifies the hidden patterns that lead to severe fire outbreaks and generates a risk probability.
                    </p>
                </div>
            </section>

            <section className="about-section">
                <h2><BarChart3 size={24} /> Risk Calculation Methodology</h2>
                <div className="card">
                    <p className="about-text">
                        It's critical to emphasize that GeoFireNet <strong>predicts risk, it does not detect flames</strong>.
                        A high risk score means the environmental conditions are incredibly favorable for a fire to start and spread rapidly if an ignition source is introduced.
                    </p>
                    <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.5rem', margin: '1.5rem 0', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Conceptual Flow</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
                            <span>Telemetry Input</span>
                            <span style={{ color: 'var(--accent-primary)' }}>→</span>
                            <span>Feature Processing</span>
                            <span style={{ color: 'var(--accent-primary)' }}>→</span>
                            <span>Machine Learning Inference</span>
                            <span style={{ color: 'var(--accent-primary)' }}>→</span>
                            <span style={{ color: 'var(--accent-risk-high)' }}>Risk Output</span>
                        </div>
                    </div>
                    <p className="about-text">
                        Meteorological conditions interact synergistically. A simple rule-based system might flag high temperatures, but our ML model can identify that an interaction between moderate heat, extremely low humidity, and high winds often presents a more critical danger.
                    </p>
                </div>

                <div className="about-grid">
                    <div className="card risk-card risk-low">
                        <h3><ShieldAlert size={20} /> Low Risk</h3>
                        <p className="about-text">Conditions do not readily support ignition or fire spread. Standard monitoring continues.</p>
                    </div>
                    <div className="card risk-card risk-moderate">
                        <h3><ShieldAlert size={20} /> Moderate Risk</h3>
                        <p className="about-text">Fires can start from most accidental causes. Control is usually relatively easy if detected soon.</p>
                    </div>
                    <div className="card risk-card risk-high">
                        <h3><ShieldAlert size={20} /> High Risk</h3>
                        <p className="about-text">Fires start easily from most causes and spread rapidly. Prompt response is required to contain outbreaks.</p>
                    </div>
                    <div className="card risk-card risk-extreme">
                        <h3><ShieldAlert size={20} /> Extreme Risk</h3>
                        <p className="about-text">Fires start quickly, spread furiously, and burn intensely. Often impossible to control until conditions change.</p>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <h2><ShieldAlert size={24} /> Why This Matters</h2>
                <div className="card">
                    <ul className="future-list" style={{ paddingLeft: '1.5rem' }}>
                        <li><strong>Early Warning & Preparedness:</strong> Provides crucial time to issue community warnings and prepare evacuation routes.</li>
                        <li><strong>Resource Allocation:</strong> Fire departments can pre-deploy vehicles and aerial assets to high-risk zones before ignitions occur.</li>
                        <li><strong>Prevention:</strong> Authorities can temporarily close hazardous areas, ban open fires, or power down vulnerable electrical grids.</li>
                        <li><strong>Damage Mitigation:</strong> Catching a fire in ideal conditions vs extreme conditions dictates the ultimate scale of the disaster.</li>
                    </ul>
                </div>
            </section>

            <section className="about-section">
                <h2><Layers size={24} /> System Methodology Workflow</h2>
                <div className="about-grid">
                    <div className="workflow-step">
                        <div className="step-icon">1</div>
                        <div className="step-content">
                            <h4>Data Collection</h4>
                            <p>Ingesting local telemetry and API-based climate data.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">2</div>
                        <div className="step-content">
                            <h4>Data Validation</h4>
                            <p>Ensuring incoming structural data meets Pydantic schemas.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">3</div>
                        <div className="step-content">
                            <h4>Feature Prep</h4>
                            <p>Scaling data logically for algorithmic digestion.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">4</div>
                        <div className="step-content">
                            <h4>Model Inference</h4>
                            <p>Scoring the data via the Random Forest architecture.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">5</div>
                        <div className="step-content">
                            <h4>Visualization</h4>
                            <p>Rendering risk probabilities onto the dashboard.</p>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="step-icon">6</div>
                        <div className="step-content">
                            <h4>Alert Generation</h4>
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
                            <li>React</li>
                            <li>TypeScript</li>
                            <li>Vite</li>
                            <li>FastAPI</li>
                            <li>Python Data Stack (scikit-learn)</li>
                            <li>Geospatial Mapping (Leaflet)</li>
                        </ul>
                    </div>
                </section>

                <section className="about-section" style={{ marginBottom: 0 }}>
                    <h2><Target size={24} /> Future Enhancements</h2>
                    <div className="card" style={{ height: '100%' }}>
                        <ul className="future-list">
                            <li>Live optical satellite API integration (VIIRS/MODIS)</li>
                            <li>Real-time topographical wind channeling models</li>
                            <li>Comprehensive vegetation moisture indexing</li>
                            <li>End-user SMS/Email alerting integrations</li>
                        </ul>
                    </div>
                </section>
            </div>

        </div>
    );
};

export default About;
