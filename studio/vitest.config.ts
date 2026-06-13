import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  oxc: {
    jsx: "react-jsx",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    exclude: ["e2e", "node_modules", ".kilo/node_modules"],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
      include: ['src/lib/**', 'src/services/**', 'src/hooks/**'],
      exclude: ['src/__tests__/**', 'src/**/*.test.*', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
