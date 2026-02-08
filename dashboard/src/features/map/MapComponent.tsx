import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { MapService, type RiskGeoJSON } from '../../services/MapService';
import L from 'leaflet';

const MapComponent: React.FC = () => {
    const [riskZones, setRiskZones] = useState<RiskGeoJSON | null>(null);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const data = await MapService.getRiskZones();
                setRiskZones(data);
            } catch (error) {
                console.error("Failed to fetch map data", error);
            }
        };
        fetchZones();
    }, []);

    const onEachFeature = (feature: any, layer: L.Layer) => {
        if (feature.properties && feature.properties.name) {
            layer.bindPopup(`
        <div class="map-popup">
          <h3>${feature.properties.name}</h3>
          <p>Risk Level: <strong class="risk-${feature.properties.riskLevel}">${feature.properties.riskLevel.toUpperCase()}</strong></p>
          <p>Temp: ${feature.properties.temperature}°C</p>
          <p>Humidity: ${feature.properties.humidity}%</p>
        </div>
      `);
        }
    };

    const styleFeature = (feature: any) => {
        switch (feature?.properties?.riskLevel) {
            case 'extreme': return { color: '#ef4444', weight: 2, fillOpacity: 0.6 };
            case 'high': return { color: '#f97316', weight: 2, fillOpacity: 0.5 };
            case 'moderate': return { color: '#eab308', weight: 2, fillOpacity: 0.4 };
            default: return { color: '#22c55e', weight: 2, fillOpacity: 0.3 };
        }
    };

    return (
        <div className="map-container">
            <MapContainer
                center={[38.5, -121.5]} // Center near Sacramento/Napa
                zoom={8}
                minZoom={3}
                maxBounds={[[-90, -180], [90, 180]]}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                    noWrap={true}
                />

                {riskZones && (
                    <GeoJSON
                        data={riskZones as any}
                        style={styleFeature}
                        onEachFeature={onEachFeature}
                    />
                )}
            </MapContainer>

            <div className="map-legend">
                <h4>Risk Levels</h4>
                <div className="legend-item"><span className="legend-color risk-extreme-bg"></span> Extreme (&gt;85%)</div>
                <div className="legend-item"><span className="legend-color risk-high-bg"></span> High (60-85%)</div>
                <div className="legend-item"><span className="legend-color risk-moderate-bg"></span> Moderate (30-60%)</div>
                <div className="legend-item"><span className="legend-color risk-low-bg"></span> Low (&lt;30%)</div>
            </div>
        </div>
    );
};

export default MapComponent;
