<script setup lang="ts">
/**
 * MapView3D — 鸟瞰沙盘 3D 地图组件
 *
 * 使用 Three.js 渲染地形、部队、轨迹的 3D 鸟瞰场景。
 * 设计参考: §5.4 鸟瞰沙盘模式
 *
 * Bug Fix: 在场景初始化后加载地形网格，并监听部队/轨迹数据变化
 * 动态创建/更新 3D 箭头和线段。
 */
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThreeSetup, type ThreeSceneContext } from './useThreeSetup'
import { loadTerrainMesh } from './useTerrainMesh'
import { createForceArrow, defaultLngLatToWorldXY } from './useForce3D'
import { createTrajectory3D } from './useTrajectory3D'
import { useScenarioStore } from '@/stores/scenario'
import { useTimeStore } from '@/stores/time'
import { useForceMarkers } from '@/components/map2d/useForceMarkers'
import { useTrajectories } from '@/components/map2d/useTrajectories'
import type { ForcesCollection, TrajectoriesCollection, LngLat } from '@/data/types'
import * as THREE from 'three'

const containerRef = ref<HTMLElement | null>(null)
const scenarioStore = useScenarioStore()
const timeStore = useTimeStore()

// Pinia store refs (storeToRefs preserves Ref<> wrapper for composable type compatibility)
const { currentTime, currentPhase } = storeToRefs(timeStore)

// ===== 部队/轨迹数据 (包装为 Collection 供 composable 使用) =====
const forcesCollection = computed<ForcesCollection | null>(() => {
  if (!scenarioStore.forces.length) return null
  return {
    type: 'FeatureCollection',
    features: scenarioStore.forces,
  }
})

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

// ===== 3D 场景上下文 =====
let threeCtx: ThreeSceneContext | null = null
const loaded = ref(false)
const terrainReady = ref(false)

/** 获取世界坐标处的地形高度 (简化 fallback) */
function getHeight(_lngLat: LngLat): number {
  return 0 // 平坦地形 fallback
}

// ===== 清理旧的 3D 标记 =====
function clear3DMarkers(): void {
  if (!threeCtx) return
  const toRemove: THREE.Object3D[] = []
  threeCtx.scene.traverse((child) => {
    if (
      child.userData?.type === 'force-arrow' ||
      child.userData?.type === 'force-glow' ||
      child.userData?.type === 'trajectory-line'
    ) {
      toRemove.push(child)
    }
  })
  for (const obj of toRemove) {
    threeCtx.scene.remove(obj)
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose()
      if (obj.material instanceof THREE.Material) {
        obj.material.dispose()
      } else if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose())
      }
    }
    if (obj instanceof THREE.Line) {
      obj.geometry.dispose()
      if (obj.material instanceof THREE.Material) {
        obj.material.dispose()
      }
    }
  }
}

// ===== 监听部队变化 → 更新 3D 箭头 =====
watch(
  [activeForces, () => loaded.value],
  () => {
    if (!loaded.value || !threeCtx) return

    // 清除旧标记
    const oldMarkers: THREE.Object3D[] = []
    threeCtx.scene.traverse((child) => {
      if (
        child.userData?.type === 'force-arrow' ||
        child.userData?.type === 'force-glow'
      ) {
        oldMarkers.push(child)
      }
    })
    for (const obj of oldMarkers) {
      threeCtx.scene.remove(obj)
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose()
        } else if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose())
        }
      }
    }

    // 创建新的部队箭头
    for (const force of activeForces.value) {
      const { mesh, glow } = createForceArrow(
        force,
        threeCtx.scene,
        defaultLngLatToWorldXY,
      )
      mesh.userData = { type: 'force-arrow' }
      glow.userData = { type: 'force-glow' }
    }
  },
  { immediate: true, deep: true },
)

// ===== 监听轨迹变化 → 更新 3D 线段 =====
watch(
  [visibleTrajectories, () => loaded.value],
  () => {
    if (!loaded.value || !threeCtx) return

    // 清除旧轨迹线
    const oldLines: THREE.Object3D[] = []
    threeCtx.scene.traverse((child) => {
      if (child.userData?.type === 'trajectory-line') {
        oldLines.push(child)
      }
    })
    for (const obj of oldLines) {
      threeCtx.scene.remove(obj)
      if (obj instanceof THREE.Line) {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose()
        }
      }
    }

    // 创建新的轨迹线
    for (const traj of visibleTrajectories.value) {
      const line = createTrajectory3D(
        traj,
        threeCtx.scene,
        defaultLngLatToWorldXY,
        getHeight,
      )
      line.userData = { type: 'trajectory-line' }
    }
  },
  { immediate: true, deep: true },
)

// ===== 生命周期 =====
onMounted(async () => {
  if (!containerRef.value) {
    console.error('3D 容器未找到')
    return
  }

  // 初始化 Three.js 场景
  threeCtx = useThreeSetup(containerRef)

  // 存储 dispose 到 DOM 元素 (保持兼容)
  const el = containerRef.value as any
  el.__threeDispose = threeCtx.dispose

  // 加载地形
  try {
    await loadTerrainMesh(threeCtx.scene)
    terrainReady.value = true
  } catch (e) {
    console.warn('地形加载失败，使用平坦地形:', e)
    terrainReady.value = true // 即使地形加载失败也渲染部队
  }

  loaded.value = true

  // 确保场景数据已加载
  if (!scenarioStore.loaded) {
    try {
      await scenarioStore.loadAll()
    } catch {
      // 数据加载失败不影响 3D 场景渲染
    }
  }
})

onBeforeUnmount(() => {
  clear3DMarkers()

  const el = containerRef.value as any
  if (el && typeof el.__threeDispose === 'function') {
    el.__threeDispose()
  }
  threeCtx = null
})
</script>

<template>
  <div class="map-3d" ref="containerRef"></div>
</template>

<style scoped>
.map-3d {
  width: 100%;
  height: 100%;
}
</style>
