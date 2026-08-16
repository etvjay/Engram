import { readFile } from "node:fs/promises";
import { createCockroachPool } from "../packages/cockroach/src/client.js";

async function main() {
  const pool = createCockroachPool();
  try {
    const migration = await readFile(new URL("../db/migrations/001_initial.sql", import.meta.url), "utf8");
    await pool.query(migration);
    console.log("Applied db/migrations/001_initial.sql");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
