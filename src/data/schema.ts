/**
 * 四渡赤水·全景沙盘 — Zod 运行时校验 Schema
 *
 * 基于设计文档 §3 数据模型，为所有数据结构提供 zod 校验。
 * 每个 schema 对应 types.ts 中的一个接口，
 * 确保运行时数据与 TypeScript 类型定义一致。
 *
 * 时间戳规范: 统一 ISO 8601 + +08:00 时区
 */

import { z } from 'zod'
import {
  FORCE_SIDES,
  FORCE_LEVELS,
  FORCE_STATUSES,
  EVENT_TYPES,
  EVENT_OUTCOMES,
} from './types'

// ============================================================
// 基础校验规则
// ============================================================

/** id 正则: 小写字母、数字、连字符组成，不允许空格 */
const ID_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** 时间戳正则: ISO 8601 + +08:00 结尾 */
const TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+08:00$/

/** 日期正则: YYYY-MM-DD */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/** 颜色正则: 六位 HEX (大小写均可) */
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

/** 经纬度坐标: LngLat [number, number] */
const LngLatSchema = z.tuple([z.number(), z.number()])

// ============================================================
// 部队动态层 / forces.geojson
// ============================================================

export const ForcePropertiesSchema = z.object({
  id: z.string().regex(ID_REGEX, 'id must be lowercase with hyphens only'),
  type: z.literal('force'),
  side: z.enum(FORCE_SIDES as unknown as [string, ...string[]]),
  name: z.string().min(1),
  level: z.enum(FORCE_LEVELS as unknown as [string, ...string[]]),
  parent_id: z.string().optional(),
  commander: z.string().min(1),
  strength: z.number().int().nonnegative(),
  timestamp: z.string().regex(TIMESTAMP_REGEX, 'timestamp must end with +08:00'),
  status: z.enum(FORCE_STATUSES as unknown as [string, ...string[]]),
  next_destination: z.string().optional(),
  source: z.string().min(1),
})

export const ForceFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: LngLatSchema,
  }),
  properties: ForcePropertiesSchema,
})

export const ForcesCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(ForceFeatureSchema),
})

// ============================================================
// 行军轨迹层 / trajectories.geojson
// ============================================================

export const TrajectoryPropertiesSchema = z.object({
  id: z.string().regex(ID_REGEX, 'id must be lowercase with hyphens only'),
  force_id: z.string().min(1),
  segment_start: z.string().regex(DATE_REGEX, 'must be YYYY-MM-DD'),
  segment_end: z.string().regex(DATE_REGEX, 'must be YYYY-MM-DD'),
  phase: z.string().min(1),
  color: z.string().regex(HEX_COLOR_REGEX, 'must be a valid hex color like #C0392B'),
  source: z.string().min(1),
})

export const TrajectoryFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('LineString'),
    coordinates: z.array(LngLatSchema).min(2, 'LineString needs at least 2 coordinates'),
  }),
  properties: TrajectoryPropertiesSchema,
})

export const TrajectoriesCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(TrajectoryFeatureSchema),
})

// ============================================================
// 事件层 / events.json
// ============================================================

export const EventRecordSchema = z.object({
  id: z.string().regex(ID_REGEX, 'id must be lowercase with hyphens only'),
  type: z.enum(EVENT_TYPES as unknown as [string, ...string[]]),
  title: z.string().min(1),
  timestamp: z.string().regex(TIMESTAMP_REGEX, 'timestamp must end with +08:00'),
  duration_hours: z.number().positive().optional(),
  location: LngLatSchema,
  participants: z.array(z.string()).min(1, 'at least one participant required'),
  outcome: z.enum(EVENT_OUTCOMES as unknown as [string, ...string[]]),
  casualties_red: z.number().int().nonnegative().optional(),
  casualties_blue: z.number().int().nonnegative().optional(),
  description: z.string().min(1),
  sources: z.array(z.string().min(1)).min(1, 'at least one source required'),
})

export const EventsFileSchema = z.object({
  events: z.array(EventRecordSchema),
})

// ============================================================
// 人物层 / persons.json
// ============================================================

export const PersonDecisionSchema = z.object({
  timestamp: z.string().regex(DATE_REGEX, 'must be YYYY-MM-DD'),
  event_id: z.string().min(1),
  decision: z.string().min(1),
})

export const PersonSchema = z.object({
  id: z.string().regex(ID_REGEX, 'id must be lowercase with hyphens only'),
  name: z.string().min(1),
  role: z.string().min(1),
  trajectory_ref: z.string().optional(),
  key_decisions: z.array(PersonDecisionSchema),
})

export const PersonsFileSchema = z.object({
  persons: z.array(PersonSchema),
})

// ============================================================
// 会议专题层 / meetings.json
// ============================================================

export const MeetingParticipantSchema = z.object({
  person_id: z.string().regex(ID_REGEX, 'person_id must be lowercase with hyphens only'),
  role: z.string().min(1),
})

export const MeetingSchema = z.object({
  id: z.string().regex(ID_REGEX, 'id must be lowercase with hyphens only'),
  name: z.string().min(1),
  location: LngLatSchema,
  date_start: z.string().regex(DATE_REGEX, 'must be YYYY-MM-DD'),
  date_end: z.string().regex(DATE_REGEX, 'must be YYYY-MM-DD'),
  background: z.string().min(1),
  resolutions: z.array(z.string().min(1)).min(1, 'at least one resolution required'),
  participants: z.array(MeetingParticipantSchema).min(1, 'at least one participant required'),
  related_event_ids: z.array(z.string()),
  sources: z.array(z.string().min(1)).min(1, 'at least one source required'),
}).refine(
  (data) => data.date_end >= data.date_start,
  { message: 'date_end must be >= date_start' },
)

export const MeetingsFileSchema = z.object({
  meetings: z.array(MeetingSchema),
})
