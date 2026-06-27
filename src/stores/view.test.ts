/**
 * ViewStore 测试
 *
 * 验证视角状态管理: setMode, setRender, setView 及计算属性。
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  useViewStore,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  VALID_BOUNDS,
  ZOOM_RANGE,
} from './view'

describe('useViewStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('默认模式为 narrative', () => {
      const store = useViewStore()
      expect(store.mode).toBe('narrative')
    })

    it('默认渲染为 2d', () => {
      const store = useViewStore()
      expect(store.render).toBe('2d')
    })

    it('默认中心为 [105.5, 27.8]', () => {
      const store = useViewStore()
      expect(store.mapCenter).toEqual(DEFAULT_CENTER)
    })

    it('默认缩放为 6', () => {
      const store = useViewStore()
      expect(store.mapZoom).toBe(DEFAULT_ZOOM)
    })
  })

  describe('setMode', () => {
    it('应切换到 explore 模式', () => {
      const store = useViewStore()
      store.setMode('explore')
      expect(store.mode).toBe('explore')
    })

    it('应切换到 narrative 模式', () => {
      const store = useViewStore()
      store.setMode('explore')
      store.setMode('narrative')
      expect(store.mode).toBe('narrative')
    })

    it('isNarrative 和 isExplore 应正确反映模式', () => {
      const store = useViewStore()

      expect(store.isNarrative).toBe(true)
      expect(store.isExplore).toBe(false)

      store.setMode('explore')
      expect(store.isNarrative).toBe(false)
      expect(store.isExplore).toBe(true)
    })
  })

  describe('setRender', () => {
    it('应保持 2d 渲染', () => {
      const store = useViewStore()
      store.setRender('2d')
      expect(store.render).toBe('2d')
    })

    it('is2DActive 应正确反映渲染模式', () => {
      const store = useViewStore()

      // 2d
      expect(store.is2DActive).toBe(true)
    })
  })

  describe('setView', () => {
    it('应同时设置中心和缩放', () => {
      const store = useViewStore()
      store.setView([106.0, 28.5], 8)

      expect(store.mapCenter).toEqual([106.0, 28.5])
      expect(store.mapZoom).toBe(8)
    })

    it('仅传 center 时应只更新中心', () => {
      const store = useViewStore()
      store.setView([106.0, 28.5])

      expect(store.mapCenter).toEqual([106.0, 28.5])
      expect(store.mapZoom).toBe(DEFAULT_ZOOM) // 未变
    })

    it('应限制经纬度在有效范围内', () => {
      const store = useViewStore()
      store.setView([100, 25])

      expect(store.mapCenter[0]).toBe(VALID_BOUNDS.minLng)
      expect(store.mapCenter[1]).toBe(VALID_BOUNDS.minLat)
    })

    it('应限制经纬度在有效范围上限', () => {
      const store = useViewStore()
      store.setView([110, 30])

      expect(store.mapCenter[0]).toBe(VALID_BOUNDS.maxLng)
      expect(store.mapCenter[1]).toBe(VALID_BOUNDS.maxLat)
    })

    it('应限制缩放级别在有效范围', () => {
      const store = useViewStore()

      store.setView([105.5, 27.8], 0)
      expect(store.mapZoom).toBe(ZOOM_RANGE.min)

      store.setView([105.5, 27.8], 20)
      expect(store.mapZoom).toBe(ZOOM_RANGE.max)
    })
  })

  describe('setCenter', () => {
    it('应仅更新地图中心', () => {
      const store = useViewStore()
      store.setCenter([106.5, 28.2])

      expect(store.mapCenter).toEqual([106.5, 28.2])
      expect(store.mapZoom).toBe(DEFAULT_ZOOM)
    })
  })

  describe('setZoom', () => {
    it('应仅更新缩放级别', () => {
      const store = useViewStore()
      store.setZoom(10)

      expect(store.mapZoom).toBe(10)
      expect(store.mapCenter).toEqual(DEFAULT_CENTER)
    })

    it('应限制在有效范围', () => {
      const store = useViewStore()
      store.setZoom(0)
      expect(store.mapZoom).toBe(ZOOM_RANGE.min)

      store.setZoom(30)
      expect(store.mapZoom).toBe(ZOOM_RANGE.max)
    })
  })

  describe('resetView', () => {
    it('应恢复到默认中心和缩放', () => {
      const store = useViewStore()
      store.setView([106.0, 28.5], 10)

      store.resetView()

      expect(store.mapCenter).toEqual(DEFAULT_CENTER)
      expect(store.mapZoom).toBe(DEFAULT_ZOOM)
    })
  })
})
