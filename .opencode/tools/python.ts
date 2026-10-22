import { tool } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"

export default tool({
  description:
    "Execute Python code in the project environment. Writes the code to a temporary file, runs it with python3, and returns stdout, stderr and the exit code. Use for automation, data processing, builds and repository tasks.",
  args: {
    code: tool.schema.string().describe("Python source code to execute"),
    timeout: tool.schema
      .number()
      .optional()
      .describe("Timeout in milliseconds (default 60000)"),
    cwd: tool.schema
      .string()
      .optional()
      .describe("Working directory relative to the project worktree (default: worktree root)"),
    python: tool.schema
      .string()
      .optional()
      .describe("Python executable to use (default: python3)"),
  },
  async execute(args, context) {
    const python = args.python || "python3"
    const workdir = args.cwd
      ? path.resolve(context.worktree, args.cwd)
      : context.worktree
    const timeout = args.timeout ?? 60000

    const tempDir = mkdtempSync(path.join(os.tmpdir(), "oc-python-"))
    const scriptPath = path.join(tempDir, "script.py")
    writeFileSync(scriptPath, args.code, "utf8")

    try {
      const result = spawnSync(python, [scriptPath], {
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
