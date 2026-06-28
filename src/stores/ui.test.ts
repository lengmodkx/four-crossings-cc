/**
 * UiStore 测试
 *
 * 验证三组 overlay 状态(filterOpen / sideOpen / menuOpen)的 open/close/toggle,
 * 以及它们彼此独立。
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from './ui'

describe('uiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始全部为关闭状态', () => {
    const ui = useUiStore()
    expect(ui.filterOpen).toBe(false)
    expect(ui.sideOpen).toBe(false)
    expect(ui.menuOpen).toBe(false)
  })

  describe('filter', () => {
    it('open/close/toggle 三件套', () => {
      const ui = useUiStore()
      ui.openFilter()
      expect(ui.filterOpen).toBe(true)
      ui.closeFilter()
      expect(ui.filterOpen).toBe(false)
      ui.toggleFilter()
      expect(ui.filterOpen).toBe(true)
      ui.toggleFilter()
      expect(ui.filterOpen).toBe(false)
    })
  })

  describe('side', () => {
    it('open/close/toggle 三件套', () => {
      const ui = useUiStore()
      ui.openSide()
      expect(ui.sideOpen).toBe(true)
      ui.closeSide()
      expect(ui.sideOpen).toBe(false)
      ui.toggleSide()
      expect(ui.sideOpen).toBe(true)
    })
  })

  describe('menu', () => {
    it('open/close/toggle 三件套', () => {
      const ui = useUiStore()
      ui.openMenu()
      expect(ui.menuOpen).toBe(true)
      ui.closeMenu()
      expect(ui.menuOpen).toBe(false)
      ui.toggleMenu()
      expect(ui.menuOpen).toBe(true)
    })
  })

  it('三个 state 互相独立(改一个不会动另两个)', () => {
    const ui = useUiStore()
    ui.openFilter()
    expect(ui.sideOpen).toBe(false)
    expect(ui.menuOpen).toBe(false)
    ui.openMenu()
    expect(ui.filterOpen).toBe(true)
    expect(ui.sideOpen).toBe(false)
    ui.toggleSide()
    expect(ui.filterOpen).toBe(true)
    expect(ui.menuOpen).toBe(true)
    expect(ui.sideOpen).toBe(true)
  })
})
