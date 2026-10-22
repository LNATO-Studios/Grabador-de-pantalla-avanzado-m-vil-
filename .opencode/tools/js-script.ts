import { tool } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import path from "node:path"

export default tool({
  description:
    "Run a JavaScript script file from the repository (or an absolute path) with optional arguments. Returns stdout, stderr and the exit code.",
  args: {
    script: tool.schema.string().describe("Path to the JavaScript script (relative to worktree or absolute)"),
    args: tool.schema
      .array(tool.schema.string())
      .optional()
      .describe("Arguments passed to the script"),
    timeout: tool.schema
      .number()
      .optional()
      .describe("Timeout in milliseconds (default 120000)"),
    cwd: tool.schema
      .string()
      .optional()
      .describe("Working directory relative to the project worktree"),
  },
  async execute(args, context) {
    const scriptPath = path.isAbsolute(args.script)
      ? args.script
      : path.resolve(context.worktree, args.script)
    const workdir = args.cwd
      ? path.resolve(context.worktree, args.cwd)
      : context.worktree
    const timeout = args.timeout ?? 120000

    const result = spawnSync("node", [scriptPath, ...(args.args ?? [])], {
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
  },
})
