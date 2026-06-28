/**
 * useBreakpoint — 响应式断点检测
 *
 * 用 reactive ref 暴露当前视口宽度 + 几个移动端判定位,
 * 替换散落在各处的 `window.innerWidth <= 1024` 硬编码。
 *
 * 用法:
 *   const { isMobile, isTablet, isDesktop } = useBreakpoint()
 *   if (isMobile.value) { ... }
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/** 与 _variables.scss 的 $breakpoint-sm/md/lg 对齐 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export function useBreakpoint() {
  const width = ref<number>(
    typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.lg,
  )

  const isMobile = computed(() => width.value < BREAKPOINTS.md)
  const isTablet = computed(() => width.value >= BREAKPOINTS.md && width.value < BREAKPOINTS.lg)
  const isDesktop = computed(() => width.value >= BREAKPOINTS.lg)

  function onResize(): void {
    width.value = window.innerWidth
  }

  onMounted(() => {
    width.value = window.innerWidth
    window.addEventListener('resize', onResize, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
  }
}
