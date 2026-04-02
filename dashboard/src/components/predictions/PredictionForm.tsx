import React, { useState } from 'react';
import type { PredictionInput } from '../../types/prediction';

interface Props {
    onPredict: (data: PredictionInput) => void;
    loading: boolean;
}

export const PRESETS = {
    MILD: { temp: 22, humidity: 45, wind: 15, veg_moisture: 0.6, country: 'USA', admin_region: 'Napa Valley' },
    HIGH: { temp: 35, humidity: 20, wind: 40, veg_moisture: 0.3, country: 'Australia', admin_region: 'New South Wales' },
    EXTREME: { temp: 42, humidity: 8, wind: 85, veg_moisture: 0.05, country: 'Greece', admin_region: 'Attica' }
};

const PredictionForm: React.FC<Props> = ({ onPredict, loading }) => {
    const [formData, setFormData] = useState<PredictionInput>({ ...PRESETS.MILD });

    const handleChange = (key: keyof PredictionInput, val: string | number) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    const loadPreset = (preset: typeof PRESETS.MILD) => {
        setFormData({ ...preset });
    };

    const validateAndSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPredict(formData);
    };

    return (
        <div className="card prediction-form-card">
            <div className="form-header-row">
                <h3 className="section-title">Environmental Conditions</h3>
                <div className="preset-buttons">
                    <button type="button" onClick={() => loadPreset(PRESETS.MILD)} className="btn btn-sm btn-outline preset-mild">Mild</button>
                    <button type="button" onClick={() => loadPreset(PRESETS.HIGH)} className="btn btn-sm btn-outline preset-high">High</button>
                    <button type="button" onClick={() => loadPreset(PRESETS.EXTREME)} className="btn btn-sm btn-outline preset-extreme">Extreme</button>
                </div>
            </div>

            <form onSubmit={validateAndSubmit} className="inputs-grid">

                {/* Weather Variables */}
                <div className="form-group slide-group">
                    <div className="slide-label">
                        <label>Temperature (°C)</label>
                        <span>{formData.temp}°C</span>
                    </div>
                    <input type="range" min="-10" max="55" value={formData.temp} onChange={(e) => handleChange('temp', Number(e.target.value))} />
                    <small className="help-text">Standard bounds: -10° to 55°C</small>
                </div>

                <div className="form-group slide-group">
                    <div className="slide-label">
                        <label>Humidity (%)</label>
                        <span>{formData.humidity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={formData.humidity} onChange={(e) => handleChange('humidity', Number(e.target.value))} />
                    <small className="help-text">Relative atmospheric humidity</small>
                </div>

                <div className="form-group slide-group">
                    <div className="slide-label">
                        <label>Wind Speed (km/h)</label>
                        <span>{formData.wind} km/h</span>
                    </div>
                    <input type="range" min="0" max="120" value={formData.wind} onChange={(e) => handleChange('wind', Number(e.target.value))} />
                    <small className="help-text">Continuous prevailing wind</small>
                </div>

                <div className="form-group slide-group">
                    <div className="slide-label">
                        <label>Vegetation Moisture (0-1)</label>
                        <span>{formData.veg_moisture.toFixed(2)}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.05" value={formData.veg_moisture} onChange={(e) => handleChange('veg_moisture', Number(e.target.value))} />
                    <small className="help-text">Local dead fuel moisture index</small>
                </div>

                {/* Geography Variables */}
                <div className="form-group geo-group mt-4">
                    <label>Country Context</label>
                    <select value={formData.country} onChange={e => handleChange('country', e.target.value)} className="input-text">
                        <option value="USA">USA</option>
                        <option value="Australia">Australia</option>
                        <option value="Greece">Greece</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Canada">Canada</option>
                        <option value="Unknown">Unspecified / Global</option>
                    </select>
                </div>

                <div className="form-group geo-group mt-4">
                    <label>Administrative Region / Province</label>
                    <input type="text" value={formData.admin_region} onChange={(e) => handleChange('admin_region', e.target.value)} className="input-text" placeholder="E.g. California" />
                </div>

                <div className="form-actions form-full-row">
                    <button type="button" onClick={() => loadPreset(PRESETS.MILD)} className="btn btn-outline" disabled={loading}>Reset</button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? 'Executing ML Inference...' : 'Run Prediction Engine'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default PredictionForm;
