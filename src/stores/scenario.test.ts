/**
 * ScenarioStore 测试
 *
 * 验证数据加载: loadAll 并行加载, 单独加载方法, loaded 状态。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScenarioStore } from './scenario'

function createMockForcesGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [107.05, 27.82] },
        properties: {
          id: 'red-1st-army',
          type: 'force',
          side: 'red',
          name: '红一军团',
          level: 'army',
          commander: '林彪',
          strength: 18000,
          timestamp: '1935-01-22T08:00:00+08:00',
          status: 'marching',
          source: '《红军长征史》',
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [107.12, 27.78] },
        properties: {
          id: 'red-3rd-army',
          type: 'force',
          side: 'red',
          name: '红三军团',
          level: 'army',
          commander: '彭德怀',
          strength: 12000,
          timestamp: '1935-01-22T08:00:00+08:00',
          status: 'marching',
          source: '《红军长征史》',
        },
      },
    ],
  }
}

function createMockTrajectoriesGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [107.05, 27.82],
            [106.45, 28.02],
          ],
        },
        properties: {
          id: 'traj-red-1st-army',
          force_id: 'red-1st-army',
          segment_start: '1935-01-22',
          segment_end: '1935-01-30',
          phase: 'first-crossing',
          color: '#C0392B',
          source: '《红军长征在贵州》',
        },
      },
    ],
  }
}

function createMockEventsJSON() {
  return {
    events: [
      {
        id: 'evt-zunyi-meeting',
        type: 'meeting',
        title: '遵义会议',
        timestamp: '1935-01-15T14:00:00+08:00',
        location: [106.92, 27.72],
        participants: ['person-mao-zedong'],
        outcome: 'red-advance',
        description: '中共中央在遵义召开会议',
        sources: ['《遵义会议文献》'],
      },
    ],
  }
}

function createMockPersonsJSON() {
  return {
    persons: [
      {
        id: 'person-mao-zedong',
        name: '毛泽东',
        role: '中央政治局常委',
        key_decisions: [
          {
            timestamp: '1935-01-29',
            event_id: 'evt-first-crossing',
            decision: '提出放弃北渡长江计划',
          },
        ],
      },
    ],
  }
}

function createMockMeetingsJSON() {
  return {
    meetings: [
      {
        id: 'meeting-zunyi',
        name: '遵义会议',
        location: [106.92, 27.72],
        date_start: '1935-01-15',
        date_end: '1935-01-17',
        background: '第五次反围剿失败',
        resolutions: ['选举毛泽东为常委'],
        participants: [
          { person_id: 'person-mao-zedong', role: '政治局常委' },
        ],
        related_event_ids: ['evt-zunyi-meeting'],
        sources: ['《遵义会议文献》'],
      },
    ],
  }
}

describe('useScenarioStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('初始 loaded 为 false', () => {
      const store = useScenarioStore()
      expect(store.loaded).toBe(false)
    })

    it('初始数据数组为空', () => {
      const store = useScenarioStore()
      expect(store.forces).toEqual([])
      expect(store.trajectories).toEqual([])
      expect(store.events).toEqual([])
      expect(store.persons).toEqual([])
      expect(store.meetings).toEqual([])
    })
  })

  describe('loadAll', () => {
    it('并行加载所有数据后 loaded 变为 true', async () => {
      const mockFetch = vi.fn((url: string) => {
        const urlStr = String(url)
        if (urlStr.includes('forces.geojson')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockForcesGeoJSON()),
          })
        }
        if (urlStr.includes('trajectories.geojson')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockTrajectoriesGeoJSON()),
          })
        }
        if (urlStr.includes('events.json')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockEventsJSON()),
          })
        }
        if (urlStr.includes('persons.json')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockPersonsJSON()),
          })
        }
        if (urlStr.includes('meetings.json')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockMeetingsJSON()),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      vi.stubGlobal('fetch', mockFetch)

      const store = useScenarioStore()
      await store.loadAll()

      expect(store.loaded).toBe(true)
    })

    it('loadAll 后数据非空', async () => {
      const mockFetch = vi.fn((url: string) => {
        const urlStr = String(url)
        if (urlStr.includes('forces.geojson')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockForcesGeoJSON()),
          })
        }
        if (urlStr.includes('trajectories.geojson')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockTrajectoriesGeoJSON()),
          })
        }
        if (urlStr.includes('events.json')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockEventsJSON()),
          })
        }
        if (urlStr.includes('persons.json')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockPersonsJSON()),
          })
        }
        if (urlStr.includes('meetings.json')) {
          return Promise.resolve({
            json: () => Promise.resolve(createMockMeetingsJSON()),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

      vi.stubGlobal('fetch', mockFetch)

      const store = useScenarioStore()
      await store.loadAll()

      expect(store.forces.length).toBe(2)
      expect(store.forces[0].properties.name).toBe('红一军团')
      expect(store.trajectories.length).toBe(1)
      expect(store.events.length).toBe(1)
      expect(store.events[0].title).toBe('遵义会议')
      expect(store.persons.length).toBe(1)
      expect(store.persons[0].name).toBe('毛泽东')
      expect(store.meetings.length).toBe(1)
      expect(store.meetings[0].name).toBe('遵义会议')
    })

    it('重复调用 loadAll 不会重复加载', async () => {
      const mockFetch = vi.fn((url: string) => {
        return Promise.resolve({
          json: () => Promise.resolve(createMockForcesGeoJSON()),
        })
      })

      vi.stubGlobal('fetch', mockFetch)

      const store = useScenarioStore()
      await store.loadAll()
      const callCount = mockFetch.mock.calls.length
      await store.loadAll()
      // 第二次调用不应触发新的 fetch
      expect(mockFetch.mock.calls.length).toBe(callCount)
    })
  })

  describe('单独加载方法', () => {
    it('loadForces 单独加载部队数据', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({ json: () => Promise.resolve(createMockForcesGeoJSON()) })
      )
      vi.stubGlobal('fetch', mockFetch)

      const store = useScenarioStore()
      const result = await store.loadForces()

      expect(result.length).toBe(2)
      expect(store.forces.length).toBe(2)
      expect(store.loaded).toBe(false) // loadAll 未调用
    })
  })

  describe('辅助方法', () => {
    it('getForceById 根据 ID 查找部队', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({ json: () => Promise.resolve(createMockForcesGeoJSON()) })
      )
      vi.stubGlobal('fetch', mockFetch)

      const store = useScenarioStore()
      await store.loadForces()

      const force = store.getForceById('red-1st-army')
      expect(force).toBeDefined()
      expect(force!.properties.name).toBe('红一军团')
    })

    it('getForceById 找不到时返回 undefined', () => {
      const store = useScenarioStore()
      expect(store.getForceById('nonexistent')).toBeUndefined()
    })

    it('getEventById 根据 ID 查找事件', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({ json: () => Promise.resolve(createMockEventsJSON()) })
      )
      vi.stubGlobal('fetch', mockFetch)

      const store = useScenarioStore()
      await store.loadEvents()

      const event = store.getEventById('evt-zunyi-meeting')
      expect(event).toBeDefined()
      expect(event!.title).toBe('遵义会议')
    })

    it('reset 清空所有数据', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({ json: () => Promise.resolve(createMockForcesGeoJSON()) })
      )
      vi.stubGlobal('fetch', mockFetch)

      const store = useScenarioStore()
      await store.loadForces()
      expect(store.forces.length).toBe(2)

      store.reset()
      expect(store.forces).toEqual([])
      expect(store.loaded).toBe(false)
    })
  })
})
