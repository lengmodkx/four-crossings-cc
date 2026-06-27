<script setup lang="ts">
/**
 * ForceDetailCard — 部队详情卡片
 *
 * Props: force (ForceFeature)
 * 显示: 部队名(h2, 红军红/敌军蓝)、指挥员/兵力/状态/下一站/来源
 */
import type { ForceFeature } from '@/data/types'

defineProps<{
  force: ForceFeature
}>()

const emit = defineEmits<{
  close: []
}>()

function handleClose(): void {
  emit('close')
}
</script>

<template>
  <article
    class="force-detail-card"
    :class="{ 'side-red': force.properties.side === 'red', 'side-blue': force.properties.side === 'blue' }"
  >
    <div class="card-header">
      <h2 class="card-title">
        <span class="side-dot" :class="force.properties.side"></span>
        {{ force.properties.name }}
      </h2>
      <button class="close-btn" @click="handleClose" title="关闭">&times;</button>
    </div>
    <dl class="card-details">
      <div class="detail-row">
        <dt>指挥员</dt>
        <dd>{{ force.properties.commander }}</dd>
      </div>
      <div class="detail-row">
        <dt>兵力</dt>
        <dd>{{ force.properties.strength.toLocaleString() }} 人</dd>
      </div>
      <div class="detail-row">
        <dt>状态</dt>
        <dd>{{ force.properties.status }}</dd>
      </div>
      <div v-if="force.properties.next_destination" class="detail-row">
        <dt>下一站</dt>
        <dd>{{ force.properties.next_destination }}</dd>
      </div>
      <div class="detail-row">
        <dt>时间</dt>
        <dd>{{ force.properties.timestamp }}</dd>
      </div>
    </dl>
    <div class="card-source">
      &#x1F4DC; 来源: {{ force.properties.source }}
    </div>
  </article>
</template>

<style scoped>
.force-detail-card {
  padding: 16px;
  border-bottom: 1px solid var(--color-bg-dark, #3D2F1F);
}

.force-detail-card.side-red {
  border-left: 4px solid var(--color-accent-red, #C0392B);
}

.force-detail-card.side-blue {
  border-left: 4px solid var(--color-accent-blue, #2C5F7C);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-family: var(--font-heading, serif);
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.side-red .card-title {
  color: var(--color-accent-red, #C0392B);
}

.side-blue .card-title {
  color: var(--color-accent-blue, #2C5F7C);
}

.side-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.side-dot.red {
  background: var(--color-accent-red, #C0392B);
}

.side-dot.blue {
  background: var(--color-accent-blue, #2C5F7C);
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

.card-details {
  margin: 0 0 16px;
  padding: 0;
}

.detail-row {
  display: flex;
  padding: 4px 0;
  border-bottom: 1px dotted var(--color-contour, #6B7F4A);
}

.detail-row dt {
  width: 72px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-muted, #6B5D4A);
  padding-top: 1px;
}

.detail-row dd {
  flex: 1;
  margin: 0;
  font-size: 14px;
  color: var(--color-text-main, #1A1410);
}

.card-source {
  font-size: 11px;
  color: var(--color-text-muted, #6B5D4A);
  margin-top: 8px;
}
</style>
