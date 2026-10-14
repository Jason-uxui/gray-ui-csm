import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import ts from "typescript"

// Exercise the production persistence code on Node 20 without a browser.
// Tests supply their own snapshots; the demo-data import is unused there.
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "gray-knowledge-tests-")
)
let status = 1
try {
  const source = fs.readFileSync("lib/knowledge-base/storage.ts", "utf8")
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    },
  })
  fs.writeFileSync(
    path.join(directory, "storage.mjs"),
    result.outputText.replace(
      "@/lib/knowledge-base/mock-data",
      "./fixtures.mjs"
    )
  )
  fs.writeFileSync(
    path.join(directory, "fixtures.mjs"),
    "export const knowledgeArticles = []; export const knowledgeArticleExplorerGroups = [];"
  )
  const tests = fs
    .readFileSync("tests/knowledge-storage.test.mjs", "utf8")
    .replace("../lib/knowledge-base/storage.ts", "./storage.mjs")
  const target = path.join(directory, "knowledge-storage.test.mjs")
  fs.writeFileSync(target, tests)
  status =
    spawnSync(process.execPath, ["--test", target], { stdio: "inherit" })
      .status ?? 1
} finally {
  fs.rmSync(directory, { recursive: true, force: true })
}
process.exitCode = status
