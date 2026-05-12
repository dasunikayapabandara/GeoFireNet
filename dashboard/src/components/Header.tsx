import React, { useEffect, useRef, useState } from 'react';
import { Flame, Bell, User, ChevronDown } from 'lucide-react';
import '../styles/Header.css';
import { useAuth } from '../context/useAuth';

const Header: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
    const { logout } = useAuth();
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

    return (
        <header className="header">
            <div className="header-logo" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
                <Flame className="logo-icon" size={24} color="#f97316" />
                <h1 className="logo-text">GeoFireNet</h1>
            </div>

            <div className="header-actions">
                <button className="icon-btn" aria-label="Notifications" onClick={() => setActiveTab('alerts')}>
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>
                <div className="user-profile-wrapper" ref={dropdownRef}>
                    <div className="user-info-container" onClick={toggleDropdown}>
                        <div className="avatar">
                            <User size={20} />
                        </div>
                        <div className="user-details">
                            <span className="username">Fire Analyst</span>
                            <span className="user-email">admin@geofirenet.com</span>
                        </div>
                        <ChevronDown size={16} className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
                    </div>

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
