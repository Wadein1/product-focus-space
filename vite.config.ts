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
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.stripe.com https://*.stripecdn.com https://js.stripe.com https://m.stripe.network https://b.stripecdn.com https://checkout.stripe.com https://hcaptcha.com https://*.hcaptcha.com;",
        "frame-src 'self' https://*.stripe.com https://*.stripecdn.com https://checkout.stripe.com https://js.stripe.com https://hooks.stripe.com https://m.stripe.network https://b.stripecdn.com https://hcaptcha.com https://*.hcaptcha.com;",
        "connect-src 'self' https://*.stripe.com https://*.stripecdn.com https://api.stripe.com https://checkout.stripe.com https://m.stripe.network https://b.stripecdn.com;",
        "img-src 'self' data: blob: https://*.stripe.com https://*.stripecdn.com;",
        "style-src 'self' 'unsafe-inline' https://*.stripe.com https://*.stripecdn.com;",
        "font-src 'self' data: https://*.stripe.com https://*.stripecdn.com;",
        "object-src 'none';",
        "base-uri 'self';",
        "form-action 'self';",
        "media-src 'self' https://*.stripe.com https://*.stripecdn.com;",
        "manifest-src 'self';",
        "worker-src 'self' blob: https://*.stripe.com https://*.stripecdn.com;",
        "child-src blob: https://*.stripe.com https://*.stripecdn.com;",
        "script-src-elem 'self' 'unsafe-inline' blob: https://*.stripe.com https://*.stripecdn.com https://js.stripe.com https://m.stripe.network https://b.stripecdn.com https://checkout.stripe.com https://hcaptcha.com https://*.hcaptcha.com;"
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