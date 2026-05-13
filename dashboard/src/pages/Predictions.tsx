import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import PredictionForm from '../components/predictions/PredictionForm';
import PredictionResultCard from '../components/predictions/PredictionResult';
import PredictionHistory from '../components/predictions/PredictionHistory';
import type { PredictionInput, PredictionResult } from '../types/prediction';
import { fetchJson } from '../config/api';
import { recordLocalRiskCheck } from '../services/RiskService';
import '../styles/Predictions.css';

const getRiskLevel = (probability: number) => {
    if (probability <= 0.3) return 'Low';
    if (probability <= 0.5) return 'Moderate';
    if (probability <= 0.8) return 'High';
    return 'Extreme';
};

const buildLocalPrediction = (data: PredictionInput): PredictionResult => {
    const normalizedTemp = Math.min(data.temp / 50, 1);
    const normalizedHumidity = Math.min(data.humidity / 100, 1);
    const normalizedWind = Math.min(data.wind / 100, 1);
    const normalizedVeg = Math.min(data.veg_moisture, 1);

    const baselineScore = Math.max(
        0,
        Math.min(
            100,
            (40 * normalizedTemp) + (20 * normalizedWind) - (30 * normalizedHumidity) - (30 * normalizedVeg) + 40
        )
    );
    const probability = Number((baselineScore / 100).toFixed(4));
    const drivers = [
        data.temp > 35 ? 'High Temperature' : null,
        data.wind > 60 ? 'Strong Winds' : null,
        data.humidity < 30 ? 'Critically Low Humidity' : null,
        data.veg_moisture < 0.3 ? 'Dry Vegetation' : null,
        data.temp > 35 && data.wind > 40 ? 'Critical Heat and Wind Interaction' : null
    ].filter((driver): driver is string => Boolean(driver));

    return {
        risk_score: Number(baselineScore.toFixed(2)),
        risk_probability: probability,
        confidence: probability,
        risk_level: getRiskLevel(probability),
        baseline_score: Number(baselineScore.toFixed(2)),
        baseline_level: getRiskLevel(probability),
        key_drivers: drivers.length > 0 ? drivers.slice(0, 3) : ['Normal Conditions'],
        system_status: 'SIMULATION',
        alert_triggered: probability > 0.5,
        model_version: 'Local simulation fallback',
        timestamp: new Date().toISOString()
    };
};

const Predictions: React.FC = () => {
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [lastInputs, setLastInputs] = useState<PredictionInput | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async (data: PredictionInput) => {
        setLoading(true);
        try {
            const resultData = await fetchJson<PredictionResult>('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            setResult(resultData);
            setLastInputs(data);
        } catch (e) {
            console.warn("Prediction API unavailable. Using local simulation fallback.", e);
            const localResult = buildLocalPrediction(data);
            recordLocalRiskCheck(data, localResult);
            setResult(localResult);
            setLastInputs(data);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setLastInputs(null);
    };

    return (
        <div className="predictions-page p-6">
            <div className="predictions-header">
                <span className="eyebrow">Scenario Assessment</span>
                <h2>Risk Scenario Check</h2>
                <p className="text-muted">Adjust weather and vegetation inputs to estimate wildfire risk for a selected region.</p>
            </div>

            <div className="predictions-workbench">
                <div className="workbench-inputs">
                    <PredictionForm onPredict={handlePredict} onReset={handleReset} loading={loading} />
                </div>

                <div className="workbench-outputs">
                    {result && lastInputs ? (
                        <PredictionResultCard result={result} inputs={lastInputs} />
                    ) : (
                        <div className="card empty-state-card text-center">
                            <SlidersHorizontal className="empty-icon" size={48} />
                            <h4>Ready for a scenario</h4>
                            <p className="text-muted small">Choose a preset or adjust the inputs to calculate a risk estimate.</p>
                        </div>
                    )}
                </div>
            </div>

            <PredictionHistory />
        </div>
    );
}

export default Predictions;
