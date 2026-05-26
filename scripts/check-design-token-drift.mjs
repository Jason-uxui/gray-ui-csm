import fs from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const configPath = path.join(repoRoot, "scripts", "guardrails.config.json")
const config = JSON.parse(fs.readFileSync(configPath, "utf8"))

const sourceRoots = ["app", "components", "lib", "hooks"]
const ignoredFiles = new Set(["app/globals.css"])
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"])
const colorLiteralPattern =
  /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\((?:[^()]|\([^()]*\))*\)|oklch\((?:[^()]|\([^()]*\))*\)/g

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }

    const extension = path.extname(entry.name)
    if (sourceExtensions.has(extension)) {
      files.push(fullPath)
    }
  }

  return files
}

function getAllowedMatches(relativeFilePath) {
  return new Set(config.allowedColorLiteralMatches[relativeFilePath] ?? [])
}

const violations = []

for (const root of sourceRoots) {
  const absoluteRoot = path.join(repoRoot, root)
  if (!fs.existsSync(absoluteRoot)) continue

  for (const filePath of walk(absoluteRoot)) {
    const relativeFilePath = path.relative(repoRoot, filePath)
    if (ignoredFiles.has(relativeFilePath)) continue

    const fileContents = fs.readFileSync(filePath, "utf8")
    const matches = [...fileContents.matchAll(colorLiteralPattern)]
    if (matches.length === 0) continue

    const allowedMatches = getAllowedMatches(relativeFilePath)

    for (const match of matches) {
      const value = match[0]
      if (allowedMatches.has(value)) continue

      const beforeMatch = fileContents.slice(0, match.index)
      const line = beforeMatch.split("\n").length

      violations.push({
        file: relativeFilePath,
        line,
        value,
      })
    }
  }
}

if (violations.length > 0) {
  console.error(
    "Found new raw color literals or color functions outside the guardrail baseline:\n"
  )

  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} -> ${violation.value}`
    )
  }

  console.error(
    "\nUse semantic tokens or shared primitives instead. If an exception is intentional, update scripts/guardrails.config.json."
  )
  process.exit(1)
}

console.log("Design-token drift check passed.")
