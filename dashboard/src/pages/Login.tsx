import React, { useState } from 'react';
import { Flame, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('admin@geofirenet.com');
    const [password, setPassword] = useState('GeoFireNet123');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        const success = await login(email, password);
        setIsLoading(false);

        if (!success) {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-container">
                        <Flame size={48} color="#f97316" />
                    </div>
                    <h1>GeoFireNet</h1>
                    <p className="subtitle">Predictive Wildfire Risk System</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <p className="form-instructions">Sign in to access the wildfire risk monitoring dashboard</p>

                    {error && <div className="error-banner">{error}</div>}

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@geofirenet.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="checkbox-container">
                            <input type="checkbox" defaultChecked />
                            <span className="checkmark"></span>
                            Remember me
                        </label>
                        <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Demo Mode: admin@geofirenet.com / GeoFireNet123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
