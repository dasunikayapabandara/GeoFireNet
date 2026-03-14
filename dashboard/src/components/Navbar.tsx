import React, { useState } from 'react';
import { Flame, Bell, ShieldCheck, Menu, X, PlayCircle } from 'lucide-react';
import '../styles/Navbar.css';

interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'map', label: 'Risk Map' },
        { id: 'predictions', label: 'Predictions' },
        { id: 'alerts', label: 'Alerts' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'history', label: 'History' },
        { id: 'about', label: 'About' }
    ];

    const handleNavClick = (id: string) => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Brand Logo */}
                <div className="navbar-brand" onClick={() => handleNavClick('dashboard')}>
                    <Flame className="logo-icon" size={24} color="#f97316" />
                    <h1 className="logo-text">GeoFireNet</h1>
                    <div className="system-status desktop-only">
                        <ShieldCheck size={14} className="status-icon" color="#22c55e" />
                        <span>System Online</span>
                    </div>
                </div>

                {/* Desktop Nav Links */}
                <div className="navbar-links desktop-only">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => handleNavClick(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="navbar-actions">
                    <button className="icon-btn desktop-only" aria-label="Alerts" onClick={() => handleNavClick('alerts')}>
                        <Bell size={20} />
                        <span className="notification-badge">3</span>
                    </button>

                    <button className="cta-btn primary" onClick={() => handleNavClick('predictions')}>
                        <PlayCircle size={18} />
                        <span className="desktop-only">Run Prediction</span>
                        <span className="mobile-only">Predict</span>
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn mobile-only"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-dropdown">
                    <div className="mobile-sys-status">
                        <ShieldCheck size={14} className="status-icon" color="#22c55e" />
                        <span>Model Ready & Online</span>
                    </div>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`mobile-nav-link ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => handleNavClick(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                    <button className="mobile-nav-link icon-link" onClick={() => handleNavClick('alerts')}>
                        <Bell size={18} /> Notifications
                        <span className="mobile-badge">3</span>
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
