import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapComponent from './features/map/MapComponent';
import DashboardOverview from './features/dashboard/DashboardOverview';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        // No padding here either, handled by DashboardOverview internal padding
        return <div style={{ height: '100%', width: '100%' }}><DashboardOverview /></div>;
      case 'map':
        return <div style={{ height: '100%', width: '100%' }}><MapComponent /></div>;
      case 'analytics':
        return <div className="p-6"><h2>Analytics</h2><p>Risk trend analysis and history.</p></div>;
      case 'settings':
        return <div className="p-6"><h2>Settings</h2><p>User configuration and preferences.</p></div>;
      default:
        return <div className="p-6"><h2>Page Not Found</h2></div>;
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
