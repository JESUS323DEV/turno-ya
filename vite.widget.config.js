import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: "src/widget.jsx",
      name: "Reservaq",
      fileName: "reservaq",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "reservaq.js",
        assetFileNames: "reservaq.[ext]",
      },
    },
  },
});
