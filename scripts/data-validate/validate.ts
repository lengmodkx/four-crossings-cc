/**
 * 四渡赤水·全景沙盘 — 数据校验脚本
 *
 * 遍历 dataDir 下的数据文件，使用 zod schema 进行运行时校验。
 * 收集所有校验错误并打印报告。
 *
 * 用法:
 *   npx tsx scripts/data-validate/validate.ts [dataDir]
 *
 * 默认 dataDir: ./public/data/
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import {
  ForcesCollectionSchema,
  EventsFileSchema,
  PersonsFileSchema,
  MeetingsFileSchema,
  TrajectoriesCollectionSchema,
} from '../../src/data/schema'

/**
 * 校验结果
 */
export interface ValidationResult {
  /** 是否全部通过 */
  valid: boolean
  /** 错误信息列表 */
  errors: string[]
}

/**
 * 所有数据文件的校验结果
 */
export interface AllValidationResults {
  forces: ValidationResult
  events: ValidationResult
  persons: ValidationResult
  meetings: ValidationResult
  trajectories: ValidationResult
}

/**
 * 读取并解析 JSON 文件
 */
function readJsonFile(filePath: string): { data: unknown; errors: string[] } {
  const errors: string[] = []

  if (!existsSync(filePath)) {
    errors.push(`File not found: ${filePath}`)
    return { data: undefined, errors }
  }

  let raw: string
  try {
    raw = readFileSync(filePath, 'utf-8')
  } catch (e) {
    errors.push(`Failed to read file ${filePath}: ${e instanceof Error ? e.message : String(e)}`)
    return { data: undefined, errors }
  }

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (e) {
    errors.push(`Invalid JSON in ${filePath}: ${e instanceof Error ? e.message : String(e)}`)
    return { data: undefined, errors }
  }

  return { data, errors: [] }
}

/**
 * 校验 forces.geojson
 */
export function validateForcesCollection(dataDir: string): ValidationResult {
  const filePath = join(dataDir, 'forces.geojson')
  const { data, errors } = readJsonFile(filePath)

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const result = ForcesCollectionSchema.safeParse(data)
  if (!result.success) {
    const zodErrors = result.error.issues.map(
      (issue) => `[forces.geojson] ${issue.path.join('.')}: ${issue.message}`,
    )
    return { valid: false, errors: zodErrors }
  }

  return { valid: true, errors: [] }
}

/**
 * 校验 events.json
 */
export function validateEventsFile(dataDir: string): ValidationResult {
  const filePath = join(dataDir, 'events.json')
  const { data, errors } = readJsonFile(filePath)

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const result = EventsFileSchema.safeParse(data)
  if (!result.success) {
    const zodErrors = result.error.issues.map(
      (issue) => `[events.json] ${issue.path.join('.')}: ${issue.message}`,
    )
    return { valid: false, errors: zodErrors }
  }

  return { valid: true, errors: [] }
}

/**
 * 校验 persons.json
 */
export function validatePersonsFile(dataDir: string): ValidationResult {
  const filePath = join(dataDir, 'persons.json')
  const { data, errors } = readJsonFile(filePath)

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const result = PersonsFileSchema.safeParse(data)
  if (!result.success) {
    const zodErrors = result.error.issues.map(
      (issue) => `[persons.json] ${issue.path.join('.')}: ${issue.message}`,
    )
    return { valid: false, errors: zodErrors }
  }

  return { valid: true, errors: [] }
}

/**
 * 校验 meetings.json
 */
export function validateMeetingsFile(dataDir: string): ValidationResult {
  const filePath = join(dataDir, 'meetings.json')
  const { data, errors } = readJsonFile(filePath)

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const result = MeetingsFileSchema.safeParse(data)
  if (!result.success) {
    const zodErrors = result.error.issues.map(
      (issue) => `[meetings.json] ${issue.path.join('.')}: ${issue.message}`,
    )
    return { valid: false, errors: zodErrors }
  }

  return { valid: true, errors: [] }
}

/**
 * 校验 trajectories.geojson
 */
export function validateTrajectoriesCollection(dataDir: string): ValidationResult {
  const filePath = join(dataDir, 'trajectories.geojson')
  const { data, errors } = readJsonFile(filePath)

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const result = TrajectoriesCollectionSchema.safeParse(data)
  if (!result.success) {
    const zodErrors = result.error.issues.map(
      (issue) => `[trajectories.geojson] ${issue.path.join('.')}: ${issue.message}`,
    )
    return { valid: false, errors: zodErrors }
  }

  return { valid: true, errors: [] }
}

/**
 * 校验所有数据文件
 */
export function validateAllData(dataDir: string): AllValidationResults {
  return {
    forces: validateForcesCollection(dataDir),
    events: validateEventsFile(dataDir),
    persons: validatePersonsFile(dataDir),
    meetings: validateMeetingsFile(dataDir),
    trajectories: validateTrajectoriesCollection(dataDir),
  }
}

/**
 * 打印校验报告
 */
export function printValidationReport(results: AllValidationResults): void {
  console.log('\n=== 数据校验报告 ===\n')

  const fileLabels: Record<string, string> = {
    forces: 'forces.geojson (部队动态)',
    events: 'events.json (战役事件)',
    persons: 'persons.json (人物决策)',
    meetings: 'meetings.json (会议专题)',
    trajectories: 'trajectories.geojson (行军轨迹)',
  }

  let allValid = true

  for (const [key, result] of Object.entries(results)) {
    const label = fileLabels[key] || key
    const status = result.valid ? 'PASS' : 'FAIL'
    console.log(`[${status}] ${label}`)
    for (const error of result.errors) {
      console.log(`  - ${error}`)
    }
    if (result.valid) {
      console.log(`  (校验通过)`)
    }
    console.log()
    if (!result.valid) allValid = false
  }

  if (allValid) {
    console.log('所有数据文件校验通过！')
  } else {
    console.log('存在校验错误，请根据上述提示修正数据文件。')
  }
}

/**
 * 主入口: CLI 模式
 */
function main(): void {
  const args = process.argv.slice(2)
  const dataDir = resolve(args[0] || './public/data')

  console.log(`校验目录: ${dataDir}`)

  const results = validateAllData(dataDir)
  printValidationReport(results)

  // Exit with error code if any validation failed
  const allValid = Object.values(results).every((r) => r.valid)
  if (!allValid) {
    process.exit(1)
  }
}

// Only run main when executed directly (not imported)
if (process.argv[1] && (process.argv[1].endsWith('validate.ts') || process.argv[1].endsWith('validate.js'))) {
  main()
}
