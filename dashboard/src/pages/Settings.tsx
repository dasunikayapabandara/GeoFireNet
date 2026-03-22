import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Settings.css';

interface SettingsState {
    theme: 'dark' | 'light';
    layout: 'standard' | 'compact';
    alertsEnabled: boolean;
    alertHighThreshold: number;
    alertExtremeThreshold: number;
    notificationSounds: boolean;
    showModerateAlerts: boolean;
    defaultLandingPage: string;
    refreshInterval: number;
    preferredRegion: string;
}

const defaultSettings: SettingsState = {
    theme: 'dark',
    layout: 'standard',
    alertsEnabled: true,
    alertHighThreshold: 75,
    alertExtremeThreshold: 90,
    notificationSounds: true,
    showModerateAlerts: false,
    defaultLandingPage: 'dashboard',
    refreshInterval: 30,
    preferredRegion: 'Global',
};

const Settings: React.FC = () => {
    const { logout } = useAuth();
    const [settings, setSettings] = useState<SettingsState>(defaultSettings);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('geofirenet_settings');
        if (stored) {
            try {
                setSettings({ ...defaultSettings, ...JSON.parse(stored) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    const handleChange = (key: keyof SettingsState, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        try {
            localStorage.setItem('geofirenet_settings', JSON.stringify(settings));
            setStatusMessage({ text: 'Settings saved successfully!', type: 'success' });
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (e) {
            setStatusMessage({ text: 'Failed to save settings.', type: 'error' });
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all settings to their default values?")) {
            setSettings(defaultSettings);
            localStorage.setItem('geofirenet_settings', JSON.stringify(defaultSettings));
            setStatusMessage({ text: 'Settings reset to defaults.', type: 'success' });
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    return (
        <div className="settings-page p-6">
            <div className="settings-header">
                <h2>System Configuration</h2>
                <p>Manage GeoFireNet dashboard preferences, alert behavior, and analytical thresholds.</p>
                {statusMessage && (
                    <div className={`settings-alert ${statusMessage.type}`}>
                        {statusMessage.text}
                    </div>
                )}
            </div>

            <div className="settings-grid">

                {/* 1. Profile / User Section */}
                <div className="card settings-card">
                    <h3 className="section-title">User Profile</h3>
                    <div className="profile-info">
                        <div className="avatar-placeholder">FA</div>
                        <div>
                            <h4>Mock Fire Analyst</h4>
                            <p className="text-muted">analyst@geofirenet.local</p>
                        </div>
                    </div>
                    <div className="form-actions mt-4">
                        <button className="btn btn-outline" disabled>Edit Profile</button>
                        <button className="btn btn-danger" onClick={logout}>Log Out</button>
                    </div>
                </div>

                {/* 2. Appearance Section */}
                <div className="card settings-card">
                    <h3 className="section-title">Appearance</h3>

                    <div className="form-group">
                        <label>Color Theme</label>
                        <select
                            value={settings.theme}
                            onChange={(e) => handleChange('theme', e.target.value)}
                        >
                            <option value="dark">Dark Theme (Default)</option>
                            <option value="light">Light Theme (Preview)</option>
                        </select>
                    </div>

                    <div className="form-group row-align">
                        <div>
                            <label>Compact Layout</label>
                            <p className="text-muted small">Reduce padding to fit more data on screen.</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.layout === 'compact'}
                                onChange={(e) => handleChange('layout', e.target.checked ? 'compact' : 'standard')}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                {/* 3. Alert Settings Section */}
                <div className="card settings-card">
                    <h3 className="section-title">Alert Configuration</h3>

                    <div className="form-group row-align">
                        <div>
                            <label>Enable Automated Alerts</label>
                            <p className="text-muted small">Allow the predictive model to spawn actionable DB alerts.</p>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.alertsEnabled}
                                onChange={(e) => handleChange('alertsEnabled', e.target.checked)}
                            />
                            <span className="slider round" />
                        </label>
                    </div>

                    <div className="form-group row-align mt-3">
                        <div>
                            <label>Notification Sounds</label>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.notificationSounds}
                                onChange={(e) => handleChange('notificationSounds', e.target.checked)}
                            />
                            <span className="slider round" />
                        </label>
                    </div>

                    <div className="form-group mt-3">
                        <label>High Risk Threshold (Score: {settings.alertHighThreshold})</label>
                        <input
                            type="range" min="50" max="95"
                            value={settings.alertHighThreshold}
                            onChange={(e) => handleChange('alertHighThreshold', Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="form-group mt-2">
                        <label>Extreme Risk Threshold (Score: {settings.alertExtremeThreshold})</label>
                        <input
                            type="range" min="80" max="100"
                            value={settings.alertExtremeThreshold}
                            onChange={(e) => handleChange('alertExtremeThreshold', Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                {/* 4. Dashboard Preferences Section */}
                <div className="card settings-card">
                    <h3 className="section-title">Dashboard Preferences</h3>

                    <div className="form-group">
                        <label>Default Landing Page</label>
                        <select
                            value={settings.defaultLandingPage}
                            onChange={(e) => handleChange('defaultLandingPage', e.target.value)}
                        >
                            <option value="dashboard">Overview</option>
                            <option value="map">Live Map</option>
                            <option value="alerts">Alerts Center</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Primary Monitored Region</label>
                        <select
                            value={settings.preferredRegion}
                            onChange={(e) => handleChange('preferredRegion', e.target.value)}
                        >
                            <option value="Global">Global All</option>
                            <option value="USA">USA</option>
                            <option value="Australia">Australia</option>
                            <option value="Europe">Europe</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Data Polling Interval (Seconds)</label>
                        <input
                            type="number" min="5" max="300"
                            value={settings.refreshInterval}
                            onChange={(e) => handleChange('refreshInterval', Number(e.target.value))}
                            className="input-text"
                        />
                    </div>
                </div>

                {/* 5. System Information Section */}
                <div className="card settings-card">
                    <h3 className="section-title">System Status</h3>
                    <ul className="sys-info-list text-muted small">
                        <li><strong>Environment:</strong> Development / Demo</li>
                        <li><strong>Frontend Version:</strong> v2.1.4-beta</li>
                        <li><strong>Backend API Status:</strong> Online (FastAPI)</li>
                        <li><strong>Database:</strong> Connected (PostgreSQL)</li>
                        <li><strong>ML Model Status:</strong> Active (RandomForestRegressor)</li>
                        <li><strong>Last Sync:</strong> {new Date().toLocaleString()}</li>
                    </ul>
                </div>

                {/* 6. Security Section */}
                <div className="card settings-card">
                    <h3 className="section-title">Security & Session</h3>
                    <div className="form-group row-align">
                        <div>
                            <label>Stay Logged In (Remember Me)</label>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider round" />
                        </label>
                    </div>
                    <div className="form-actions mt-4">
                        <button className="btn btn-outline" disabled>Change Password (Mock)</button>
                    </div>
                </div>

            </div>

            {/* 7. Action Bar */}
            <div className="settings-action-bar card mt-6">
                <button className="btn btn-outline" onClick={handleReset}>Reset to Defaults</button>
                <button className="btn btn-primary" onClick={handleSave}>Save Configuration</button>
            </div>
        </div>
    );
};

export default Settings;
