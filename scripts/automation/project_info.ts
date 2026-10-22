import { execSync } from "node:child_process"
import fs from "node:fs"

function run(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim()
  } catch (e: any) {
    return `error: ${e.message}`
  }
}

console.log("repo-root:", process.cwd())
console.log("git-branch:", run("git rev-parse --abbrev-ref HEAD"))
console.log("git-status:", run("git status --short") || "(clean)")
console.log("files:", fs.readdirSync(".").filter((f: string) => {
  try { return fs.statSync(f).isFile() } catch { return false }
}).length)
