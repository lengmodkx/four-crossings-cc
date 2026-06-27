<script setup lang="ts">
/**
 * TopBar — 顶部导航栏
 *
 * 品牌名 + 模式切换 (narrative/explore)。
 * 使用 useViewStore 管理视图状态，useRouter 导航。
 */
import { useRouter } from 'vue-router'
import { useViewStore } from '@/stores/view'
import type { ViewMode } from '@/stores/view'

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
      <a
        class="topbar-link"
        href="https://sidu.lengmodkx.club/"
        target="_blank"
        rel="noopener noreferrer"
        title="姊妹项目 · sidu-red-river (轻量版,新窗口打开)"
      >
        <span>姊妹项目</span>
        <svg class="external-icon" viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
          <path d="M9 2h5v5M14 2L7 9M11 9v4H3V5h4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
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
}
.topbar-link:hover {
 background: rgba(255, 255, 255, 0.12);
 border-color: var(--color-accent-red, #C0392B);
 color: #fff;
}
.topbar-link .external-icon {
 opacity: 0.75;
 flex-shrink: 0;
}
.topbar-link:hover .external-icon {
 opacity: 1;
}
.mode-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.mode-btn.active {
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
  .mode-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>
