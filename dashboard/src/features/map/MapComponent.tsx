import React, { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { MapService, type RiskGeoJSON, type RiskLevel, type RiskZoneFeature } from '../../services/MapService';
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

    const getRiskColor = (riskLevel: RiskLevel) => {
        switch (riskLevel) {
            case 'extreme': return '#ef4444';
            case 'high': return '#f97316';
            case 'moderate': return '#eab308';
            default: return '#22c55e';
        }
    };

    const getMarkerIcon = (riskLevel: RiskLevel) => L.divIcon({
        className: 'risk-location-marker',
        html: `<span class="risk-location-pin risk-pin-${riskLevel}"></span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
    });

    const getFeaturePosition = (feature: RiskZoneFeature): [number, number] => {
        const [lon, lat] = feature.geometry.coordinates;
        return [lat, lon];
    };

    return (
        <div className="map-container">
            <MapContainer
                center={[38.5, -121.5]} // Center near Sacramento/Napa
                zoom={8}
                minZoom={3}
                maxBounds={[[-90, -180], [90, 180]]}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    className="map-tiles"
                    noWrap={true}
                />

                {riskZones?.features.map((feature) => {
                    const position = getFeaturePosition(feature);
                    const color = getRiskColor(feature.properties.riskLevel);
                    const popup = (
                        <div className="map-popup">
                            <h3>{feature.properties.name}</h3>
                            <p>Risk Level: <strong className={`risk-${feature.properties.riskLevel}`}>{feature.properties.riskLevel.toUpperCase()}</strong></p>
                            <p>Radius: {(feature.properties.radiusMeters / 1000).toFixed(1)} km</p>
                            <p>Alpha: {feature.properties.alpha.toFixed(2)}</p>
                            <p>Temp: {feature.properties.temperature}°C</p>
                            <p>Humidity: {feature.properties.humidity}%</p>
                        </div>
                    );

                    return (
                        <React.Fragment key={feature.properties.id}>
                            <Circle
                                center={position}
                                radius={feature.properties.radiusMeters}
                                pathOptions={{
                                    color,
                                    fillColor: color,
                                    fillOpacity: feature.properties.alpha,
                                    opacity: 0.9,
                                    weight: 2
                                }}
                            >
                                <Popup>{popup}</Popup>
                            </Circle>
                            <Marker position={position} icon={getMarkerIcon(feature.properties.riskLevel)}>
                                <Popup>{popup}</Popup>
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>

            <div className="map-legend">
                <h4>Risk Levels</h4>
                <div className="legend-item"><span className="legend-color risk-extreme-bg"></span> Extreme (&gt;85%)</div>
                <div className="legend-item"><span className="legend-color risk-high-bg"></span> High (60-85%)</div>
                <div className="legend-item"><span className="legend-color risk-moderate-bg"></span> Moderate (30-60%)</div>
                <div className="legend-item"><span className="legend-color risk-low-bg"></span> Low (&lt;30%)</div>
                <div className="legend-item"><span className="legend-radius-sample"></span> Radius / alpha zone</div>
            </div>
        </div>
    );
};

export default MapComponent;
