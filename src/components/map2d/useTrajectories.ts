/**
 * useTrajectories — 行军轨迹筛选 composable
 *
 * 根据当前阶段和时间重叠条件，筛选需要显示的行军轨迹。
 */
import { computed, type Ref } from 'vue'
import type { TrajectoriesCollection, TrajectoryFeature } from '@/data/types'

/**
 * 从轨迹集合中筛选与当前阶段匹配且时间重叠的轨迹
 *
 * @param trajectoriesCollection - 行军轨迹 GeoJSON 集合 (reactive 或 ref)
 * @param currentPhase - 当前战役阶段 id (reactive 或 ref)
 * @param currentTime - 当前战役时间 ISO 字符串 (reactive 或 ref)
 * @returns 符合条件的轨迹数组
 */
export function useTrajectories(
  trajectoriesCollection: Ref<TrajectoriesCollection | null>,
  currentPhase: Ref<string>,
  currentTime: Ref<string>,
) {
  const visibleTrajectories = computed<TrajectoryFeature[]>(() => {
    const collection = trajectoriesCollection.value
    if (!collection || !collection.features) {
      return []
    }

    const phase = currentPhase.value
    const targetMs = new Date(currentTime.value).getTime()

    return collection.features.filter((feature) => {
      const props = feature.properties

      // 阶段匹配: 轨迹所属阶段必须与当前阶段一致
      if (props.phase !== phase) {
        return false
      }

      // 时间重叠: 轨迹的时间段必须包含当前时间点
      const segStart = new Date(props.segment_start).getTime()
      const segEnd = new Date(props.segment_end).getTime()

      return targetMs >= segStart && targetMs <= segEnd
    })
  })

  /**
   * 获取指定部队的轨迹
   */
  function getForceTrajectory(forceId: string): TrajectoryFeature | undefined {
    return visibleTrajectories.value.find((f) => f.properties.force_id === forceId)
  }

  return {
    visibleTrajectories,
    getForceTrajectory,
  }
}
