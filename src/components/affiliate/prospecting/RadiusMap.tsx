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

// Light theme - Uber style (CartoDB Voyager)
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function ensureDefaultMarkerIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom GPS/location icon - Uber style
const locationIcon = L.divIcon({
  html: `<div style="
    background: #276EF1;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(39, 110, 241, 0.4), 0 2px 4px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
  ">
    <div style="
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
    "></div>
  </div>
  <style>
    @keyframes pulse {
      0% { box-shadow: 0 4px 12px rgba(39, 110, 241, 0.4), 0 2px 4px rgba(0,0,0,0.2); }
      50% { box-shadow: 0 4px 20px rgba(39, 110, 241, 0.6), 0 2px 4px rgba(0,0,0,0.2); }
      100% { box-shadow: 0 4px 12px rgba(39, 110, 241, 0.4), 0 2px 4px rgba(0,0,0,0.2); }
    }
  </style>`,
  className: 'custom-location-icon',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Cluster marker icon - Uber style
const createClusterIcon = (count: number) => {
  const size = count > 20 ? 44 : count > 10 ? 38 : 32;
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #276EF1 0%, #1557D0 100%);
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(39, 110, 241, 0.35), 0 2px 4px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: ${count > 20 ? 14 : count > 10 ? 13 : 12}px;
      font-weight: 600;
      font-family: 'Inter', system-ui, sans-serif;
    ">${count}</div>`,
    className: 'cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Single business marker icon
const businessIcon = L.divIcon({
  html: `<div style="
    background: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #276EF1;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#276EF1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  </div>`,
  className: 'business-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    mapRef.current = map;

    L.tileLayer(TILE_URL, {
      attribution: ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add minimal attribution in corner
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    map.setView(center, 14, { animate: false });

    markerRef.current = L.marker(center, { icon: locationIcon }).addTo(map);

    circleRef.current = L.circle(center, {
      radius: radius * 1000,
      color: '#276EF1',
      fillColor: '#276EF1',
      fillOpacity: 0.08,
      weight: 2,
      opacity: 0.6,
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
    const gridSize = 0.008; // smaller cells for better precision
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
      const icon = cluster.count === 1 ? businessIcon : createClusterIcon(cluster.count);
      const marker = L.marker([cluster.lat, cluster.lng], { icon }).addTo(map);

      if (cluster.names.length > 0) {
        const tooltipContent = cluster.count > 5 
          ? `<div style="font-weight: 600; margin-bottom: 4px;">${cluster.count} estabelecimentos</div>${cluster.names.slice(0, 3).map(n => `<div style="font-size: 11px; color: #666;">• ${n}</div>`).join('')}<div style="font-size: 11px; color: #999; margin-top: 4px;">... e mais ${cluster.count - 3}</div>`
          : cluster.names.map(n => `<div style="font-size: 12px;">• ${n}</div>`).join('');
        marker.bindTooltip(tooltipContent, { 
          className: 'uber-tooltip',
          direction: 'top',
          offset: [0, -8],
        });
      }

      clusterMarkersRef.current.push(marker);
    });
  }, [markers]);

  return (
    <>
      <style>{`
        .uber-tooltip {
          background: white;
          border: none;
          color: #1A1A1A;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          font-family: 'Inter', system-ui, sans-serif;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08);
          max-width: 250px;
        }
        .uber-tooltip::before {
          display: none;
        }
        .custom-location-icon, .cluster-icon, .business-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #1A1A1A !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #F6F6F6 !important;
        }
        .leaflet-control-zoom-in {
          border-bottom: 1px solid #E5E5E5 !important;
          border-radius: 8px 8px 0 0 !important;
        }
        .leaflet-control-zoom-out {
          border-radius: 0 0 8px 8px !important;
        }
      `}</style>
      <div ref={containerRef} className="h-full w-full rounded-lg" />
    </>
  );
}
