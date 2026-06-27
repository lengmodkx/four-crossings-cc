<script setup lang="ts">
/**
 * EventPin — 事件标记组件
 *
 * 在 MapLibre 地图上显示事件标记 (圆形 marker)。
 * 根据事件类型显示不同图标:
 * - battle   → ⚔ 战斗
 * - meeting  → ★ 会议
 * - crossing → ◆ 渡河
 * - maneuver → ◇ 机动
 *
 * 组件通过 maplibregl.Marker API 添加标记到地图。
 */
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import maplibregl from 'maplibre-gl'
import type { EventRecord } from '@/data/types'

const props = defineProps<{
  /** MapLibre GL Map 实例 */
  map: maplibregl.Map
  /** 事件记录 */
  event: EventRecord
}>()

const emit = defineEmits<{
  click: [event: EventRecord]
}>()

const markerRef = ref<maplibregl.Marker | null>(null)

/** 事件类型 → 图标映射 */
const typeIcon = computed<string>(() => {
  switch (props.event.type) {
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

/** 事件类型 → CSS class */
const typeClass = computed<string>(() => {
  return `event-pin-${props.event.type}`
})

/** 构造事件标记 HTML 元素 */
function createPinElement(): HTMLElement {
  const el = document.createElement('div')

  el.className = `event-pin ${typeClass.value}`
  el.innerHTML = `<span class="event-pin-icon">${typeIcon.value}</span>`
  el.title = `${typeIcon.value} ${props.event.title}`
  return el
}

onMounted(() => {
  const el = createPinElement()
  const coords = props.event.location as [number, number]

  const marker = new maplibregl.Marker({
    element: el,
    anchor: 'center',
  })
    .setLngLat(coords)
    .addTo(props.map)

  // 绑定点击事件
  el.addEventListener('click', () => {
    emit('click', props.event)
  })

  markerRef.value = marker
})

onBeforeUnmount(() => {
  if (markerRef.value) {
    markerRef.value.remove()
    markerRef.value = null
  }
})
</script>

<template>
  <!--
    此组件不渲染任何 DOM 内容。
    标记通过 maplibregl.Marker API 直接添加到地图。
  -->
</template>

<style>
/* 全局样式: 事件标记样式 (不使用 scoped，因为标记元素是动态创建的) */

.event-pin {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.event-pin:hover {
  transform: scale(1.3);
  z-index: 10;
}

.event-pin-icon {
  display: block;
}

/* 战斗: 红底白字 */
.event-pin-battle {
  background: var(--color-accent-red, #C0392B);
  color: #ffffff;
  border: 2px solid var(--color-bg-paper, #F2E8D0);
}

/* 会议: 金底白字 */
.event-pin-meeting {
  background: var(--color-highlight, #D4A017);
  color: #ffffff;
  border: 2px solid var(--color-bg-paper, #F2E8D0);
}

/* 渡河: 蓝底白字 */
.event-pin-crossing {
  background: var(--color-accent-blue, #2C5F7C);
  color: #ffffff;
  border: 2px solid var(--color-bg-paper, #F2E8D0);
}

/* 机动: 绿底白字 */
.event-pin-maneuver {
  background: var(--color-contour, #6B7F4A);
  color: #ffffff;
  border: 2px solid var(--color-bg-paper, #F2E8D0);
}
</style>
