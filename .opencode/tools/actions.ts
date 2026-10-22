import { tool } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import path from "node:path"

function run(cmd: string, args: string[], cwd: string, timeout = 120000) {
  const result = spawnSync(cmd, args, { cwd, timeout, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 })
  const parts: string[] = []
  if (result.stdout && result.stdout.length > 0) parts.push(result.stdout.replace(/\n$/, ""))
  if (result.stderr && result.stderr.length > 0) parts.push(`[stderr]\n${result.stderr.replace(/\n$/, "")}`)
  if (result.error) parts.push(`[error] ${result.error.message}`)
  parts.push(`[exit ${result.status === null ? "null" : result.status}]`)
  return parts.join("\n").trim()
}

export default tool({
  description:
    "Interact with GitHub Actions for this repository: list workflows, list/view runs, trigger a workflow, list jobs, or validate workflow YAML files. Uses the gh CLI (authenticated).",
  args: {
    action: tool.schema
      .string()
      .describe("Action to perform: list-workflows | list-runs | view-run | trigger | list-jobs | validate"),
    workflow: tool.schema.string().optional().describe("Workflow file name or name (for list-runs/trigger/list-jobs)"),
    runId: tool.schema.string().optional().describe("Run ID (for view-run/list-jobs)"),
    branch: tool.schema.string().optional().describe("Branch for trigger (default: current)"),
    inputs: tool.schema
      .array(tool.schema.string())
      .optional()
      .describe("Workflow inputs as key=value (for trigger)"),
    limit: tool.schema.number().optional().describe("Limit number of results (default 20)"),
    timeout: tool.schema.number().optional().describe("Timeout in milliseconds (default 120000)"),
  },
  async execute(args, context) {
    const cwd = context.worktree
    const timeout = args.timeout ?? 120000
    const limit = args.limit ?? 20
    const action = args.action

    if (action === "list-workflows") {
      return run("gh", ["workflow", "list"], cwd, timeout)
    }
    if (action === "list-runs") {
      const ghArgs = ["run", "list", "--limit", String(limit)]
      if (args.workflow) ghArgs.push("--workflow", args.workflow)
      if (args.branch) ghArgs.push("--branch", args.branch)
      return run("gh", ghArgs, cwd, timeout)
    }
    if (action === "view-run") {
      if (!args.runId) return "runId is required for view-run"
      return run("gh", ["run", "view", args.runId], cwd, timeout)
    }
    if (action === "list-jobs") {
      if (!args.runId) return "runId is required for list-jobs"
      return run("gh", ["run", "view", args.runId, "--job"], cwd, timeout)
    }
    if (action === "trigger") {
      if (!args.workflow) return "workflow is required for trigger"
      const ghArgs = ["workflow", "run", args.workflow]
      if (args.branch) ghArgs.push("--ref", args.branch)
      for (const kv of args.inputs ?? []) {
        ghArgs.push("-f", kv)
      }
      return run("gh", ghArgs, cwd, timeout)
    }
    if (action === "validate") {
      const scriptPath = path.resolve(cwd, "scripts/automation/validate_workflows.py")
      return run("python3", [scriptPath], cwd, timeout)
    }
    return `Unknown action '${action}'. Available: list-workflows, list-runs, view-run, trigger, list-jobs, validate`
  },
})
