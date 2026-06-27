<script setup lang="ts">
/**
 * MapView2D — 古旧军图风格 2D 地图组件
 *
 * 使用 MapLibre GL JS 渲染自定义古旧军图样式的地图。
 * 以贵州遵义地区为中心，展示四渡赤水战役全貌。
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const emit = defineEmits<{
  mapReady: [map: maplibregl.Map]
  mapError: [error: string]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = ref<maplibregl.Map | null>(null)
const errorMsg = ref<string | null>(null)
const isLoading = ref(true)

onMounted(() => {
  if (!mapContainer.value) {
    errorMsg.value = '地图容器未找到'
    isLoading.value = false
    return
  }

  try {
    const map = new maplibregl.Map({
      container: mapContainer.value,
      style: '/map-styles/ancient-map.json',
      center: [105.5, 27.8],
      zoom: 6,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left')

    map.on('load', () => {
      isLoading.value = false
      emit('mapReady', map)
    })

    map.on('error', (e) => {
      if (!map.isStyleLoaded()) {
        const msg = (e.error as any)?.message || (e.error as any)?.statusText || e.error?.toString() || '未知错误'
        errorMsg.value = `地图样式加载失败：${msg}。请检查网络连接。`
        isLoading.value = false
        emit('mapError', errorMsg.value)
      }
    })

    mapInstance.value = map
  } catch (e: any) {
    errorMsg.value = `地图初始化失败：${e.message || e}`
    isLoading.value = false
    emit('mapError', errorMsg.value)
  }
})

onBeforeUnmount(() => {
  if (mapInstance.value) {
    try { mapInstance.value.remove() } catch {}
    mapInstance.value = null
  }
})
</script>

<template>
  <div class="map-view-2d">
    <!-- 加载中 -->
    <div v-if="isLoading && !errorMsg" class="map-status">
      <div class="compass-icon">🧭</div>
      <p>地图加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="errorMsg" class="map-status map-error">
      <p>⚠ {{ errorMsg }}</p>
      <p class="error-hint">
        MapLibre GL + OpenStreetMap 瓦片：完全免费、无需注册。
      </p>
    </div>

    <!-- 地图画布(始终渲染,但加载/错误时被覆盖) -->
    <div ref="mapContainer" class="map-container" :class="{ hidden: !!errorMsg }"></div>
  </div>
</template>

<style scoped>
.map-view-2d {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-container.hidden {
  visibility: hidden;
}

.map-status {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #F2E8D0);
  color: var(--color-ink-soft, #6B5D4A);
  font-family: var(--font-body, serif);
  z-index: 10;
  padding: 2rem;
  text-align: center;
}

.map-error {
  color: var(--color-red, #C0392B);
  border: 2px dashed var(--color-red, #C0392B);
  margin: 2rem;
}

.compass-icon {
  font-size: 3rem;
  animation: spin 3s linear infinite;
  margin-bottom: 1rem;
}

.error-hint {
  font-size: 0.9em;
  margin-top: 1rem;
}

.error-hint a {
  color: var(--color-blue, #2C5F7C);
  text-decoration: underline;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
