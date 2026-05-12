import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Flame, MapPin, Pencil, Save, Send, Trash2, UserCheck, Users, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import '../styles/UserPortal.css';

type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Extreme';
type ReviewStatus = 'Submitted' | 'Under Review' | 'Verified';

interface UserRiskEntry {
    id: string;
    submittedAt: string;
    updatedAt?: string;
    userName: string;
    userEmail: string;
    country: string;
    region: string;
    location: string;
    riskLevel: RiskLevel;
    riskScore: number;
    description: string;
    status: ReviewStatus;
    adminNote?: string;
}

interface RiskFormState {
    country: string;
    region: string;
    location: string;
    riskLevel: RiskLevel;
    riskScore: number;
    description: string;
}

const STORAGE_KEY = 'geofirenet_user_risk_entries';

const REGIONS: Record<string, string[]> = {
    USA: ['California', 'Texas', 'Utah', 'Arizona', 'Colorado', 'Oregon', 'Washington'],
    Australia: ['New South Wales', 'Queensland', 'South Australia', 'Victoria', 'Western Australia', 'Northern Territory']
};

const RISK_SCORE_DEFAULTS: Record<RiskLevel, number> = {
    Low: 22,
    Moderate: 48,
    High: 76,
    Extreme: 92
};

const defaultFormState: RiskFormState = {
    country: 'USA',
    region: REGIONS.USA[0],
    location: '',
    riskLevel: 'Moderate',
    riskScore: RISK_SCORE_DEFAULTS.Moderate,
    description: ''
};

const readEntries = (): UserRiskEntry[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) as UserRiskEntry[] : [];
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
};

