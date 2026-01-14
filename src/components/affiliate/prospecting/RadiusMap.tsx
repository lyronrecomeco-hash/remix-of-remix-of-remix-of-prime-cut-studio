import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RadiusMapProps {
  center: [number, number];
  radius: number; // km
  onMapClick: (lat: number, lng: number) => void;
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
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

export default function RadiusMap({ center, radius, onMapClick }: RadiusMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
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
    }).addTo(map);

    map.setView(center, 13, { animate: false });

    markerRef.current = L.marker(center).addTo(map);

    circleRef.current = L.circle(center, {
      radius: radius * 1000,
      color: 'hsl(var(--primary))',
      fillColor: 'hsl(var(--primary))',
      fillOpacity: 0.15,
      weight: 2,
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

    map.setView(center, map.getZoom(), { animate: false });
    markerRef.current?.setLatLng(center);
    circleRef.current?.setLatLng(center);
  }, [center]);

  // Keep radius in sync
  useEffect(() => {
    circleRef.current?.setRadius(radius * 1000);
  }, [radius]);

  return <div ref={containerRef} className="h-full w-full" />;
}
