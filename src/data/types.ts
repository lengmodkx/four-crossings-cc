/**
 * 四渡赤水·全景沙盘 — 数据模型类型定义
 *
 * 基于设计文档 §3 数据模型，定义所有数据结构类型。
 * 数据主格式为 GeoJSON FeatureCollection，辅以 events.json、persons.json、meetings.json。
 *
 * 时间戳规范: 统一 ISO 8601 + +08:00 时区
 */

// ============================================================
// 基础类型
// ============================================================

/** 经纬度坐标 [经度, 纬度] */
export type LngLat = [number, number]

/** 部队隶属: 红军 / 敌军 */
export type ForceSide = 'red' | 'blue'

/** 部队编制级别 */
export type ForceLevel = 'army' | 'division' | 'regiment'

/** 部队状态 */
export type ForceStatus = 'marching' | 'engaged' | 'resting' | 'crossing'

// ============================================================
// 部队动态层 / forces.geojson
// ============================================================

/** 部队属性 (每个 Feature 的 properties) */
export interface ForceProperties {
  /** 唯一标识，如 red-1st-army-1st-div-1935-01-22 */
  id: string
  /** GeoJSON feature 类型标记 */
  type: 'force'
  /** 红/蓝 */
  side: ForceSide
  /** 部队名称 */
  name: string
  /** 编制级别 */
  level: ForceLevel
  /** 隶属上级 id，可选 */
  parent_id?: string
  /** 指挥员 */
  commander: string
  /** 兵力 */
  strength: number
  /** 时间戳 ISO 8601 +08:00 */
  timestamp: string
  /** 状态 */
  status: ForceStatus
  /** 下一步目的地，可选 */
  next_destination?: string
  /** 史料来源 */
  source: string
}

/** 单个部队点位 Feature */
export interface ForceFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: LngLat
  }
  properties: ForceProperties
}

/** 部队动态 GeoJSON 集合 */
export interface ForcesCollection {
  type: 'FeatureCollection'
  features: ForceFeature[]
}

// ============================================================
// 行军轨迹层 / trajectories.geojson
// ============================================================

/** 行军轨迹属性 */
export interface TrajectoryProperties {
  /** 唯一标识 */
  id: string
  /** 关联部队 id */
  force_id: string
  /** 段起始日期 */
  segment_start: string
  /** 段结束日期 */
  segment_end: string
  /** 所属战役阶段 */
  phase: string
  /** 渲染颜色 */
  color: string
  /** 史料来源 */
  source: string
}

/** 单条行军轨迹 LineString Feature */
export interface TrajectoryFeature {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: LngLat[]
  }
  properties: TrajectoryProperties
}

/** 行军轨迹 GeoJSON 集合 */
export interface TrajectoriesCollection {
  type: 'FeatureCollection'
  features: TrajectoryFeature[]
}

// ============================================================
// 事件层 / events.json
// ============================================================

/** 事件类型 */
export type EventType = 'battle' | 'meeting' | 'crossing' | 'maneuver'

/** 事件结果 */
export type EventOutcome =
  | 'red-advance'
  | 'red-retreat'
  | 'blue-advance'
  | 'blue-retreat'
  | 'stalemate'

/** 单条事件记录 */
export interface EventRecord {
  /** 唯一标识 */
  id: string
  /** 事件类型 */
  type: EventType
  /** 事件标题 */
  title: string
  /** 事件发生时间 */
  timestamp: string
  /** 持续小时数，可选 */
  duration_hours?: number
  /** 事件位置 */
  location: LngLat
  /** 参与部队 id 列表 */
  participants: string[]
  /** 事件结果 */
  outcome: EventOutcome
  /** 红军伤亡，可选 */
  casualties_red?: number
  /** 敌军伤亡，可选 */
  casualties_blue?: number
  /** 事件描述 */
  description: string
  /** 史料来源列表 */
  sources: string[]
}

/** 事件文件结构 */
export interface EventsFile {
  events: EventRecord[]
}

// ============================================================
// 人物层 / persons.json
// ============================================================

/** 人物关键决策记录 */
export interface PersonDecision {
  /** 决策时间 */
  timestamp: string
  /** 关联事件 id */
  event_id: string
  /** 决策内容 */
  decision: string
}

/** 人物记录 */
export interface Person {
  /** 唯一标识 */
  id: string
  /** 姓名 */
  name: string
  /** 职务 */
  role: string
  /** 轨迹引用 */
  trajectory_ref?: string
  /** 关键决策列表 */
  key_decisions: PersonDecision[]
}

/** 人物文件结构 */
export interface PersonsFile {
  persons: Person[]
}

// ============================================================
// 会议专题层 / meetings.json
// ============================================================

/** 会议参与人 */
export interface MeetingParticipant {
  /** 关联人物 id */
  person_id: string
  /** 在会议中的角色 */
  role: string
}

/** 会议记录 */
export interface Meeting {
  /** 唯一标识 */
  id: string
  /** 会议名称 */
  name: string
  /** 会议地点坐标 */
  location: LngLat
  /** 开始日期 */
  date_start: string
  /** 结束日期 */
  date_end: string
  /** 会议背景 */
  background: string
  /** 会议决议列表 */
  resolutions: string[]
  /** 参会人员 */
  participants: MeetingParticipant[]
  /** 关联事件 id 列表 */
  related_event_ids: string[]
  /** 史料来源 */
  sources: string[]
}

/** 会议文件结构 */
export interface MeetingsFile {
  meetings: Meeting[]
}

// ============================================================
// 运行时常量 (用于 zod schema 枚举校验等)
// ============================================================

/** 数据模型版本 */
export const DATA_MODEL_VERSION = '0.1.0'

/** ForceSide 有效值 */
export const FORCE_SIDES: readonly ForceSide[] = ['red', 'blue']

/** ForceLevel 有效值 */
export const FORCE_LEVELS: readonly ForceLevel[] = ['army', 'division', 'regiment']

/** ForceStatus 有效值 */
export const FORCE_STATUSES: readonly ForceStatus[] = [
  'marching',
  'engaged',
  'resting',
  'crossing',
]

/** EventType 有效值 */
export const EVENT_TYPES: readonly EventType[] = [
  'battle',
  'meeting',
  'crossing',
  'maneuver',
]

/** EventOutcome 有效值 */
export const EVENT_OUTCOMES: readonly EventOutcome[] = [
  'red-advance',
  'red-retreat',
  'blue-advance',
  'blue-retreat',
  'stalemate',
]

/** 会议参与人类型 */
export const MEETING_PARTICIPANT_TYPES = [
  '政治局常委',
  '政治局委员',
  '候补委员',
  '军团长',
  '政委',
  '参谋长',
  '其他',
] as const
