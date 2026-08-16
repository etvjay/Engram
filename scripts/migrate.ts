import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createCockroachPool } from "../packages/cockroach/src/client.js";

async function main() {
  const pool = createCockroachPool();
  const migrationsDir = resolve(fileURLToPath(new URL("../db/migrations/", import.meta.url)));

  try {
    const files = (await readdir(migrationsDir))
      .filter((file) => /^\d+_.*\.sql$/.test(file))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const sql = await readFile(resolve(migrationsDir, file), "utf8");
      await pool.query(sql);
      console.log(`Applied db/migrations/${file}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
