/**
 * useTerrainMesh — DEM 地形加载 composable
 *
 * 尝试从 GeoTIFF 加载赤水河流域地形高程数据，生成带高度色带的 3D 地形网格。
 * 如果 DEM 文件不存在或加载失败，自动 fallback 到平坦过程地形。
 *
 * 设计参考: §5.4 鸟瞰沙盘模式 - DEM 地形
 */
import * as THREE from 'three'

/** 高度色带定义 */
interface ColorStop {
  /** 归一化高度值 [0, 1] */
  threshold: number
  /** 颜色 hex */
  color: string
}

/** 默认色带: 河蓝 → 田黄 → 山褐 → 雪线 */
const DEFAULT_COLOR_STOPS: ColorStop[] = [
  { threshold: 0.0, color: '#5C7A8C' }, // 河蓝
  { threshold: 0.3, color: '#C9A86A' }, // 田黄
  { threshold: 0.6, color: '#8B6B47' }, // 山褐
  { threshold: 0.9, color: '#E8E0D0' }, // 雪线白
]

/** 地形参数 */
export interface TerrainOptions {
  /** 平面地形宽度 (单位) */
  width?: number
  /** 平面地形高度 (单位) */
  height?: number
  /** 宽度方向顶点数 */
  widthSegments?: number
  /** 高度方向顶点数 */
  heightSegments?: number
  /** 高程夸张系数 */
  heightExaggeration?: number
  /** 色带定义 */
  colorStops?: ColorStop[]
  /** 随机起伏幅度 (fallback 时) */
  noiseAmplitude?: number
}

/**
 * 根据归一化高度值查找颜色
 */
function lerpColor(t: number, stops: ColorStop[]): THREE.Color {
  if (stops.length === 0) return new THREE.Color('#5C7A8C')
  if (stops.length === 1) return new THREE.Color(stops[0].color)

  // 找到 t 所在的区间
  let lower = stops[0]
  let upper = stops[stops.length - 1]

  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].threshold && t <= stops[i + 1].threshold) {
      lower = stops[i]
      upper = stops[i + 1]
      break
    }
  }

  const range = upper.threshold - lower.threshold
  if (range === 0) return new THREE.Color(lower.color)

  const factor = (t - lower.threshold) / range
  const c1 = new THREE.Color(lower.color)
  const c2 = new THREE.Color(upper.color)
  return c1.lerp(c2, factor)
}

/**
 * 加载 DEM 地形网格
 *
 * 1. 尝试加载 `/terrain/chishui-dem.tif` GeoTIFF
 * 2. 失败则生成带随机微起伏的平坦地形
 * 3. 应用高度色带
 * 4. 旋转 -PI/2 使地形水平放置
 *
 * @param scene - Three.js 场景
 * @param options - 地形参数
 * @returns THREE.Mesh 地形网格对象
 */
export async function loadTerrainMesh(
  scene: THREE.Scene,
  options: TerrainOptions = {},
): Promise<THREE.Mesh> {
  const {
    width = 2000,
    height = 2000,
    widthSegments = 256,
    heightSegments = 256,
    heightExaggeration = 3,
    colorStops = DEFAULT_COLOR_STOPS,
    noiseAmplitude = 5,
  } = options

  let geometry: THREE.PlaneGeometry

  // ===== 1. 尝试加载 GeoTIFF DEM =====
  try {
    const geotiff = await import('geotiff')
    const response = await fetch('/terrain/chishui-dem.tif')
    if (!response.ok) {
      throw new Error(`DEM 文件加载失败: HTTP ${response.status}`)
    }
    const arrayBuffer = await response.arrayBuffer()
    const tiff = await geotiff.fromArrayBuffer(arrayBuffer)
    const image = await tiff.getImage()
    const rasters = await image.readRasters()
    const elevation = rasters[0] as Float32Array | Int16Array | Uint16Array

    // 计算高程范围
    let minElev = Infinity
    let maxElev = -Infinity
    for (let i = 0; i < elevation.length; i++) {
      const v = elevation[i]
      if (v !== elevation[i]) continue // skip NaN (no-data)
      if (v < minElev) minElev = v
      if (v > maxElev) maxElev = v
    }

    const elevRange = maxElev - minElev || 1

    // 创建 PlaneGeometry 并设置顶点高程
    geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments)
    const positions = geometry.attributes.position

    const rasterWidth = image.getWidth()
    const rasterHeight = image.getHeight()

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)

      // UV 坐标映射到 DEM 栅格
      const u = (x / width) + 0.5 // [-0.5, 0.5] → [0, 1]
      const v = (y / height) + 0.5 // [-0.5, 0.5] → [0, 1]

      const col = Math.floor(u * (rasterWidth - 1))
      const row = Math.floor(v * (rasterHeight - 1))
      const idx = row * rasterWidth + col

      if (idx >= 0 && idx < elevation.length) {
        const elev = elevation[idx]
        if (elev === elev) {
          // not NaN
          const normalized = (elev - minElev) / elevRange
          positions.setZ(i, normalized * heightExaggeration * 100)
        }
      }
    }
    geometry.computeVertexNormals()
  } catch (_err) {
    // ===== 2. Fallback: 平坦地形 (带轻微随机起伏) =====
    console.warn('DEM 加载失败，使用平坦地形 fallback')

    geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments)
    const positions = geometry.attributes.position

    // 简单伪随机函数 (基于坐标的确定性噪声)
    function pseudoNoise(x: number, y: number): number {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
      return (n - Math.floor(n)) * 2 - 1 // [-1, 1]
    }

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      // 中心区域轻微隆起，边缘低洼 (模拟盆地地形)
      const distFromCenter = Math.sqrt(x * x + y * y) / (width * 0.7)
      const baseElev = Math.max(0, 1 - distFromCenter) * 20
      const noise = pseudoNoise(x * 0.1, y * 0.1) * noiseAmplitude
      positions.setZ(i, (baseElev + noise) * heightExaggeration)
    }
    geometry.computeVertexNormals()
  }

  // ===== 3. 顶点色带着色 =====
  const posAttr = geometry.attributes.position
  const colors = new Float32Array(posAttr.count * 3)

  // 计算高程范围用于归一化
  let zMin = Infinity
  let zMax = -Infinity
  for (let i = 0; i < posAttr.count; i++) {
    const z = posAttr.getZ(i)
    if (z < zMin) zMin = z
    if (z > zMax) zMax = z
  }
  const zRange = zMax - zMin || 1

  for (let i = 0; i < posAttr.count; i++) {
    const z = posAttr.getZ(i)
    const t = (z - zMin) / zRange // 归一化到 [0, 1]
    const color = lerpColor(t, colorStops)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // ===== 4. 创建 Mesh =====
  const material = new THREE.MeshLambertMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2 // 水平放置 (PlaneGeometry 默认在 XY 平面)
  mesh.receiveShadow = true
  mesh.castShadow = false

  scene.add(mesh)

  return mesh
}
