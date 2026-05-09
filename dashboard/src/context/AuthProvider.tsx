import React, { useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';

const readStoredAuth = () => localStorage.getItem('geofirenet_auth') === 'true';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(readStoredAuth);

    const login = async (email: string, pass: string) => {
        // Simulate network delay for effect
        await new Promise(resolve => setTimeout(resolve, 800));

        // Local operator credentials for the final-year deployment build.
        if (email === 'admin@geofirenet.com' && pass === 'GeoFireNet123') {
            localStorage.setItem('geofirenet_auth', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('geofirenet_auth');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
