import { useState, useCallback } from 'react';
import { BusinessMarker, MapConfig } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Generate realistic demo data for the globe
const generateDemoMarkers = (count: number = 150): BusinessMarker[] => {
  const locations = [
    // Brazil
    { lat: -23.5505, lng: -46.6333, city: 'São Paulo' },
    { lat: -22.9068, lng: -43.1729, city: 'Rio de Janeiro' },
    { lat: -19.9167, lng: -43.9345, city: 'Belo Horizonte' },
    { lat: -25.4284, lng: -49.2733, city: 'Curitiba' },
    { lat: -30.0346, lng: -51.2177, city: 'Porto Alegre' },
    { lat: -3.7172, lng: -38.5433, city: 'Fortaleza' },
    { lat: -12.9714, lng: -38.5014, city: 'Salvador' },
    { lat: -15.7942, lng: -47.8825, city: 'Brasília' },
    // USA
    { lat: 40.7128, lng: -74.0060, city: 'New York' },
    { lat: 34.0522, lng: -118.2437, city: 'Los Angeles' },
    { lat: 41.8781, lng: -87.6298, city: 'Chicago' },
    { lat: 29.7604, lng: -95.3698, city: 'Houston' },
    { lat: 33.4484, lng: -112.0740, city: 'Phoenix' },
    { lat: 25.7617, lng: -80.1918, city: 'Miami' },
    // Europe
    { lat: 51.5074, lng: -0.1278, city: 'London' },
    { lat: 48.8566, lng: 2.3522, city: 'Paris' },
    { lat: 52.5200, lng: 13.4050, city: 'Berlin' },
    { lat: 41.9028, lng: 12.4964, city: 'Rome' },
    { lat: 40.4168, lng: -3.7038, city: 'Madrid' },
    { lat: 38.7223, lng: -9.1393, city: 'Lisbon' },
    // Asia
    { lat: 35.6762, lng: 139.6503, city: 'Tokyo' },
    { lat: 22.3193, lng: 114.1694, city: 'Hong Kong' },
    { lat: 1.3521, lng: 103.8198, city: 'Singapore' },
    { lat: 37.5665, lng: 126.9780, city: 'Seoul' },
    // Australia
    { lat: -33.8688, lng: 151.2093, city: 'Sydney' },
    { lat: -37.8136, lng: 144.9631, city: 'Melbourne' },
  ];

  const categories = [
    'Barbearia', 'Salão de Beleza', 'Restaurante', 'Clínica Médica', 
    'Academia', 'Pet Shop', 'Oficina Mecânica', 'Loja de Roupas',
    'Consultório Odontológico', 'Estúdio de Tatuagem', 'Bar', 'Padaria'
  ];

  const nightBusinesses = ['Bar', 'Restaurante', 'Estúdio de Tatuagem'];

  const markers: BusinessMarker[] = [];

  for (let i = 0; i < count; i++) {
    const baseLocation = locations[Math.floor(Math.random() * locations.length)];
    // Add some randomness to the exact position
    const lat = baseLocation.lat + (Math.random() - 0.5) * 0.5;
    const lng = baseLocation.lng + (Math.random() - 0.5) * 0.5;
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const hasWebsite = Math.random() > 0.6;
    const hasScheduling = Math.random() > 0.7;
    const hasCRM = Math.random() > 0.8;
    const hasOnlinePresence = hasWebsite || Math.random() > 0.5;
    
    // Calculate opportunity score (0-100)
    let opportunityScore = 100;
    if (hasWebsite) opportunityScore -= 30;
    if (hasScheduling) opportunityScore -= 25;
    if (hasCRM) opportunityScore -= 25;
    if (hasOnlinePresence) opportunityScore -= 10;
    opportunityScore = Math.max(10, opportunityScore);

    // Determine status based on opportunity
    let status: 'critical' | 'warning' | 'good';
    if (opportunityScore >= 70) status = 'critical';
    else if (opportunityScore >= 40) status = 'warning';
    else status = 'good';

    const isNightBusiness = nightBusinesses.includes(category);
    const hour = new Date().getHours();
    const isOpenNow = isNightBusiness 
      ? (hour >= 18 || hour < 2)
      : (hour >= 8 && hour < 18);

    markers.push({
      id: `marker-${i}`,
      name: `${category} ${baseLocation.city} ${i + 1}`,
      latitude: lat,
      longitude: lng,
      status,
      hasWebsite,
      hasScheduling,
      hasCRM,
      hasOnlinePresence,
      rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      address: `${baseLocation.city}, ${Math.floor(Math.random() * 1000) + 1}`,
      isOpenNow,
      isNightBusiness,
      opportunityScore,
      category,
      estimatedValue: opportunityScore >= 70 ? 2500 : opportunityScore >= 40 ? 1200 : 500
    });
  }

  return markers;
};

export const useGlobeData = () => {
  const [markers, setMarkers] = useState<BusinessMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<BusinessMarker | null>(null);
  const [config, setConfig] = useState<MapConfig>({
    showCritical: true,
    showWarning: true,
    showGood: true,
    showNightOnly: false,
    showOpenNow: false,
    autoRotate: true,
    showClouds: true,
    showAtmosphere: true
  });

  const loadMarkers = useCallback(async () => {
    setLoading(true);
    try {
      // For now, use demo data - can be replaced with real API calls later
      const demoMarkers = generateDemoMarkers(200);
      setMarkers(demoMarkers);
      toast.success(`${demoMarkers.length} empresas carregadas no mapa global`);
    } catch (error) {
      console.error('Error loading markers:', error);
      toast.error('Erro ao carregar marcadores');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredMarkers = markers.filter(marker => {
    if (!config.showCritical && marker.status === 'critical') return false;
    if (!config.showWarning && marker.status === 'warning') return false;
    if (!config.showGood && marker.status === 'good') return false;
    if (config.showNightOnly && !marker.isNightBusiness) return false;
    if (config.showOpenNow && !marker.isOpenNow) return false;
    return true;
  });

  const stats = {
    total: markers.length,
    critical: markers.filter(m => m.status === 'critical').length,
    warning: markers.filter(m => m.status === 'warning').length,
    good: markers.filter(m => m.status === 'good').length,
    nightBusinesses: markers.filter(m => m.isNightBusiness).length,
    openNow: markers.filter(m => m.isOpenNow).length,
    filtered: filteredMarkers.length
  };

  return {
    markers: filteredMarkers,
    allMarkers: markers,
    loading,
    loadMarkers,
    selectedMarker,
    setSelectedMarker,
    config,
    setConfig,
    stats
  };
};
