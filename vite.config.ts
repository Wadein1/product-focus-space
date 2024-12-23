import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Content-Security-Policy": [
        // Base directive
        "default-src 'self';",
        
        // Script handling - both regular and element-specific
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.stripe.com https://*.stripecdn.com https://js.stripe.com https://m.stripe.network https://b.stripecdn.com https://checkout.stripe.com https://hcaptcha.com https://*.hcaptcha.com;",
        "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.stripe.com https://*.stripecdn.com https://js.stripe.com https://m.stripe.network https://b.stripecdn.com https://checkout.stripe.com https://hcaptcha.com https://*.hcaptcha.com;",
        
        // Frame and child sources
        "frame-src 'self' blob: https://*.stripe.com https://*.stripecdn.com https://checkout.stripe.com https://js.stripe.com https://hooks.stripe.com https://m.stripe.network https://b.stripecdn.com https://hcaptcha.com https://*.hcaptcha.com;",
        "child-src 'self' blob: https://*.stripe.com https://*.stripecdn.com;",
        
        // Resource loading
        "connect-src 'self' https://*.stripe.com https://*.stripecdn.com https://api.stripe.com https://checkout.stripe.com https://m.stripe.network https://b.stripecdn.com;",
        "img-src 'self' data: blob: https://*.stripe.com https://*.stripecdn.com;",
        "style-src 'self' 'unsafe-inline' https://*.stripe.com https://*.stripecdn.com;",
        "font-src 'self' data: https://*.stripe.com https://*.stripecdn.com;",
        
        // Media and worker handling
        "media-src 'self' https://*.stripe.com https://*.stripecdn.com;",
        "worker-src 'self' blob: https://*.stripe.com https://*.stripecdn.com;",
        
        // Additional security headers
        "object-src 'none';",
        "base-uri 'self';",
        "form-action 'self';",
        "manifest-src 'self';"
      ].join(" ")
    }
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