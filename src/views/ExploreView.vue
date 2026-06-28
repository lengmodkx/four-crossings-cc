<script setup lang="ts">
/**
 * ExploreView 鈥?鎺㈢储妯″紡鏍稿績瑙嗗浘
 *
 * 甯冨眬: TopBar (涓? + FilterPanel (宸? + MapView2D 涓诲尯 (鍙? + Timeline (涓?
 * onMounted 鏃跺姞杞芥暟鎹苟璁剧疆鎺㈢储妯″紡銆? *
 * Bug Fix: 鎹曡幏 mapReady 浜嬩欢锛屾覆鏌?ForceMarker / TrajectoryLine / EventPin
 * 鍒?MapLibre 鍦板浘瀹炰緥涓娿€傞泦鎴?FilterPanel 绛涢€夌姸鎬併€? */
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useViewStore } from '@/stores/view'
import { useTimeStore } from '@/stores/time'
import { useScenarioStore } from '@/stores/scenario'
import type { EventRecord, ForceFeature, ForcesCollection, TrajectoriesCollection, EventType } from '@/data/types'
import { EVENT_TYPES } from '@/data/types'
import TopBar from '@/components/layout/TopBar.vue'
import MapView2D from '@/components/map2d/MapView2D.vue'
import Timeline from '@/components/timeline/Timeline.vue'
import FilterPanel from '@/components/common/FilterPanel.vue'
import LoadingCompass from '@/components/common/LoadingCompass.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import ForceMarker from '@/components/map2d/ForceMarker.vue'
import TrajectoryLine from '@/components/map2d/TrajectoryLine.vue'
import EventPin from '@/components/map2d/EventPin.vue'
import { useForceMarkers } from '@/components/map2d/useForceMarkers'
import { useTrajectories } from '@/components/map2d/useTrajectories'
import { useSelectionStore } from '@/stores/selection'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const viewStore = useViewStore()
const timeStore = useTimeStore()
const scenarioStore = useScenarioStore()
const selectionStore = useSelectionStore()
const uiStore = useUiStore()

// Pinia store refs (storeToRefs preserves Ref<> wrapper for composable type compatibility)
const { currentTime, currentPhase } = storeToRefs(timeStore)

const loadError = ref(false)

// ===== 鍦板浘瀹炰緥 (鐢?MapView2D @mapReady 濉厖) =====
// 浣跨敤 any 缁曡繃 maplibre-gl 绉佹湁鎴愬憳绫诲瀷妫€鏌?// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapInstance = ref<any>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleMapReady(map: any): void {
  mapInstance.value = map
}

// ===== 绛涢€夌姸鎬?=====
const showRed = ref<boolean>(true)
const showBlue = ref<boolean>(true)
const selectedEventTypes = ref<Set<EventType>>(new Set(EVENT_TYPES))

// ===== 閮ㄩ槦鏁版嵁 (鍖呰涓?ForcesCollection 渚?useForceMarkers 浣跨敤) =====
const forcesCollection = computed<ForcesCollection | null>(() => {
  if (!scenarioStore.forces.length) return null
  return {
    type: 'FeatureCollection',
    features: scenarioStore.forces,
  }
})

// ===== 杞ㄨ抗鏁版嵁 (鍖呰涓?TrajectoriesCollection 渚?useTrajectories 浣跨敤) =====
const trajectoriesCollection = computed<TrajectoriesCollection | null>(() => {
  if (!scenarioStore.trajectories.length) return null
  return {
    type: 'FeatureCollection',
    features: scenarioStore.trajectories,
  }
})

// ===== 娲昏穬閮ㄩ槦鏍囪 (鎸夊綋鍓嶆椂闂寸瓫閫? =====
const { activeForces } = useForceMarkers(forcesCollection, currentTime)

