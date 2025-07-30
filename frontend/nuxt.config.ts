// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: false },
  ssr: true,
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "Delgar Frozen Products",
      link: [
        {
          rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css",
        },
      ],
      script: [
        {
          async: true,
          src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5987109792483405",
          crossorigin: "anonymous"
        }
      ]

    },
  },
  css: ["~/assets/css/main.css"],
  modules: ["@nuxtjs/tailwindcss", "nuxt-facebook-chat", "nuxt-gtag"],
  gtag: {
    id: 'G-WCCRGMPYMY'
  },
  nuxtFacebookChat: {
    pageId: "100855749241228",
    themeColor: "#0084ff",
    loggedInGreeting: "Hi! How can we help you?",
    loggedOutGreeting: "Hi! Please log in to chat with us.",
    locale: "en_US",
  },
  nitro: {
    experimental: {
      wasm: true,
    },
  },
  vite: {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    },
  },
});
