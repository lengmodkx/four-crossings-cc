/**
 * SelectionStore — 选中状态管理
 *
 * 管理用户在地图/时间轴上选中的实体:
 * - selectedForce: 当前选中的部队
 * - selectedEvent: 当前选中的事件
 * - selectedPerson: 当前选中的人物
 * - selectedMeeting: 当前选中的会议
 *
 * 同一时间仅允许一个实体被选中（选中新实体自动取消旧选中）。
 */
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ForceFeature, EventRecord, Person, Meeting } from '@/data/types'

export const useSelectionStore = defineStore('selection', () => {
  // ===== 状态 =====
  const selectedForce = ref<ForceFeature | null>(null)
  const selectedEvent = ref<EventRecord | null>(null)
  const selectedPerson = ref<Person | null>(null)
  const selectedMeeting = ref<Meeting | null>(null)

  // ===== 方法 =====

  function selectForce(force: ForceFeature | null): void {
    _clearAllExcept('force')
    selectedForce.value = force
  }

  function selectEvent(event: EventRecord | null): void {
    _clearAllExcept('event')
    selectedEvent.value = event
  }

  function selectPerson(person: Person | null): void {
    _clearAllExcept('person')
    selectedPerson.value = person
  }

  function selectMeeting(meeting: Meeting | null): void {
    _clearAllExcept('meeting')
    selectedMeeting.value = meeting
  }

  /**
   * 清除指定类型以外的所有选中
   */
  function _clearAllExcept(type: 'force' | 'event' | 'person' | 'meeting'): void {
    if (type !== 'force') selectedForce.value = null
    if (type !== 'event') selectedEvent.value = null
    if (type !== 'person') selectedPerson.value = null
    if (type !== 'meeting') selectedMeeting.value = null
  }

  /**
   * 清除全部选中状态
   */
  function clear(): void {
    selectedForce.value = null
    selectedEvent.value = null
    selectedPerson.value = null
    selectedMeeting.value = null
  }

  return {
    // 状态
    selectedForce,
    selectedEvent,
    selectedPerson,
    selectedMeeting,
    // 方法
    selectForce,
    selectEvent,
    selectPerson,
    selectMeeting,
    clear,
  }
})
