import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapComponent from './features/map/MapComponent';
import DashboardOverview from './features/dashboard/DashboardOverview';
import ReactiveCapture from './features/reactive/ReactiveCapture';
import Predictions from './pages/Predictions';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import History from './pages/History';
import About from './pages/About';
import Settings from './pages/Settings';
import Login from './pages/Login';
import RealTimeToast from './components/RealTimeToast';
import { useAuth } from './context/AuthContext';
import './styles/App.css';

import Footer from './components/Footer';

function App() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Apply theme on first render based on saved settings
  useEffect(() => {
    const stored = localStorage.getItem('geofirenet_settings');
    if (stored) {
      try {
        if (JSON.parse(stored).theme === 'light') {
          document.documentElement.classList.add('light-theme');
        }
      } catch (e) {
        // ignored
      }
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <div className="full-size-container"><DashboardOverview /></div>;
      case 'map':
        return <div className="full-size-container"><MapComponent /></div>;
      case 'predictions':
        return <div className="full-size-container"><Predictions /></div>;
      case 'reactive':
        return <div className="full-size-container"><ReactiveCapture /></div>;
      case 'alerts':
        return <div className="full-size-container"><Alerts /></div>;
      case 'analytics':
        return <div className="full-size-container"><Analytics /></div>;
      case 'history':
        return <div className="full-size-container"><History /></div>;
      case 'about':
        return <div className="full-size-container"><About /></div>;
      case 'settings':
        return <div className="full-size-container"><Settings /></div>;
      default:
        return <div className="p-6"><h2>Page Not Found</h2></div>;
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <RealTimeToast />
      <Header setActiveTab={setActiveTab} />
      <div className="main-layout">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
