import { tool } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import path from "node:path"

export default tool({
  description:
    "Describe an image/screenshot in detail using a vision-capable model (fallback for non-multimodal primary models). Returns description with UI elements, text and coordinates.",
  args: {
    image: tool.schema.string().describe("Path to the image file (relative or absolute)"),
    prompt: tool.schema
      .string()
      .optional()
      .describe("Specific question or instruction about the image"),
    model: tool.schema
      .string()
      .optional()
      .describe("Vision model to use (default: opencode/nemotron-3.5-super-vl-free)"),
    timeout: tool.schema.number().optional().describe("Timeout in milliseconds (default 120000)"),
  },
  async execute(args, context) {
    const model = args.model || "opencode/nemotron-3.5-super-vl-free"
    const imgPath = path.isAbsolute(args.image)
      ? args.image
      : path.resolve(context.worktree, args.image)
    const prompt =
      args.prompt ||
      "Describe la imagen en detalle: elementos UI, texto visible, colores, layout, estados y coordenadas (x,y) normalizadas o en píxeles de cada elemento relevante. Indica puntos de tap recomendados si aplica."
    const timeout = args.timeout ?? 120000

    const result = spawnSync(
      "opencode",
      ["run", "-m", model, prompt, "-f", imgPath, "--auto", "--format", "default"],
      { cwd: context.worktree, timeout, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
    )

    const parts: string[] = []
    if (result.stdout && result.stdout.length > 0) parts.push(result.stdout.replace(/\n$/, ""))
    if (result.stderr && result.stderr.length > 0) parts.push(`[stderr]\n${result.stderr.replace(/\n$/, "")}`)
    if (result.error) parts.push(`[error] ${result.error.message}`)
    parts.push(`[exit ${result.status === null ? "null" : result.status}]`)
    return parts.join("\n").trim()
  },
})
