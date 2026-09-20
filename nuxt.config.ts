const APP_NAME = 'Костёр'
const THEME_COLOR = '#14110f'
const baseURL = process.env.NUXT_APP_BASE_URL || '/'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-20',
  ssr: false,
  modules: ['@vite-pwa/nuxt'],
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  app: {
    baseURL,
    head: {
      title: APP_NAME,
      htmlAttrs: { lang: 'ru' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: THEME_COLOR },
        { name: 'color-scheme', content: 'dark' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: APP_NAME },
      ],
      link: [
        { rel: 'manifest', href: `${baseURL}manifest.webmanifest` },
        { rel: 'icon', type: 'image/png', href: `${baseURL}icons/icon-192.png` },
        { rel: 'apple-touch-icon', sizes: '180x180', href: `${baseURL}icons/apple-touch-icon-180.png` },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: APP_NAME,
      short_name: APP_NAME,
      description: 'Офлайн-карточки с вопросами для вечеринок и походов',
      lang: 'ru',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: THEME_COLOR,
      background_color: THEME_COLOR,
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: baseURL,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json,webmanifest}'],
      cleanupOutdatedCaches: true,
    },
    client: {
      installPrompt: false,
    },
    devOptions: {
      enabled: false,
    },
  },
})
