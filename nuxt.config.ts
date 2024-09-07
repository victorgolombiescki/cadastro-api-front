export default defineNuxtConfig({
  ssr: false,

  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || "http://localhost:3000",
    },
  },

  css: [],

  build: {
    transpile: ["face-api.js"],
  },

  vite: {
    server: {
      fs: {
        strict: false,
      },
    },
  },

  compatibilityDate: "2024-07-18",
});