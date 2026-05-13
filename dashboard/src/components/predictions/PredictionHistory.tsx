import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { RiskService, type HistoryRecord } from '../../services/RiskService';

const PredictionHistory: React.FC = () => {
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = async () => {
        try {
            const data = await RiskService.getHistory(undefined, 5);
            setHistory(data);
        } catch (e) {
            console.error("Failed fetching history for Predictions Page", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number | string) => {
        // Optimistic UI Update: immediately remove from view
        setHistory(prev => prev.filter(item => item.id !== id));
        try {
            await RiskService.deleteHistoryRecord(Number(id));
        } catch (e) {
            console.error("Failed to delete history item on the server", e);
            // Optionally could re-fetch history here on failure to restore state
        }
    };

    useEffect(() => {
        loadHistory();
        // Poll briefly
        const intv = setInterval(loadHistory, 10000);
        return () => clearInterval(intv);
    }, []);

    if (loading) return <div className="card mt-4 p-4 text-center">Loading recent history...</div>;

    if (history.length === 0) return null;

    return (
        <div className="card mt-4 history-table-card">
            <h3 className="section-title">Recent Risk Checks</h3>
            <div className="table-responsive">
                <table className="compact-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Target Location</th>
                            <th>Metrics Input</th>
                            <th>Risk Tier</th>
                            <th>Primary Driver</th>
                            <th>Source</th>
                            <th style={{ width: '60px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.id}>
                                <td className="text-muted small">{new Date(item.timestamp).toLocaleTimeString()}</td>
                                <td>
                                    {item.location
                                        ? `${item.location.admin_region || item.location.name}, ${item.location.country}`.replace(/^, | ,/g, '')
                                        : 'Project Area'}
                                </td>
                                <td className="text-muted small">
                                    {item.weather_input?.temp}°C | {item.weather_input?.wind}kph
                                </td>
                                <td>
                                    <span className={`mini-badge badge-${item.risk_level.toLowerCase()}`}>
                                        {item.risk_level}
                                    </span>
                                </td>
                                <td className="text-muted small limit-text">{item.primary_drivers || 'N/A'}</td>
                                <td className="text-muted small">
                                    {item.source === 'reference' ? 'Reference' : item.source === 'local' ? 'Local' : 'Database'}
                                </td>
                                <td>
                                    {item.source !== 'reference' && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            style={{
                                                background: 'none', border: '1px solid rgba(239, 68, 68, 0.3)',
                                                color: 'var(--accent-risk-extreme)', padding: '0.2rem 0.4rem',
                                                borderRadius: '4px', cursor: 'pointer'
                                            }}
                                            title="Delete Record"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PredictionHistory;
