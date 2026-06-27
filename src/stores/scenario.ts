/**
 * ScenarioStore — 数据加载与管理
 *
 * 管理四渡赤水战役的全部数据层:
 * - forces: 部队动态 (GeoJSON FeatureCollection)
 * - trajectories: 行军轨迹 (GeoJSON FeatureCollection)
 * - events: 事件记录
 * - persons: 人物
 * - meetings: 会议专题
 *
 * 所有数据从 public/data/ 目录加载。
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  ForceFeature,
  TrajectoryFeature,
  EventRecord,
  Person,
  Meeting,
  ForcesCollection,
  TrajectoriesCollection,
  EventsFile,
  PersonsFile,
  MeetingsFile,
} from '@/data/types'

const BASE = '/data'

export const useScenarioStore = defineStore('scenario', () => {
  // ===== 状态 =====
  const forces = ref<ForceFeature[]>([])
  const trajectories = ref<TrajectoryFeature[]>([])
  const events = ref<EventRecord[]>([])
  const persons = ref<Person[]>([])
  const meetings = ref<Meeting[]>([])
  const loaded = ref(false)

  // ===== 计算属性 =====

  /** 部队数量 */
  const forceCount = computed(() => forces.value.length)

  /** 事件数量 */
  const eventCount = computed(() => events.value.length)

  // ===== 方法 =====

  async function loadForces(): Promise<ForceFeature[]> {
    const res = await fetch(`${BASE}/forces.geojson`)
    const data: ForcesCollection = await res.json()
    forces.value = data.features
    return data.features
  }

  async function loadTrajectories(): Promise<TrajectoryFeature[]> {
    const res = await fetch(`${BASE}/trajectories.geojson`)
    const data: TrajectoriesCollection = await res.json()
    trajectories.value = data.features
    return data.features
  }

  async function loadEvents(): Promise<EventRecord[]> {
    const res = await fetch(`${BASE}/events.json`)
    const data: EventsFile = await res.json()
    events.value = data.events
    return data.events
  }

  async function loadPersons(): Promise<Person[]> {
    const res = await fetch(`${BASE}/persons.json`)
    const data: PersonsFile = await res.json()
    persons.value = data.persons
    return data.persons
  }

  async function loadMeetings(): Promise<Meeting[]> {
    const res = await fetch(`${BASE}/meetings.json`)
    const data: MeetingsFile = await res.json()
    meetings.value = data.meetings
    return data.meetings
  }

  /**
   * 并行加载所有数据文件
   */
  async function loadAll(): Promise<void> {
    if (loaded.value) return

    const results = await Promise.allSettled([
      loadForces(),
      loadTrajectories(),
      loadEvents(),
      loadPersons(),
      loadMeetings(),
    ])

    // 检查是否有任何加载失败
    const failures = results.filter((r) => r.status === 'rejected')
    if (failures.length > 0) {
      console.warn(`ScenarioStore: ${failures.length} 个数据文件加载失败`)
    }

    loaded.value = true
  }

  /**
   * 根据部队 ID 查找部队
   */
  function getForceById(id: string): ForceFeature | undefined {
    return forces.value.find((f) => f.properties.id === id)
  }

  /**
   * 根据事件 ID 查找事件
   */
  function getEventById(id: string): EventRecord | undefined {
    return events.value.find((e) => e.id === id)
  }

  /**
   * 根据人物 ID 查找人物
   */
  function getPersonById(id: string): Person | undefined {
    return persons.value.find((p) => p.id === id)
  }

  /**
   * 重置所有数据 (用于测试/清理)
   */
  function reset(): void {
    forces.value = []
    trajectories.value = []
    events.value = []
    persons.value = []
    meetings.value = []
    loaded.value = false
  }

  return {
    // 状态
    forces,
    trajectories,
    events,
    persons,
    meetings,
    loaded,
    // 计算属性
    forceCount,
    eventCount,
    // 方法
    loadAll,
    loadForces,
    loadTrajectories,
    loadEvents,
    loadPersons,
    loadMeetings,
    getForceById,
    getEventById,
    getPersonById,
    reset,
  }
})
