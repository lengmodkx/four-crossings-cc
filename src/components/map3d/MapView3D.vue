<script setup lang="ts">
/**
 * MapView3D — 四渡赤水 3D 鸟瞰沙盘
 *
 * 直接创建 Three.js 管线(已验证可用),逐步叠加:
 * 1. 场景 + 灯光 + 雾
 * 2. 地形(带 fallback)
 * 3. 部队楔形箭头(响应时间变化)
 * 4. 行军轨迹线(响应阶段变化)
 */
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import * as THREE from 'three'
import { useScenarioStore } from '@/stores/scenario'
import { useTimeStore } from '@/stores/time'
import { loadTerrainMesh } from './useTerrainMesh'
import { createForceArrow, defaultLngLatToWorldXY } from './useForce3D'
import { createTrajectory3D } from './useTrajectory3D'
import type { ForceFeature, TrajectoryFeature } from '@/data/types'

const containerRef = ref<HTMLElement | null>(null)
const scenario = useScenarioStore()
const time = useTimeStore()
const { currentTime, currentPhase } = storeToRefs(time)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let rafId: number | null = null
const ready = ref(false)

// === 每部队取最新位置(不依赖 composable,直接实现) ===
const activeForces = computed<ForceFeature[]>(() => {
  if (!scenario.forces.length) return []
  const targetMs = new Date(currentTime.value).getTime()
  const latest = new Map<string, ForceFeature>()
  for (const f of scenario.forces) {
    const ft = new Date(f.properties.timestamp).getTime()
    if (ft > targetMs) continue
    const existing = latest.get(f.properties.id)
    if (!existing || new Date(existing.properties.timestamp).getTime() < ft) {
      latest.set(f.properties.id, f)
    }
  }
  return Array.from(latest.values())
})

// === 当前阶段轨迹 ===
const visibleTrajectories = computed<TrajectoryFeature[]>(() => {
  return scenario.trajectories.filter(t => t.properties.phase === currentPhase.value)
})

// === 清理 + 重建 3D 标记 ===
function refresh3DMarkers() {
  if (!scene) return
  // 移除旧标记
  const toRemove: THREE.Object3D[] = []
  scene.traverse(c => {
    const t = c.userData?.type
    if (t === 'force-arrow' || t === 'force-glow' || t === 'trajectory-line') toRemove.push(c)
  })
  toRemove.forEach(c => {
    scene!.remove(c)
    if (c instanceof THREE.Mesh) { c.geometry.dispose(); disposeMat(c.material) }
    if (c instanceof THREE.Line) { c.geometry.dispose(); if (c.material instanceof THREE.Material) c.material.dispose() }
  })

  // 新建箭头
  for (const f of activeForces.value) {
    const { mesh, glow } = createForceArrow(f, scene, defaultLngLatToWorldXY)
    mesh.userData = { type: 'force-arrow' }
    glow.userData = { type: 'force-glow' }
  }
  // 新建轨迹
  for (const t of visibleTrajectories.value) {
    const line = createTrajectory3D(t, scene, defaultLngLatToWorldXY, () => 20)
    line.userData = { type: 'trajectory-line' }
  }
}

function disposeMat(m: THREE.Material | THREE.Material[]) {
  if (m instanceof THREE.Material) m.dispose()
  else if (Array.isArray(m)) m.forEach(x => x.dispose())
}

// 监听数据变化 → 重建
watch([activeForces, visibleTrajectories], refresh3DMarkers, { deep: true })

onMounted(async () => {
  const el = containerRef.value
  if (!el) return
  const w = el.clientWidth || 800
  const h = el.clientHeight || 600

  // === 场景(与调试版相同的可靠创建方式) ===
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  el.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#E8E0D0')
  scene.fog = new THREE.Fog('#F2E8D0', 1000, 6000)

  camera = new THREE.PerspectiveCamera(45, w / h, 1, 20000)
  camera.position.set(0, 1500, 2500)
  camera.lookAt(0, 0, 0)

  // 灯光
  scene.add(new THREE.HemisphereLight('#FFE4B5', '#5C7A8C', 0.5))
  scene.add(new THREE.AmbientLight('#FFF5E0', 0.3))
  const sun = new THREE.DirectionalLight('#FFE4B5', 0.8)
  sun.position.set(5000, 5000, 3000)
  scene.add(sun)

  // RAF
  function animate() {
    rafId = requestAnimationFrame(animate)
    if (renderer && scene && camera) renderer.render(scene, camera)
  }
  animate()

  // 自适应
  window.addEventListener('resize', () => {
    const cw = el.clientWidth || 400
    const ch = el.clientHeight || 400
    renderer?.setSize(cw, ch)
    if (camera) { camera.aspect = cw / ch; camera.updateProjectionMatrix() }
  })

  // === 加载数据 ===
  if (!scenario.loaded) {
    try { await scenario.loadAll() } catch {}
  }

  // === 加载地形 ===
  try {
    await loadTerrainMesh(scene)
  } catch (e) {
    console.warn('地形 fallback:', e)
  }

  ready.value = true
  refresh3DMarkers()
})

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (renderer) { renderer.dispose(); renderer = null }
  scene = null
  camera = null
})
</script>

<template>
  <div class="map-3d" ref="containerRef" />
</template>

<style scoped>
.map-3d { width: 100%; height: 100%; min-height: 400px; position: relative; }
</style>