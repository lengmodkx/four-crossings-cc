/**
 * useTrajectory3D — 3D 行军轨迹线
 *
 * 将 GeoJSON LineString 轨迹转为 Three.js 3D 线段，使用轨迹属性颜色。
 * 坐标通过 lngLatToWorldXY 映射到 3D 世界空间，高程通过 getHeightFn 注入。
 *
 * 注意: Three.js 的 Line width 在 Windows WebGL 上通常只支持 1px。
 * 如需更粗线条，后续可替换为 Line2/LineMaterial (需要 LineGeometry)。
 *
 * 设计参考: §5.4 鸟瞰沙盘模式 - 行军轨迹
 */
import * as THREE from 'three'
import type { TrajectoryFeature, LngLat } from '@/data/types'
import { defaultLngLatToWorldXY, type LngLatToWorldXY } from './useForce3D'

/** 默认高程函数: 在 DEM 高度 + 固定偏移上绘制轨迹 */
export type GetHeightFn = (lngLat: LngLat) => number

/** 默认高程: 固定 Y=20 (略高于地形) */
const defaultGetHeight: GetHeightFn = (_lngLat: LngLat) => 20

/** 轨迹线选项 */
export interface Trajectory3DOptions {
  /** 线颜色 (覆盖 traj.properties.color) */
  color?: string
  /** 透明度 */
  opacity?: number
  /** 线宽 (注意: WebGL 限制通常只支持 1px) */
  lineWidth?: number
  /** 高程偏移 (在 getHeightFn 的基础上) */
  heightOffset?: number
}

/**
 * 创建 3D 行军轨迹线
 *
 * @param traj - GeoJSON LineString 轨迹 Feature
 * @param scene - Three.js 场景
 * @param lngLatToWorldXY - 经纬度 → 世界坐标映射
 * @param getHeightFn - 根据经纬度返回高程值
 * @param options - 线样式选项
 * @returns THREE.Line 对象
 */
export function createTrajectory3D(
  traj: TrajectoryFeature,
  scene: THREE.Scene,
  lngLatToWorldXY: LngLatToWorldXY = defaultLngLatToWorldXY,
  getHeightFn: GetHeightFn = defaultGetHeight,
  options: Trajectory3DOptions = {},
): THREE.Line {
  const {
    color: overrideColor,
    opacity = 0.8,
    lineWidth = 1,
    heightOffset = 0,
  } = options

  const coordinates = traj.geometry.coordinates
  const colorHex = overrideColor ?? traj.properties.color ?? '#8B6B47'

  // ===== 构建 3D 顶点数组 =====
  const points: THREE.Vector3[] = []

  for (const lngLat of coordinates) {
    const [wx, wz] = lngLatToWorldXY(lngLat)
    const wy = getHeightFn(lngLat) + heightOffset
    points.push(new THREE.Vector3(wx, wy, wz))
  }

  if (points.length < 2) {
    // 单点无法绘线，返回空 Line
    const emptyGeom = new THREE.BufferGeometry()
    emptyGeom.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)])
    const line = new THREE.Line(emptyGeom, new THREE.LineBasicMaterial({ visible: false }))
    scene.add(line)
    return line
  }

  // ===== BufferGeometry + Line =====
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(colorHex),
    linewidth: lineWidth, // 注意: Windows WebGL 通常忽略此值,固定 1px
    transparent: true,
    opacity,
    depthTest: true,
  })

  const line = new THREE.Line(geometry, material)
  line.renderOrder = 1

  scene.add(line)

  return line
}
