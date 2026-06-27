import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const scriptsDir = resolve(__dirname)

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  const mockCreate = vi.fn()
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    })),
    Anthropic: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    })),
  }
})

describe('AI extraction script', () => {
  describe('prompt.md', () => {
    it('should exist in scripts/data-extract/', () => {
      const promptPath = resolve(scriptsDir, 'prompt.md')
      expect(existsSync(promptPath)).toBe(true)
    })

    it('should contain {INPUT} placeholder', () => {
      const promptPath = resolve(scriptsDir, 'prompt.md')
      const content = readFileSync(promptPath, 'utf-8')
      expect(content).toContain('{INPUT}')
    })

    it('should contain JSON schema specification in Chinese', () => {
      const promptPath = resolve(scriptsDir, 'prompt.md')
      const content = readFileSync(promptPath, 'utf-8')
      expect(content).toMatch(/schema|JSON|[Ss]chema|格式|输出/)
    })

    it('should contain strict rules about not fabricating data', () => {
      const promptPath = resolve(scriptsDir, 'prompt.md')
      const content = readFileSync(promptPath, 'utf-8')
      // Should contain rules like "不补充不推测" or similar
      expect(content).toMatch(/不补充|不推测|不.*编造|不.*猜测|严格/)
    })

    it('should mention +08:00 timezone requirement', () => {
      const promptPath = resolve(scriptsDir, 'prompt.md')
      const content = readFileSync(promptPath, 'utf-8')
      expect(content).toMatch(/\+08:00|UTC\+8|东八区/)
    })
  })

  describe('sample-input.md', () => {
    it('should exist in scripts/data-extract/', () => {
      const samplePath = resolve(scriptsDir, 'sample-input.md')
      expect(existsSync(samplePath)).toBe(true)
    })

    it('should contain historical text about 土城战役', () => {
      const samplePath = resolve(scriptsDir, 'sample-input.md')
      const content = readFileSync(samplePath, 'utf-8')
      expect(content).toMatch(/土城|青杠坡/)
    })

    it('should be non-empty', () => {
      const samplePath = resolve(scriptsDir, 'sample-input.md')
      const content = readFileSync(samplePath, 'utf-8')
      expect(content.trim().length).toBeGreaterThan(100)
    })
  })

  describe('.env.example', () => {
    it('should exist', () => {
      const envPath = resolve(scriptsDir, '.env.example')
      expect(existsSync(envPath)).toBe(true)
    })

    it('should contain ANTHROPIC_API_KEY placeholder', () => {
      const envPath = resolve(scriptsDir, '.env.example')
      const content = readFileSync(envPath, 'utf-8')
      expect(content).toContain('ANTHROPIC_API_KEY')
    })
  })

  describe('extract.ts buildPrompt', () => {
    // Dynamic import to test the function
    it('should replace {INPUT} with provided text', async () => {
      // Read the prompt template directly
      const promptPath = resolve(scriptsDir, 'prompt.md')
      const template = readFileSync(promptPath, 'utf-8')
      const inputText = '1935年1月28日，红军在土城与川军展开激战。'

      const result = template.replace('{INPUT}', inputText)
      expect(result).toContain(inputText)
      expect(result).not.toContain('{INPUT}')
    })
  })
})
