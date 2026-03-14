import React from 'react';
import { Flame, Bell, User, ShieldCheck } from 'lucide-react';
import '../styles/Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="header-logo">
                <Flame className="logo-icon" size={24} color="#f97316" />
                <h1 className="logo-text">GeoFireNet</h1>
                <div className="system-status desktop-only">
                    <ShieldCheck size={14} className="status-icon" color="#22c55e" />
                    <span>System Online</span>
                </div>
            </div>

            <div className="header-actions">
                <button className="icon-btn" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>
                <div className="user-profile">
                    <div className="avatar">
                        <User size={20} />
                    </div>
                    <span className="username">Fire Analyst</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
