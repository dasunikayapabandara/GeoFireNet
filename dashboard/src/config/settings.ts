export type ColorTheme = 'dark' | 'light';
export type LayoutDensity = 'standard' | 'compact';
export type LandingPage = 'dashboard' | 'map' | 'alerts' | 'analytics' | 'history';
export type PreferredRegion = 'Global' | 'USA' | 'Australia';

export interface DashboardSettings {
    theme: ColorTheme;
    layout: LayoutDensity;
    alertsEnabled: boolean;
    alertHighThreshold: number;
    alertExtremeThreshold: number;
    notificationSounds: boolean;
    showModerateAlerts: boolean;
    defaultLandingPage: LandingPage;
    refreshInterval: number;
    preferredRegion: PreferredRegion;
    stayLoggedIn: boolean;
}

export const SETTINGS_KEY = 'geofirenet_settings';
export const SETTINGS_CHANGED_EVENT = 'geofirenet_settings_changed';

export const defaultSettings: DashboardSettings = {
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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const normalizeSettings = (settings: Partial<DashboardSettings>): DashboardSettings => {
    const merged = { ...defaultSettings, ...settings };
    const high = clamp(Number(merged.alertHighThreshold) || defaultSettings.alertHighThreshold, 50, 95);
    const extreme = clamp(Number(merged.alertExtremeThreshold) || defaultSettings.alertExtremeThreshold, 80, 100);

    return {
        ...merged,
        alertHighThreshold: Math.min(high, extreme),
        alertExtremeThreshold: extreme,
        refreshInterval: clamp(Number(merged.refreshInterval) || defaultSettings.refreshInterval, 5, 300),
        defaultLandingPage: ['dashboard', 'map', 'alerts', 'analytics', 'history'].includes(merged.defaultLandingPage)
            ? merged.defaultLandingPage
            : defaultSettings.defaultLandingPage,
        preferredRegion: ['Global', 'USA', 'Australia'].includes(merged.preferredRegion)
            ? merged.preferredRegion
            : defaultSettings.preferredRegion,
    };
};

export const loadStoredSettings = (): DashboardSettings => {
    if (typeof window === 'undefined') return defaultSettings;
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    if (!stored) return defaultSettings;

    try {
        return normalizeSettings(JSON.parse(stored) as Partial<DashboardSettings>);
    } catch (error) {
        console.error('Failed to parse settings', error);
        return defaultSettings;
    }
};

export const saveStoredSettings = (settings: DashboardSettings) => {
    const normalized = normalizeSettings(settings);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
    return normalized;
};

export const applyDashboardSettings = (settings: DashboardSettings) => {
    document.documentElement.classList.toggle('light-theme', settings.theme === 'light');
    document.documentElement.classList.toggle('compact-layout', settings.layout === 'compact');
};

export const emitSettingsChanged = (settings: DashboardSettings) => {
    window.dispatchEvent(new CustomEvent<DashboardSettings>(SETTINGS_CHANGED_EVENT, { detail: settings }));
};

export const preferredRegionToCountry = (settings: DashboardSettings) =>
    settings.preferredRegion === 'Global' ? '' : settings.preferredRegion;

export const refreshIntervalMs = (settings: DashboardSettings) => settings.refreshInterval * 1000;

export const getAlertSeverityForScore = (score: number, settings: DashboardSettings) => {
    if (!settings.alertsEnabled) return null;
    if (score >= settings.alertExtremeThreshold) return 'extreme' as const;
    if (score >= settings.alertHighThreshold) return 'high' as const;
    if (settings.showModerateAlerts && score >= 50) return 'moderate' as const;
    return null;
};
