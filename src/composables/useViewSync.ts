/**
 * useViewSync — 2D/3D 视角同步 composable
 *
 * 监听 ViewStore 中的 mapCenter 和 mapZoom 变化，
 * 同步更新 Mapbox GL 2D 地图和 Three.js 3D 相机的视角。
 * 支持双向同步: 用户拖动地图 → store 更新 → 另一视图响应。
 *
 * 设计参考: §5.4 鸟瞰沙盘模式 - 2D/3D 视角同步
 */
import { watch, type Ref } from 'vue'
import type { Map } from 'mapbox-gl'
import type { Camera } from 'three'
import { useViewStore } from '@/stores/view'

/**
 * 将经纬度中心 + 缩放转换为 3D 相机位置
 *
 * 赤水河流域范围: 104-107°E, 27-29°N
 * 3D 世界范围: -4000 ~ +4000 units
 *
 * 缩放级别 → 相机高度映射:
 *   zoom 4 → 8000
 *   zoom 6 → 4000
 *   zoom 8 → 2000
 *   zoom 10 → 1000
 *   zoom 12 → 500
 */
function lngLatZoomToCameraPos(
  lng: number,
  lat: number,
  zoom: number,
): { position: [number, number, number]; target: [number, number, number] } {
  // 经纬度 → 世界坐标 (与 useForce3D 的 defaultLngLatToWorldXY 一致)
  const BOUNDS = { minLng: 104, maxLng: 107, minLat: 27, maxLat: 29, worldMin: -4000, worldMax: 4000 }
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * (BOUNDS.worldMax - BOUNDS.worldMin) + BOUNDS.worldMin
  const z = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * (BOUNDS.worldMax - BOUNDS.worldMin) + BOUNDS.worldMin

  // 缩放 → 相机高度 (指数映射)
  const height = 8000 / Math.pow(1.5, zoom - 4)

  return {
    position: [x, height, z + height * 0.5],
    target: [x, 0, z],
  }
}

/**
 * 启动 2D Mapbox 地图和 3D Three.js 相机的视角同步
 *
 * @param map2dRef - Mapbox GL Map 实例的 Ref (可选, 可能延迟加载)
 * @param camera3dRef - Three.js Camera 实例的 Ref (可选, 可能延迟加载)
 */
export function useViewSync(
  map2dRef?: Ref<Map | null>,
  camera3dRef?: Ref<Camera | null>,
) {
  const viewStore = useViewStore()

  // ===== 2D → Store (用户拖动地图时) =====
  if (map2dRef) {
    // 当地图准备好后，绑定 moveend 事件
    const unbindMoveEnd = watch(
      map2dRef,
      (map, _, onCleanup) => {
        if (!map) return

        const handler = () => {
          const center = map.getCenter()
          const zoom = map.getZoom()
          viewStore.setView([center.lng, center.lat], zoom)
        }

        map.on('moveend', handler)

        onCleanup(() => {
          map.off('moveend', handler)
        })
      },
      { immediate: true },
    )
  }

  // ===== Store → 2D (map2d.flyTo) =====
  watch(
    () => [viewStore.mapCenter[0], viewStore.mapCenter[1], viewStore.mapZoom],
    ([lng, lat, zoom]) => {
      if (!map2dRef?.value) return

      const currentCenter = map2dRef.value.getCenter()
      const currentZoom = map2dRef.value.getZoom()

      // 避免循环: 只在值不同时触发
      if (
        Math.abs(currentCenter.lng - lng) > 0.0001 ||
        Math.abs(currentCenter.lat - lat) > 0.0001 ||
        Math.abs(currentZoom - zoom) > 0.01
      ) {
        map2dRef.value.flyTo({
          center: [lng, lat],
          zoom,
          duration: 800,
        })
      }
    },
  )

  // ===== Store → 3D (camera3d.position 更新) =====
  watch(
    () => [viewStore.mapCenter[0], viewStore.mapCenter[1], viewStore.mapZoom],
    ([lng, lat, zoom]) => {
      if (!camera3dRef?.value) return

      const { position, target } = lngLatZoomToCameraPos(lng, lat, zoom)

      camera3dRef.value.position.set(position[0], position[1], position[2])
      camera3dRef.value.lookAt(target[0], target[1], target[2])
    },
  )
}
