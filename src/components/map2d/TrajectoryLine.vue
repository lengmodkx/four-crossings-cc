<script setup lang="ts">
/**
 * TrajectoryLine — 行军轨迹线组件
 *
 * 使用 MapLibre GL GeoJSON source + line layer 在地图上渲染行军轨迹。
 * 颜色从 trajectory.properties.color 读取，线宽 2.5。
 */
import { onMounted, onBeforeUnmount, watch } from 'vue'
import type { Map, GeoJSONSource } from 'maplibre-gl'
import type { TrajectoryFeature } from '@/data/types'

const props = defineProps<{
  /** MapLibre GL Map 实例 */
  map: Map
  /** 要渲染的轨迹 feature */
  feature: TrajectoryFeature
}>()

/** 图层和 source 的唯一 id */
const sourceId = `trajectory-source-${props.feature.properties.id}`
const layerId = `trajectory-layer-${props.feature.properties.id}`

/**
 * 将 TrajectoryFeature 转换为 GeoJSON Feature 对象
 * maplibre-gl 的 GeoJSONSource API 接受 any，此处绕过严格的 GeoJSON 泛型校验
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toGeoJSONSourceData(): any {
  return {
    type: 'Feature',
    properties: props.feature.properties,
    geometry: props.feature.geometry,
  }
}

function addSourceAndLayer(): void {
  const map = props.map

  // 检查 source 是否已存在 (热更新场景)
  if (map.getSource(sourceId)) {
    const source = map.getSource(sourceId) as GeoJSONSource
    source.setData(toGeoJSONSourceData())
    return
  }

  // 添加 GeoJSON source
  map.addSource(sourceId, {
    type: 'geojson',
    data: toGeoJSONSourceData(),
  })

  // 添加 line layer
  const color = props.feature.properties.color || '#C0392B'
  map.addLayer({
    id: layerId,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': color,
      'line-width': 2.5,
      'line-opacity': 0.85,
      'line-blur': 0.5,
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
  })
}

function removeSourceAndLayer(): void {
  const map = props.map
  if (!map || !map.loaded()) return

  try {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId)
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  } catch {
    // 地图可能已被销毁
  }
}

onMounted(() => {
  // The parent's "load" handler may have fired before this component mounted,
  // so neither props.map.loaded() nor a "styledata"/"load" listener is reliable
  // for late-mounting components. MapLibre queues addSource/addLayer calls
  // internally until the style is ready, so just call them directly.
  addSourceAndLayer();
})

// 监听 feature 变化更新数据
watch(
  () => props.feature,
  () => {
    const map = props.map
    if (!map.loaded()) return

    const source = map.getSource(sourceId) as GeoJSONSource | undefined
    if (source) {
      source.setData(toGeoJSONSourceData())
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  removeSourceAndLayer()
})
</script>

<template>
  <!-- 此组件不渲染 DOM，通过 MapLibre GL API 直接操作地图图层 -->
</template>
