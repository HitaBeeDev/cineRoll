#!/usr/bin/env node
// Fails the build/push when a file the build READS is missing from the deploy.
//
// Vercel deploys from git, so a build input that is gitignored (or otherwise not
// committed) simply does not exist in production. That is invisible locally —
// the file is sitting right there on your disk — and only shows up as a running
// service that crashes on every request.
//
// This happened: `backend/prisma/` was gitignored, so the schema and all 15
// migrations never reached Vercel. `prisma generate` had no schema, so
// @prisma/client threw on import in backend/src/lib/prisma.ts and the backend
// function died at boot — every route 500'd with FUNCTION_INVOCATION_FAILED,
// including /health. Browse sat on "Loading films" forever.
//
// Two checks, because the two environments can each catch what the other cannot:
//
//   on disk   — always. This is the check that matters on Vercel (no .git there),
//               and it catches EVERY cause of a missing file: .gitignore,
//               .vercelignore, a bad bundle, a botched merge.
//   in git    — only where a repo exists. Catches the mistake locally, at commit
//               time, before a broken deploy is ever created.

import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Files the build reads. Adding a path here makes it impossible to quietly drop.
const BUILD_INPUTS = [
  // `prisma generate` runs from these at install time. Without them there is no
  // Prisma client and the backend cannot boot at all.
  "backend/prisma/schema.prisma",
  "backend/prisma/migrations/migration_lock.toml",
  "backend/prisma.config.ts",
  // The frontend generates its own client from its own copy of the schema.
  "frontend/prisma/schema.prisma",
];

function git(args) {
  return execFileSync("git", args, { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] })
    .toString()
    .trim();
}

let hasGit = false;
try {
  hasGit = git(["rev-parse", "--is-inside-work-tree"]) === "true";
} catch {
  // No git (Vercel build, tarball export) — the on-disk check still applies.
}

const problems = [];

for (const path of BUILD_INPUTS) {
  if (!existsSync(resolve(repoRoot, path))) {
    problems.push(`${path} — MISSING ON DISK. The build reads this file and it is not here.`);
    continue;
  }

  if (!hasGit) continue;

  // Present locally, but would it survive a deploy? Untracked or ignored means no.
  try {
    git(["ls-files", "--error-unmatch", path]);
  } catch {
    let why = "not committed";
    try {
      const rule = git(["check-ignore", "-v", path]);
      if (rule) why = `ignored by ${rule.split("\t")[0]}`;
    } catch {
      // Untracked but not ignored — simply never added.
    }
    problems.push(`${path} — ${why}. It exists on your disk but NOT in the deploy.`);
  }
}

// Packages whose BINARY must run during install/build. Vercel does not install
// devDependencies here — the build log says `husky: command not found` — so a
// build-critical CLI parked in devDependencies is simply absent in production.
// `prisma` in devDependencies is what kept the backend down even after the
// schema was committed: no CLI, so no `prisma generate`, so no client, so
// @prisma/client threw on import and the function died at boot.
const RUNTIME_REQUIRED = [
  { workspace: "backend", pkg: "prisma", why: "postinstall runs `prisma generate`" },
  { workspace: "frontend", pkg: "prisma", why: "postinstall runs `prisma generate`" },
];

for (const { workspace, pkg, why } of RUNTIME_REQUIRED) {
  const manifestPath = resolve(repoRoot, workspace, "package.json");
  if (!existsSync(manifestPath)) continue;

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.dependencies?.[pkg]) continue;

  problems.push(
    manifest.devDependencies?.[pkg]
      ? `${workspace}/package.json — "${pkg}" is a devDependency but ${why}. ` +
        `Vercel prunes devDependencies, so it will not exist there. Move it to "dependencies".`
      : `${workspace}/package.json — "${pkg}" is missing entirely, but ${why}.`,
  );
}

// Vercel bundles the backend function from the HOISTED root node_modules. Anything
// npm was forced to nest under backend/node_modules — which happens when the
// backend pins a different major than the frontend, so the two cannot share one
// hoisted copy — is dropped from that bundle and is simply absent at runtime.
//
// This is what took the site down twice. `jose` was pinned to ^5 in the backend
// while next-auth pulled ^6 to the root, so npm nested jose@5 under
// backend/node_modules. Production then threw "Cannot find module 'jose'" from
// middleware/auth.js on every single request.
//
// Only meaningful where node_modules is installed, so skip it on Vercel.
const nestedDir = resolve(repoRoot, "backend/node_modules");

if (existsSync(nestedDir) && existsSync(resolve(repoRoot, "node_modules"))) {
  const backendManifest = JSON.parse(
    readFileSync(resolve(repoRoot, "backend/package.json"), "utf8"),
  );

  for (const dep of Object.keys(backendManifest.dependencies ?? {})) {
    // Workspace links (@cineroll/*) are symlinked, not duplicated — not a risk.
    if (dep.startsWith("@cineroll/")) continue;
    if (!existsSync(resolve(nestedDir, dep, "package.json"))) continue;

    const nestedVersion = JSON.parse(
      readFileSync(resolve(nestedDir, dep, "package.json"), "utf8"),
    ).version;
    const rootPath = resolve(repoRoot, "node_modules", dep, "package.json");
    const rootVersion = existsSync(rootPath)
      ? JSON.parse(readFileSync(rootPath, "utf8")).version
      : "absent";

    problems.push(
      `backend/node_modules/${dep} — nested (v${nestedVersion}) because the root has v${rootVersion}. ` +
        `Vercel bundles only the hoisted copy, so this one is MISSING at runtime. ` +
        `Align the version range in backend/package.json with the rest of the repo so npm can hoist it.`,
    );
  }
}

if (problems.length > 0) {
  console.error("\n  Build inputs will be missing in production:\n");
  for (const problem of problems) console.error(`    ${problem}`);
  console.error(
    "\n  Everything above exists locally but not on Vercel, so local stays green\n" +
      "  while production crashes on every request.\n" +
      "\n  Fix: drop the ignore rule and `git add` the file, or move the package\n" +
      "  into \"dependencies\". Never ignore a build input and never leave a\n" +
      "  build-critical CLI in devDependencies.\n",
  );
  process.exit(1);
}

console.log(`Build inputs OK (${BUILD_INPUTS.length} checked${hasGit ? ", all tracked in git" : ", on-disk only"}).`);
