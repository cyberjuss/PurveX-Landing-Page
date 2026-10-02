import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.75.1"],
  // Coach and the MCP server search the lesson files at runtime, and the
  // answer check reads the challenge files.
  outputFileTracingIncludes: {
    "/api/academy/mcp": ["./src/content/academy/**/*.md", "./src/content/scenarios/**/*"],
    "/academy/api/coach": ["./src/content/academy/**/*.md"],
    "/academy/api/mission-answer": ["./src/content/academy/**/*.md"],
    "/academy/api/siem": ["./src/content/scenarios/**/*"],
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
  },
  // Serve the course under /range too, so links we hand out say range, not
  // academy. Real routes (e.g. /range/join) win over this; everything else
  // falls through to the same /academy page.
  async rewrites() {
    return [{ source: "/range/:path*", destination: "/academy/:path*" }];
  }
  // Security headers (CSP with nonces, HSTS, COOP, CORP, X-Frame-Options,
  // etc.) are already applied site-wide in src/proxy.ts -- no need to
  // duplicate any of that here.
};

export default nextConfig;
