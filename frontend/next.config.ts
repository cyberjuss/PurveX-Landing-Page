import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.75.1"],
  // Optimize compilation performance
  experimental: {
    // Tree-shake large icon libraries and chart components
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Reduce logging for faster builds
  logging: {
    fetches: {
      fullUrl: false,
    },
  }
  // Security headers (CSP with nonces, HSTS, COOP, CORP, X-Frame-Options,
  // etc.) are already applied site-wide in src/proxy.ts -- no need to
  // duplicate any of that here.
};

export default nextConfig;
