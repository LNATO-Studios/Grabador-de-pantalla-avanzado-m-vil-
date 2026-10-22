import { tool } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"

export default tool({
  description:
    "Execute TypeScript code in the project environment with Node.js (experimental type stripping). Writes the code to a temporary .ts file, runs it with node --experimental-strip-types, and returns stdout, stderr and the exit code.",
  args: {
    code: tool.schema.string().describe("TypeScript source code to execute"),
    timeout: tool.schema
      .number()
      .optional()
      .describe("Timeout in milliseconds (default 60000)"),
    cwd: tool.schema
      .string()
      .optional()
      .describe("Working directory relative to the project worktree (default: worktree root)"),
  },
  async execute(args, context) {
    const workdir = args.cwd
      ? path.resolve(context.worktree, args.cwd)
      : context.worktree
    const timeout = args.timeout ?? 60000

    const tempDir = mkdtempSync(path.join(os.tmpdir(), "oc-ts-"))
    const scriptPath = path.join(tempDir, "script.ts")
    writeFileSync(scriptPath, args.code, "utf8")

    try {
      const result = spawnSync("node", ["--experimental-strip-types", scriptPath], {
        cwd: workdir,
        timeout,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      })

      const parts: string[] = []
      if (result.stdout && result.stdout.length > 0) {
        parts.push(result.stdout.replace(/\n$/, ""))
      }
      if (result.stderr && result.stderr.length > 0) {
        parts.push(`[stderr]\n${result.stderr.replace(/\n$/, "")}`)
      }
      if (result.error) {
        parts.push(`[error] ${result.error.message}`)
      }
      parts.push(`[exit ${result.status === null ? "null" : result.status}]`)
      return parts.join("\n").trim()
    } finally {
      try {
        rmSync(tempDir, { recursive: true, force: true })
      } catch {
        // ignore cleanup errors
      }
    }
  },
})
