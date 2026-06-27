/**
 * TimeStore — 单一时间写入源
 *
 * 管理四渡赤水战役时间轴的核心状态:
 * - 5 个战役阶段 (first/second/third/fourth-crossing, jinsha-river)
 * - 当前时间、播放状态、播放速度
 * - RAF 驱动的自动播放 (1 现实秒 = 6 战役小时 × speed)
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/** 战役阶段定义 */
export interface PhaseDef {
  id: string
  name: string
  start: string
  end: string
}

/** 播放速度倍率 */
export type PlaybackSpeed = 1 | 2 | 4 | 8

/** 所有战役阶段 */
export const PHASES: PhaseDef[] = [
  {
    id: 'first-crossing',
    name: '一渡赤水',
    start: '1935-01-19T00:00:00+08:00',
    end: '1935-02-09T23:59:59+08:00',
  },
  {
    id: 'second-crossing',
    name: '二渡赤水',
    start: '1935-02-10T00:00:00+08:00',
    end: '1935-03-01T23:59:59+08:00',
  },
  {
    id: 'third-crossing',
    name: '三渡赤水',
    start: '1935-03-02T00:00:00+08:00',
    end: '1935-03-17T23:59:59+08:00',
  },
  {
    id: 'fourth-crossing',
    name: '四渡赤水',
    start: '1935-03-18T00:00:00+08:00',
    end: '1935-04-07T23:59:59+08:00',
  },
  {
    id: 'jinsha-river',
    name: '巧渡金沙江',
    start: '1935-04-08T00:00:00+08:00',
    end: '1935-05-09T23:59:59+08:00',
  },
]

/** 战役起始时间 */
export const CAMPAIGN_START = PHASES[0].start
export const CAMPAIGN_END = PHASES[PHASES.length - 1].end

/** 基础时间倍率: 1 现实秒 = BASE_HOURS 战役小时 */
const BASE_HOURS = 6
/** 每小时毫秒数 */
const MS_PER_HOUR = 3600_000

/** 可用的播放速度 */
export const PLAYBACK_SPEEDS: readonly PlaybackSpeed[] = [1, 2, 4, 8]

/**
 * 解析 ISO 时间字符串为 Date 对象
 */
export function parseTime(iso: string): Date {
  return new Date(iso)
}

/**
 * 格式化 Date 为 ISO 字符串 (保留 +08:00)
 */
export function formatTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`
}

export const useTimeStore = defineStore('time', () => {
  // ===== 状态 =====
  const currentPhase = ref<string>(PHASES[0].id)
  const currentTime = ref<string>(CAMPAIGN_START)
  const isPlaying = ref<boolean>(false)
  const speed = ref<PlaybackSpeed>(1)

  // ===== 内部状态 =====
  let rafId: number | null = null
  let lastRafTime: number = 0
  /** RAF 回调引用，用于测试替换 */
  let rafFn: (cb: FrameRequestCallback) => number = (cb) => requestAnimationFrame(cb)
  let cafFn: (id: number) => void = (id) => cancelAnimationFrame(id)

  // ===== 计算属性 =====

  /** 当前阶段的起止 ISO 时间 */
  const phaseRange = computed<{ start: string; end: string }>(() => {
    const phase = PHASES.find((p) => p.id === currentPhase.value)
    if (!phase) {
      return { start: CAMPAIGN_START, end: CAMPAIGN_END }
    }
    return { start: phase.start, end: phase.end }
  })

  /** 当前阶段索引 (从 0 开始) */
  const currentPhaseIndex = computed<number>(() => {
    return PHASES.findIndex((p) => p.id === currentPhase.value)
  })

  // ===== 方法 =====

  /**
   * 设置当前阶段
   */
  function setPhase(phaseId: string): void {
    const phase = PHASES.find((p) => p.id === phaseId)
    if (!phase) {
      console.warn(`未知阶段: ${phaseId}`)
      return
    }
    currentPhase.value = phaseId
    // 切换到该阶段开始时间
    currentTime.value = phase.start
  }

  /**
   * 设置当前时间
   * 自动同步所在阶段
   */
  function setTime(time: string): void {
    // 限制在战役范围内
    const t = parseTime(time)
    const start = parseTime(CAMPAIGN_START)
    const end = parseTime(CAMPAIGN_END)

    if (t < start) {
      currentTime.value = formatTime(start)
    } else if (t > end) {
      currentTime.value = formatTime(end)
    } else {
      currentTime.value = time
    }

    // 自动同步阶段
    syncPhase()
  }

  /**
   * 设置播放速度
   */
  function setSpeed(newSpeed: PlaybackSpeed): void {
    speed.value = newSpeed
  }

  /**
   * 开始播放
   */
  function play(): void {
    if (isPlaying.value) return
    isPlaying.value = true
    lastRafTime = 0
    rafId = rafFn(tick)
  }

  /**
   * 暂停播放
   */
  function pause(): void {
    isPlaying.value = false
    if (rafId !== null) {
      cafFn(rafId)
      rafId = null
    }
  }

  /**
   * 播放/暂停切换
   */
  function togglePlay(): void {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  /**
   * RAF 逐帧回调
   * 1 现实秒 = BASE_HOURS 战役小时 × speed
   */
  function tick(timestamp: number): void {
    if (!isPlaying.value) return

    if (lastRafTime === 0) {
      lastRafTime = timestamp
      rafId = rafFn(tick)
      return
    }

    const deltaMs = timestamp - lastRafTime
    lastRafTime = timestamp

    // 现实时间增量 → 战役时间增量 (小时)
    const hoursDelta = (deltaMs / 1000) * BASE_HOURS * speed.value
    const msDelta = hoursDelta * MS_PER_HOUR

    const now = parseTime(currentTime.value)
    const newTime = new Date(now.getTime() + msDelta)

    // 获取当前阶段结束时间
    const phaseEnd = parseTime(phaseRange.value.end)

    if (newTime >= phaseEnd) {
      // 到达阶段末尾，停在阶段结束时间
      currentTime.value = formatTime(phaseEnd)
      pause()
      return
    }

    // 检查是否超出战役结束时间
    const campaignEnd = parseTime(CAMPAIGN_END)
    if (newTime >= campaignEnd) {
      currentTime.value = formatTime(campaignEnd)
      pause()
      return
    }

    currentTime.value = formatTime(newTime)

    // 检查是否需要切换阶段
    syncPhase()

    rafId = rafFn(tick)
  }

  /**
   * 根据当前时间自动同步所在阶段
   */
  function syncPhase(): void {
    const t = parseTime(currentTime.value)
    for (const phase of PHASES) {
      const start = parseTime(phase.start)
      const end = parseTime(phase.end)
      if (t >= start && t <= end) {
        currentPhase.value = phase.id
        return
      }
    }
    // 如果时间在阶段范围外，保持在最近的有效阶段
    const firstStart = parseTime(PHASES[0].start)
    if (t < firstStart) {
      currentPhase.value = PHASES[0].id
    }
  }

  // ===== 测试用方法 =====

  /**
   * 替换 RAF 实现（仅测试用）
   */
  function _setRaf(fn: (cb: FrameRequestCallback) => number): void {
    rafFn = fn
  }

  function _setCaf(fn: (id: number) => void): void {
    cafFn = fn
  }

  return {
    // 状态
    currentPhase,
    currentTime,
    isPlaying,
    speed,
    // 计算属性
    phaseRange,
    currentPhaseIndex,
    // 方法
    setPhase,
    setTime,
    setSpeed,
    play,
    pause,
    togglePlay,
    // 测试
    _setRaf,
    _setCaf,
  }
})
