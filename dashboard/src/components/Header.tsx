import React, { useEffect, useRef, useState } from 'react';
import { Flame, Bell, User, ChevronDown, CircleCheck } from 'lucide-react';
import '../styles/Header.css';
import { useAuth } from '../context/useAuth';

const Header: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
    const { logout, user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const toggleDropdown = () => {
        setIsDropdownOpen((current) => !current);
    };

    const handleLogoClick = () => {
        setActiveTab('dashboard');
    };

    return (
        <header className="header">
            <button className="header-logo" onClick={handleLogoClick} aria-label="Open overview">
                <Flame className="logo-icon" size={24} color="#f97316" />
                <span className="logo-text">GeoFireNet</span>
                <span className="system-status">
                    <CircleCheck size={14} />
                    Monitoring
                </span>
            </button>

            <div className="header-actions">
                <button className="icon-btn" aria-label="Open alerts" title="Open alerts" onClick={() => setActiveTab('alerts')}>
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>
                <div className="user-profile-wrapper" ref={dropdownRef}>
                    <button className="user-info-container" onClick={toggleDropdown} aria-expanded={isDropdownOpen}>
                        <div className="avatar">
                            <User size={20} />
                        </div>
                        <div className="user-details">
                            <span className="username">{user?.name ?? 'Fire Analyst'}</span>
                            <span className="user-email">{user?.role ?? user?.email ?? 'Operator'}</span>
                        </div>
                        <ChevronDown size={16} className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="profile-dropdown-menu">
                            <ul className="dropdown-list">
                                <li className="dropdown-item text-danger" onClick={logout}>
                                    Log out
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
