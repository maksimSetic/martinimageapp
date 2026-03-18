import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor libraries into separate cached chunks.
    // React + react-dom and emailjs are stable and can be cached
    // independently from the app code that changes more often.
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-emailjs": ["@emailjs/browser"],
        },
      },
    },
  },
});
