import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import type pg from "pg";

export const DEFAULT_MIGRATIONS_DIR = resolve(
  fileURLToPath(new URL("../../../db/migrations/", import.meta.url)),
);

export async function listMigrationFiles(migrationsDir = DEFAULT_MIGRATIONS_DIR): Promise<string[]> {
  return (await readdir(migrationsDir))
    .filter((file) => /^\d+_.*\.sql$/.test(file))
    .sort((a, b) => a.localeCompare(b));
}

export async function applyEngramMigrations(
  pool: pg.Pool,
  options: {
    migrationsDir?: string;
    onApplied?: (file: string) => void;
  } = {},
): Promise<string[]> {
  const migrationsDir = options.migrationsDir ?? DEFAULT_MIGRATIONS_DIR;
  const files = await listMigrationFiles(migrationsDir);

  for (const file of files) {
    const sql = await readFile(resolve(migrationsDir, file), "utf8");
    await pool.query(sql);
    options.onApplied?.(file);
  }

  return files;
}
