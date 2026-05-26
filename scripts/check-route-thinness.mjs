import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const configPath = path.join(repoRoot, "scripts", "guardrails.config.json")
const config = JSON.parse(fs.readFileSync(configPath, "utf8"))

const appRoot = path.join(repoRoot, "app")
const maxNonEmptyLines = config.routeThinness.maxNonEmptyLines
const violations = []

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }

    if (entry.name === "page.tsx") {
      files.push(fullPath)
    }
  }

  return files
}

if (!fs.existsSync(appRoot)) {
  console.log("Route thinness check skipped because app/ was not found.")
  process.exit(0)
}

for (const filePath of walk(appRoot)) {
  const relativeFilePath = path.relative(repoRoot, filePath)
  const fileContents = fs.readFileSync(filePath, "utf8")
  const nonEmptyLines = fileContents
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0).length

  if (
    fileContents.includes('"use client"') ||
    fileContents.includes("'use client'")
  ) {
    violations.push({
      file: relativeFilePath,
      reason:
        "Route files should stay thin server wrappers and must not declare use client.",
    })
  }

  if (nonEmptyLines > maxNonEmptyLines) {
    violations.push({
      file: relativeFilePath,
      reason: `Route file has ${nonEmptyLines} non-empty lines, above the limit of ${maxNonEmptyLines}.`,
    })
  }
}

if (violations.length > 0) {
  console.error("Route thinness check failed:\n")

  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.reason}`)
  }

  process.exit(1)
}

console.log("Route thinness check passed.")
