export interface BusinessMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'critical' | 'warning' | 'good';
  hasWebsite: boolean;
  hasScheduling: boolean;
  hasCRM: boolean;
  hasOnlinePresence: boolean;
  rating?: number;
  phone?: string;
  address?: string;
  isOpenNow: boolean;
  isNightBusiness: boolean;
  opportunityScore: number;
  category?: string;
  estimatedValue?: number;
}

export interface MapConfig {
  showCritical: boolean;
  showWarning: boolean;
  showGood: boolean;
  showNightOnly: boolean;
  showOpenNow: boolean;
  autoRotate: boolean;
  showClouds: boolean;
  showAtmosphere: boolean;
}

export interface GlobePosition {
  lat: number;
  lng: number;
  altitude: number;
}
