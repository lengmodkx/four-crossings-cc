<script setup lang="ts">
/**
 * TopBar - 顶部导航栏
 *
 * 品牌名 + 模式切换 (narrative/explore) 链接。
 * 使用 useViewStore 管理视图状态,useRouter 导航。
 * 移动端(<768px)隐藏链接和模式切换,改为汉堡菜单唤出抽屉。
 * 菜单状态统一由 uiStore.menuOpen 管理,路由切换自动关闭。
 */
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useViewStore } from '@/stores/view'
import type { ViewMode } from '@/stores/view'
import { useUiStore } from '@/stores/ui'
import { useBreakpoint, BREAKPOINTS } from '@/composables/useBreakpoint'

const route = useRoute()
const router = useRouter()
const viewStore = useViewStore()
const uiStore = useUiStore()
const { width } = useBreakpoint()

function handleModeSwitch(mode: ViewMode): void {
  viewStore.setMode(mode)
  const currentPath = router.currentRoute.value.path
  if (mode === 'narrative' && !currentPath.startsWith('/narrative')) {
    router.push('/narrative/first-crossing')
  } else if (mode === 'explore' && !currentPath.startsWith('/explore')) {
    router.push('/explore/first-crossing')
  }
  uiStore.closeMenu()
}

function goHome(): void {
  router.push('/')
  uiStore.closeMenu()
}

// 任何路由变更都关闭菜单
watch(() => route.fullPath, () => uiStore.closeMenu())

// 视口变宽到桌面尺寸时关闭菜单(防止桌面布局下菜单仍打开)
watch(width, (w) => {
  if (w >= BREAKPOINTS.md) uiStore.closeMenu()
})
</script>

<template>
  <header class="topbar">
    <div class="topbar-brand" @click="goHome">
      <span class="brand-mark">四渡</span>
      <span class="brand-text">四渡赤水·全景沙盘</span>
    </div>
    <nav class="topbar-nav">
      <a
        class="topbar-link only-desktop"
        href="https://sidu.lengmodkx.club/"
        target="_blank"
        rel="noopener noreferrer"
        title="姊妹项目 · sidu-red-river (新窗口打开)"
      >
        <span>姊妹项目</span>
        <svg class="external-icon" viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
          <path d="M9 2h5v5M14 2L7 9M11 9v4H3V5h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
      <div class="mode-switch only-desktop">
        <button
          class="mode-btn"
          :class="{ active: viewStore.mode === 'narrative' }"
          @click="handleModeSwitch('narrative')"
        >
          叙事
        </button>
        <button
          class="mode-btn"
          :class="{ active: viewStore.mode === 'explore' }"
          @click="handleModeSwitch('explore')"
        >
          探索
        </button>
      </div>
      <button
        class="hamburger-btn only-mobile"
        :class="{ 'is-open': uiStore.menuOpen }"
        @click="uiStore.toggleMenu()"
        :aria-label="uiStore.menuOpen ? '关闭菜单' : '打开菜单'"
        :aria-expanded="uiStore.menuOpen"
      >
        <span></span><span></span><span></span>
      </button>
    </nav>
  </header>
  <div
    v-if="uiStore.menuOpen"
    class="topbar-backdrop only-mobile"
    @click="uiStore.closeMenu()"
  ></div>
  <aside
    class="topbar-drawer drawer-side only-mobile"
    :class="{ 'is-open': uiStore.menuOpen }"
  >
    <div class="drawer-header">
      <span class="drawer-title">导航</span>
      <button class="drawer-close" @click="uiStore.closeMenu()" aria-label="关闭">×</button>
    </div>
    <div class="drawer-body drawer-menu">
      <a
        class="menu-link"
        href="https://sidu.lengmodkx.club/"
        target="_blank" rel="noopener noreferrer"
        @click="uiStore.closeMenu()"
      >
        姊妹项目
        <svg class="external-icon" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path d="M9 2h5v5M14 2L7 9M11 9v4H3V5h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
      <button
        class="menu-link"
        :class="{ active: viewStore.mode === 'narrative' }"
        @click="handleModeSwitch('narrative')"
      >
        叙事模式
      </button>
      <button
        class="menu-link"
        :class="{ active: viewStore.mode === 'explore' }"
        @click="handleModeSwitch('explore')"
      >
        探索模式
      </button>
    </div>
  </aside>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: var(--color-bg-dark, #3D2F1F);
  color: var(--color-bg-paper, #F2E8D0);
  font-family: var(--font-heading, serif);
  flex-shrink: 0;
  padding-top: env(safe-area-inset-top, 0px);
  position: relative;
  z-index: 30;
}

.topbar-brand {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.brand-mark {
  display: none;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--color-accent-red, #C0392B);
  background: var(--color-bg-paper, #F2E8D0);
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

.mode-switch {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 2px;
}

.mode-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--color-bg-paper, #F2E8D0);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 32px;
}

.topbar-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  color: var(--color-bg-paper, #F2E8D0);
  font-family: inherit;
  font-size: 14px;
  text-decoration: none;
  border: 1px solid rgba(242, 232, 208, 0.35);
  border-radius: 3px;
  transition: background-color 0.15s, border-color 0.15s;
  white-space: nowrap;
  min-height: 32px;
}

.topbar-link:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--color-accent-red, #C0392B);
  color: #fff;
}

.topbar-link .external-icon { opacity: 0.75; flex-shrink: 0; }
.topbar-link:hover .external-icon { opacity: 1; }
.mode-btn:hover { background: rgba(255, 255, 255, 0.15); }

.mode-btn.active {
  background: var(--color-accent-red, #C0392B);
  color: #fff;
}

/* ===== 汉堡按钮 ===== */
.hamburger-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: var(--color-bg-paper, #F2E8D0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0;
  border-radius: 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.hamburger-btn span {
  display: block;
  width: 22px;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition: transform 0.2s, opacity 0.2s;
}

.hamburger-btn.is-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger-btn.is-open span:nth-child(2) { opacity: 0; }
.hamburger-btn.is-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.topbar-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 35;
}

.topbar-drawer {
  background: var(--color-bg-dark, #3D2F1F);
  color: var(--color-bg-paper, #F2E8D0);
  top: 0;
}

.topbar-drawer .drawer-header {
  border-bottom-color: rgba(242, 232, 208, 0.2);
  padding-top: calc(10px + env(safe-area-inset-top, 0px));
}

.topbar-drawer .drawer-title {
  color: var(--color-bg-paper, #F2E8D0);
}

.topbar-drawer .drawer-close {
  color: var(--color-bg-paper, #F2E8D0);
}

.drawer-menu {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border: none;
  background: transparent;
  color: var(--color-bg-paper, #F2E8D0);
  font-family: inherit;
  font-size: 15px;
  text-align: left;
  text-decoration: none;
  border-bottom: 1px solid rgba(242, 232, 208, 0.08);
  cursor: pointer;
  min-height: 48px;
  -webkit-tap-highlight-color: transparent;
}

.menu-link:active { background: rgba(255, 255, 255, 0.08); }

.menu-link.active {
  color: var(--color-accent-red, #C0392B);
  background: rgba(192, 57, 43, 0.1);
}

/* ===== 移动端适配 ===== */
@media (max-width: 768px) {
  .topbar { padding: 0 12px; gap: 8px; }
  .topbar-nav { gap: 8px; }
  .brand-text { display: none; }
  .brand-mark { display: inline-flex; }
  .topbar-link, .mode-switch { display: none; }
}
</style>
