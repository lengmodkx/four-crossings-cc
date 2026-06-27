<script setup lang="ts">
/**
 * ForceMarker — 部队标记组件
 *
 * 在 MapLibre 地图上显示单个部队标记 (HTML marker)。
 * 根据部队隶属 (红/蓝) 显示不同边框颜色。
 *
 * 注意: 必须在 MapLibre Map 初始化之后使用，
 * 组件通过 maplibregl.Marker API 添加标记到地图。
 */
import { onMounted, onBeforeUnmount, ref } from 'vue'
import maplibregl from 'maplibre-gl'
import type { ForceFeature } from '@/data/types'

const props = defineProps<{
  /** MapLibre GL Map 实例 */
  map: maplibregl.Map
  /** 部队点位 Feature */
  feature: ForceFeature
}>()

const emit = defineEmits<{
  click: [feature: ForceFeature]
}>()

const markerRef = ref<maplibregl.Marker | null>(null)

/** 构造部队标签的 HTML 元素 */
function createMarkerElement(): HTMLElement {
  const el = document.createElement('div')
  const sideClass = props.feature.properties.side === 'red' ? 'force-red' : 'force-blue'

  el.className = `force-marker ${sideClass}`
  el.innerHTML = `<span class="force-dot"></span>`
  el.title = props.feature.properties.name
  return el
}

onMounted(() => {
  const el = createMarkerElement()
  const coords = props.feature.geometry.coordinates as [number, number]

  const marker = new maplibregl.Marker({
    element: el,
    anchor: 'center',
  })
    .setLngLat(coords)
    .addTo(props.map)

  // 绑定点击事件
  el.addEventListener('click', () => {
    emit('click', props.feature)
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
/* 全局样式: 部队标记样式 (不使用 scoped，因为标记元素是动态创建的) */

.force-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}

.force-marker:hover {
  transform: scale(1.4);
}

.force-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 红军标记: 红底白点，红色边框 */
.force-marker.force-red {
  background: var(--color-bg-paper, #F2E8D0);
  border: 2px solid var(--color-accent-red, #C0392B);
}

.force-marker.force-red .force-dot {
  background: var(--color-accent-red, #C0392B);
}

/* 敌军标记: 深底白点，蓝色边框 */
.force-marker.force-blue {
  background: var(--color-bg-paper, #F2E8D0);
  border: 2px solid var(--color-accent-blue, #2C5F7C);
}

.force-marker.force-blue .force-dot {
  background: var(--color-accent-blue, #2C5F7C);
}
</style>
