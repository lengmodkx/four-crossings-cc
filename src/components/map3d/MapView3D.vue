<script setup lang="ts">
/**
 * MapView3D — 鸟瞰沙盘 3D 地图组件
 *
 * 使用 Three.js 渲染地形、部队、轨迹的 3D 鸟瞰场景。
 * 设计参考: §5.4 鸟瞰沙盘模式
 */
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
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

const { currentTime, currentPhase } = storeToRefs(timeStore)

const forcesCollection = computed<ForcesCollection | null>(() => {
  if (!scenarioStore.forces.length) return null
  return { type: 'FeatureCollection', features: scenarioStore.forces }
})

const trajectoriesCollection = computed<TrajectoriesCollection | null>(() => {
  if (!scenarioStore.trajectories.length) return null
  return { type: 'FeatureCollection', features: scenarioStore.trajectories }
})

const { activeForces } = useForceMarkers(forcesCollection, currentTime)
const { visibleTrajectories } = useTrajectories(trajectoriesCollection, currentPhase, currentTime)

let threeCtx: ThreeSceneContext | null = null
const loaded = ref(false)
const terrainReady = ref(false)

function getHeight(_lngLat: LngLat): number {
  return 0
}

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
      const mat = obj.material
      if (mat instanceof THREE.Material) mat.dispose()
      else if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    }
    if (obj instanceof THREE.Line) {
      obj.geometry.dispose()
      if (obj.material instanceof THREE.Material) obj.material.dispose()
    }
  }
}

watch(
  [activeForces, () => loaded.value],
  () => {
    if (!loaded.value || !threeCtx) return
    const oldMarkers: THREE.Object3D[] = []
    threeCtx.scene.traverse((child) => {
      if (child.userData?.type === 'force-arrow' || child.userData?.type === 'force-glow') {
        oldMarkers.push(child)
      }
    })
    for (const obj of oldMarkers) {
      threeCtx.scene.remove(obj)
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        const mat = obj.material
        if (mat instanceof THREE.Material) mat.dispose()
        else if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      }
    }
    for (const force of activeForces.value) {
      const { mesh, glow } = createForceArrow(force, threeCtx.scene, defaultLngLatToWorldXY)
      mesh.userData = { type: 'force-arrow' }
      glow.userData = { type: 'force-glow' }
    }
  },
  { immediate: true, deep: true },
)

watch(
  [visibleTrajectories, () => loaded.value],
  () => {
    if (!loaded.value || !threeCtx) return
    const oldLines: THREE.Object3D[] = []
    threeCtx.scene.traverse((child) => {
      if (child.userData?.type === 'trajectory-line') oldLines.push(child)
    })
    for (const obj of oldLines) {
      threeCtx.scene.remove(obj)
      if (obj instanceof THREE.Line) {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.Material) obj.material.dispose()
      }
    }
    for (const traj of visibleTrajectories.value) {
      const line = createTrajectory3D(traj, threeCtx.scene, defaultLngLatToWorldXY, getHeight)
      line.userData = { type: 'trajectory-line' }
    }
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  if (!containerRef.value) {
    console.error('3D 容器未找到')
    return
  }

  threeCtx = useThreeSetup(containerRef)

  const el = containerRef.value as any
  el.__threeDispose = threeCtx.dispose

  try {
    await loadTerrainMesh(threeCtx.scene)
    terrainReady.value = true
  } catch (e) {
    console.warn('地形加载失败，使用平坦地形:', e)
    terrainReady.value = true
  }

  loaded.value = true

  if (!scenarioStore.loaded) {
    try { await scenarioStore.loadAll() } catch {}
  }

  // 强制 resize: Tab 切换后容器可能尚未完成 CSS 布局
  await nextTick()
  setTimeout(() => window.dispatchEvent(new Event('resize')), 200)
})

onBeforeUnmount(() => {
  clear3DMarkers()
  const el = containerRef.value as any
  if (el && typeof el.__threeDispose === 'function') el.__threeDispose()
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
  min-height: 400px;
  min-width: 400px;
  position: relative;
}
</style>