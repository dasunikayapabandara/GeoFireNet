import React, { useEffect, useState } from 'react';
import RiskCard from './RiskCard';
import RiskChart from './RiskChart';
import { AlertCircle } from 'lucide-react';
import { RiskService, type RiskMetric, type Alert, type RiskChartData } from '../../services/RiskService';
import '../../styles/DashboardOverview.css';

const DashboardOverview: React.FC = () => {
    const [metrics, setMetrics] = useState<RiskMetric[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [chartData, setChartData] = useState<RiskChartData | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsData, alertsData, trendData] = await Promise.all([
                    RiskService.getMetrics(),
                    RiskService.getAlerts(),
                    RiskService.getRiskTrend()
                ]);

                setMetrics(metricsData);
                setAlerts(alertsData);
                setChartData(trendData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="dashboard-container flex-center">Loading Dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Risk Overview</h2>
                <span className="last-updated">Last Updated: Just now</span>
            </div>

            <div className="metrics-grid">
                {metrics.map((metric, index) => (
                    <RiskCard
                        key={index}
                        title={metric.title}
                        value={metric.value}
                        change={metric.change}
                        trend={metric.trend}
                        status={metric.status}
                    />
                ))}
            </div>

            <div className="dashboard-main-content">
                <div className="chart-section card">
                    <div className="section-header">
                        <h3>7-Day Risk Forecast</h3>
                    </div>
                    <RiskChart data={chartData} />
                </div>

                <div className="alerts-section card">
                    <div className="section-header">
                        <h3>Recent Alerts</h3>
                    </div>
                    <ul className="alerts-list">
                        {alerts.map((alert) => (
                            <li key={alert.id} className={`alert-item ${alert.severity}`}>
                                <AlertCircle size={16} />
                                <div>
                                    <strong>{alert.title}</strong>
                                    <p>{alert.description}</p>
                                </div>
                                <span className="alert-time">{alert.timestamp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
