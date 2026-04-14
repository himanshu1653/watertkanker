import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '@/data/types';
import { CITY_CENTER } from '@/data/mockData';

// Fix default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'hue-rotate-180',
});

interface MapViewProps {
  markers?: { position: Location; label: string; type?: 'request' | 'truck' }[];
  route?: Location[];
  center?: Location;
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

const MapView: React.FC<MapViewProps> = ({ markers = [], route, center = CITY_CENTER, height = '300px', onMapClick }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        // @ts-ignore
        whenReady={(map: any) => {
          if (onMapClick) {
            map.target.on('click', (e: any) => onMapClick(e.latlng.lat, e.latlng.lng));
          }
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker key={i} position={[m.position.lat, m.position.lng]} icon={m.type === 'truck' ? truckIcon : new L.Icon.Default()}>
            <Popup>{m.label}</Popup>
          </Marker>
        ))}
        {route && route.length > 1 && (
          <Polyline positions={route.map(r => [r.lat, r.lng])} pathOptions={{ color: 'hsl(192, 82%, 35%)', weight: 4 }} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
