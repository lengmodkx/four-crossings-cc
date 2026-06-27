/**
 * useKeyboardShortcuts — 键盘快捷键
 *
 * 全局快捷键映射:
 * - Space     → 播放/暂停 timeStore
 * - ← →       → 前/后跳 6 小时
 * - 1 / 2     → 切换 2D/3D
 * - E / N     → 切换到 explore/narrative 模式 (router push)
 *
 * 在 input/textarea/select/contenteditable 内不触发。
 * onMounted 注册, onBeforeUnmount 移除。
 */
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useTimeStore } from '@/stores/time'
import { useViewStore } from '@/stores/view'
import { parseTime, formatTime } from '@/stores/time'

const MS_PER_HOUR = 3600_000

const INPUT_ELEMENTS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isEditingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  if (INPUT_ELEMENTS.has(target.tagName)) return true
  if (target.isContentEditable) return true
  return false
}

export function useKeyboardShortcuts(): void {
  const router = useRouter()
  const timeStore = useTimeStore()
  const viewStore = useViewStore()

  function handleKeydown(event: KeyboardEvent): void {
    // 在输入组件内不触发快捷键
    if (isEditingTarget(event.target)) return

    switch (event.key) {
      case ' ': {
        event.preventDefault()
        timeStore.togglePlay()
        break
      }
      case 'ArrowLeft': {
        event.preventDefault()
        const t = parseTime(timeStore.currentTime)
        const newTime = new Date(t.getTime() - 6 * MS_PER_HOUR)
        timeStore.setTime(formatTime(newTime))
        break
      }
      case 'ArrowRight': {
        event.preventDefault()
        const t = parseTime(timeStore.currentTime)
        const newTime = new Date(t.getTime() + 6 * MS_PER_HOUR)
        timeStore.setTime(formatTime(newTime))
        break
      }
      case 'e':
      case 'E': {
        viewStore.setMode('explore')
        if (!router.currentRoute.value.path.startsWith('/explore')) {
          router.push('/explore/first-crossing')
        }
        break
      }
      case 'n':
      case 'N': {
        viewStore.setMode('narrative')
        if (!router.currentRoute.value.path.startsWith('/narrative')) {
          router.push('/narrative/first-crossing')
        }
        break
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
