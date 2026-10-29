import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // native replacement for the vite-tsconfig-paths plugin
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: true,
    // model tests spin up an in-memory MongoDB; give the download headroom
    testTimeout: 30_000,
    hookTimeout: 60_000,
    include: ["tests/**/*.test.ts"],
  },
});
