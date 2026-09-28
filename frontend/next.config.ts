import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.75.1"],
  // Coach and the MCP server search the lesson files at runtime, and the
  // answer check reads the challenge files.
  outputFileTracingIncludes: {
    "/api/academy/mcp": ["./src/content/academy/**/*.md"],
    "/academy/api/coach": ["./src/content/academy/**/*.md"],
    "/academy/api/mission-answer": ["./src/content/academy/**/*.md"],
  },
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
