import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'uz.nur.quron',
  appName: 'Nur',
  webDir: 'dist',
  android: {
    backgroundColor: '#0b1f1a',
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
}

export default config
