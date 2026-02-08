import React from 'react';
import { LayoutDashboard, Map, BarChart3, Settings, LogOut } from 'lucide-react';
import '../styles/Sidebar.css';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
        { id: 'map', icon: Map, label: 'Live Map' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => (
                        <li key={item.id} className="nav-item">
                            <button
                                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <item.icon size={20} />
                                <span className="nav-label">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="nav-link logout-btn">
                    <LogOut size={20} />
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
