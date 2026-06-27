/**
 * 四渡赤水·全景沙盘 — AI 史料抽取脚本
 *
 * 从史料文本中抽取结构化事件、部队动态、人物决策信息。
 * 使用 Anthropic Claude API 进行智能抽取。
 *
 * 用法:
 *   npx tsx scripts/data-extract/extract.ts --input <input-file.md>
 *   npx tsx scripts/data-extract/extract.ts --input <input-file.md> --output <output.json>
 *
 * 环境变量:
 *   ANTHROPIC_API_KEY — 必需
 *   ANTHROPIC_BASE_URL  — 可选，自定义 API 端点
 *   ANTHROPIC_MODEL     — 可选，默认 claude-sonnet-4-20250514
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 读取提示词模板并替换 {INPUT} 占位符
 */
export function buildPrompt(inputText: string): string {
  const promptPath = resolve(__dirname, 'prompt.md')
  const template = readFileSync(promptPath, 'utf-8')
  return template.replace('{INPUT}', inputText)
}

/**
 * 解析命令行参数
 */
export function parseArgs(argv: string[]): { input?: string; output?: string } {
  const args: { input?: string; output?: string } = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--input' && argv[i + 1]) {
      args.input = argv[i + 1]
      i++
    } else if (argv[i] === '--output' && argv[i + 1]) {
      args.output = argv[i + 1]
      i++
    }
  }
  return args
}

/**
 * 调用 Anthropic Claude API 进行抽取
 */
export async function extractEvents(
  inputText: string,
  apiKey: string,
  options?: {
    baseUrl?: string
    model?: string
  },
): Promise<string> {
  const prompt = buildPrompt(inputText)

  // Dynamic import of Anthropic SDK
  const AnthropicModule = await import('@anthropic-ai/sdk')
  const Anthropic = AnthropicModule.default || AnthropicModule.Anthropic

  const client = new Anthropic({
    apiKey,
    baseURL: options?.baseUrl,
  })

  const response = await client.messages.create({
    model: options?.model || 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system:
      '你是一位专业的历史数据标注专家。只输出有效的 JSON，不包含任何 Markdown 标记或解释文字。',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  // Extract text content from response
  const textContent = response.content
    .filter((block): block is { type: 'text'; text: string } => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  return textContent
}

/**
 * 主入口: CLI 模式
 */
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  if (!args.input) {
    console.error('Usage: npx tsx scripts/data-extract/extract.ts --input <input-file.md> [--output <output.json>]')
    process.exit(1)
  }

  const inputPath = resolve(args.input)
  if (!existsSync(inputPath)) {
    console.error(`Error: input file not found: ${inputPath}`)
    process.exit(1)
  }

  // Load environment variables from .env if available
  try {
    const dotenv = await import('dotenv')
    dotenv.config({ path: resolve(__dirname, '.env') })
  } catch {
    // dotenv not available or .env not found — use process.env directly
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required')
    console.error('Create a .env file in scripts/data-extract/ with your API key')
    console.error('See .env.example for reference')
    process.exit(1)
  }

  const inputText = readFileSync(inputPath, 'utf-8')

  console.error(`Extracting events from: ${inputPath}`)
  console.error(`Input text length: ${inputText.length} characters`)

  try {
    const result = await extractEvents(inputText, apiKey, {
      baseUrl: process.env.ANTHROPIC_BASE_URL,
      model: process.env.ANTHROPIC_MODEL,
    })

    if (args.output) {
      const outputPath = resolve(args.output)
      writeFileSync(outputPath, result, 'utf-8')
      console.error(`Output written to: ${outputPath}`)
    } else {
      console.log(result)
    }
  } catch (error) {
    console.error('Error during extraction:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Only run main when executed directly (not imported)
if (process.argv[1] && (process.argv[1].endsWith('extract.ts') || process.argv[1].endsWith('extract.js'))) {
  main()
}
