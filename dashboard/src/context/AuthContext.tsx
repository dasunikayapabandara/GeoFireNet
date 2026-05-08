import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage on boot
        const authFlag = localStorage.getItem('geofirenet_auth');
        if (authFlag === 'true') {
            setIsAuthenticated(true);
        }
        setIsChecking(false);
    }, []);

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

    if (isChecking) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)', color: 'white' }}>Loading System...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
