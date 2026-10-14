import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import ts from "typescript"

// Run the production TypeScript model tests on the repo's Node 20 CI too.
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "gray-remote-tests-"))
let status = 1
try {
  for (const name of [
    "state",
    "storage",
    "sample-customer",
    "recipient-suggestions",
    "presentation",
  ]) {
    const source = fs.readFileSync(
      `lib/tickets/remote-assist/${name}.ts`,
      "utf8"
    )
    const result = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
      },
    })
    fs.writeFileSync(path.join(directory, `${name}.mjs`), result.outputText)
  }
  const tests = fs
    .readFileSync("tests/remote-assist.test.mjs", "utf8")
    .replaceAll("../lib/tickets/remote-assist/state.ts", "./state.mjs")
    .replaceAll("../lib/tickets/remote-assist/storage.ts", "./storage.mjs")
    .replaceAll(
      "../lib/tickets/remote-assist/sample-customer.ts",
      "./sample-customer.mjs"
    )
    .replaceAll(
      "../lib/tickets/remote-assist/recipient-suggestions.ts",
      "./recipient-suggestions.mjs"
    )
    .replaceAll(
      "../lib/tickets/remote-assist/presentation.ts",
      "./presentation.mjs"
    )
  const target = path.join(directory, "remote-assist.test.mjs")
  fs.writeFileSync(target, tests)
  status =
    spawnSync(process.execPath, ["--test", target], { stdio: "inherit" })
      .status ?? 1
} finally {
  fs.rmSync(directory, { recursive: true, force: true })
}
process.exitCode = status
