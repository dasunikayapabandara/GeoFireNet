import { useState } from 'react';
import Navbar from './components/Navbar';
import MapComponent from './features/map/MapComponent';
import DashboardOverview from './features/dashboard/DashboardOverview';
import ReactiveCapture from './features/reactive/ReactiveCapture';
import Predictions from './pages/Predictions';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import History from './pages/History';
import About from './pages/About';
import './styles/App.css';

import Footer from './components/Footer';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      default:
        return <div className="p-6"><h2>Page Not Found</h2></div>;
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="content-area">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
