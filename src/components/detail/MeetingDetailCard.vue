<script setup lang="ts">
/**
 * MeetingDetailCard — 会议专题详情卡片
 *
 * Props: meeting (Meeting)
 * 显示: 标题、日期范围、地点、背景、决议、参会人员、来源
 * 古旧军图风格，max-width 800px，居中。
 */
import type { Meeting } from '@/data/types'

defineProps<{
  meeting: Meeting
}>()

function formatDateRange(start: string, end: string): string {
  const s = start.slice(0, 10)
  const e = end.slice(0, 10)
  return s === e ? s : `${s} — ${e}`
}
</script>

<template>
  <article class="meeting-detail-card">
    <header class="meeting-header">
      <h1 class="meeting-title">{{ meeting.name }}</h1>
      <p class="meeting-date">{{ formatDateRange(meeting.date_start, meeting.date_end) }}</p>
      <p v-if="meeting.location" class="meeting-location">
        &#x1F4CD; {{ meeting.location.join(', ') }}
      </p>
    </header>

    <!-- 背景 -->
    <section v-if="meeting.background" class="meeting-section">
      <h2 class="section-heading">背景</h2>
      <p class="section-text">{{ meeting.background }}</p>
    </section>

    <!-- 决议 -->
    <section v-if="meeting.resolutions && meeting.resolutions.length" class="meeting-section">
      <h2 class="section-heading">决议</h2>
      <ul class="resolutions-list">
        <li v-for="(r, idx) in meeting.resolutions" :key="idx">{{ r }}</li>
      </ul>
    </section>

    <!-- 参会人员 -->
    <section v-if="meeting.participants && meeting.participants.length" class="meeting-section">
      <h2 class="section-heading">参会人员</h2>
      <ul class="participants-list">
        <li v-for="(p, idx) in meeting.participants" :key="idx">
          <span class="participant-role">{{ p.role }}</span>
          <span class="participant-id">{{ p.person_id }}</span>
        </li>
      </ul>
    </section>

    <!-- 来源 -->
    <section v-if="meeting.sources && meeting.sources.length" class="meeting-section meeting-sources">
      <p class="sources-label">&#x1F4DC; 史料来源</p>
      <ul class="source-list">
        <li v-for="(src, idx) in meeting.sources" :key="idx">{{ src }}</li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.meeting-detail-card {
  max-width: 800px;
  margin: 32px auto;
  padding: 40px 48px;
  background: var(--color-bg-paper, #F2E8D0);
  border: 1px solid var(--color-bg-dark, #3D2F1F);
  border-radius: 4px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
  font-family: var(--font-body, serif);
}

.meeting-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--color-bg-dark, #3D2F1F);
}

.meeting-title {
  font-family: var(--font-heading, serif);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-main, #1A1410);
  margin: 0 0 8px;
  letter-spacing: 2px;
}

.meeting-date {
  font-size: 14px;
  color: var(--color-text-muted, #6B5D4A);
  margin: 0 0 8px;
}

.meeting-location {
  font-size: 14px;
  color: var(--color-text-muted, #6B5D4A);
  margin: 0;
}

.meeting-section {
  margin-bottom: 28px;
}

.section-heading {
  font-family: var(--font-heading, serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main, #1A1410);
  margin: 0 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-contour, #6B7F4A);
}

.section-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-main, #1A1410);
  margin: 0;
  text-indent: 2em;
}

.resolutions-list {
  margin: 0;
  padding-left: 20px;
}

.resolutions-list li {
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-main, #1A1410);
  margin-bottom: 4px;
}

.participants-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.participants-list li {
  display: flex;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 3px;
  font-size: 13px;
}

.participant-role {
  color: var(--color-text-muted, #6B5D4A);
  flex-shrink: 0;
}

.participant-id {
  color: var(--color-text-main, #1A1410);
}

.meeting-sources {
  padding-top: 16px;
  border-top: 1px solid var(--color-bg-dark, #3D2F1F);
}

.sources-label {
  font-size: 11px;
  color: var(--color-text-muted, #6B5D4A);
  margin: 0 0 4px;
}

.source-list {
  margin: 4px 0 0;
  padding-left: 16px;
  font-size: 11px;
  color: var(--color-text-muted, #6B5D4A);
}

.source-list li {
  margin-bottom: 2px;
}
</style>
