import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

// Route handlers run in Node against the stores' in-memory fallbacks, so the
// tests need no Supabase, AWS or Anthropic account.
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${src}/` },
      { find: "server-only", replacement: fileURLToPath(new URL("./tests/server-only.ts", import.meta.url)) },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      ACADEMY_PLANS: "on",
      ANTHROPIC_API_KEY: "test-key",
      ACADEMY_COACH_DAILY_LIMIT: "20",
      ACADEMY_ADMIN_EMAILS: "admin@example.com",
      NEXT_PUBLIC_SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
  },
});
