import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
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
    stayLoggedIn: boolean;
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
    stayLoggedIn: true,
};

const loadStoredSettings = (): SettingsState => {
    const stored = localStorage.getItem('geofirenet_settings');
    if (!stored) return defaultSettings;

    try {
        return { ...defaultSettings, ...JSON.parse(stored) as Partial<SettingsState> };
    } catch (error) {
        console.error("Failed to parse settings", error);
        return defaultSettings;
    }
};

const Settings: React.FC = () => {
    const { changePassword, logout, user } = useAuth();
    const [settings, setSettings] = useState<SettingsState>(loadStoredSettings);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const displayName = user?.name ?? 'Fire Risk Analyst';
    const displayEmail = user?.email ?? 'admin@geofirenet.com';
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'FA';

    const handleChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        if (settings.theme === 'light') document.documentElement.classList.add('light-theme');
        else document.documentElement.classList.remove('light-theme');
    }, [settings.theme]);

    const handleSave = () => {
        try {
            localStorage.setItem('geofirenet_settings', JSON.stringify(settings));
            
            setStatusMessage({ text: 'Settings saved successfully!', type: 'success' });
            setTimeout(() => setStatusMessage(null), 3000);
        } catch {
            setStatusMessage({ text: 'Failed to save settings.', type: 'error' });
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all settings to their default values?")) {
            setSettings(defaultSettings);
            localStorage.setItem('geofirenet_settings', JSON.stringify(defaultSettings));
            
            // Apply Default Visual Theme Live
            document.documentElement.classList.remove('light-theme');

            setStatusMessage({ text: 'Settings reset to defaults.', type: 'success' });
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleChangePassword = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatusMessage(null);

        if (newPassword.length < 8) {
            setStatusMessage({ text: 'New password must contain at least 8 characters.', type: 'error' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatusMessage({ text: 'New password and confirmation do not match.', type: 'error' });
            return;
        }

        setPasswordSaving(true);
        const result = await changePassword(currentPassword, newPassword);
        setPasswordSaving(false);

        if (!result.success) {
            setStatusMessage({ text: result.message ?? 'Unable to change password.', type: 'error' });
            return;
        }

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordFormOpen(false);
        setStatusMessage({ text: result.message ?? 'Password changed successfully.', type: 'success' });
        setTimeout(() => setStatusMessage(null), 3000);
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
                        <div className="avatar-placeholder">{initials}</div>
                        <div>
                            <h4>{displayName}</h4>
                            <p className="text-muted">{displayEmail}</p>
                        </div>
                    </div>
                    <div className="form-actions mt-4">
                        <button className="btn btn-outline" onClick={() => setStatusMessage({ text: 'Profile editing is not enabled in this build.', type: 'error' })}>Edit Profile</button>
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
                            onChange={(e) => handleChange('theme', e.target.value as SettingsState['theme'])}
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
                            <p className="text-muted small">Allow high-risk checks to create database alerts.</p>
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
                            <option value="Global">Project Scope (USA + Australia)</option>
                            <option value="USA">United States</option>
                            <option value="Australia">Australia</option>
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
                        <li><strong>Environment:</strong> Production-ready local deployment</li>
                        <li><strong>Frontend Version:</strong> v2.1.4</li>
                        <li><strong>Backend API Status:</strong> FastAPI health endpoint available</li>
                        <li><strong>Database:</strong> PostgreSQL via SQLAlchemy/Alembic</li>
                        <li><strong>Risk Scoring:</strong> Active</li>
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
                            <input
                                type="checkbox"
                                checked={settings.stayLoggedIn}
                                onChange={(e) => handleChange('stayLoggedIn', e.target.checked)}
                            />
                            <span className="slider round" />
                        </label>
                    </div>
                    <div className="form-actions mt-4">
                        <button className="btn btn-outline" onClick={() => setIsPasswordFormOpen((current) => !current)}>
                            {isPasswordFormOpen ? 'Cancel Password Change' : 'Change Password'}
                        </button>
                    </div>
                    {isPasswordFormOpen && (
                        <form className="password-change-form mt-4" onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label htmlFor="current-password">Current Password</label>
                                <input
                                    id="current-password"
                                    type="password"
                                    className="input-text"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="new-password">New Password</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    className="input-text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirm-new-password">Confirm New Password</label>
                                <input
                                    id="confirm-new-password"
                                    type="password"
                                    className="input-text"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={passwordSaving}>
                                {passwordSaving ? 'Saving...' : 'Save New Password'}
                            </button>
                        </form>
                    )}
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
