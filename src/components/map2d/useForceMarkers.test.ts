import { describe, it, expect } from 'vitest'
import { ref } from 'vue'

import { useForceMarkers } from './useForceMarkers'
import type { ForcesCollection, ForceFeature } from '@/data/types'

/** 创建 mock 部队 Feature */
function makeForceFeature(
  id: string,
  side: 'red' | 'blue',
  timestamp: string,
  coordinates: [number, number],
): ForceFeature {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties: {
      id,
      type: 'force' as const,
      side,
      name: id,
      level: 'army' as const,
      commander: 'test',
      strength: 1000,
      timestamp,
      status: 'marching' as const,
      source: 'test',
    },
  }
}

/** 创建 mock ForcesCollection */
function makeCollection(features: ForceFeature[]): ForcesCollection {
  return {
    type: 'FeatureCollection',
    features,
  }
}

describe('useForceMarkers', () => {
  it('should return empty array when collection is null', () => {
    const collection = ref<ForcesCollection | null>(null)
    const currentTime = ref('1935-01-22T08:00:00+08:00')

    const { activeForces } = useForceMarkers(collection, currentTime)
    expect(activeForces.value).toEqual([])
  })

  it('should return empty array when no forces exist', () => {
    const collection = ref<ForcesCollection | null>(makeCollection([]))
    const currentTime = ref('1935-01-22T08:00:00+08:00')

    const { activeForces } = useForceMarkers(collection, currentTime)
    expect(activeForces.value).toEqual([])
  })

  it('should return only forces before current time', () => {
    const f1 = makeForceFeature('red-1st', 'red', '1935-01-22T08:00:00+08:00', [107, 27.8])
    const f2 = makeForceFeature('red-3rd', 'red', '1935-01-25T12:00:00+08:00', [106, 28])
    const f3 = makeForceFeature('red-5th', 'red', '1935-01-30T12:00:00+08:00', [105, 28.3])

    const collection = ref<ForcesCollection | null>(makeCollection([f1, f2, f3]))
    // Current time is between f2 and f3
    const currentTime = ref('1935-01-28T00:00:00+08:00')

    const { activeForces } = useForceMarkers(collection, currentTime)
    expect(activeForces.value).toHaveLength(2)
    expect(activeForces.value.map((f) => f.properties.id)).toContain('red-1st')
    expect(activeForces.value.map((f) => f.properties.id)).toContain('red-3rd')
    expect(activeForces.value.map((f) => f.properties.id)).not.toContain('red-5th')
  })

  it('should return latest position for each force when multiple timestamps exist', () => {
    // Same force at different times - should only return the latest before currentTime
    const f1_early = makeForceFeature('red-1st', 'red', '1935-01-22T08:00:00+08:00', [107, 27.8])
    const f1_late = makeForceFeature('red-1st', 'red', '1935-01-24T08:00:00+08:00', [106.5, 28.0])
    const f2 = makeForceFeature('blue-guizhou', 'blue', '1935-01-23T12:00:00+08:00', [107.2, 28.1])

    const collection = ref<ForcesCollection | null>(makeCollection([f1_early, f1_late, f2]))
    const currentTime = ref('1935-01-25T00:00:00+08:00')

    const { activeForces } = useForceMarkers(collection, currentTime)

    // Should have 2 unique forces
    expect(activeForces.value).toHaveLength(2)

    // red-1st should be at the later position
    const red1st = activeForces.value.find((f) => f.properties.id === 'red-1st')
    expect(red1st).toBeDefined()
    expect(red1st!.geometry.coordinates).toEqual([106.5, 28.0])
    expect(red1st!.properties.timestamp).toBe('1935-01-24T08:00:00+08:00')

    // blue should be present
    const blue = activeForces.value.find((f) => f.properties.id === 'blue-guizhou')
    expect(blue).toBeDefined()
  })

  it('should filter out forces exactly at current time (considering time as upper bound)', () => {
    // Forces at exactly current time should be included
    const f1 = makeForceFeature('red-1st', 'red', '1935-01-22T08:00:00+08:00', [107, 27.8])

    const collection = ref<ForcesCollection | null>(makeCollection([f1]))
    const currentTime = ref('1935-01-22T08:00:00+08:00')

    const { activeForces } = useForceMarkers(collection, currentTime)

    // Exact match should be included (not excluded)
    expect(activeForces.value).toHaveLength(1)
  })

  it('should count red and blue forces separately', () => {
    const f_red1 = makeForceFeature('red-1st', 'red', '1935-01-22T08:00:00+08:00', [107, 27.8])
    const f_red2 = makeForceFeature('red-3rd', 'red', '1935-01-22T08:00:00+08:00', [106, 28])
    const f_blue1 = makeForceFeature('blue-guizhou', 'blue', '1935-01-22T08:00:00+08:00', [107.2, 28.1])

    const collection = ref<ForcesCollection | null>(makeCollection([f_red1, f_red2, f_blue1]))
    const currentTime = ref('1935-01-25T00:00:00+08:00')

    const { redCount, blueCount } = useForceMarkers(collection, currentTime)

    expect(redCount.value).toBe(2)
    expect(blueCount.value).toBe(1)
  })

  it('should reactively update when currentTime changes', () => {
    const f1 = makeForceFeature('red-1st', 'red', '1935-01-22T08:00:00+08:00', [107, 27.8])
    const f2 = makeForceFeature('red-3rd', 'red', '1935-01-25T12:00:00+08:00', [106, 28])

    const collection = ref<ForcesCollection | null>(makeCollection([f1, f2]))
    const currentTime = ref('1935-01-23T00:00:00+08:00')

    const { activeForces } = useForceMarkers(collection, currentTime)

    // At 1935-01-23, only f1 is visible
    expect(activeForces.value).toHaveLength(1)
    expect(activeForces.value[0].properties.id).toBe('red-1st')

    // Advance time past f2
    currentTime.value = '1935-01-26T00:00:00+08:00'

    // Should now show both forces
    expect(activeForces.value).toHaveLength(2)
  })

  it('should reactively update when collection changes', () => {
    const collection = ref<ForcesCollection | null>(null)
    const currentTime = ref('1935-01-25T00:00:00+08:00')

    const { activeForces } = useForceMarkers(collection, currentTime)
    expect(activeForces.value).toEqual([])

    // Add forces
    const f1 = makeForceFeature('red-1st', 'red', '1935-01-22T08:00:00+08:00', [107, 27.8])
    collection.value = makeCollection([f1])

    expect(activeForces.value).toHaveLength(1)
  })

  it('getForceLatest should return correct force by id', () => {
    const f1 = makeForceFeature('red-1st', 'red', '1935-01-22T08:00:00+08:00', [107, 27.8])
    const f2 = makeForceFeature('red-3rd', 'red', '1935-01-22T08:00:00+08:00', [106, 28])

    const collection = ref<ForcesCollection | null>(makeCollection([f1, f2]))
    const currentTime = ref('1935-01-25T00:00:00+08:00')

    const { getForceLatest } = useForceMarkers(collection, currentTime)

    expect(getForceLatest('red-1st')).toBeDefined()
    expect(getForceLatest('red-1st')!.properties.id).toBe('red-1st')
    expect(getForceLatest('nonexistent')).toBeUndefined()
  })
})
