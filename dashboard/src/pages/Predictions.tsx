import React, { useState } from 'react';
import PredictionForm from '../components/predictions/PredictionForm';
import PredictionResultCard from '../components/predictions/PredictionResult';
import PredictionHistory from '../components/predictions/PredictionHistory';
import type { PredictionInput, PredictionResult } from '../types/prediction';
import '../styles/Predictions.css';

const Predictions: React.FC = () => {
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [lastInputs, setLastInputs] = useState<PredictionInput | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async (data: PredictionInput) => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!resp.ok) throw new Error('API Error');
            const resultData = await resp.json();
            setResult(resultData);
            setLastInputs(data);
        } catch (e) {
            console.error("Prediction Error:", e);
            setError("Failed to execute ML pipeline. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="predictions-page p-6">
            <div className="predictions-header">
                <h2>Predictive Modeller</h2>
                <p className="text-muted">Simulate environmental parameters to execute the ML pipeline and analyze risk.</p>
                {error && <div className="settings-alert error">{error}</div>}
            </div>

            <div className="predictions-workbench">
                <div className="workbench-inputs">
                    <PredictionForm onPredict={handlePredict} loading={loading} />
                </div>

                <div className="workbench-outputs">
                    {result && lastInputs ? (
                        <PredictionResultCard result={result} inputs={lastInputs} />
                    ) : (
                        <div className="card empty-state-card text-center">
                            <span className="empty-icon">🌲</span>
                            <h4>Awaiting Telemetry</h4>
                            <p className="text-muted small">Select a scenario preset or manually configure weather inputs to generate a simulated inference.</p>
                        </div>
                    )}
                </div>
            </div>

            <PredictionHistory />
        </div>
    );
}

export default Predictions;
