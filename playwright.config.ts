import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "*.e2e.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  use: {
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: [
    {
      command: "pnpm --dir e2e/vanilla dev --port 5180 --strictPort",
      port: 5180,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "pnpm --dir e2e/react-app dev --port 5181 --strictPort",
      port: 5181,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "pnpm --dir e2e/vue-app dev --port 5182 --strictPort",
      port: 5182,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
