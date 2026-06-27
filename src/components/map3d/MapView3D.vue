<script setup lang="ts">
/**
 * MapView3D — DEBUG VERSION
 * 临时调试版:红色场景背景 + 测试立方体,证明 Three.js 管线是否工作
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLElement | null>(null)
const statusMsg = ref('初始化中...')
let rafId: number | null = null
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null

onMounted(() => {
  const el = containerRef.value
  if (!el) { statusMsg.value = '❌ 容器元素不存在'; return }

  const w = el.clientWidth || 800
  const h = el.clientHeight || 600
  statusMsg.value = `容器尺寸: ${w}×${h}`

  // === 测试 WebGL ===
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true })
  } catch (e: any) {
    statusMsg.value = `❌ WebGL 不可用: ${e.message}`
    return
  }

  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.domElement.style.display = 'block'
  el.appendChild(renderer.domElement)
  statusMsg.value = `✅ WebGL 创建成功,canvas: ${renderer.domElement.width}×${renderer.domElement.height}`

  // === 红色场景(证明渲染是否工作) ===
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#FF0000') // 纯红,一看就知道是否在渲染

  // === 绿色测试方块(证明 3D 物体是否可见) ===
  const cubeGeo = new THREE.BoxGeometry(300, 300, 300)
  const cubeMat = new THREE.MeshBasicMaterial({ color: '#00FF00' })
  const cube = new THREE.Mesh(cubeGeo, cubeMat)
  cube.position.set(0, 150, 0)
  scene.add(cube)

  // === 相机 ===
  const camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000)
  camera.position.set(500, 500, 800)
  camera.lookAt(0, 0, 0)

  // === 灯光(虽然 BasicMaterial 不需要,但后续需要) ===
  scene.add(new THREE.AmbientLight('#FFFFFF', 0.5))
  scene.add(new THREE.DirectionalLight('#FFFFFF', 0.8))

  // === RAF 渲染 ===
  function animate() {
    rafId = requestAnimationFrame(animate)
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }
  animate()

  statusMsg.value = `✅ 渲染循环已启动 — 应看到红色背景+绿色方块。实际:${renderer.domElement.width}×${renderer.domElement.height}`
})

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (renderer) {
    renderer.dispose()
    renderer = null
  }
})
</script>

<template>
  <div class="map-3d" ref="containerRef">
    <div class="debug-overlay">{{ statusMsg }}</div>
  </div>
</template>

<style scoped>
.map-3d {
  width: 100%;
  height: 100%;
  min-height: 400px;
  min-width: 400px;
  position: relative;
}
.debug-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.75);
  color: #FFFF00;
  font-family: monospace;
  font-size: 12px;
  padding: 6px 10px;
  z-index: 20;
  max-width: 400px;
  word-break: break-all;
  border-radius: 4px;
}
</style>