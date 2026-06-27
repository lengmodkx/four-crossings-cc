<script setup lang="ts">
/**
 * MeetingView — 会议专题页
 *
 * 根据 route.params.meetingId 从 scenarioStore 查找会议并渲染 MeetingDetailCard。
 * onMounted 时加载数据。
 */
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useScenarioStore } from '@/stores/scenario'
import type { Meeting } from '@/data/types'
import MeetingDetailCard from '@/components/detail/MeetingDetailCard.vue'

const route = useRoute()
const scenarioStore = useScenarioStore()

const meetingId = computed<string>(() => {
  return route.params.meetingId as string
})

const meeting = computed<Meeting | undefined>(() => {
  return scenarioStore.meetings.find((m) => m.id === meetingId.value)
})

onMounted(async () => {
  if (!scenarioStore.loaded) {
    await scenarioStore.loadAll()
  }
})
</script>

<template>
  <div class="meeting-view">
    <MeetingDetailCard v-if="meeting" :meeting="meeting" />
    <div v-else class="not-found">
      <h2>未找到该会议</h2>
      <p>会议 ID: {{ meetingId }}</p>
    </div>
  </div>
</template>

<style scoped>
.meeting-view {
  min-height: 100vh;
  background: var(--color-bg-paper, #F2E8D0);
  padding: 16px;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  font-family: var(--font-body, serif);
  color: var(--color-text-muted, #6B5D4A);
}
</style>
