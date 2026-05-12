import React, { useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthActionResult, type AuthUser } from './AuthContext';

interface StoredUser extends AuthUser {
    passwordHash: string;
}

interface StoredAuthSession {
    email: string;
    rememberMe: boolean;
}

const DEFAULT_USER: AuthUser = {
    email: 'admin@geofirenet.com',
    name: 'Fire Analyst',
    role: 'Administrator',
};

const DEFAULT_PASSWORD = 'GeoFireNet123';
const USERS_KEY = 'geofirenet_users';
const AUTH_KEY = 'geofirenet_auth_session';
const LEGACY_AUTH_KEY = 'geofirenet_auth';

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const pause = () => new Promise(resolve => setTimeout(resolve, 500));

const readJson = <T,>(storage: Storage, key: string): T | null => {
    try {
        const value = storage.getItem(key);
        return value ? JSON.parse(value) as T : null;
    } catch {
        storage.removeItem(key);
        return null;
    }
};

const getStoredUsers = (): StoredUser[] => {
    if (typeof window === 'undefined') return [];
    return readJson<StoredUser[]>(localStorage, USERS_KEY) ?? [];
};

const saveStoredUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const findStoredUser = (email: string) => {
    const normalizedEmail = normalizeEmail(email);
    return getStoredUsers().find((user) => normalizeEmail(user.email) === normalizedEmail) ?? null;
};

const resolveUser = (email: string): AuthUser | null => {
    const storedUser = findStoredUser(email);
    if (storedUser) {
        return {
            email: storedUser.email,
            name: storedUser.name,
            role: storedUser.role,
        };
    }

    return normalizeEmail(email) === DEFAULT_USER.email ? DEFAULT_USER : null;
};

const hashPassword = async (password: string) => {
    if (!globalThis.crypto?.subtle) {
        return `plain:${password}`;
    }

    const encoded = new TextEncoder().encode(password);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
};

const readStoredAuth = (): StoredAuthSession | null => {
    if (typeof window === 'undefined') return null;

    const rememberedSession = readJson<StoredAuthSession>(localStorage, AUTH_KEY);
    if (rememberedSession) return rememberedSession;

    const browserSession = readJson<StoredAuthSession>(sessionStorage, AUTH_KEY);
    if (browserSession) return browserSession;

    if (localStorage.getItem(LEGACY_AUTH_KEY) === 'true') {
        return { email: DEFAULT_USER.email, rememberMe: true };
    }

    return null;
};

const writeAuthSession = (session: StoredAuthSession) => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(LEGACY_AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);

    const targetStorage = session.rememberMe ? localStorage : sessionStorage;
    targetStorage.setItem(AUTH_KEY, JSON.stringify(session));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authSession, setAuthSession] = useState<StoredAuthSession | null>(readStoredAuth);
    const [localUserCount, setLocalUserCount] = useState(() => getStoredUsers().length);

    const user = useMemo(() => authSession ? resolveUser(authSession.email) : null, [authSession]);

    const login = async (email: string, pass: string, rememberMe: boolean) => {
        await pause();

        const normalizedEmail = normalizeEmail(email);
        const storedUser = findStoredUser(normalizedEmail);
        const passwordHash = await hashPassword(pass);
        const isStoredUserMatch = storedUser?.passwordHash === passwordHash;
        const isDefaultUserMatch = normalizedEmail === DEFAULT_USER.email && pass === DEFAULT_PASSWORD && !storedUser;

        if (isStoredUserMatch || isDefaultUserMatch) {
            const session = { email: normalizedEmail, rememberMe };
            writeAuthSession(session);
            setAuthSession(session);
            return true;
        }

        return false;
    };

    const createFirstUser = async (
        name: string,
        email: string,
        pass: string,
        rememberMe: boolean
    ): Promise<AuthActionResult> => {
        await pause();

        const users = getStoredUsers();
        if (users.length > 0) {
            return { success: false, message: 'The first user account is already configured.' };
        }

        const normalizedEmail = normalizeEmail(email);
        const newUser: StoredUser = {
            email: normalizedEmail,
            name: name.trim(),
            role: 'Administrator',
            passwordHash: await hashPassword(pass),
        };

        saveStoredUsers([newUser]);
        setLocalUserCount(1);

        const session = { email: normalizedEmail, rememberMe };
        writeAuthSession(session);
        setAuthSession(session);

        return { success: true };
    };

    const resetPassword = async (email: string, pass: string): Promise<AuthActionResult> => {
        await pause();

        const normalizedEmail = normalizeEmail(email);
        const users = getStoredUsers();
        const existingUserIndex = users.findIndex((storedUser) => normalizeEmail(storedUser.email) === normalizedEmail);
        const isDefaultUser = normalizedEmail === DEFAULT_USER.email;

        if (existingUserIndex === -1 && !isDefaultUser) {
            return { success: false, message: 'No GeoFireNet account was found for that email.' };
        }

        const passwordHash = await hashPassword(pass);
        const updatedUser: StoredUser = existingUserIndex >= 0
            ? { ...users[existingUserIndex], passwordHash }
            : { ...DEFAULT_USER, passwordHash };

        if (existingUserIndex >= 0) {
            users[existingUserIndex] = updatedUser;
        } else {
            users.push(updatedUser);
        }

        saveStoredUsers(users);
        setLocalUserCount(users.length);

        return { success: true, message: 'Password updated. Sign in with your new password.' };
    };

    const logout = () => {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(LEGACY_AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY);
        setAuthSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: Boolean(authSession && user),
                user,
                hasLocalUser: localUserCount > 0,
                login,
                createFirstUser,
                resetPassword,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
