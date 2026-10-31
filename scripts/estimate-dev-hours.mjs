#!/usr/bin/env node
/**
 * Estima las horas de desarrollo por repositorio a partir del historial de
 * git y actualiza `app/data/costs.json` (development.repos[].hours).
 *
 * Heurística (estilo "git-hours"):
 *   - Se consideran solo los commits de los autores indicados (tus emails).
 *   - Los commits se agrupan por repo y se ordenan por fecha.
 *   - Entre dos commits consecutivos:
 *       · si el hueco <= MAX_GAP horas  -> se suma el hueco real.
 *       · si el hueco  > MAX_GAP horas  -> el commit "inicia una sesión" y se
 *         le asigna FIRST_COMMIT horas (tiempo de arranque antes del 1er commit).
 *   - El primer commit de todo el historial también cuenta como FIRST_COMMIT.
 *
 * Uso:
 *   node scripts/estimate-dev-hours.mjs            # muestra y escribe el JSON
 *   node scripts/estimate-dev-hours.mjs --dry-run  # solo muestra, no escribe
 *   node scripts/estimate-dev-hours.mjs --max-gap=2 --first=1
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const COSTS_PATH = resolve(REPO_ROOT, "app/data/costs.json");
const HOME = process.env.HOME || resolve(REPO_ROOT, "..");

// --- Configuración ---------------------------------------------------------

/** Tus emails de autor en git (se suman todos). */
const AUTHOR_EMAILS = ["davidmejia.05@hotmail.com", "dmg_92@hotmail.com"];

/**
 * Mapa: nombre del repo en costs.json -> ruta local del repositorio.
 * Si una ruta no existe, ese repo se omite (conserva sus horas previas).
 */
const REPO_PATHS = {
  "Backend (pos_multi_store)": resolve(HOME, "pos_multi_store"),
  "Frontend POS (pos-multi-store)": resolve(HOME, "pos-multi-store"),
  "Landing (smartventa-landing)": resolve(HOME, "smartventa-landing"),
  "Frontend Admin (pos-multi-store-admin)": resolve(HOME, "pos-multi-store-admin"),
};

// --- Parseo de flags simples ----------------------------------------------

function getFlag(name, fallback) {
  const pref = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(pref));
  if (arg) return Number(arg.slice(pref.length));
  return fallback;
}

const MAX_GAP = getFlag("max-gap", 2); // horas máximas entre commits de una sesión
const FIRST_COMMIT = getFlag("first", 1); // horas asignadas al 1er commit de una sesión
const DRY_RUN = process.argv.includes("--dry-run");

// --- Lógica -----------------------------------------------------------------

/** Timestamps (en ms) de los commits de los autores dados, orden ascendente. */
function getCommitTimestamps(repoPath) {
  const authorArgs = AUTHOR_EMAILS.flatMap((e) => ["--author", e]);
  const out = execFileSync(
    "git",
    ["-C", repoPath, "log", "--no-merges", "--all", "--regexp-ignore-case",
      ...authorArgs, "--date=unix", "--pretty=%ad"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s) * 1000)
    .sort((a, b) => a - b);
}

/** Estima horas a partir de timestamps ordenados. */
function estimateHours(timestamps) {
  if (timestamps.length === 0) return 0;
  const maxGapMs = MAX_GAP * 3600_000;
  let hours = FIRST_COMMIT; // primer commit del historial
  for (let i = 1; i < timestamps.length; i++) {
    const gap = timestamps[i] - timestamps[i - 1];
    if (gap <= maxGapMs) {
      hours += gap / 3600_000; // tiempo real trabajado en la sesión
    } else {
      hours += FIRST_COMMIT; // nueva sesión: tiempo de arranque
    }
  }
  return hours;
}

function dirExists(p) {
  try {
    execFileSync("git", ["-C", p, "rev-parse", "--is-inside-work-tree"], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const costs = JSON.parse(readFileSync(COSTS_PATH, "utf8"));
  const repos = costs.development.repos;

  console.log(
    `Estimando horas  (max-gap=${MAX_GAP}h, first=${FIRST_COMMIT}h, autores: ${AUTHOR_EMAILS.join(", ")})\n`
  );

  let total = 0;
  for (const repo of repos) {
    const path = REPO_PATHS[repo.name];
    if (!path || !dirExists(path)) {
      console.log(`  ⚠ ${repo.name}: repo no encontrado, se conserva ${repo.hours} h`);
      total += repo.hours;
      continue;
    }
    const ts = getCommitTimestamps(path);
    const hours = Number(estimateHours(ts).toFixed(1));
    console.log(
      `  ${repo.name}: ${ts.length} commits -> ${hours} h` +
        (repo.hours !== hours ? `  (antes ${repo.hours} h)` : "")
    );
    repo.hours = hours;
    total += hours;
  }

  console.log(`\n  TOTAL: ${total.toFixed(1)} h`);

  if (DRY_RUN) {
    console.log("\n(dry-run: no se escribió costs.json)");
    return;
  }
  writeFileSync(COSTS_PATH, JSON.stringify(costs, null, 2) + "\n", "utf8");
  console.log(`\n✓ Actualizado ${COSTS_PATH}`);
}

main();
