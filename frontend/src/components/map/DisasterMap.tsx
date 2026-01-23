import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type DisasterAlert } from "@/types/disaster-alert";
import { api } from "@/lib/api";
import { AnimatePresence } from "framer-motion";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different disaster types
const createCustomIcon = (type: string, severity: string) => {
  const severityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#7c2d12'
  };

  const typeIcons = {
    earthquake: '🌋',
    flood: '🌊',
    storm: '⛈️',
    wildfire: '🔥',
    volcanic: '🌋',
    tsunami: '🌊'
  };

  const iconHtml = `
    <div style="
      background: ${severityColors[severity as keyof typeof severityColors]};
      border: 2px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      ${typeIcons[type as keyof typeof typeIcons] || '⚠️'}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

interface DisasterMapProps {
  onAlertSelect?: (alert: DisasterAlert) => void;
  selectedAlert?: DisasterAlert | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DisasterMap({ onAlertSelect, selectedAlert }: DisasterMapProps) {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_map, setMap] = useState<L.Map | null>(null);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts');
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Center on Philippines by default
  const defaultCenter: [number, number] = [12.8797, 121.7740];

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading disaster map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <AnimatePresence>
          {alerts.map((alert) => (
            <React.Fragment key={alert.id}>
              {/* Marker */}
              <Marker
                position={[alert.latitude, alert.longitude]}
                icon={createCustomIcon(alert.type, alert.severity)}
                eventHandlers={{
                  click: () => onAlertSelect?.(alert),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-sembiold text-lg">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' 
                        : alert.severity === 'high' ? 'bg-orange-100 text-orange-800' 
                        : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100'}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.started_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Affected area circle */}
              <Circle 
                center={[alert.latitude, alert.longitude]}
                radius={alert.radius_km * 1000} // convert km to meters
                pathOptions={{
                  color: alert.severity === 'critical' ? '#ef4444'
                    : alert.severity === 'high' ? '#f97316'
                    : alert.severity === 'medium' ? '#eab308'
                    : '#10b981',
                  fillColor: alert.severity === 'critical' ? '#ef4444'
                    : alert.severity === 'high' ? '#f9716'
                    : alert.severity === 'medium' ? '#eab308'
                    : '#10b981',
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            </React.Fragment>
          ))}
        </AnimatePresence>
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border z-500">
        <h4 className="font-semibold mb-2">Disaster Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low</span>
          </div>
        </div>
      </div>

      {/* Alert Count */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-500">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{alerts.length}</div>
          <div className="text-xs text-muted-foreground">Active Alerts</div>
        </div>
      </div>
    </div>
  )
}