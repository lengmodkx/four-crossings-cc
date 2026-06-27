/**
 * useTrajectories — 行军轨迹筛选 composable
 *
 * 筛选当前阶段下需要渲染的行军轨迹线（仅按阶段匹配，阶段入口即全量可见），
 * 时间维度上点位的推进由 useForceMarkers 负责。
 */
import { computed, type Ref } from 'vue'
import type { TrajectoriesCollection, TrajectoryFeature } from '@/data/types'

export function useTrajectories(
  trajectoriesCollection: Ref<TrajectoriesCollection | null>,
  currentPhase: Ref<string>,
  // currentTime 保留作为依赖以维持响应式，但不再用于过滤。
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _currentTime: Ref<string>,
) {
  const visibleTrajectories = computed<TrajectoryFeature[]>(() => {
    const collection = trajectoriesCollection.value
    if (!collection || !collection.features) {
      return []
    }

    const phase = currentPhase.value
    return collection.features.filter((feature) => feature.properties.phase === phase)
  })

  function getForceTrajectory(forceId: string): TrajectoryFeature | undefined {
    return visibleTrajectories.value.find((f) => f.properties.force_id === forceId)
  }

  return {
    visibleTrajectories,
    getForceTrajectory,
  }
}