<script setup lang="ts">
/**
 * TopBar — 顶部导航栏
 *
 * 品牌名 + 模式切换 (narrative/explore) + 渲染切换 (2D/3D)。
 * 使用 useViewStore 管理视图状态，useRouter 导航。
 */
import { useRouter } from 'vue-router'
import { useViewStore } from '@/stores/view'
import type { ViewMode, RenderMode } from '@/stores/view'

const router = useRouter()
const viewStore = useViewStore()

function handleModeSwitch(mode: ViewMode): void {
  viewStore.setMode(mode)
  const currentPath = router.currentRoute.value.path
  if (mode === 'narrative' && !currentPath.startsWith('/narrative')) {
    router.push('/narrative/first-crossing')
  } else if (mode === 'explore' && !currentPath.startsWith('/explore')) {
    router.push('/explore/first-crossing')
  }
}

function handleRenderSwitch(render: RenderMode): void {
  viewStore.setRender(render)
}

function goHome(): void {
  router.push('/')
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-brand" @click="goHome">
      <span class="brand-text">四渡赤水·全景沙盘</span>
    </div>
    <nav class="topbar-nav">
      <div class="mode-switch">
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
      <div class="render-switch">
        <button
          class="render-btn"
          :class="{ active: viewStore.render === '2d' }"
          @click="handleRenderSwitch('2d')"
        >
          2D
        </button>
        <button
          class="render-btn"
          :class="{ active: viewStore.render === '3d' }"
          @click="handleRenderSwitch('3d')"
        >
          3D
        </button>
      </div>
    </nav>
  </header>
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
}

.topbar-brand {
  cursor: pointer;
  user-select: none;
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
}

.topbar-nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

.mode-switch,
.render-switch {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 2px;
}

.mode-btn,
.render-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 3px;
  background: transparent;
  color: var(--color-bg-paper, #F2E8D0);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover,
.render-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.mode-btn.active,
.render-btn.active {
  background: var(--color-accent-red, #C0392B);
  color: #fff;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .topbar {
    padding: 0.5rem;
    gap: 0.5rem;
    font-size: 0.85rem;
  }
  .brand-text {
    font-size: 14px;
    letter-spacing: 1px;
  }
  .topbar-nav {
    gap: 8px;
  }
  .mode-btn,
  .render-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
  .render-switch button:nth-child(2) {
    display: none;
  }
}
</style>
