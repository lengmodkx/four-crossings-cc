/**
 * useForceMarkers — 部队标记 composable
 *
 * 根据当前时间筛选部队动态数据，返回每个部队在给定时间之前的最新位置。
 * 用于在 Mapbox 地图上渲染部队标记。
 */
import { computed, type Ref } from 'vue'
import type { ForcesCollection, ForceFeature } from '@/data/types'

/**
 * 从部队集合中提取每个部队在指定时间之前的最新位置
 *
 * @param forcesCollection - 部队动态 GeoJSON 集合 (reactive 或 ref)
 * @param currentTime - 当前战役时间 ISO 字符串 (reactive 或 ref)
 * @returns 每个部队在当前时间之前的最新位置数组
 */
export function useForceMarkers(
  forcesCollection: Ref<ForcesCollection | null>,
  currentTime: Ref<string>,
) {
  const activeForces = computed<ForceFeature[]>(() => {
    const collection = forcesCollection.value
    if (!collection || !collection.features) {
      return []
    }

    const targetMs = new Date(currentTime.value).getTime()

    // 按 force_id 分组，取每个部队在 targetTime 之前的最新点位
    const latestByForce = new Map<string, ForceFeature>()

    for (const feature of collection.features) {
      const forceId = feature.properties.id
      const featureTime = new Date(feature.properties.timestamp).getTime()

      // 只考虑在当前时间之前的点位
      if (featureTime > targetMs) continue

      const existing = latestByForce.get(forceId)
      if (!existing) {
        latestByForce.set(forceId, feature)
      } else {
        const existingTime = new Date(existing.properties.timestamp).getTime()
        if (featureTime > existingTime) {
          latestByForce.set(forceId, feature)
        }
      }
    }

    return Array.from(latestByForce.values())
  })

  /**
   * 获取指定部队在当前时间之前的最新位置
   */
  function getForceLatest(forceId: string): ForceFeature | undefined {
    return activeForces.value.find((f) => f.properties.id === forceId)
  }

  /**
   * 统计红/蓝双方当前活跃部队数量
   */
  const redCount = computed<number>(() => {
    return activeForces.value.filter((f) => f.properties.side === 'red').length
  })

  const blueCount = computed<number>(() => {
    return activeForces.value.filter((f) => f.properties.side === 'blue').length
  })

  return {
    activeForces,
    getForceLatest,
    redCount,
    blueCount,
  }
}