// ===== 鍙杞ㄨ抗 (鎸夐樁娈?+ 鏃堕棿閲嶅彔绛涢€? =====
const { visibleTrajectories } = useTrajectories(
  trajectoriesCollection,
  currentPhase,
  currentTime,
)

// ===== 绛涢€夊悗鐨勯儴闃?(闃佃惀绛涢€? =====
const filteredForces = computed<ForceFeature[]>(() => {
  return activeForces.value.filter((f) => {
    const side = f.properties.side
    if (side === 'red' && !showRed.value) return false
    if (side === 'blue' && !showBlue.value) return false
    return true
  })
})

// ===== 绛涢€夊悗鐨勪簨浠?(绫诲瀷 + 闃舵) =====
const filteredEvents = computed<EventRecord[]>(() => {
  const { start, end } = timeStore.phaseRange
  return scenarioStore.events.filter((e) => {
    if (!selectedEventTypes.value.has(e.type)) return false
    if (e.timestamp < start || e.timestamp > end) return false
    return true
  })
})

// ===== 鐐瑰嚮澶勭悊 =====
function handleForceClick(force: ForceFeature): void {
  selectionStore.selectForce(force)
}

function handleEventClick(evt: EventRecord): void {
  timeStore.setTime(evt.timestamp)
  selectionStore.selectEvent(evt)
}

const phaseId = computed(() => {
  return (route.params.phaseId as string) || 'first-crossing'
})

async function loadData(): Promise<void> {
  loadError.value = false
  try {
    await scenarioStore.loadAll()
  } catch {
    loadError.value = true
  }
}

onMounted(async () => {
  viewStore.setMode('explore')
  timeStore.setPhase(phaseId.value)
  if (!scenarioStore.loaded) {
    await loadData()
  }
})
</script>

<template>
  <div class="explore-view">
    <TopBar />
    <!-- 鍔犺浇/閿欒鐘舵€?-->
    <div v-if="!scenarioStore.loaded && !loadError" class="load-state">
      <LoadingCompass />
    </div>
    <div v-else-if="loadError" class="load-state">
      <ErrorState message="鍙叉枡鍔犺浇澶辫触" @retry="loadData()" />
    </div>
    <template v-else>
      <div class="explore-main">
        <FilterPanel />
        <div class="map-area">
          <MapView2D @map-ready="handleMapReady" />

          <!-- 鍦板浘鍙犲姞灞? 閮ㄩ槦鏍囪 / 琛屽啗杞ㄨ抗 / 浜嬩欢鏍囪 -->
          <div v-if="mapInstance" style="display:none">
            <ForceMarker
              v-for="force in filteredForces"
              :key="force.properties.id"
              :map="mapInstance"
              :feature="force"
              @click="handleForceClick(force)"
            />
            <TrajectoryLine
              v-for="traj in visibleTrajectories"
              :key="traj.properties.id"
              :map="mapInstance"
              :feature="traj"
            />
            <EventPin
              v-for="evt in filteredEvents"
              :key="evt.id"
              :map="mapInstance"
              :event="evt"
              @click="handleEventClick(evt)"
            />
          </div>

          <!-- 移动端 FAB: 唤起筛选抽屉 -->
          <button
            class="fab explore-fab only-mobile"
            :class="{ 'is-active': uiStore.filterOpen }"
            @click="uiStore.toggleFilter()"
            aria-label="切换目录"
            title="切换目录"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 6h18M6 12h12M10 18h4"/>
            </svg>
          </button>
        </div>
      </div>
      <Timeline />
    </template>
  </div>
</template>

<style scoped>
.explore-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg-paper, #F2E8D0);
}
.explore-main {
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
.load-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.explore-fab {
  top: calc(64px + env(safe-area-inset-top, 0px));
  right: 16px;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .explore-view .explore-main {
    flex-direction: column;
  }
  /* 桌面端 inline 面板在中等屏也隐藏,统一走 FAB */
  .explore-main > .filter-panel { display: none !important; }
}
</style>





