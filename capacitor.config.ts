import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bartender.lareserve',
  appName: 'La Reserve',
  webDir: 'dist/spa',
  server: {
    // En dev, pointer vers le serveur local si besoin
    // url: 'http://localhost:5173',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e293b",
      showSpinner: false
    }
  }
};

export default config;
