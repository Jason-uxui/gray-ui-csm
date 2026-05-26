import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const hooksDir = path.join(repoRoot, ".githooks")
const hookFiles = ["pre-commit", "pre-push"]

if (!fs.existsSync(hooksDir)) {
  console.error("Missing .githooks directory.")
  process.exit(1)
}

for (const hookFile of hookFiles) {
  const hookPath = path.join(hooksDir, hookFile)
  if (!fs.existsSync(hookPath)) {
    console.error(`Missing hook file: ${hookFile}`)
    process.exit(1)
  }

  fs.chmodSync(hookPath, 0o755)
}

execFileSync("git", ["config", "--local", "core.hooksPath", ".githooks"], {
  cwd: repoRoot,
  stdio: "inherit",
})

console.log("Git hooks installed from .githooks")
