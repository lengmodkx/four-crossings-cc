/**
 * useKeyboardShortcuts 测试
 *
 * 验证键盘快捷键事件正确触发 store 方法和路由导航。
 * 使用 vi.mock 替代真实的 timeStore / viewStore / router。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock stores before any imports
const mockTogglePlay = vi.fn()
const mockSetTime = vi.fn()
const mockSetRender = vi.fn()
const mockSetMode = vi.fn()
const mockRouterPush = vi.fn()

let currentTime = '1935-01-22T12:00:00+08:00'
let currentPath = '/narrative/first-crossing'

vi.mock('@/stores/time', () => {
  const actual = vi.importActual('@/stores/time')
  return {
    ...actual,
    useTimeStore: () => ({
      currentTime: '1935-01-22T12:00:00+08:00',
      isPlaying: false,
      togglePlay: mockTogglePlay,
      setTime: mockSetTime,
      currentPhase: 'first-crossing',
    }),
    parseTime: (iso: string) => new Date(iso),
    formatTime: (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`
    },
  }
})

vi.mock('@/stores/view', () => ({
  useViewStore: () => ({
    mode: 'narrative',
    render: '2d',
    setMode: mockSetMode,
    setRender: mockSetRender,
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    currentRoute: { value: { path: currentPath } },
  }),
}))

// Now import Vue runtime
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

/** 测试包装组件，挂载后调用 composable */
const TestComponent = defineComponent({
  setup() {
    useKeyboardShortcuts()
    return {}
  },
  template: '<div class="test-root"><input class="test-input" /></div>',
})

describe('useKeyboardShortcuts', () => {
  const dispatchKey = (key: string, target?: EventTarget | null) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    })
    // Override target if needed
    if (target) {
      Object.defineProperty(event, 'target', { value: target, writable: false })
    }
    window.dispatchEvent(event)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    currentPath = '/narrative/first-crossing'
  })

  afterEach(() => {
    window.dispatchEvent(new Event('unmounted'))
  })

  it('Space 键应触发 togglePlay', async () => {
    const wrapper = mount(TestComponent)
    await nextTick()

    dispatchKey(' ')

    expect(mockTogglePlay).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('ArrowLeft 应回退 6 小时', async () => {
    const wrapper = mount(TestComponent)
    await nextTick()

    dispatchKey('ArrowLeft')

    expect(mockSetTime).toHaveBeenCalledWith('1935-01-22T06:00:00+08:00')
    wrapper.unmount()
  })

  it('ArrowRight 应前进 6 小时', async () => {
    const wrapper = mount(TestComponent)
    await nextTick()

    dispatchKey('ArrowRight')

    expect(mockSetTime).toHaveBeenCalledWith('1935-01-22T18:00:00+08:00')
    wrapper.unmount()
  })

  it('1 键应切换到 2D 渲染', async () => {
    const wrapper = mount(TestComponent)
    await nextTick()

    dispatchKey('1')

    expect(mockSetRender).toHaveBeenCalledWith('2d')
    wrapper.unmount()
  })

  it('2 键应切换到 3D 渲染', async () => {
    const wrapper = mount(TestComponent)
    await nextTick()

    dispatchKey('2')

    expect(mockSetRender).toHaveBeenCalledWith('3d')
    wrapper.unmount()
  })

  it('E 键应切换到 explore 模式并导航', async () => {
    const wrapper = mount(TestComponent)
    await nextTick()

    dispatchKey('e')

    expect(mockSetMode).toHaveBeenCalledWith('explore')
    expect(mockRouterPush).toHaveBeenCalledWith('/explore/first-crossing')
    wrapper.unmount()
  })

  it('N 键应切换到 narrative 模式并导航', async () => {
    currentPath = '/explore/first-crossing'
    const wrapper = mount(TestComponent)
    await nextTick()

    dispatchKey('n')

    expect(mockSetMode).toHaveBeenCalledWith('narrative')
    expect(mockRouterPush).toHaveBeenCalledWith('/narrative/first-crossing')
    wrapper.unmount()
  })

  it('在 input 元素内不应触发放映控制', async () => {
    const wrapper = mount(TestComponent)
    await nextTick()

    const input = wrapper.find('.test-input').element
    dispatchKey(' ', input)

    expect(mockTogglePlay).not.toHaveBeenCalled()
    expect(mockSetTime).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
