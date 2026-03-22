import React, { useState } from 'react';

const Predictions: React.FC = () => {
    const [temp, setTemp] = useState(25);
    const [humidity, setHumidity] = useState(40);
    const [wind, setWind] = useState(15);
    const [veg, setVeg] = useState(0.4);
    const [country, setCountry] = useState("USA");
    const [adminRegion, setAdminRegion] = useState("California");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temp, humidity, wind, veg_moisture: veg, country, admin_region: adminRegion })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Prediction failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 flex" style={{ gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
                <h2>Manual Risk Inference</h2>
                <p style={{ marginBottom: '2rem' }}>Input exact weather parameters to test the Scikit-Learn pipeline directly.</p>

                <form onSubmit={handlePredict} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f8fafc' }}>Temperature (°C): {temp}</label>
                        <input type="range" min="-10" max="55" value={temp} onChange={(e) => setTemp(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f8fafc' }}>Humidity (%): {humidity}</label>
                        <input type="range" min="0" max="100" value={humidity} onChange={(e) => setHumidity(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f8fafc' }}>Wind Speed (km/h): {wind}</label>
                        <input type="range" min="0" max="120" value={wind} onChange={(e) => setWind(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f8fafc' }}>Vegetation Moisture (0-1): {veg.toFixed(2)}</label>
                        <input type="range" min="0" max="1" step="0.05" value={veg} onChange={(e) => setVeg(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f8fafc' }}>Country</label>
                        <select value={country} onChange={e => setCountry(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.25rem' }}>
                            <option value="USA">USA</option>
                            <option value="Australia">Australia</option>
                            <option value="Greece">Greece</option>
                            <option value="Portugal">Portugal</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f8fafc' }}>Admin Region / State</label>
                        <input type="text" value={adminRegion} onChange={(e) => setAdminRegion(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.25rem' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Running Inference...' : 'Run Pipeline Inference'}
                    </button>
                </form>
            </div>

            {result && (
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="card" style={{ textAlign: 'center', backgroundColor: result.risk_level === 'Extreme' ? 'rgba(239,68,68,0.1)' : 'var(--bg-secondary)' }}>
                        <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: result.risk_level === 'Extreme' ? '#ef4444' : result.risk_level === 'High' ? '#f97316' : '#22c55e' }}>
                            {result.risk_level} Risk
                        </h3>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>
                            {(result.risk_probability * 100).toFixed(1)}%
                        </div>
                        <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Machine Learning Confidence</p>

                        <div style={{ marginTop: '2rem', textAlign: 'left', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                            <strong>Primary Drivers Recognized:</strong>
                            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#cbd5e1' }}>
                                {result.primary_drivers.length > 0 ? (
                                    result.primary_drivers.map((d: string, i: number) => <li key={i}>{d}</li>)
                                ) : (
                                    <li>None identified</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Predictions;
