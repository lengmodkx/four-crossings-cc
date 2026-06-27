<script setup lang="ts">
/**
 * Timeline — 主时间轴组件
 *
 * 水平时间轴，显示当前阶段、时间、播放控制。
 * 可通过点击轨道跳转到指定时间点。
 */
import { computed } from 'vue'
import { useTimeStore, PHASES, PLAYBACK_SPEEDS, parseTime } from '@/stores/time'

const timeStore = useTimeStore()

/** 所有阶段信息（用于渲染阶段指示器） */
const phaseLabels = computed(() => {
  return PHASES.map((p) => ({
    id: p.id,
    name: p.name,
    active: p.id === timeStore.currentPhase,
  }))
})

/** 当前时间在战役时间轴上的进度百分比 */
const progressPercent = computed<number>(() => {
  const campaignStart = parseTime(PHASES[0].start).getTime()
  const campaignEnd = parseTime(PHASES[PHASES.length - 1].end).getTime()
  const current = parseTime(timeStore.currentTime).getTime()
  const range = campaignEnd - campaignStart
  if (range <= 0) return 0
  const pct = ((current - campaignStart) / range) * 100
  return Math.max(0, Math.min(100, pct))
})

/** 播放按钮标签 */
const playButtonLabel = computed(() => {
  return timeStore.isPlaying ? '⏸' : '▶'
})

/** 格式化时间显示 (日-月 时:分) */
const displayTime = computed(() => {
  const d = parseTime(timeStore.currentTime)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
})

/**
 * 点击轨道跳转
 */
function handleTrackClick(event: MouseEvent): void {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const pct = (x / rect.width) * 100

  const campaignStart = parseTime(PHASES[0].start).getTime()
  const campaignEnd = parseTime(PHASES[PHASES.length - 1].end).getTime()
  const range = campaignEnd - campaignStart
  const clickedTime = campaignStart + (pct / 100) * range

  // 格式化为 ISO 字符串
  const d = new Date(clickedTime)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  const iso = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`

  timeStore.setTime(iso)
}

/**
 * 切换播放/暂停
 */
function handleTogglePlay(): void {
  timeStore.togglePlay()
}

/**
 * 设置速度
 */
function handleSpeedChange(s: typeof PLAYBACK_SPEEDS[number]): void {
  timeStore.setSpeed(s)
}

/**
 * 点击阶段指示器
 */
function handlePhaseClick(phaseId: string): void {
  timeStore.setPhase(phaseId)
}
</script>

<template>
  <div class="timeline">
    <!-- 阶段指示器 -->
    <div class="timeline-phases">
      <button
        v-for="phase in phaseLabels"
        :key="phase.id"
        class="phase-btn"
        :class="{ active: phase.active }"
        @click="handlePhaseClick(phase.id)"
      >
        {{ phase.name }}
      </button>
    </div>

    <!-- 时间轴轨道 -->
    <div class="timeline-track-wrapper">
      <div
        class="timeline-track"
        @click="handleTrackClick"
      >
        <!-- 进度条 -->
        <div
          class="timeline-progress"
          :style="{ width: progressPercent + '%' }"
        ></div>
        <!-- 当前时间指示器 -->
        <div
          class="timeline-thumb"
          :style="{ left: progressPercent + '%' }"
        ></div>
      </div>
    </div>

    <!-- 控制栏 -->
    <div class="timeline-controls">
      <button
        class="control-btn play-btn"
        :title="timeStore.isPlaying ? '暂停' : '播放'"
        @click="handleTogglePlay"
      >
        {{ playButtonLabel }}
      </button>

      <span class="time-display">{{ displayTime }}</span>

      <div class="speed-buttons">
        <button
          v-for="s in PLAYBACK_SPEEDS"
          :key="s"
          class="speed-btn"
          :class="{ active: timeStore.speed === s }"
          @click="handleSpeedChange(s)"
        >
          ×{{ s }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-bg-paper, #F2E8D0);
  border-top: 2px solid var(--color-bg-dark, #3D2F1F);
}

.timeline-phases {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.phase-btn {
  padding: 4px 10px;
  border: 1px solid var(--color-text-muted, #6B5D4A);
  border-radius: 3px;
  background: transparent;
  color: var(--color-text-muted, #6B5D4A);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.phase-btn:hover {
  border-color: var(--color-accent-red, #C0392B);
  color: var(--color-accent-red, #C0392B);
}

.phase-btn.active {
  background: var(--color-bg-dark, #3D2F1F);
  border-color: var(--color-bg-dark, #3D2F1F);
  color: var(--color-bg-paper, #F2E8D0);
}

.timeline-track-wrapper {
  padding: 8px 0;
}

.timeline-track {
  position: relative;
  height: 8px;
  background: var(--color-contour, #6B7F4A);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.4;
}

.timeline-track:hover {
  opacity: 0.6;
}

.timeline-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--color-accent-red, #C0392B);
  border-radius: 4px;
  transition: width 0.1s linear;
}

.timeline-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: var(--color-accent-red, #C0392B);
  border: 2px solid var(--color-bg-paper, #F2E8D0);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-bg-dark, #3D2F1F);
  border-radius: 4px;
  background: var(--color-bg-paper, #F2E8D0);
  color: var(--color-bg-dark, #3D2F1F);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.control-btn:hover {
  background: var(--color-bg-dark, #3D2F1F);
  color: var(--color-bg-paper, #F2E8D0);
}

.time-display {
  font-family: monospace;
  font-size: 14px;
  color: var(--color-text-main, #1A1410);
  min-width: 100px;
}

.speed-buttons {
  display: flex;
  gap: 2px;
  margin-left: auto;
}

.speed-btn {
  padding: 4px 8px;
  border: 1px solid var(--color-text-muted, #6B5D4A);
  border-radius: 3px;
  background: transparent;
  color: var(--color-text-muted, #6B5D4A);
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.speed-btn:hover {
  border-color: var(--color-accent-red, #C0392B);
  color: var(--color-accent-red, #C0392B);
}

.speed-btn.active {
  background: var(--color-accent-red, #C0392B);
  border-color: var(--color-accent-red, #C0392B);
  color: #fff;
}
</style>
