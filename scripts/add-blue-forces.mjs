/**
 * add-blue-forces.mjs
 *
 * 向 forces.geojson 追加 3 支蓝军 (中央军薛岳部/滇军孙渡部/川军刘湘主力)
 * 向 trajectories.geojson 追加对应的 LineString 轨迹
 *
 * 用法: node scripts/add-blue-forces.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '..', 'public', 'data')
const FORCES_PATH = resolve(DATA_DIR, 'forces.geojson')
const TRAJ_PATH = resolve(DATA_DIR, 'trajectories.geojson')

// ============================================================
// 数据定义
// ============================================================

const BLUE_FORCES = [
  {
    id: 'blue-center-xueyue',
    name: '中央军薛岳部',
    commander: '薛岳',
    strength: 30000,
    color: '#1F618D',
    force_id: 'blue-center-xueyue',
    traj_id: 'traj-blue-center-xueyue-1935-01-20-24',
    source: '模拟演示数据',
    waypoints: [
      { ts: '1935-01-20T08:00:00+08:00', lng: 106.71, lat: 26.58, status: 'marching', dest: '贵阳北' },
      { ts: '1935-01-20T20:00:00+08:00', lng: 106.72, lat: 26.65, status: 'resting', dest: '扎佐' },
      { ts: '1935-01-21T08:00:00+08:00', lng: 106.73, lat: 26.85, status: 'marching', dest: '息烽' },
      { ts: '1935-01-21T20:00:00+08:00', lng: 106.75, lat: 27.10, status: 'resting', dest: '乌江南岸' },
      { ts: '1935-01-22T08:00:00+08:00', lng: 106.78, lat: 27.20, status: 'marching', dest: '乌江渡口' },
      { ts: '1935-01-22T20:00:00+08:00', lng: 106.80, lat: 27.28, status: 'resting', dest: '养龙司' },
      { ts: '1935-01-23T08:00:00+08:00', lng: 106.82, lat: 27.38, status: 'marching', dest: '刀靶水' },
      { ts: '1935-01-23T20:00:00+08:00', lng: 106.85, lat: 27.42, status: 'resting', dest: '懒板凳' },
      { ts: '1935-01-24T08:00:00+08:00', lng: 106.87, lat: 27.50, status: 'marching', dest: '遵义城南' },
      { ts: '1935-01-24T20:00:00+08:00', lng: 106.90, lat: 27.58, status: 'resting', dest: '遵义城' },
    ],
  },
  {
    id: 'blue-yunnan-sundu',
    name: '滇军孙渡部',
    commander: '孙渡',
    strength: 15000,
    color: '#2980B9',
    force_id: 'blue-yunnan-sundu',
    traj_id: 'traj-blue-yunnan-sundu-1935-01-20-24',
    source: '模拟演示数据',
    waypoints: [
      { ts: '1935-01-20T08:00:00+08:00', lng: 104.10, lat: 26.22, status: 'marching', dest: '威宁' },
      { ts: '1935-01-20T20:00:00+08:00', lng: 104.28, lat: 26.87, status: 'resting', dest: '赫章' },
      { ts: '1935-01-21T08:00:00+08:00', lng: 104.72, lat: 27.13, status: 'marching', dest: '毕节' },
      { ts: '1935-01-21T20:00:00+08:00', lng: 105.30, lat: 27.30, status: 'resting', dest: '毕节东' },
      { ts: '1935-01-22T08:00:00+08:00', lng: 105.40, lat: 27.35, status: 'marching', dest: '赤水河镇' },
      { ts: '1935-01-22T20:00:00+08:00', lng: 105.50, lat: 27.42, status: 'resting', dest: '大河口' },
      { ts: '1935-01-23T08:00:00+08:00', lng: 105.60, lat: 27.50, status: 'marching', dest: '四川边界' },
      { ts: '1935-01-23T20:00:00+08:00', lng: 105.68, lat: 27.58, status: 'resting', dest: '古蔺方向' },
      { ts: '1935-01-24T08:00:00+08:00', lng: 105.75, lat: 27.65, status: 'marching', dest: '古蔺边境' },
      { ts: '1935-01-24T20:00:00+08:00', lng: 105.80, lat: 27.70, status: 'resting', dest: '叙永方向' },
    ],
  },
  {
    id: 'blue-sichuan-liuxiang',
    name: '川军刘湘主力',
    commander: '刘湘',
    strength: 25000,
    color: '#3498DB',
    force_id: 'blue-sichuan-liuxiang',
    traj_id: 'traj-blue-sichuan-liuxiang-1935-01-20-24',
    source: '模拟演示数据',
    waypoints: [
      { ts: '1935-01-20T08:00:00+08:00', lng: 105.43, lat: 28.87, status: 'marching', dest: '纳溪' },
      { ts: '1935-01-20T20:00:00+08:00', lng: 105.38, lat: 28.77, status: 'resting', dest: '叙永' },
      { ts: '1935-01-21T08:00:00+08:00', lng: 105.43, lat: 28.17, status: 'marching', dest: '古蔺' },
      { ts: '1935-01-21T20:00:00+08:00', lng: 105.82, lat: 28.05, status: 'resting', dest: '赤水县城' },
      { ts: '1935-01-22T08:00:00+08:00', lng: 105.70, lat: 28.58, status: 'marching', dest: '复兴场' },
      { ts: '1935-01-22T20:00:00+08:00', lng: 105.90, lat: 28.50, status: 'resting', dest: '旺隆' },
      { ts: '1935-01-23T08:00:00+08:00', lng: 105.94, lat: 28.38, status: 'marching', dest: '土城北' },
      { ts: '1935-01-23T20:00:00+08:00', lng: 105.96, lat: 28.20, status: 'resting', dest: '青杠坡北' },
      { ts: '1935-01-24T08:00:00+08:00', lng: 105.99, lat: 28.08, status: 'marching', dest: '土城' },
      { ts: '1935-01-24T20:00:00+08:00', lng: 105.97, lat: 28.04, status: 'resting', dest: '土城南' },
    ],
  },
]

// ============================================================
// 工具函数
// ============================================================

/**
 * 根据 ts 生成 feature id (不含日期后缀部分由外部拼接)
 */
