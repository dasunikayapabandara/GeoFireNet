import { createContext } from 'react';

export interface AuthUser {
    email: string;
    name: string;
    role: string;
}

export interface AuthActionResult {
    success: boolean;
    message?: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null;
    hasLocalUser: boolean;
    login: (email: string, pass: string, rememberMe: boolean) => Promise<boolean>;
    createFirstUser: (name: string, email: string, pass: string, rememberMe: boolean) => Promise<AuthActionResult>;
    resetPassword: (email: string, pass: string) => Promise<AuthActionResult>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
