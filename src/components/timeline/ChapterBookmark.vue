<script setup lang="ts">
/**
 * ChapterBookmark — 阶段切换书签
 *
 * 全屏覆盖，显示当前阶段名称、日期范围与引言。
 * 淡入后 2.5 秒自动淡出，不可交互。
 */
import { computed } from 'vue'
import { useTimeStore, PHASES } from '@/stores/time'

const timeStore = useTimeStore()

const quoteMap: Record<string, string> = {
  'first-crossing': '扎西整编，挥戈西指',
  'second-crossing': '回师黔北，再渡赤水',
  'third-crossing': '三渡赤水，佯动惑敌',
  'fourth-crossing': '四渡赤水，跳出合围',
  'jinsha-river': '巧渡金沙江，挥师北上',
}

const currentPhaseDef = computed(() => {
  return PHASES.find((p) => p.id === timeStore.currentPhase)
})

const quote = computed(() => {
  return quoteMap[timeStore.currentPhase] || ''
})

const dateRange = computed(() => {
  const phase = currentPhaseDef.value
  if (!phase) return ''
  return `${phase.start.slice(0, 10)} — ${phase.end.slice(0, 10)}`
})
</script>

<template>
  <div class="chapter-bookmark">
    <div class="bookmark-card">
      <h2 class="bookmark-phase">{{ currentPhaseDef?.name || timeStore.currentPhase }}</h2>
      <p class="bookmark-date">{{ dateRange }}</p>
      <blockquote class="bookmark-quote" v-if="quote">{{ quote }}</blockquote>
    </div>
  </div>
</template>

<style scoped>
.chapter-bookmark {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 20, 16, 0.85);
  animation: bookmark-in 0.4s ease-out;
  pointer-events: none;
}

.bookmark-card {
  text-align: center;
  padding: 48px 64px;
  border: 2px solid rgba(242, 232, 208, 0.3);
  border-radius: 8px;
  background: rgba(36, 28, 18, 0.9);
  animation: card-enter 0.4s ease-out;
}

.bookmark-phase {
  font-family: LXGWWenKai, var(--font-heading, serif);
  font-size: 36px;
  font-weight: 700;
  color: var(--color-bg-paper, #F2E8D0);
  margin: 0 0 12px;
  letter-spacing: 6px;
}

.bookmark-date {
  font-family: var(--font-body, serif);
  font-size: 15px;
  color: var(--color-text-muted, #6B5D4A);
  margin: 0 0 20px;
  letter-spacing: 3px;
}

.bookmark-quote {
  font-family: var(--font-body, serif);
  font-size: 16px;
  font-style: italic;
  color: var(--color-highlight, #D4A017);
  margin: 0;
  padding: 12px 0 0;
  border-top: 1px solid rgba(242, 232, 208, 0.15);
  letter-spacing: 2px;
}

@keyframes bookmark-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes card-enter {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
