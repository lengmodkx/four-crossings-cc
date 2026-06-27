<script setup lang="ts">
/**
 * NarrativeView — 叙事模式核心视图
 *
 * 布局: TopBar (上) + [MapView2D/MapView3D] 主区 (左) + SidePanel (右) + Timeline (下)
 * onMounted 时加载数据并设置叙事模式。
 */
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useViewStore } from '@/stores/view'
import { useTimeStore } from '@/stores/time'
import { useScenarioStore } from '@/stores/scenario'
import TopBar from '@/components/layout/TopBar.vue'
import MapView2D from '@/components/map2d/MapView2D.vue'
import MapView3D from '@/components/map3d/MapView3D.vue'
import Timeline from '@/components/timeline/Timeline.vue'
import SidePanel from '@/components/layout/SidePanel.vue'

const route = useRoute()
const viewStore = useViewStore()
const timeStore = useTimeStore()
const scenarioStore = useScenarioStore()

const phaseId = computed(() => {
  return (route.params.phaseId as string) || 'first-crossing'
})

onMounted(async () => {
  viewStore.setMode('narrative')
  timeStore.setPhase(phaseId.value)
  if (!scenarioStore.loaded) {
    await scenarioStore.loadAll()
  }
})
</script>

<template>
  <div class="narrative-view">
    <TopBar />
    <div class="narrative-main">
      <div class="map-area">
        <MapView2D v-if="viewStore.render === '2d'" />
        <MapView3D v-else-if="viewStore.render === '3d'" />
      </div>
      <SidePanel />
    </div>
    <Timeline />
  </div>
</template>

<style scoped>
.narrative-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg-paper, #F2E8D0);
}

.narrative-main {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.map-area {
  flex: 1;
  min-width: 0;
  position: relative;
}
</style>
