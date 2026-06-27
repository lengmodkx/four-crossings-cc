<script setup lang="ts">
/**
 * MapView2D — 古旧军图风格 2D 地图组件
 *
 * 使用 Mapbox GL JS 渲染自定义古旧军图样式的地图。
 * 以贵州遵义地区为中心，展示四渡赤水战役全貌。
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getMapboxToken } from '@/config/mapbox'

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = ref<mapboxgl.Map | null>(null)

onMounted(() => {
  if (!mapContainer.value) {
    console.error('地图容器未找到')
    return
  }

  const token = getMapboxToken()
  mapboxgl.accessToken = token

  const map = new mapboxgl.Map({
    container: mapContainer.value,
    style: '/map-styles/ancient-map.json',
    center: [105.5, 27.8],
    zoom: 6,
    attributionControl: false,
  })

  // 添加导航控件
  map.addControl(new mapboxgl.NavigationControl(), 'top-right')

  // 添加比例尺
  map.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

  map.on('load', () => {
    // 地图加载完成后的回调，可在此添加自定义图层
    console.log('古旧军图加载完成')
  })

  mapInstance.value = map
})

onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.remove()
    mapInstance.value = null
  }
})
</script>

<template>
  <div class="map-view-2d">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.map-view-2d {
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>
