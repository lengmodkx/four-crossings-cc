/**
 * ViewStore — 视角状态管理
 *
 * 管理 2D/3D 视图模式、渲染模式、地图中心与缩放级别。
 * 支持 narrative (叙事模式) / explore (探索模式) 以及
 * 2d / 3d / split (双屏) 渲染方式。
 *
 * 默认中心: 贵州遵义地区 [105.5, 27.8], 缩放 6
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/** 交互模式 */
export type ViewMode = 'narrative' | 'explore'

/** 渲染模式 */
export type RenderMode = '2d'

/** 有效经纬度范围 (赤水河流域) */
export const VALID_BOUNDS = {
  minLng: 104,
  maxLng: 107,
  minLat: 27,
  maxLat: 29,
} as const

/** 有效缩放级别 [2, 18] */
export const ZOOM_RANGE = { min: 2, max: 18 } as const

/** 默认视角 */
export const DEFAULT_CENTER: [number, number] = [105.5, 27.8]
export const DEFAULT_ZOOM = 6

/**
 * 限制数值在 [min, max] 范围内
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 限制经纬度在有效范围内
 */
function clampLngLat(lng: number, lat: number): [number, number] {
  return [
    clamp(lng, VALID_BOUNDS.minLng, VALID_BOUNDS.maxLng),
    clamp(lat, VALID_BOUNDS.minLat, VALID_BOUNDS.maxLat),
  ]
}

export const useViewStore = defineStore('view', () => {
  // ===== 状态 =====
  const mode = ref<ViewMode>('narrative')
  const render = ref<RenderMode>('2d')
  const mapCenter = ref<[number, number]>([...DEFAULT_CENTER])
  const mapZoom = ref<number>(DEFAULT_ZOOM)

  // ===== 计算属性 =====

  /** 当前是否处于叙事模式 */
  const isNarrative = computed(() => mode.value === 'narrative')

  /** 当前是否处于探索模式 */
  const isExplore = computed(() => mode.value === 'explore')

  /** 2D 视图是否激活 */
  const is2DActive = computed(() => render.value === '2d')

  // ===== 方法 =====

  /**
   * 设置交互模式
   */
  function setMode(newMode: ViewMode): void {
    mode.value = newMode
  }

  /**
   * 设置渲染模式
   */
  function setRender(newRender: RenderMode): void {
    render.value = newRender
  }

  /**
   * 同时设置地图中心和缩放
   * 经纬度会被限制在赤水河流域范围内
   */
  function setView(
    center: [number, number],
    zoom?: number,
  ): void {
    mapCenter.value = clampLngLat(center[0], center[1])
    if (zoom !== undefined) {
      mapZoom.value = clamp(zoom, ZOOM_RANGE.min, ZOOM_RANGE.max)
    }
  }

  /**
   * 仅设置地图中心
   */
  function setCenter(center: [number, number]): void {
    mapCenter.value = clampLngLat(center[0], center[1])
  }

  /**
   * 仅设置缩放
   */
  function setZoom(zoom: number): void {
    mapZoom.value = clamp(zoom, ZOOM_RANGE.min, ZOOM_RANGE.max)
  }

  /**
   * 重置视角到默认
   */
  function resetView(): void {
    mapCenter.value = [...DEFAULT_CENTER]
    mapZoom.value = DEFAULT_ZOOM
  }

  return {
    // 状态
    mode,
    render,
    mapCenter,
    mapZoom,
    // 计算属性
    isNarrative,
    isExplore,
    is2DActive,
    // 方法
    setMode,
    setRender,
    setView,
    setCenter,
    setZoom,
    resetView,
  }
})
