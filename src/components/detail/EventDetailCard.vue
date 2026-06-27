<script setup lang="ts">
/**
 * EventDetailCard — 事件详情卡片
 *
 * Props: event (EventRecord)
 * 显示: 标题、类型标签、时间、参战部队列表、结果标签、双方伤亡、描述、来源列表
 */
import type { EventRecord } from '@/data/types'

defineProps<{
  event: EventRecord
}>()

const emit = defineEmits<{
  close: []
}>()

const typeLabels: Record<string, string> = {
  battle: '战斗',
  meeting: '会议',
  crossing: '渡河',
  maneuver: '机动',
}

const outcomeLabels: Record<string, string> = {
  'red-advance': '红军推进',
  'red-retreat': '红军撤退',
  'blue-advance': '敌军推进',
  'blue-retreat': '敌军撤退',
  'stalemate': '对峙',
}

function handleClose(): void {
  emit('close')
}
</script>

<template>
  <article class="event-detail-card">
    <div class="card-header">
      <h2 class="card-title">{{ event.title }}</h2>
      <button class="close-btn" @click="handleClose" title="关闭">&times;</button>
    </div>

    <div class="card-tags">
      <span class="tag type-tag">{{ typeLabels[event.type] || event.type }}</span>
      <span class="tag outcome-tag">{{ outcomeLabels[event.outcome] || event.outcome }}</span>
    </div>

    <dl class="card-details">
      <div class="detail-row">
        <dt>时间</dt>
        <dd>{{ event.timestamp }}</dd>
      </div>
      <div v-if="event.duration_hours" class="detail-row">
        <dt>持续</dt>
        <dd>{{ event.duration_hours }} 小时</dd>
      </div>
      <div class="detail-row">
        <dt>参战部队</dt>
        <dd>{{ event.participants.length > 0 ? event.participants.join(', ') : '未知' }}</dd>
      </div>
      <div v-if="event.casualties_red || event.casualties_blue" class="detail-row">
        <dt>伤亡</dt>
        <dd>
          <span v-if="event.casualties_red" class="casualty-red">红军 {{ event.casualties_red.toLocaleString() }}</span>
          <span v-if="event.casualties_red && event.casualties_blue" class="sep"> / </span>
          <span v-if="event.casualties_blue" class="casualty-blue">敌军 {{ event.casualties_blue.toLocaleString() }}</span>
        </dd>
      </div>
    </dl>

    <p class="card-description">{{ event.description }}</p>

    <div v-if="event.sources.length > 0" class="card-sources">
      &#x1F4DC; 来源:
      <ul class="source-list">
        <li v-for="(src, idx) in event.sources" :key="idx">{{ src }}</li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.event-detail-card {
  padding: 16px;
  border-bottom: 1px solid var(--color-bg-dark, #3D2F1F);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
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

.card-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.type-tag {
  background: var(--color-bg-dark, #3D2F1F);
  color: var(--color-bg-paper, #F2E8D0);
}

.outcome-tag {
  background: var(--color-highlight, #D4A017);
  color: var(--color-text-main, #1A1410);
}

.card-details {
  margin: 0 0 12px;
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
}

.detail-row dd {
  flex: 1;
  margin: 0;
  font-size: 13px;
  color: var(--color-text-main, #1A1410);
}

.casualty-red {
  color: var(--color-accent-red, #C0392B);
}

.casualty-blue {
  color: var(--color-accent-blue, #2C5F7C);
}

.sep {
  color: var(--color-text-muted, #6B5D4A);
}

.card-description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-main, #1A1410);
  margin: 0 0 12px;
}

.card-sources {
  font-size: 11px;
  color: var(--color-text-muted, #6B5D4A);
}

.source-list {
  margin: 4px 0 0;
  padding-left: 16px;
}

.source-list li {
  margin-bottom: 2px;
}
</style>
