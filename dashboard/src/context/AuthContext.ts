import { createContext } from 'react';

export interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
