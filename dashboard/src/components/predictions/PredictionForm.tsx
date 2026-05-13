import React, { useState } from 'react';
import type { PredictionInput } from '../../types/prediction';

interface Props {
    onPredict: (data: PredictionInput) => void;
    onReset?: () => void;
    loading: boolean;
}

const PRESETS = {
    MILD: { temp: 22, humidity: 45, wind: 15, veg_moisture: 0.6, country: 'USA', admin_region: 'California' },
    HIGH: { temp: 35, humidity: 20, wind: 40, veg_moisture: 0.3, country: 'Australia', admin_region: 'New South Wales' },
    EXTREME: { temp: 42, humidity: 8, wind: 85, veg_moisture: 0.05, country: 'USA', admin_region: 'Texas' }
};

const COUNTRY_OPTIONS = [
    { value: 'USA', label: 'United States' },
    { value: 'Australia', label: 'Australia' },
];

const ADMIN_REGIONS_BY_COUNTRY: Record<string, string[]> = {
    USA: [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
    ],
    Australia: [
        'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
        'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
    ]
};

const getAdminRegions = (country: string) => ADMIN_REGIONS_BY_COUNTRY[country] ?? ADMIN_REGIONS_BY_COUNTRY.USA;

const PredictionForm: React.FC<Props> = ({ onPredict, onReset, loading }) => {
    const [formData, setFormData] = useState<PredictionInput>({ ...PRESETS.MILD });

    const handleChange = (key: keyof PredictionInput, val: string | number) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    const handleCountryChange = (country: string) => {
        const regions = getAdminRegions(country);
        setFormData(prev => ({
            ...prev,
            country,
            admin_region: regions[0] ?? ''
        }));
    };

    const loadPreset = (preset: typeof PRESETS.MILD) => {
        setFormData({ ...preset });
    };

    const handleReset = () => {
        loadPreset(PRESETS.MILD);
        if (onReset) onReset();
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
                <small className="help-text">Lower values mean drier vegetation</small>
            </div>

                {/* Geography Variables */}
                <div className="form-group geo-group mt-4">
                    <label>Country Context</label>
                    <select value={formData.country} onChange={e => handleCountryChange(e.target.value)} className="input-text">
                        {COUNTRY_OPTIONS.map((country) => (
                            <option key={country.value} value={country.value}>{country.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group geo-group mt-4">
                    <label>Administrative Region / Province</label>
                    <select
                        value={formData.admin_region}
                        onChange={(e) => handleChange('admin_region', e.target.value)}
                        className="input-text"
                    >
                        {getAdminRegions(formData.country).map((region) => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                </div>

                <div className="form-actions form-full-row">
                    <button type="button" onClick={handleReset} className="btn btn-outline" disabled={loading}>Reset</button>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? 'Calculating...' : 'Calculate Risk'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default PredictionForm;
