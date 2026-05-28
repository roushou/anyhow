import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.svelte.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    conditions: ["svelte", "browser"],
  },
});
