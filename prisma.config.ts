import fs from "node:fs";

import { defineConfig } from "prisma/config";

function loadEnvFile(filePath: string) {
  try {
    const file = fs.readFileSync(filePath, "utf8");

    for (const line of file.split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

      if (!match) {
        continue;
      }

      const [, key, rawValue = ""] = match;
      const value = rawValue.trim().replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Env files are optional for deployed environments.
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/happyscake",
    shadowDatabaseUrl:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/happyscake",
  },
});
