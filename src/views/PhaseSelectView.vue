<script setup lang="ts">
/**
 * PhaseSelectView — 战役阶段选择页
 *
 * 展示 5 个战役阶段卡片（一/二/三/四渡 + 巧渡金沙江），
 * 每张卡片含名称、日期范围、[叙事]/[探索] 按钮。
 */
import { useRouter } from 'vue-router'
import { PHASES } from '@/stores/time'
import { useViewStore } from '@/stores/view'

const router = useRouter()
const viewStore = useViewStore()

const phaseCards = PHASES.map((phase) => {
  const startDate = phase.start.substring(0, 10)
  const endDate = phase.end.substring(0, 10)
  return {
    ...phase,
    dateRange: `${startDate} — ${endDate}`,
  }
})

function enterNarrative(phaseId: string): void {
  viewStore.setMode('narrative')
  router.push(`/narrative/${phaseId}`)
}

function enterExplore(phaseId: string): void {
  viewStore.setMode('explore')
  router.push(`/explore/${phaseId}`)
}

function goBack(): void {
  router.push('/')
}
</script>

<template>
  <div class="phase-select">
    <button class="back-btn" @click="goBack">← 返回</button>
    <h2 class="phase-title">选择战役阶段</h2>
    <div class="phase-grid">
      <div
        v-for="card in phaseCards"
        :key="card.id"
        class="phase-card"
      >
        <h3 class="card-name">{{ card.name }}</h3>
        <p class="card-date">{{ card.dateRange }}</p>
        <div class="card-actions">
          <button
            class="card-btn narrative-btn"
            @click="enterNarrative(card.id)"
          >
            叙事
          </button>
          <button
            class="card-btn explore-btn"
            @click="enterExplore(card.id)"
          >
            探索
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phase-select {
  min-height: 100vh;
  background: var(--color-bg-paper, #F2E8D0);
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.back-btn {
  align-self: flex-start;
  padding: 8px 16px;
  border: 1px solid var(--color-text-muted, #6B5D4A);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted, #6B5D4A);
  font-family: var(--font-body, serif);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 32px;
}

.back-btn:hover {
  border-color: var(--color-accent-red, #C0392B);
  color: var(--color-accent-red, #C0392B);
}

.phase-title {
  font-family: var(--font-heading, serif);
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-main, #1A1410);
  margin: 0 0 48px;
  letter-spacing: 4px;
}

.phase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1200px;
}

.phase-card {
  background: #fff;
  border: 1px solid var(--color-bg-dark, #3D2F1F);
  border-radius: 6px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s, transform 0.2s;
}

.phase-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-name {
  font-family: var(--font-heading, serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-main, #1A1410);
  margin: 0 0 12px;
}

.card-date {
  font-family: var(--font-body, serif);
  font-size: 14px;
  color: var(--color-text-muted, #6B5D4A);
  margin: 0 0 24px;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-btn {
  flex: 1;
  padding: 10px 0;
  border: 1px solid var(--color-bg-dark, #3D2F1F);
  border-radius: 4px;
  font-family: var(--font-body, serif);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.narrative-btn {
  background: var(--color-bg-dark, #3D2F1F);
  color: var(--color-bg-paper, #F2E8D0);
}

.narrative-btn:hover {
  background: var(--color-text-main, #1A1410);
}

.explore-btn {
  background: transparent;
  color: var(--color-bg-dark, #3D2F1F);
}

.explore-btn:hover {
  background: var(--color-bg-dark, #3D2F1F);
  color: var(--color-bg-paper, #F2E8D0);
}
</style>
