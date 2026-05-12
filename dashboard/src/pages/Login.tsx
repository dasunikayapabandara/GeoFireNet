import React, { useState } from 'react';
import { Flame, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import '../styles/Login.css';

type LoginMode = 'login' | 'first-user' | 'forgot';

const Login: React.FC = () => {
    const { login, loginAsPublicUser, createFirstUser, resetPassword, hasLocalUser } = useAuth();
    const [mode, setMode] = useState<LoginMode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const changeMode = (nextMode: LoginMode) => {
        setMode(nextMode);
        setError('');
        setSuccess('');
        setPassword('');
        setConfirmPassword('');
    };

    const validatePasswordChange = () => {
        if (password.length < 8) {
            setError('Password must contain at least 8 characters.');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email.trim() || !password) {
            setError('Please enter both email and password.');
            return;
        }

        if (mode === 'first-user') {
            if (!name.trim()) {
                setError('Please enter the first user name.');
                return;
            }

            if (!validatePasswordChange()) return;

            setIsLoading(true);
            const result = await createFirstUser(name, email, password, rememberMe);
            setIsLoading(false);

            if (!result.success) {
                setError(result.message ?? 'Unable to create the first user account.');
            }

            return;
        }

        if (mode === 'forgot') {
            if (!validatePasswordChange()) return;

            setIsLoading(true);
            const result = await resetPassword(email, password);
            setIsLoading(false);

            if (!result.success) {
                setError(result.message ?? 'Unable to reset the password.');
                return;
            }

            setPassword('');
            setConfirmPassword('');
            setSuccess(result.message ?? 'Password updated. Sign in with your new password.');
            setMode('login');
            return;
        }

        setIsLoading(true);
        const isValidLogin = await login(email, password, rememberMe);
        setIsLoading(false);

        if (!isValidLogin) {
            setError('Invalid credentials. Please try again.');
        }
    };

    const submitLabel = mode === 'login'
        ? 'Secure Login'
        : mode === 'first-user'
            ? 'Create First User'
            : 'Reset Password';

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
                    <p className="form-instructions">
                        {mode === 'login' && 'Sign in to access the wildfire risk monitoring dashboard'}
                        {mode === 'first-user' && 'Create the first operator account for this browser'}
                        {mode === 'forgot' && 'Reset the password for an existing account'}
                    </p>

                    {error && <div className="error-banner">{error}</div>}
                    {success && <div className="success-banner">{success}</div>}

                    {mode === 'first-user' && (
                        <div className="input-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Fire Risk Analyst"
                                required
                            />
                        </div>
                    )}

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
                        <label htmlFor="password">{mode === 'forgot' ? 'New Password' : 'Password'}</label>
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

                    {mode !== 'login' && (
                        <div className="input-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                required
                            />
                        </div>
                    )}

                    {mode !== 'forgot' && (
                        <div className="form-options">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                Remember me
                            </label>

                            {mode === 'login' && (
                                <button
                                    type="button"
                                    className="text-link-button"
                                    onClick={() => changeMode('forgot')}
                                >
                                    Forgot Password?
                                </button>
                            )}
                        </div>
                    )}

                    {mode === 'login' && !hasLocalUser && (
                        <div className="first-user-option">
                            <span>First user?</span>
                            <button
                                type="button"
                                className="text-link-button"
                                onClick={() => changeMode('first-user')}
                            >
                                Create account
                            </button>
                        </div>
                    )}

                    {mode !== 'login' && (
                        <div className="first-user-option">
                            <button
                                type="button"
                                className="text-link-button"
                                onClick={() => changeMode('login')}
                            >
                                Back to login
                            </button>
                        </div>
                    )}

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? 'Please wait...' : submitLabel}
                    </button>
                </form>

                {mode === 'login' && (
                    <button type="button" className="public-login-button" onClick={loginAsPublicUser}>
                        Continue as Public User
                    </button>
                )}

                <div className="login-footer">
                    <p>Operators can sign in above. Community users can open the public portal.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
