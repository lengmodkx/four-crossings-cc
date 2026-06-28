<script setup lang="ts">
/**
 * SidePanel - 详情侧面板
 *
 * 根据 selectionStore 的选中状态条件渲染 ForceDetailCard /
 * EventDetailCard / PersonDetailCard。全空时显示提示文字。
 *
 * 桌面端 (>1024px): 作为内联侧栏固定显示
 * 移动端 (<=1024px): 作为底部抽屉,通过 uiStore.sideOpen 切换
 */
import { computed } from 'vue'
import { useSelectionStore } from '@/stores/selection'
import { useUiStore } from '@/stores/ui'
import { useBreakpoint } from '@/composables/useBreakpoint'
import ForceDetailCard from '@/components/detail/ForceDetailCard.vue'
import EventDetailCard from '@/components/detail/EventDetailCard.vue'
import PersonDetailCard from '@/components/detail/PersonDetailCard.vue'

const selectionStore = useSelectionStore()
const uiStore = useUiStore()
const { isMobile, isTablet } = useBreakpoint()
const onMobileOrTablet = computed(() => isMobile.value || isTablet.value)

function handleClear(): void {
  selectionStore.clear()
  if (onMobileOrTablet.value) uiStore.closeSide()
}
</script>

<template>
  <!-- 桌面端内联 -->
  <aside class="side-panel only-desktop">
    <ForceDetailCard
      v-if="selectionStore.selectedForce"
      :force="selectionStore.selectedForce"
      @close="handleClear"
    />
    <EventDetailCard
      v-else-if="selectionStore.selectedEvent"
      :event="selectionStore.selectedEvent"
      @close="handleClear"
    />
    <PersonDetailCard
      v-else-if="selectionStore.selectedPerson"
      :person="selectionStore.selectedPerson"
      @close="handleClear"
    />
    <div v-else class="empty-state">
      <p class="empty-text">点击部队/事件/人物查看详情</p>
    </div>
  </aside>

  <!-- 移动端底部抽屉 -->
  <div
    class="drawer-backdrop only-mobile"
    :class="{ 'is-open': uiStore.sideOpen }"
    @click="uiStore.closeSide()"
  ></div>
  <aside
    class="drawer side-panel-drawer only-mobile"
    :class="['drawer-bottom', { 'is-open': uiStore.sideOpen }]"
  >
    <div class="drawer-header">
      <span class="drawer-title">详情</span>
      <button class="drawer-close" @click="uiStore.closeSide()" aria-label="关闭">×</button>
    </div>
    <div class="drawer-body">
      <ForceDetailCard
        v-if="selectionStore.selectedForce"
        :force="selectionStore.selectedForce"
        @close="handleClear"
      />
      <EventDetailCard
        v-else-if="selectionStore.selectedEvent"
        :event="selectionStore.selectedEvent"
        @close="handleClear"
      />
      <PersonDetailCard
        v-else-if="selectionStore.selectedPerson"
        :person="selectionStore.selectedPerson"
        @close="handleClear"
      />
      <div v-else class="empty-state">
        <p class="empty-text">点击部队/事件/人物查看详情</p>
      </div>
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

@media (min-width: 769px) and (max-width: 1280px) {
  .side-panel { width: 280px; }
}
</style>
