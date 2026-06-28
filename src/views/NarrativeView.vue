<script setup lang="ts">
/**
 * NarrativeView - 叙事模式核心视图
 *
 * 布局: TopBar (顶) + MapView2D 主区 (左) + SidePanel (右) + Timeline (底)
 * onMounted 时加载数据并设置叙事模式。
 * 当前事件与时间同步时,在 SidePanel 顶部显示旁白文字。
 *
 * Bug Fix: 捕获 mapReady 事件,挂载 ForceMarker / TrajectoryLine / EventPin
 * 到 MapLibre 地图实例中。集成 FilterPanel 筛选状态。
 */
import { onMounted, computed, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useViewStore } from '@/stores/view'
import { useTimeStore } from '@/stores/time'
import { useScenarioStore } from '@/stores/scenario'
import { parseTime } from '@/stores/time'
import type { EventRecord, ForceFeature, ForcesCollection, TrajectoriesCollection } from '@/data/types'
import TopBar from '@/components/layout/TopBar.vue'
import MapView2D from '@/components/map2d/MapView2D.vue'
import Timeline from '@/components/timeline/Timeline.vue'
import SidePanel from '@/components/layout/SidePanel.vue'
import ChapterBookmark from '@/components/timeline/ChapterBookmark.vue'
import LoadingCompass from '@/components/common/LoadingCompass.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import ForceMarker from '@/components/map2d/ForceMarker.vue'
import TrajectoryLine from '@/components/map2d/TrajectoryLine.vue'
import EventPin from '@/components/map2d/EventPin.vue'
import { useForceMarkers } from '@/components/map2d/useForceMarkers'
import { useTrajectories } from '@/components/map2d/useTrajectories'
import { useSelectionStore } from '@/stores/selection'
import { useUiStore } from '@/stores/ui'
import { useBreakpoint } from '@/composables/useBreakpoint'

const route = useRoute()
const viewStore = useViewStore()
const timeStore = useTimeStore()
const scenarioStore = useScenarioStore()
const selectionStore = useSelectionStore()
const uiStore = useUiStore()
const { isMobile, isTablet } = useBreakpoint()
const onMobileOrTablet = computed(() => isMobile.value || isTablet.value)

const { currentTime, currentPhase } = storeToRefs(timeStore)
const loadError = ref(false)

const mapInstance = ref<any>(null)
function handleMapReady(map: any): void { mapInstance.value = map }

const forcesCollection = computed<ForcesCollection | null>(() => {
  if (!scenarioStore.forces.length) return null
  return { type: 'FeatureCollection', features: scenarioStore.forces }
})
const trajectoriesCollection = computed<TrajectoriesCollection | null>(() => {
  if (!scenarioStore.trajectories.length) return null
  return { type: 'FeatureCollection', features: scenarioStore.trajectories }
})

const { activeForces } = useForceMarkers(forcesCollection, currentTime)
const { visibleTrajectories } = useTrajectories(
  trajectoriesCollection, currentPhase, currentTime,
)

const currentPhaseEvents = computed<EventRecord[]>(() => {
  const { start, end } = timeStore.phaseRange
  return scenarioStore.events.filter(e => e.timestamp >= start && e.timestamp <= end)
})

function handleForceClick(force: ForceFeature): void { selectionStore.selectForce(force) }
function handleEventClick(evt: EventRecord): void {
  timeStore.setTime(evt.timestamp)
  selectionStore.selectEvent(evt)
  if (onMobileOrTablet.value) uiStore.openSide()
}

async function loadData(): Promise<void> {
  loadError.value = false
  try { await scenarioStore.loadAll() } catch { loadError.value = true }
}

const phaseId = computed(() => (route.params.phaseId as string) || 'first-crossing')

const currentEvent = computed<EventRecord | null>(() => {
  if (!scenarioStore.events.length) return null
  const now = parseTime(timeStore.currentTime)
  for (const evt of scenarioStore.events) {
    const tStart = parseTime(evt.timestamp)
    const hours = evt.duration_hours ?? 1
    const tEnd = new Date(tStart.getTime() + hours * 3600_000)
    if (now >= tStart && now <= tEnd) return evt
  }
  return null
})

const showBookmark = ref(false)
let bookmarkTimer: ReturnType<typeof setTimeout> | null = null
watch(() => timeStore.currentPhase, () => {
  showBookmark.value = true
  if (bookmarkTimer) clearTimeout(bookmarkTimer)
  bookmarkTimer = setTimeout(() => { showBookmark.value = false }, 2500)
})

onMounted(async () => {
  viewStore.setMode('narrative')
  timeStore.setPhase(phaseId.value)
  if (!scenarioStore.loaded) await loadData()
})
</script>

<template>
  <div class="narrative-view">
    <TopBar />
    <div v-if="!scenarioStore.loaded && !loadError" class="load-state">
      <LoadingCompass />
    </div>
    <div v-else-if="loadError" class="load-state">
      <ErrorState message="史料加载失败" @retry="loadData()" />
    </div>
    <template v-else>
      <div class="narrative-main">
        <div class="map-area">
          <MapView2D @map-ready="handleMapReady" />

          <div v-if="mapInstance" style="display:none">
            <ForceMarker v-for="force in activeForces" :key="force.properties.id" :map="mapInstance" :feature="force" @click="handleForceClick(force)" />
            <TrajectoryLine v-for="traj in visibleTrajectories" :key="traj.properties.id" :map="mapInstance" :feature="traj" />
            <EventPin v-for="evt in currentPhaseEvents" :key="evt.id" :map="mapInstance" :event="evt" @click="handleEventClick(evt)" />
          </div>

          <div v-if="currentEvent" class="narration-overlay">
            <h3 class="narration-title">{{ currentEvent.title }}</h3>
            <p class="narration-desc">{{ currentEvent.description }}</p>
          </div>

          <!-- 移动端 FAB: 唤起详情抽屉 -->
          <button
            class="fab narrative-fab only-mobile"
            :class="{ 'is-active': uiStore.sideOpen }"
            @click="uiStore.toggleSide()"
            aria-label="查看详情"
            title="查看详情"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h10"/>
            </svg>
          </button>
        </div>
        <SidePanel />
      </div>
      <Timeline />
    </template>
    <ChapterBookmark v-if="showBookmark" class="chapter-bookmark-layer" />
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
.narration-overlay {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  max-width: 600px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  color: #f0f0f0;
  font-family: var(--font-body, serif);
  z-index: 10;
  pointer-events: none;
}
.narration-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  font-family: var(--font-heading, serif);
}
.narration-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #e0e0e0;
}
.load-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chapter-bookmark-layer {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100;
}
.narrative-fab {
  top: calc(64px + env(safe-area-inset-top, 0px));
  right: 16px;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .narrative-view .narrative-main {
    flex-direction: column;
  }
  .narrative-main > .side-panel { display: none !important; }
  .narration-overlay {
    left: 8px;
    right: 8px;
    bottom: 8px;
    padding: 8px 12px;
  }
  .narration-title { font-size: 13px; }
  .narration-desc { font-size: 11px; line-height: 1.4; }
}
</style>