const saveEntries = (entries: UserRiskEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const clampScore = (score: number) => Math.max(0, Math.min(100, score));

const UserPortal: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Administrator';
    const [entries, setEntries] = useState<UserRiskEntry[]>(readEntries);
    const [form, setForm] = useState<RiskFormState>(defaultFormState);
    const [editEntry, setEditEntry] = useState<UserRiskEntry | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const visibleEntries = useMemo(() => {
        return entries;
    }, [entries]);

    const persistEntries = (nextEntries: UserRiskEntry[]) => {
        setEntries(nextEntries);
        saveEntries(nextEntries);
    };

    const handleCountryChange = (country: string) => {
        setForm((current) => ({
            ...current,
            country,
            region: REGIONS[country][0]
        }));
    };

    const handleRiskLevelChange = (riskLevel: RiskLevel) => {
        setForm((current) => ({
            ...current,
            riskLevel,
            riskScore: RISK_SCORE_DEFAULTS[riskLevel]
        }));
    };

    const submitRiskEntry = (event: React.FormEvent) => {
        event.preventDefault();
        if (!user || !isAdmin) return;

        const entry: UserRiskEntry = {
            id: `risk-${Date.now()}`,
            submittedAt: new Date().toISOString(),
            userName: user.name,
            userEmail: user.email,
            country: form.country,
            region: form.region,
            location: form.location.trim(),
            riskLevel: form.riskLevel,
            riskScore: clampScore(form.riskScore),
            description: form.description.trim(),
            status: 'Submitted'
        };

        persistEntries([entry, ...entries]);
        setForm(defaultFormState);
        setStatusMessage('Wildfire risk entry added.');
        window.setTimeout(() => setStatusMessage(null), 3000);
    };

    const updateEditEntry = <K extends keyof UserRiskEntry>(key: K, value: UserRiskEntry[K]) => {
        setEditEntry((current) => current ? { ...current, [key]: value } : current);
    };

    const saveEditedEntry = () => {
        if (!editEntry) return;
        const nextEntry = {
            ...editEntry,
            riskScore: clampScore(Number(editEntry.riskScore)),
            location: editEntry.location.trim(),
            description: editEntry.description.trim(),
            adminNote: editEntry.adminNote?.trim(),
            updatedAt: new Date().toISOString()
        };
        persistEntries(entries.map((entry) => entry.id === nextEntry.id ? nextEntry : entry));
        setEditEntry(null);
        setStatusMessage('User wildfire risk entry updated.');
        window.setTimeout(() => setStatusMessage(null), 3000);
    };

    const deleteEntry = (id: string) => {
        if (!window.confirm('Delete this user wildfire risk entry?')) return;
        persistEntries(entries.filter((entry) => entry.id !== id));
        if (editEntry?.id === id) setEditEntry(null);
    };

    if (!isAdmin) {
        return (
            <div className="user-portal">
                <section className="card user-entry-card">
                    <div className="user-empty-state">User Portal access is restricted to administrators.</div>
                </section>
            </div>
        );
    }

    return (
        <div className="user-portal">
            <div className="user-portal-header">
                <div>
                    <span className="portal-eyebrow"><Users size={16} /> User Portal</span>
                    <h2>Wildfire Risk Entries</h2>
                    <p>Administrator workspace for viewing and editing wildfire risk details submitted by users.</p>
                </div>
                <div className="portal-user-card">
                    <UserCheck size={20} />
                    <div>
                        <span>Signed in as</span>
                        <strong>{user?.name ?? 'GeoFireNet User'}</strong>
                        <p>{user?.email}</p>
                    </div>
                </div>
            </div>

            {statusMessage && (
                <div className="report-success">
                    <CheckCircle2 size={16} /> {statusMessage}
                </div>
            )}

            <div className="user-kpi-grid">
                <div className="user-risk-card">
                    <span><Flame size={18} /> Total Entries</span>
                    <strong>{visibleEntries.length}</strong>
                    <p>Submitted by all users</p>
                </div>
                <div className="user-risk-card risk-high">
                    <span><AlertTriangle size={18} /> High or Extreme</span>
                    <strong>{visibleEntries.filter((entry) => entry.riskLevel === 'High' || entry.riskLevel === 'Extreme').length}</strong>
                    <p>Entries needing operator attention</p>
                </div>
                <div className="user-risk-card risk-low">
                    <span><CheckCircle2 size={18} /> Verified</span>
                    <strong>{visibleEntries.filter((entry) => entry.status === 'Verified').length}</strong>
                    <p>Reviewed by an administrator</p>
                </div>
            </div>

            <div className="user-main-grid">
                <section className="card report-card">
                    <div className="user-section-header">
                        <h3><Send size={20} /> Add Wildfire Risk</h3>
                    </div>
                    <form onSubmit={submitRiskEntry} className="public-report-form">
                        <label>Country</label>
                        <select value={form.country} onChange={(event) => handleCountryChange(event.target.value)}>
                            <option value="USA">United States</option>
                            <option value="Australia">Australia</option>
                        </select>

                        <label>Region</label>
                        <select value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}>
                            {REGIONS[form.country].map((region) => <option key={region} value={region}>{region}</option>)}
                        </select>

                        <label>Location or landmark</label>
                        <input
                            value={form.location}
                            onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                            placeholder="Town, road, or nearby landmark"
                            required
                        />

                        <div className="risk-entry-two-column">
                            <div>
                                <label>Wildfire risk</label>
                                <select value={form.riskLevel} onChange={(event) => handleRiskLevelChange(event.target.value as RiskLevel)}>
                                    <option value="Low">Low</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="High">High</option>
                                    <option value="Extreme">Extreme</option>
                                </select>
                            </div>
                            <div>
                                <label>Risk score</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.riskScore}
                                    onChange={(event) => setForm((current) => ({ ...current, riskScore: clampScore(Number(event.target.value)) }))}
                                    required
                                />
                            </div>
                        </div>

                        <label>Risk details</label>
                        <textarea
                            value={form.description}
                            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                            placeholder="Smoke, heat, wind, vegetation dryness, nearby homes, or road access"
                            required
                        />
                        <button className="btn btn-primary" type="submit">Add Risk Entry</button>
                    </form>
                </section>

                <section className="card user-entry-card">
                    <div className="user-section-header">
                        <h3><MapPin size={20} /> Submitted Details</h3>
                    </div>
                    {visibleEntries.length === 0 ? (
                        <div className="user-empty-state">No wildfire risk entries have been added yet.</div>
                    ) : (
                        <div className="user-risk-entry-list">
                            {visibleEntries.map((entry) => {
                                const isEditing = editEntry?.id === entry.id;
                                return (
                                    <div key={entry.id} className={`user-risk-entry risk-${entry.riskLevel.toLowerCase()}`}>
                                        {isEditing && editEntry ? (
                                            <div className="admin-edit-form">
                                                <div className="risk-entry-two-column">
                                                    <div>
                                                        <label>Risk level</label>
                                                        <select
                                                            value={editEntry.riskLevel}
                                                            onChange={(event) => updateEditEntry('riskLevel', event.target.value as RiskLevel)}
                                                        >
                                                            <option value="Low">Low</option>
                                                            <option value="Moderate">Moderate</option>
                                                            <option value="High">High</option>
                                                            <option value="Extreme">Extreme</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label>Risk score</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={editEntry.riskScore}
                                                            onChange={(event) => updateEditEntry('riskScore', clampScore(Number(event.target.value)))}
                                                        />
                                                    </div>
                                                </div>
                                                <label>Location or landmark</label>
                                                <input value={editEntry.location} onChange={(event) => updateEditEntry('location', event.target.value)} />
                                                <label>Risk details</label>
                                                <textarea value={editEntry.description} onChange={(event) => updateEditEntry('description', event.target.value)} />
                                                <label>Review status</label>
                                                <select value={editEntry.status} onChange={(event) => updateEditEntry('status', event.target.value as ReviewStatus)}>
                                                    <option value="Submitted">Submitted</option>
                                                    <option value="Under Review">Under Review</option>
                                                    <option value="Verified">Verified</option>
                                                </select>
                                                <label>Admin note</label>
                                                <textarea value={editEntry.adminNote ?? ''} onChange={(event) => updateEditEntry('adminNote', event.target.value)} />
                                                <div className="entry-actions">
                                                    <button type="button" className="btn btn-primary" onClick={saveEditedEntry}><Save size={16} /> Save</button>
                                                    <button type="button" className="btn btn-ghost" onClick={() => setEditEntry(null)}><X size={16} /> Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="entry-header">
                                                    <div>
                                                        <strong>{entry.region}, {entry.country}</strong>
                                                        <p>{entry.location}</p>
                                                    </div>
                                                    <span className="entry-risk-badge">{entry.riskLevel} {entry.riskScore}/100</span>
                                                </div>
                                                <p className="entry-description">{entry.description}</p>
                                                <div className="entry-meta">
                                                    <span>{entry.userName}</span>
                                                    <span>{entry.userEmail}</span>
                                                    <span>{new Date(entry.submittedAt).toLocaleString()}</span>
                                                    <span>{entry.status}</span>
                                                </div>
                                                {entry.adminNote && <p className="admin-note">Admin note: {entry.adminNote}</p>}
                                                {isAdmin && (
                                                    <div className="entry-actions">
                                                        <button type="button" className="btn btn-outline" onClick={() => setEditEntry(entry)}><Pencil size={16} /> Edit</button>
                                                        <button type="button" className="btn btn-danger" onClick={() => deleteEntry(entry.id)}><Trash2 size={16} /> Delete</button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default UserPortal;
