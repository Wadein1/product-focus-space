import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Set CSP headers to allow Stripe and other required resources
      "Content-Security-Policy": `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://*.stripecdn.com https://m.stripe.network;
        frame-src 'self' https://*.stripe.com https://*.stripecdn.com;
        connect-src 'self' https://*.stripe.com https://*.stripecdn.com https://m.stripe.network;
        img-src 'self' data: blob: https://*.stripe.com https://*.stripecdn.com;
        style-src 'self' 'unsafe-inline' https://*.stripe.com;
        font-src 'self' data:;
      `.replace(/\s+/g, ' ').trim(),
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));