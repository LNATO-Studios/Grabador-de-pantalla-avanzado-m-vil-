import { tool } from "@opencode-ai/plugin"
import path from "path"

export default tool({
  description: "Add two numbers using Python",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args, context) {
    const script = path.join(context.worktree, ".opencode/tools/add.py")
    const { spawnSync } = await import("node:child_process")
    const result = spawnSync("python3", [script, String(args.a), String(args.b)], {
      cwd: context.worktree,
      encoding: "utf8",
      timeout: 30000,
    })
    if (result.error) return `error: ${result.error.message}`
    if (result.status !== 0) return `exit ${result.status}: ${result.stderr}`
    return result.stdout.trim()
  },
})
