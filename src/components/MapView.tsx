import React, { useEffect, useRef } from 'react';
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([center.lat, center.lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng));
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers and route
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear old layers (except tile layer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    markers.forEach((m) => {
      const icon = m.type === 'truck' ? truckIcon : new L.Icon.Default();
      L.marker([m.position.lat, m.position.lng], { icon }).addTo(map).bindPopup(m.label);
    });

    // Add route
    if (route && route.length > 1) {
      L.polyline(route.map(r => [r.lat, r.lng] as [number, number]), {
        color: 'hsl(192, 82%, 35%)',
        weight: 4,
      }).addTo(map);
    }
  }, [markers, route]);

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default MapView;
