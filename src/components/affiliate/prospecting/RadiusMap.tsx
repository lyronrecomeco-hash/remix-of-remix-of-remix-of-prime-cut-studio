import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ResultMarker {
  lat: number;
  lng: number;
  name?: string;
}

interface RadiusMapProps {
  center: [number, number];
  radius: number; // km
  onMapClick: (lat: number, lng: number) => void;
  markers?: ResultMarker[];
}

// Dark theme tile URL (CartoDB Dark Matter)
const TILE_URL_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function ensureDefaultMarkerIcons() {
  // Fix for default marker icon (bundlers often miss these assets)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom GPS/location icon
const locationIcon = L.divIcon({
  html: `<div style="
    background: hsl(var(--primary));
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
    "></div>
  </div>`,
  className: 'custom-location-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Cluster marker icon
const createClusterIcon = (count: number) => L.divIcon({
  html: `<div style="
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8));
    width: ${count > 10 ? 36 : 28}px;
    height: ${count > 10 ? 36 : 28}px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: ${count > 10 ? 12 : 10}px;
    font-weight: bold;
  ">${count}</div>`,
  className: 'cluster-icon',
  iconSize: [count > 10 ? 36 : 28, count > 10 ? 36 : 28],
  iconAnchor: [(count > 10 ? 36 : 28) / 2, (count > 10 ? 36 : 28) / 2],
});

export default function RadiusMap({ center, radius, onMapClick, markers = [] }: RadiusMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const clusterMarkersRef = useRef<L.Marker[]>([]);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Mount map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    ensureDefaultMarkerIcons();

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
    });

    mapRef.current = map;

    L.tileLayer(TILE_URL_DARK, {
      attribution: ATTRIBUTION,
    }).addTo(map);

    // Add minimal attribution in corner
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    map.setView(center, 13, { animate: false });

    markerRef.current = L.marker(center, { icon: locationIcon }).addTo(map);

    circleRef.current = L.circle(center, {
      radius: radius * 1000,
      color: 'hsl(var(--primary))',
      fillColor: 'hsl(var(--primary))',
      fillOpacity: 0.15,
      weight: 2,
      dashArray: '8, 4',
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClickRef.current(e.latlng.lat, e.latlng.lng);
    });

    // When inside modals, size can be wrong on first paint
    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep center in sync
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setView(center, map.getZoom(), { animate: true });
    markerRef.current?.setLatLng(center);
    circleRef.current?.setLatLng(center);
  }, [center]);

  // Keep radius in sync
  useEffect(() => {
    circleRef.current?.setRadius(radius * 1000);
  }, [radius]);

  // Add/update cluster markers for results
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing cluster markers
    clusterMarkersRef.current.forEach(m => m.remove());
    clusterMarkersRef.current = [];

    if (markers.length === 0) return;

    // Simple grid-based clustering
    const gridSize = 0.01; // ~1km grid cells
    const clusters: Map<string, { lat: number; lng: number; count: number; names: string[] }> = new Map();

    markers.forEach(m => {
      const gridKey = `${Math.floor(m.lat / gridSize)},${Math.floor(m.lng / gridSize)}`;
      const existing = clusters.get(gridKey);
      if (existing) {
        existing.count++;
        if (m.name) existing.names.push(m.name);
        existing.lat = (existing.lat * (existing.count - 1) + m.lat) / existing.count;
        existing.lng = (existing.lng * (existing.count - 1) + m.lng) / existing.count;
      } else {
        clusters.set(gridKey, {
          lat: m.lat,
          lng: m.lng,
          count: 1,
          names: m.name ? [m.name] : [],
        });
      }
    });

    clusters.forEach(cluster => {
      const marker = L.marker([cluster.lat, cluster.lng], {
        icon: createClusterIcon(cluster.count),
      }).addTo(map);

      if (cluster.names.length > 0) {
        const tooltipContent = cluster.count > 3 
          ? `${cluster.names.slice(0, 3).join('<br>')}... +${cluster.count - 3} mais`
          : cluster.names.join('<br>');
        marker.bindTooltip(tooltipContent, { 
          className: 'leaflet-tooltip-dark',
          direction: 'top',
        });
      }

      clusterMarkersRef.current.push(marker);
    });
  }, [markers]);

  return (
    <>
      <style>{`
        .leaflet-tooltip-dark {
          background: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--popover-foreground));
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .leaflet-tooltip-dark::before {
          border-top-color: hsl(var(--border)) !important;
        }
        .custom-location-icon, .cluster-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}
