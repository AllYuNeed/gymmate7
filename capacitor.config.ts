import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mortalgyms.app',
  appName: 'Mortal Gyms',
  webDir: 'dist',
  server: {
    url: 'https://mortalgyms.com',
    cleartext: false,
  },
};

export default config;
