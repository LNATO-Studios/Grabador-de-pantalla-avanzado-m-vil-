import { tool } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import path from "node:path"

const TASKS: Record<string, string> = {
  "env-check": "scripts/automation/env_check.py",
  "project-info": "scripts/automation/project_info.py",
  "env-check-js": "scripts/automation/env_check.js",
  "project-info-js": "scripts/automation/project_info.js",
  "env-check-ts": "scripts/automation/env_check.ts",
  "project-info-ts": "scripts/automation/project_info.ts",
  "validate-workflows": "scripts/automation/validate_workflows.py",
}

function interpreterFor(scriptPath: string): { cmd: string; prefix: string[] } {
  const ext = path.extname(scriptPath).toLowerCase()
  if (ext === ".py") return { cmd: "python3", prefix: [] }
  if (ext === ".js" || ext === ".mjs" || ext === ".cjs") return { cmd: "node", prefix: [] }
  if (ext === ".ts" || ext === ".mts" || ext === ".cts") return { cmd: "node", prefix: ["--experimental-strip-types"] }
  return { cmd: "node", prefix: [] }
}

export default tool({
  description:
    "Run a predefined repository automation task. Available tasks: env-check, project-info, env-check-js, project-info-js, env-check-ts, project-info-ts, validate-workflows. Returns stdout, stderr and the exit code.",
  args: {
    task: tool.schema.string().describe("Automation task name"),
    args: tool.schema
      .array(tool.schema.string())
      .optional()
      .describe("Extra arguments for the task"),
    timeout: tool.schema
      .number()
      .optional()
      .describe("Timeout in milliseconds (default 120000)"),
  },
  async execute(args, context) {
    const scriptRel = TASKS[args.task]
    if (!scriptRel) {
      return `Unknown task '${args.task}'. Available: ${Object.keys(TASKS).join(", ")}`
    }
    const scriptPath = path.resolve(context.worktree, scriptRel)
    const { cmd, prefix } = interpreterFor(scriptPath)
    const timeout = args.timeout ?? 120000
    const result = spawnSync(cmd, [...prefix, scriptPath, ...(args.args ?? [])], {
      cwd: context.worktree,
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
