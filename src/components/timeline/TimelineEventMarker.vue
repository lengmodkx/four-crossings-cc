<script setup lang="ts">
/**
 * TimelineEventMarker — 时间轴事件标记点
 *
 * 在时间轴轨道上显示事件位置，根据事件类型显示不同图标。
 */
import { computed } from 'vue'
import type { EventType } from '@/data/types'

const props = defineProps<{
  /** 事件唯一 id */
  id: string
  /** 事件时间戳 */
  timestamp: string
  /** 事件标题 */
  title: string
  /** 事件类型 */
  type: EventType
  /** 时间轴起始毫秒 (epoch) */
  startMs: number
  /** 时间轴结束毫秒 (epoch) */
  endMs: number
}>()

const emit = defineEmits<{
  click: [id: string]
}>()

/** 当前事件在时间长轴上的位置百分比 */
const leftPercent = computed<number>(() => {
  const ts = new Date(props.timestamp).getTime()
  const range = props.endMs - props.startMs
  if (range <= 0) return 0
  const pct = ((ts - props.startMs) / range) * 100
  return Math.max(0, Math.min(100, pct))
})

/** 事件类型图标映射 */
const typeIcon = computed<string>(() => {
  switch (props.type) {
    case 'battle':
      return '⚔'
    case 'meeting':
      return '★'
    case 'crossing':
      return '◆'
    case 'maneuver':
      return '◇'
    default:
      return '●'
  }
})

function handleClick(): void {
  emit('click', props.id)
}
</script>

<template>
  <div
    class="timeline-event-marker"
    :style="{ left: leftPercent + '%' }"
    :title="title"
    @click="handleClick"
  >
    <span class="marker-icon">{{ typeIcon }}</span>
    <span class="marker-label">{{ title }}</span>
  </div>
</template>

<style scoped>
.timeline-event-marker {
  position: absolute;
  top: -6px;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.marker-icon {
  font-size: 14px;
  line-height: 1;
  color: var(--color-accent-red, #C0392B);
  transition: transform 0.2s;
}

.timeline-event-marker:hover .marker-icon {
  transform: scale(1.3);
}

.marker-label {
  font-size: 10px;
  color: var(--color-text-muted, #6B5D4A);
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
