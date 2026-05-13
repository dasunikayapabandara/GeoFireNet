import React from 'react';
import { AlertTriangle, Droplets, Leaf, MapPin, ThermometerSun, Wind } from 'lucide-react';
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
        case 'extreme': return 'Urgent preparedness is recommended. Conditions are highly favorable for ignition and rapid spread.';
        case 'high': return 'Wildfire likelihood is elevated; review prevention and response coverage for the selected area.';
        case 'moderate': return 'Conditions should be monitored closely, especially if wind or dryness increases.';
        default: return 'Conditions are currently stable with limited immediate concern.';
    }
};

const PredictionResultCard: React.FC<Props> = ({ result, inputs }) => {
    const isLocalSimulation = result.system_status === 'SIMULATION';

    return (
        <div className="predictions-results-column">
            {/* Primary Score Output Card */}
            <div className={`card result-hero-card ${getBadgeClass(result.risk_level)}`}>
                <div className="result-header">
                    <h4>Estimated Risk Level</h4>
                    <span className="timestamp-badge text-muted small">{new Date().toLocaleTimeString()}</span>
                </div>

                <div className="result-score-block">
                    <div className="risk-level-display">
                        <h2>{result.risk_level}</h2>
                        <p>{(result.risk_probability * 100).toFixed(1)}% risk confidence</p>
                    </div>
                </div>

                <div className="interpretation-block">
                    <p className="interpretation-text">{getInterpretation(result.risk_level)}</p>
                </div>
            </div>

            {/* Explanation / Reasoning Card */}
            <div className="card explanation-card mt-4">
                <h4 className="section-title">Risk Drivers</h4>

                <p className="text-muted mb-4 small">
                    {isLocalSimulation
                        ? 'The local fallback highlighted these conditions as the main contributors.'
                        : 'The backend highlighted these conditions as the main contributors.'}
                </p>

                <ul className="driver-list">
                    {result.key_drivers.length > 0 ? (
                        result.key_drivers.map((driver, idx) => (
                            <li key={idx} className="driver-item">
                                <AlertTriangle className="driver-icon" size={18} />
                                <span className="driver-text">{driver}</span>
                            </li>
                        ))
                    ) : (
                        <li className="driver-item text-muted">No extreme primary drivers isolated.</li>
                    )}
                </ul>

                <div className="input-summary-block mt-4">
                    <h5>Scenario Context</h5>
                    <div className="context-chip"><ThermometerSun size={15} /> {inputs.temp}°C</div>
                    <div className="context-chip"><Wind size={15} /> {inputs.wind} km/h</div>
                    <div className="context-chip"><Droplets size={15} /> {inputs.humidity}% RH</div>
                    <div className="context-chip"><Leaf size={15} /> {inputs.veg_moisture.toFixed(2)} moisture</div>
                    <div className="context-chip mt-2"><MapPin size={15} /> {inputs.admin_region}, {inputs.country}</div>
                </div>
            </div>

            {/* Alert Connection Card */}
            {(result.risk_level === 'High' || result.risk_level === 'Extreme') && (
                <div className="card alert-action-card mt-4">
                    <h4>Alert Threshold Reached</h4>
                    <p className="text-muted small mb-3">
                        {isLocalSimulation
                            ? 'This local simulation exceeded the alert threshold. Start the backend API to persist alert records.'
                            : 'This scenario exceeded the configured threshold and was recorded in the alert log.'}
                    </p>
                    <button className="btn btn-outline" onClick={() => window.location.href = '/alerts'}>Review Active Alerts</button>
                </div>
            )}
        </div>
    );
};

export default PredictionResultCard;
