<script setup lang="ts">
/**
 * PersonDetailCard — 人物详情卡片
 *
 * Props: person (Person)
 * 显示: 姓名/角色、关键决策列表 (timestamp + decision)
 */
import type { Person } from '@/data/types'

defineProps<{
  person: Person
}>()

const emit = defineEmits<{
  close: []
}>()

function handleClose(): void {
  emit('close')
}
</script>

<template>
  <article class="person-detail-card">
    <div class="card-header">
      <h2 class="card-title">{{ person.name }}</h2>
      <button class="close-btn" @click="handleClose" title="关闭">&times;</button>
    </div>

    <p class="card-role">{{ person.role }}</p>

    <div v-if="person.key_decisions.length > 0" class="decisions-section">
      <h3 class="decisions-heading">关键决策</h3>
      <ul class="decisions-list">
        <li
          v-for="(decision, idx) in person.key_decisions"
          :key="idx"
          class="decision-item"
        >
          <time class="decision-time">{{ decision.timestamp }}</time>
          <p class="decision-text">{{ decision.decision }}</p>
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.person-detail-card {
  padding: 16px;
  border-bottom: 1px solid var(--color-bg-dark, #3D2F1F);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 4px;
}

.card-title {
  font-family: var(--font-heading, serif);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-main, #1A1410);
  margin: 0;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted, #6B5D4A);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--color-accent-red, #C0392B);
}

.card-role {
  font-size: 14px;
  color: var(--color-text-muted, #6B5D4A);
  margin: 0 0 16px;
}

.decisions-section {
  margin-top: 8px;
}

.decisions-heading {
  font-family: var(--font-heading, serif);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-bg-dark, #3D2F1F);
  margin: 0 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-bg-dark, #3D2F1F);
}

.decisions-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.decision-item {
  padding: 8px 0;
  border-bottom: 1px dotted var(--color-contour, #6B7F4A);
}

.decision-item:last-child {
  border-bottom: none;
}

.decision-time {
  font-size: 11px;
  color: var(--color-text-muted, #6B5D4A);
}

.decision-text {
  font-size: 14px;
  color: var(--color-text-main, #1A1410);
  margin: 4px 0 0;
  line-height: 1.5;
}
</style>
