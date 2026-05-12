import React from 'react';
import type { PredictionResult, PredictionInput } from '../../types/prediction';

interface Props {
    result: PredictionResult;
    inputs: PredictionInput;
}

const getBadgeClass = (level: string) => {
    switch (level.toLowerCase()) {
        case 'extreme': return 'badge-extreme';
        case 'high': return 'badge-high';
        case 'moderate': return 'badge-moderate';
        default: return 'badge-low';
    }
};

const getInterpretation = (level: string) => {
    switch (level.toLowerCase()) {
        case 'extreme': return 'Urgent preparedness and alerting recommended. Multi-cluster ignition highly probable.';
        case 'high': return 'Increased wildfire likelihood; preventive attention required across active zones.';
        case 'moderate': return 'Monitor changing weather conditions closely for escalation vectors.';
        default: return 'Stable conditions detected, limited immediate concern.';
    }
};

const PredictionResultCard: React.FC<Props> = ({ result, inputs }) => {
    const isLocalSimulation = result.system_status === 'SIMULATION';

    return (
        <div className="predictions-results-column">
            {/* Primary Score Output Card */}
            <div className={`card result-hero-card ${getBadgeClass(result.risk_level)}`}>
                <div className="result-header">
                    <h4>Target Risk Level</h4>
                    <span className="timestamp-badge text-muted small">{new Date().toLocaleTimeString()}</span>
                </div>

                <div className="result-score-block">
                    <div className="risk-level-display">
                        <h2>{result.risk_level}</h2>
                        <p>{(result.risk_probability * 100).toFixed(1)}% ML Confidence</p>
                    </div>
                </div>

                <div className="interpretation-block">
                    <p className="interpretation-text">{getInterpretation(result.risk_level)}</p>
                </div>
            </div>

            {/* Explanation / Reasoning Card */}
            <div className="card explanation-card mt-4">
                <h4 className="section-title">Model Inference Reasoning</h4>

                <p className="text-muted mb-4 small">
                    {isLocalSimulation
                        ? 'The local simulation flagged the following primary conditions driving the wildfire risk probability.'
                        : 'The RandomForestClassifier flagged the following primary conditions driving the wildfire risk probability.'}
                </p>

                <ul className="driver-list">
                    {result.key_drivers.length > 0 ? (
                        result.key_drivers.map((driver, idx) => (
                            <li key={idx} className="driver-item">
                                <span className="driver-icon">⚠️</span>
                                <span className="driver-text">{driver}</span>
                            </li>
                        ))
                    ) : (
                        <li className="driver-item text-muted">No extreme primary drivers isolated.</li>
                    )}
                </ul>

                <div className="input-summary-block mt-4">
                    <h5>Simulation Context:</h5>
                    <div className="context-chip">🌡️ {inputs.temp}°C</div>
                    <div className="context-chip">💨 {inputs.wind} km/h</div>
                    <div className="context-chip">💧 {inputs.humidity}% RH</div>
                    <div className="context-chip">🌿 {inputs.veg_moisture.toFixed(2)} NDWI</div>
                    <div className="context-chip mt-2">📍 {inputs.admin_region}, {inputs.country}</div>
                </div>
            </div>

            {/* Alert Connection Card */}
            {(result.risk_level === 'High' || result.risk_level === 'Extreme') && (
                <div className="card alert-action-card mt-4">
                    <h4>🚨 Actionable Alert Triggered</h4>
                    <p className="text-muted small mb-3">
                        {isLocalSimulation
                            ? 'This local simulation exceeded the alert threshold. Start the backend API to persist alert records.'
                            : 'This inference breached the SQL database severity thresholds. A live alert log has been dispatched to the monitoring center automatically.'}
                    </p>
                    <button className="btn btn-outline" onClick={() => window.location.href = '/alerts'}>Review Active Alerts</button>
                </div>
            )}
        </div>
    );
};

export default PredictionResultCard;
