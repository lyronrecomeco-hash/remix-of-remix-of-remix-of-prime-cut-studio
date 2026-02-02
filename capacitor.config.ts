import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3810e649e60b4522b54681e25f4ba28c',
  appName: 'Academia Genesis',
  webDir: 'dist',
  server: {
    url: 'https://3810e649-e60b-4522-b546-81e25f4ba28c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#09090b',
      showSpinner: false
    }
  }
};

export default config;
