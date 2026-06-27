<script setup lang="ts">
/**
 * SidePanel — 详情侧面板
 *
 * 根据 selectionStore 的选中状态条件渲染 ForceDetailCard /
 * EventDetailCard / PersonDetailCard。全空时显示提示文字。
 */
import { useSelectionStore } from '@/stores/selection'
import ForceDetailCard from '@/components/detail/ForceDetailCard.vue'
import EventDetailCard from '@/components/detail/EventDetailCard.vue'
import PersonDetailCard from '@/components/detail/PersonDetailCard.vue'

const selectionStore = useSelectionStore()

function handleClear(): void {
  selectionStore.clear()
}
</script>

<template>
  <aside class="side-panel">
    <!-- 部队详情 -->
    <ForceDetailCard
      v-if="selectionStore.selectedForce"
      :force="selectionStore.selectedForce"
      @close="handleClear"
    />

    <!-- 事件详情 -->
    <EventDetailCard
      v-else-if="selectionStore.selectedEvent"
      :event="selectionStore.selectedEvent"
      @close="handleClear"
    />

    <!-- 人物详情 -->
    <PersonDetailCard
      v-else-if="selectionStore.selectedPerson"
      :person="selectionStore.selectedPerson"
      @close="handleClear"
    />

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p class="empty-text">点击部队/事件/人物查看详情</p>
    </div>
  </aside>
</template>

<style scoped>
.side-panel {
  width: 360px;
  border-left: 1px solid var(--color-bg-dark, #3D2F1F);
  overflow-y: auto;
  background: var(--color-bg-paper, #F2E8D0);
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 32px 16px;
}

.empty-text {
  color: var(--color-text-muted, #6B5D4A);
  font-style: italic;
  font-size: 14px;
  text-align: center;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .side-panel {
    width: 100% !important;
    max-height: 40vh;
    border-left: none;
    border-top: 1px solid var(--color-bg-dark, #3D2F1F);
  }
}

@media (min-width: 769px) and (max-width: 1280px) {
  .side-panel {
    width: 280px !important;
  }
}
</style>
