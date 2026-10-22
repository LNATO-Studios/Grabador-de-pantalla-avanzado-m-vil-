import { tool } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import path from "node:path"

export default tool({
  description:
    "Control an Android emulator/device via ADB for app testing: devices, screenshot, tap, swipe, text, key, install, launch, wait, emulator-start. Pass subcommand and args as an array.",
  args: {
    args: tool.schema
      .array(tool.schema.string())
      .describe("Arguments for phone_simulator.py, e.g. [\"screenshot\", \"out.png\"] or [\"tap\", \"540\", \"960\"]"),
    timeout: tool.schema.number().optional().describe("Timeout in milliseconds (default 120000)"),
  },
  async execute(args, context) {
    const scriptPath = path.resolve(context.worktree, "scripts/automation/phone_simulator.py")
    const timeout = args.timeout ?? 120000
    const result = spawnSync("python3", [scriptPath, ...(args.args ?? [])], {
      cwd: context.worktree,
      timeout,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    })

    const parts: string[] = []
    if (result.stdout && result.stdout.length > 0) parts.push(result.stdout.replace(/\n$/, ""))
    if (result.stderr && result.stderr.length > 0) parts.push(`[stderr]\n${result.stderr.replace(/\n$/, "")}`)
    if (result.error) parts.push(`[error] ${result.error.message}`)
    parts.push(`[exit ${result.status === null ? "null" : result.status}]`)
    return parts.join("\n").trim()
  },
})