function buildForceFeature(def, wp) {
  const tsDate = wp.ts.slice(0, 10)
  const tsHour = wp.ts.slice(11, 13)
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [wp.lng, wp.lat],
    },
    properties: {
      id: `${def.id}-${tsDate}-${tsHour}`,
      type: 'force',
      side: 'blue',
      name: def.name,
      level: 'army',
      commander: def.commander,
      strength: def.strength,
      timestamp: wp.ts,
      status: wp.status,
      next_destination: wp.dest,
      source: def.source,
    },
  }
}

function buildTrajectoryFeature(def) {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: def.waypoints.map((wp) => [wp.lng, wp.lat]),
    },
    properties: {
      id: def.traj_id,
      force_id: def.force_id,
      segment_start: '1935-01-20',
      segment_end: '1935-01-24',
      phase: 'first-crossing',
      color: def.color,
      source: def.source,
    },
  }
}

// ============================================================
// 主流程
// ============================================================

function main() {
  // --- forces.geojson ---
  const forcesRaw = readFileSync(FORCES_PATH, 'utf-8')
  const forces = JSON.parse(forcesRaw)

  const existingForceIds = new Set(forces.features.map((f) => f.properties.id))

  let forceAdded = 0
  for (const def of BLUE_FORCES) {
    for (const wp of def.waypoints) {
      const feature = buildForceFeature(def, wp)
      if (!existingForceIds.has(feature.properties.id)) {
        forces.features.push(feature)
        existingForceIds.add(feature.properties.id)
        forceAdded++
      }
    }
  }

  writeFileSync(FORCES_PATH, JSON.stringify(forces, null, 2) + '\n')
  console.log(`[forces.geojson] 新增 ${forceAdded} 个 feature，当前共 ${forces.features.length} 个`)

  // --- trajectories.geojson ---
  const trajRaw = readFileSync(TRAJ_PATH, 'utf-8')
  const traj = JSON.parse(trajRaw)

  const existingTrajIds = new Set(traj.features.map((f) => f.properties.id))

  let trajAdded = 0
  for (const def of BLUE_FORCES) {
    const feature = buildTrajectoryFeature(def)
    if (!existingTrajIds.has(feature.properties.id)) {
      traj.features.push(feature)
      existingTrajIds.add(feature.properties.id)
      trajAdded++
    }
  }

  writeFileSync(TRAJ_PATH, JSON.stringify(traj, null, 2) + '\n')
  console.log(`[trajectories.geojson] 新增 ${trajAdded} 个轨迹，当前共 ${traj.features.length} 个`)
}

main()
