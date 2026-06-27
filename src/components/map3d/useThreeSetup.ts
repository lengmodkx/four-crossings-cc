/**
 * useThreeSetup — Three.js 3D 场景初始化 composable
 *
 * 创建 Three.js scene、camera、renderer，注入到给定 DOM 容器。
 * 包含基础光照、雾效和 RAF 动画循环。
 *
 * 设计参考: §5.4 鸟瞰沙盘模式
 */
import { type Ref } from 'vue'
import * as THREE from 'three'

export interface ThreeSceneContext {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  dispose: () => void
}

/**
 * 初始化 Three.js 3D 场景
 *
 * @param containerRef - 挂载 Three.js canvas 的 DOM 容器 ref
 * @returns ThreeSceneContext 包含 scene, camera, renderer, dispose
 */
export function useThreeSetup(
  containerRef: Ref<HTMLElement | null>,
): ThreeSceneContext {
  // ===== Scene =====
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#E8E0D0')
  scene.fog = new THREE.Fog('#F2E8D0', 1000, 6000)

  // ===== Camera =====
  const camera = new THREE.PerspectiveCamera(
    45, // FOV
    1, // Aspect (updated on resize)
    1, // Near
    20000, // Far
  )
  // 默认鸟瞰视角: 从上方俯视，略微倾斜
  camera.position.set(0, 1500, 2500)
  camera.lookAt(0, 0, 0)

  // ===== Renderer =====
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  // ===== Lighting =====
  // 半球光: 天空 + 地面 自然散射 (模拟大气)
  const hemiLight = new THREE.HemisphereLight('#FFE4B5', '#5C7A8C', 0.5)
  scene.add(hemiLight)

  // 环境光: 柔和全局补光 (避免暗面过黑)
  const ambientLight = new THREE.AmbientLight('#FFF5E0', 0.3)
  scene.add(ambientLight)

  // 方向光 (模拟太阳，产生阴影)
  const sunLight = new THREE.DirectionalLight('#FFE4B5', 0.8)
  sunLight.position.set(5000, 5000, 3000)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 2048
  sunLight.shadow.mapSize.height = 2048
  sunLight.shadow.camera.near = 1
  sunLight.shadow.camera.far = 15000
  sunLight.shadow.camera.left = -5000
  sunLight.shadow.camera.right = 5000
  sunLight.shadow.camera.top = 5000
  sunLight.shadow.camera.bottom = -5000
  scene.add(sunLight)

  // ===== 挂载到容器 =====
  const container = containerRef.value
  if (container) {
    container.appendChild(renderer.domElement)
    resizeRenderer()
  }

  // ===== 自适应大小 =====
  function resizeRenderer(): void {
    const el = containerRef.value
    if (!el) return
    const width = el.clientWidth
    const height = el.clientHeight
    if (width <= 0 || height <= 0) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  window.addEventListener('resize', resizeRenderer)

  // ===== RAF 动画循环 =====
  let rafId: number | null = null

  function animate(): void {
    rafId = requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()

  // ===== 清理 =====
  function dispose(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    window.removeEventListener('resize', resizeRenderer)

    // 从 DOM 移除 canvas
    if (container && renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement)
    }

    // 释放 Three.js 资源
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        } else if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        }
      }
      if (child instanceof THREE.DirectionalLight || child instanceof THREE.SpotLight) {
        if (child.shadow?.map) {
          child.shadow.map.dispose()
        }
      }
    })

    renderer.dispose()
  }

  return {
    scene,
    camera,
    renderer,
    dispose,
  }
}
