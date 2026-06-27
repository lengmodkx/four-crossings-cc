/**
 * useForce3D — 3D 部队楔形箭头标记
 *
 * 将 GeoJSON ForceFeature 转换为 Three.js 3D 楔形箭头 + 脉冲光晕，
 * 添加到 3D 场景中。坐标通过仿射变换从经纬度映射到 3D 世界空间。
 *
 * 设计参考: §5.4 鸟瞰沙盘模式 - 部队标记
 */
import * as THREE from 'three'
import type { ForceFeature, LngLat } from '@/data/types'

/** 坐标映射: 经纬度 → 3D 世界坐标 */
export type LngLatToWorldXY = (lngLat: LngLat) => [number, number]

/** 部队颜色映射 */
const SIDE_COLORS: Record<string, number> = {
  red: 0xc0392b, // 红军 — 深红
  blue: 0x2c5f7c, // 蓝军 — 钢蓝
}

/** 默认颜色 (未知方) */
const DEFAULT_COLOR = 0x888888

/**
 * 赤水河流域范围 (仿射变换参考)
 * 经度 104°E - 107°E, 纬度 27°N - 29°N
 * 映射到 3D 世界空间 [-4000, +4000]
 */
const DEFAULT_BOUNDS = {
  minLng: 104,
  maxLng: 107,
  minLat: 27,
  maxLat: 29,
  worldMin: -1000,
  worldMax: 1000,
}

/**
 * 默认 lngLat → worldXY 仿射变换
 *
 * 线性映射经纬度到 3D 世界坐标
 */
export function defaultLngLatToWorldXY(lngLat: LngLat): [number, number] {
  const [lng, lat] = lngLat
  const { minLng, maxLng, minLat, maxLat, worldMin, worldMax } = DEFAULT_BOUNDS

  const x = ((lng - minLng) / (maxLng - minLng)) * (worldMax - worldMin) + worldMin
  const z = ((maxLat - lat) / (maxLat - minLat)) * (worldMax - worldMin) + worldMin

  return [x, z]
}

/** 箭头选项 */
export interface ForceArrowOptions {
  /** 箭头高度 */
  height?: number
  /** 箭头底部半径 */
  radius?: number
  /** 光晕半径 */
  glowRadius?: number
  /** 光晕透明度 */
  glowOpacity?: number
}

/**
 * 创建单个部队的 3D 楔形箭头标记
 *
 * @param force - 部队 GeoJSON Feature
 * @param scene - Three.js 场景
 * @param lngLatToWorldXY - 经纬度→世界坐标映射函数
 * @param options - 箭头样式选项
 * @returns { mesh, glow } 箭头网格和光晕网格
 */
export function createForceArrow(
  force: ForceFeature,
  scene: THREE.Scene,
  lngLatToWorldXY: LngLatToWorldXY = defaultLngLatToWorldXY,
  options: ForceArrowOptions = {},
): { mesh: THREE.Mesh; glow: THREE.Mesh } {
  const {
    height = 300,
    radius = 80,
    glowRadius = 120,
    glowOpacity = 0.2,
  } = options

  const side = force.properties.side
  const color = SIDE_COLORS[side] ?? DEFAULT_COLOR

  // ===== 坐标转换 =====
  const [worldX, worldZ] = lngLatToWorldXY(force.geometry.coordinates)

  // ===== 楔形箭头 (ConeGeometry) =====
  const coneGeom = new THREE.ConeGeometry(radius, height, 8, 1)
  const coneMat = new THREE.MeshBasicMaterial({ color })
  const arrow = new THREE.Mesh(coneGeom, coneMat)
  arrow.position.set(worldX, height / 2, worldZ)
  arrow.castShadow = false
  arrow.receiveShadow = false

  scene.add(arrow)

  // ===== 脉冲光晕 (SphereGeometry) =====
  const glowGeom = new THREE.SphereGeometry(glowRadius, 16, 16)
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: glowOpacity,
    depthWrite: false,
  })
  const glow = new THREE.Mesh(glowGeom, glowMat)
  glow.position.set(worldX, 5, worldZ)
  glow.renderOrder = 999
  glow.material.depthTest = true
  glow.material.depthWrite = false

  scene.add(glow)

  return { mesh: arrow, glow }
}
