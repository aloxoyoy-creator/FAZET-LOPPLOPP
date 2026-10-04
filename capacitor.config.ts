import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fathur.schoolhub',
  appName: 'FAZETT LOPP LOPP',
  webDir: 'dist',
  ...(process.env.VITE_APP_URL?.trim()
    ? {
        server: {
          url: process.env.VITE_APP_URL.trim(),
          cleartext: false,
        },
      }
    : {}),
  android: {
    allowMixedContent: false,
    // Native app feel: no white flash / browser chrome while the WebView boots.
    backgroundColor: '#0f172a',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
