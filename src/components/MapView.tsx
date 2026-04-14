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

const createCustomIcon = (type: 'request' | 'truck', label: string) => {
  const color = type === 'truck' ? '#00A3FF' : '#FF4B4B';
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 bg-[${color}]/20 rounded-full animate-ping"></div>
        <div class="relative w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-[${color}]">
          <div class="w-2.5 h-2.5 rounded-full bg-[${color}]"></div>
        </div>
        <div class="absolute top-10 whitespace-nowrap bg-white/90 backdrop-blur-sm border border-border px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
          ${label}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

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
    
    // Switch to Google Maps Street Tiles
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps',
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
      const icon = createCustomIcon(m.type || 'request', m.label);
      L.marker([m.position.lat, m.position.lng], { icon }).addTo(map);
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
