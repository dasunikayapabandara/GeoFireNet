import React from 'react';
import { LayoutDashboard, Map, BarChart3, Settings, LogOut, Camera, PlaySquare, Bell, Clock, Info, Users } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import '../styles/Sidebar.css';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { logout, user } = useAuth();
    const isAdmin = user?.role === 'Administrator';

    const navSections = [
        {
            title: 'Monitor',
            items: [
                { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
                { id: 'map', icon: Map, label: 'Live Map' },
                { id: 'alerts', icon: Bell, label: 'Alerts' },
                { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            ]
        },
        {
            title: 'Assess',
            items: [
                { id: 'predictions', icon: PlaySquare, label: 'Scenario Check' },
                { id: 'reactive', icon: Camera, label: 'Image Review' },
                { id: 'history', icon: Clock, label: 'History' },
            ]
        },
        {
            title: 'System',
            items: [
                ...(isAdmin ? [{ id: 'user', icon: Users, label: 'Users' }] : []),
                { id: 'about', icon: Info, label: 'About' },
                { id: 'settings', icon: Settings, label: 'Settings' },
            ]
        },
    ];

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {navSections.map((section) => (
                    <div className="nav-section" key={section.title}>
                        <p className="nav-section-label">{section.title}</p>
                        <ul className="nav-list">
                            {section.items.map((item) => (
                                <li key={item.id} className="nav-item">
                                    <button
                                        className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(item.id)}
                                        title={item.label}
                                    >
                                        <item.icon size={20} />
                                        <span className="nav-label">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-link logout-btn" onClick={logout}>
                    <LogOut size={20} />
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
