<script setup lang="ts">
/**
 * NarrativeView — 叙事模式核心视图
 *
 * 布局: TopBar (上) + [MapView2D/MapView3D] 主区 (左) + SidePanel (右) + Timeline (下)
 * onMounted 时加载数据并设置叙事模式。
 * 当前事件与时间同步时，在 SidePanel 顶部显示旁白文字。
 *
 * Bug Fix: 捕获 mapReady 事件，渲染 ForceMarker / TrajectoryLine / EventPin
 * 到 MapLibre 地图实例上。
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
import MapView3D from '@/components/map3d/MapView3D.vue'
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

const route = useRoute()
const viewStore = useViewStore()
const timeStore = useTimeStore()
const scenarioStore = useScenarioStore()
const selectionStore = useSelectionStore()

// Pinia store refs (storeToRefs preserves Ref<> wrapper for composable type compatibility)
const { currentTime, currentPhase } = storeToRefs(timeStore)

const loadError = ref(false)

// ===== 地图实例 (由 MapView2D @mapReady 填充) =====
// 使用 any 绕过 maplibre-gl 私有成员类型检查 (_setupResizeObserver 等)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapInstance = ref<any>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleMapReady(map: any): void {
  mapInstance.value = map
}

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

// ===== 当前阶段事件 =====
const currentPhaseEvents = computed<EventRecord[]>(() => {
  const { start, end } = timeStore.phaseRange
  return scenarioStore.events.filter(
    (e) => e.timestamp >= start && e.timestamp <= end,
  )
})

// ===== 点击处理 =====
function handleForceClick(force: ForceFeature): void {
  selectionStore.selectForce(force)
}

function handleEventClick(evt: EventRecord): void {
  timeStore.setTime(evt.timestamp)
  selectionStore.selectEvent(evt)
}

async function loadData(): Promise<void> {
  loadError.value = false
  try {
    await scenarioStore.loadAll()
  } catch {
    loadError.value = true
  }
}

const phaseId = computed(() => {
  return (route.params.phaseId as string) || 'first-crossing'
})

/** 当前时间范围内的事件 — 用于旁白显示 */
const currentEvent = computed<EventRecord | null>(() => {
  if (!scenarioStore.events.length) return null
  const now = parseTime(timeStore.currentTime)
  for (const evt of scenarioStore.events) {
    const tStart = parseTime(evt.timestamp)
    // duration_hours 默认为 1 小时
    const hours = evt.duration_hours ?? 1
    const tEnd = new Date(tStart.getTime() + hours * 3600_000)
    if (now >= tStart && now <= tEnd) {
      return evt
    }
  }
  return null
})

// === ChapterBookmark 控制 ===
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
  if (!scenarioStore.loaded) {
    await loadData()
  }
})
</script>

<template>
  <div class="narrative-view">
    <TopBar />
    <!-- 加载/错误状态 -->
    <div v-if="!scenarioStore.loaded && !loadError" class="load-state">
      <LoadingCompass />
    </div>
    <div v-else-if="loadError" class="load-state">
      <ErrorState message="史料加载失败" @retry="loadData()" />
    </div>
    <template v-else>
      <div class="narrative-main">
        <div class="map-area">
          <MapView2D v-if="viewStore.render === '2d'" @map-ready="handleMapReady" />
          <MapView3D v-else-if="viewStore.render === '3d'" />

          <!-- 地图叠加层: 部队标记 / 行军轨迹 / 事件标记 -->
          <!-- 这些组件通过 maplibregl API 直接操作地图, 不渲染可见 DOM -->
          <div v-if="mapInstance && viewStore.render === '2d'" style="display:none">
            <ForceMarker
              v-for="force in activeForces"
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
              v-for="evt in currentPhaseEvents"
              :key="evt.id"
              :map="mapInstance"
              :event="evt"
              @click="handleEventClick(evt)"
            />
          </div>

          <!-- 地图底部旁白叠加 -->
          <div v-if="currentEvent" class="narration-overlay">
            <h3 class="narration-title">{{ currentEvent.title }}</h3>
            <p class="narration-desc">{{ currentEvent.description }}</p>
          </div>
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

/* 旁白叠加 */
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .narrative-view .narrative-main {
    flex-direction: column;
  }
  .narration-overlay {
    left: 8px;
    right: 8px;
    bottom: 8px;
    padding: 8px 12px;
  }
  .narration-title {
    font-size: 13px;
  }
  .narration-desc {
    font-size: 11px;
    line-height: 1.4;
  }
}

@media (min-width: 769px) and (max-width: 1280px) {
  .narration-overlay {
    max-width: 480px;
  }
}
</style>
