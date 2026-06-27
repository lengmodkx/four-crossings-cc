<script setup lang="ts">
/**
 * ExploreView — 探索模式核心视图
 *
 * 布局: TopBar (上) + FilterPanel (左) + MapView2D 主区 (右) + Timeline (下)
 * onMounted 时加载数据并设置探索模式。
 *
 * Bug Fix: 捕获 mapReady 事件，渲染 ForceMarker / TrajectoryLine / EventPin
 * 到 MapLibre 地图实例上。集成 FilterPanel 筛选状态。
 */
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

const route = useRoute()
const viewStore = useViewStore()
const timeStore = useTimeStore()
const scenarioStore = useScenarioStore()
const selectionStore = useSelectionStore()

// Pinia store refs (storeToRefs preserves Ref<> wrapper for composable type compatibility)
const { currentTime, currentPhase } = storeToRefs(timeStore)

const loadError = ref(false)

// ===== 地图实例 (由 MapView2D @mapReady 填充) =====
// 使用 any 绕过 maplibre-gl 私有成员类型检查
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapInstance = ref<any>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleMapReady(map: any): void {
  mapInstance.value = map
}

// ===== 筛选状态 =====
const showRed = ref<boolean>(true)
const showBlue = ref<boolean>(true)
const selectedEventTypes = ref<Set<EventType>>(new Set(EVENT_TYPES))

// ===== 部队数据 (包装为 ForcesCollection 供 useForceMarkers 使用) =====
const forcesCollection = computed<ForcesCollection | null>(() => {
  if (!scenarioStore.forces.length) return null
  return {
    type: 'FeatureCollection',
    features: scenarioStore.forces,
  }
})

// ===== 轨迹数据 (包装为 TrajectoriesCollection 供 useTrajectories 使用) =====
const trajectoriesCollection = computed<TrajectoriesCollection | null>(() => {
  if (!scenarioStore.trajectories.length) return null
  return {
    type: 'FeatureCollection',
    features: scenarioStore.trajectories,
  }
})

// ===== 活跃部队标记 (按当前时间筛选) =====
const { activeForces } = useForceMarkers(forcesCollection, currentTime)

// ===== 可见轨迹 (按阶段 + 时间重叠筛选) =====
const { visibleTrajectories } = useTrajectories(
  trajectoriesCollection,
  currentPhase,
  currentTime,
)

// ===== 筛选后的部队 (阵营筛选) =====
const filteredForces = computed<ForceFeature[]>(() => {
  return activeForces.value.filter((f) => {
    const side = f.properties.side
    if (side === 'red' && !showRed.value) return false
    if (side === 'blue' && !showBlue.value) return false
    return true
  })
})

// ===== 筛选后的事件 (类型 + 阶段) =====
const filteredEvents = computed<EventRecord[]>(() => {
  const { start, end } = timeStore.phaseRange
  return scenarioStore.events.filter((e) => {
    if (!selectedEventTypes.value.has(e.type)) return false
    if (e.timestamp < start || e.timestamp > end) return false
    return true
  })
})

// ===== 点击处理 =====
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
    <!-- 加载/错误状态 -->
    <div v-if="!scenarioStore.loaded && !loadError" class="load-state">
      <LoadingCompass />
    </div>
    <div v-else-if="loadError" class="load-state">
      <ErrorState message="史料加载失败" @retry="loadData()" />
    </div>
    <template v-else>
      <div class="explore-main">
        <FilterPanel />
        <div class="map-area">
          <MapView2D @map-ready="handleMapReady" />

          <!-- 地图叠加层: 部队标记 / 行军轨迹 / 事件标记 -->
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

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .explore-view .explore-main {
    flex-direction: column;
  }
}

@media (min-width: 769px) and (max-width: 1280px) {
  /* 中等屏幕保留侧栏 */
}
</style>
