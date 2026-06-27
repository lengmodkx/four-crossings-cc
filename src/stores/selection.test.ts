/**
 * SelectionStore 测试
 *
 * 验证选中状态管理: select/clear 方法, 互斥选中, 初始空值。
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSelectionStore } from './selection'
import type {
  ForceFeature,
  EventRecord,
  Person,
  Meeting,
} from '@/data/types'

function makeMockForce(name: string): ForceFeature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [107.05, 27.82] },
    properties: {
      id: `force-${name}`,
      type: 'force',
      side: 'red',
      name,
      level: 'army',
      commander: '测试指挥员',
      strength: 10000,
      timestamp: '1935-01-22T08:00:00+08:00',
      status: 'marching',
      source: '测试来源',
    },
  }
}

function makeMockEvent(title: string): EventRecord {
  return {
    id: `event-${title}`,
    type: 'battle',
    title,
    timestamp: '1935-01-28T10:00:00+08:00',
    location: [105.97, 28.04],
    participants: [],
    outcome: 'red-retreat',
    description: '测试描述',
    sources: ['测试来源'],
  }
}

function makeMockPerson(name: string): Person {
  return {
    id: `person-${name}`,
    name,
    role: '指挥员',
    key_decisions: [],
  }
}

function makeMockMeeting(name: string): Meeting {
  return {
    id: `meeting-${name}`,
    name,
    location: [106.92, 27.72],
    date_start: '1935-01-15',
    date_end: '1935-01-17',
    background: '测试背景',
    resolutions: [],
    participants: [],
    related_event_ids: [],
    sources: [],
  }
}

describe('useSelectionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('所有选中项初始为 null', () => {
      const store = useSelectionStore()
      expect(store.selectedForce).toBeNull()
      expect(store.selectedEvent).toBeNull()
      expect(store.selectedPerson).toBeNull()
      expect(store.selectedMeeting).toBeNull()
    })
  })

  describe('selectForce', () => {
    it('选中部队后 selectedForce 应有值', () => {
      const store = useSelectionStore()
      const force = makeMockForce('红一军团')
      store.selectForce(force)
      expect(store.selectedForce).toEqual(force)
    })

    it('传入 null 应取消选中', () => {
      const store = useSelectionStore()
      const force = makeMockForce('红一军团')
      store.selectForce(force)
      store.selectForce(null)
      expect(store.selectedForce).toBeNull()
    })
  })

  describe('selectEvent', () => {
    it('选中事件后 selectedEvent 应有值', () => {
      const store = useSelectionStore()
      const event = makeMockEvent('遵义会议')
      store.selectEvent(event)
      expect(store.selectedEvent).toEqual(event)
    })

    it('传入 null 应取消选中', () => {
      const store = useSelectionStore()
      const event = makeMockEvent('遵义会议')
      store.selectEvent(event)
      store.selectEvent(null)
      expect(store.selectedEvent).toBeNull()
    })
  })

  describe('selectPerson', () => {
    it('选中人物后 selectedPerson 应有值', () => {
      const store = useSelectionStore()
      const person = makeMockPerson('毛泽东')
      store.selectPerson(person)
      expect(store.selectedPerson).toEqual(person)
    })
  })

  describe('selectMeeting', () => {
    it('选中会议后 selectedMeeting 应有值', () => {
      const store = useSelectionStore()
      const meeting = makeMockMeeting('遵义会议')
      store.selectMeeting(meeting)
      expect(store.selectedMeeting).toEqual(meeting)
    })
  })

  describe('互斥选中', () => {
    it('选中部队后切换选中事件，部队应清除', () => {
      const store = useSelectionStore()
      const force = makeMockForce('红一军团')
      const event = makeMockEvent('土城战役')

      store.selectForce(force)
      expect(store.selectedForce).toEqual(force)

      store.selectEvent(event)
      expect(store.selectedEvent).toEqual(event)
      expect(store.selectedForce).toBeNull()
    })

    it('选中人物后切换选中会议，人物应清除', () => {
      const store = useSelectionStore()
      const person = makeMockPerson('毛泽东')
      const meeting = makeMockMeeting('遵义会议')

      store.selectPerson(person)
      store.selectMeeting(meeting)

      expect(store.selectedMeeting).toEqual(meeting)
      expect(store.selectedPerson).toBeNull()
    })
  })

  describe('clear', () => {
    it('clear 后所有选中项应为 null', () => {
      const store = useSelectionStore()
      const force = makeMockForce('红一军团')
      const event = makeMockEvent('土城战役')
      const person = makeMockPerson('毛泽东')
      const meeting = makeMockMeeting('遵义会议')

      store.selectForce(force)
      store.selectEvent(event)
      store.selectPerson(person)
      store.selectMeeting(meeting)

      // 由于互斥，只有一个有值。我们逐个设置后验证 clear。
      // 逐个设置后最后一个设置的是 meeting
      expect(store.selectedMeeting).not.toBeNull()
      expect(store.selectedForce).toBeNull()

      store.clear()

      expect(store.selectedForce).toBeNull()
      expect(store.selectedEvent).toBeNull()
      expect(store.selectedPerson).toBeNull()
      expect(store.selectedMeeting).toBeNull()
    })
  })
})
