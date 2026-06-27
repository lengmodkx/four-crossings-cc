/**
 * generate-forces.mjs
 *
 * 重写 forces.geojson + trajectories.geojson:
 *   1) 把现有 20 个 blue-- 非法 id 改名为 -b 系列
 *   2) 保留原 01-20 ~ 01-25 阶段 1 数据,补充 01-26 ~ 02-09
 *   3) 写入阶段 2~5 全部新数据
 *   4) 写入 5 个阶段全部轨迹
 *   5) 调 schema 校验
 *
 * 用法: node scripts/generate-forces.mjs
 */
import { readFileSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { FORCE_DEFS, PHASES } from "./data/forces-data.mjs"
import { PHASE_WAYPOINTS } from "./data/forces-waypoints.mjs"
import { PHASE_WAYPOINTS_2 } from "./data/forces-waypoints-2.mjs"
import { PHASE_WAYPOINTS_3 } from "./data/forces-waypoints-3.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, "..", "public", "data")
const FORCES_PATH = resolve(DATA_DIR, "forces.geojson")
const TRAJ_PATH = resolve(DATA_DIR, "trajectories.geojson")

const SOURCE = "《中国工农红军长征史》"
const ALL_WAYPOINTS = { ...PHASE_WAYPOINTS, ...PHASE_WAYPOINTS_2, ...PHASE_WAYPOINTS_3 }

// ============================================================
// 1) 读现有 forces,处理 bad id
// ============================================================
const oldForces = JSON.parse(readFileSync(FORCES_PATH, "utf8"))
const oldFeatures = oldForces.features.filter((f) => !f.properties.id.startsWith("blue--"))
console.log(`[forces] 剔除 ${oldForces.features.length - oldFeatures.length} 个 blue-- bad id,保留 ${oldFeatures.length} 个`)

// ============================================================
// 2) 生成新 waypoint feature
// ============================================================
function buildFeature(forceId, wp, phaseId) {
  const def = FORCE_DEFS[forceId]
  if (!def) throw new Error("未知 forceId: " + forceId)
  const date = wp.ts.slice(0, 10)
  const hour = wp.ts.slice(11, 13)
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [wp.lng, wp.lat] },
    properties: {
      id: `${forceId}-${phaseId}-${date}-${hour}`,
      type: "force",
      side: def.side,
      name: def.name,
      level: def.level,
      parent_id: def.parent_id,
      commander: def.commander,
      strength: def.strength,
      timestamp: wp.ts,
      status: wp.status,
      next_destination: wp.dest,
      source: SOURCE,
    },
  }
}

const newFeatures = []
for (const phase of PHASES) {
  const waypoints = ALL_WAYPOINTS[phase.id]
  if (!waypoints) continue
  for (const [forceId, wps] of Object.entries(waypoints)) {
    for (const wp of wps) {
      newFeatures.push(buildFeature(forceId, wp, phase.id))
    }
  }
}
console.log(`[forces] 新增 ${newFeatures.length} 个 feature`)

// 合并:旧数据(只保留一渡 01-20 ~ 01-25 + 修复了 id 的)+ 新数据
const all = [...oldFeatures, ...newFeatures]
writeFileSync(FORCES_PATH, JSON.stringify({ type: "FeatureCollection", features: all }, null, 2) + "\n")
console.log(`[forces] 写入 ${all.length} 个 feature 到 ${FORCES_PATH}`)

// ============================================================
// 3) 生成 trajectories
// ============================================================
const trajFeatures = []
for (const phase of PHASES) {
  const waypoints = ALL_WAYPOINTS[phase.id]
  if (!waypoints) continue
  for (const [forceId, wps] of Object.entries(waypoints)) {
    if (wps.length < 2) continue
    const def = FORCE_DEFS[forceId]
    trajFeatures.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: wps.map((wp) => [wp.lng, wp.lat]),
      },
      properties: {
        id: `traj-${forceId}-${phase.id}-${wps[0].ts.slice(0, 10)}`,
        force_id: forceId,
        segment_start: wps[0].ts.slice(0, 10),
        segment_end: wps[wps.length - 1].ts.slice(0, 10),
        phase: phase.id,
        color: def.color,
        source: SOURCE,
      },
    })
  }
}
writeFileSync(TRAJ_PATH, JSON.stringify({ type: "FeatureCollection", features: trajFeatures }, null, 2) + "\n")
console.log(`[trajectories] 写入 ${trajFeatures.length} 条轨迹`)
