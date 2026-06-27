/**
 * DetailCards 测试
 *
 * 验证 ForceDetailCard / EventDetailCard / PersonDetailCard 的渲染。
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ForceDetailCard from './ForceDetailCard.vue'
import EventDetailCard from './EventDetailCard.vue'
import PersonDetailCard from './PersonDetailCard.vue'
import type { ForceFeature, EventRecord, Person } from '@/data/types'

const mockForce: ForceFeature = {
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
    next_destination: '土城',
    source: '《红军长征史》p.358',
  },
}

const mockEvent: EventRecord = {
  id: 'evt-tucheng-battle',
  type: 'battle',
  title: '土城战役',
  timestamp: '1935-01-28T10:00:00+08:00',
  duration_hours: 12,
  location: [105.97, 28.04],
  participants: ['red-3rd-army', 'red-5th-army'],
  outcome: 'red-retreat',
  casualties_red: 3000,
  casualties_blue: 1500,
  description: '红军在土城青杠坡与川军激战，红军主动撤出战斗。',
  sources: ['《土城战役综述》', '《红军长征史》p.362'],
}

const mockPerson: Person = {
  id: 'person-mao-zedong',
  name: '毛泽东',
  role: '中央政治局常委',
  key_decisions: [
    {
      timestamp: '1935-01-29',
      event_id: 'evt-first-crossing',
      decision: '提出放弃原定北渡长江计划，向西渡过赤水河进入川南',
    },
  ],
}

describe('ForceDetailCard', () => {
  it('应渲染部队名称和指挥员', () => {
    const wrapper = mount(ForceDetailCard, {
      props: { force: mockForce },
    })
    expect(wrapper.text()).toContain('红一军团')
    expect(wrapper.text()).toContain('林彪')
    expect(wrapper.text()).toContain('18,000 人')
  })

  it('红军部队应有红色样式类', () => {
    const wrapper = mount(ForceDetailCard, {
      props: { force: mockForce },
    })
    expect(wrapper.find('.side-red').exists()).toBe(true)
  })

  it('点击关闭按钮应触发 close 事件', async () => {
    const wrapper = mount(ForceDetailCard, {
      props: { force: mockForce },
    })
    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})

describe('EventDetailCard', () => {
  it('应渲染事件标题和描述', () => {
    const wrapper = mount(EventDetailCard, {
      props: { event: mockEvent },
    })
    expect(wrapper.text()).toContain('土城战役')
    expect(wrapper.text()).toContain('红军在土城青杠坡与川军激战')
  })

  it('应显示来源列表', () => {
    const wrapper = mount(EventDetailCard, {
      props: { event: mockEvent },
    })
    expect(wrapper.text()).toContain('《土城战役综述》')
  })
})

describe('PersonDetailCard', () => {
  it('应渲染人物姓名和角色', () => {
    const wrapper = mount(PersonDetailCard, {
      props: { person: mockPerson },
    })
    expect(wrapper.text()).toContain('毛泽东')
    expect(wrapper.text()).toContain('中央政治局常委')
  })

  it('应显示关键决策列表', () => {
    const wrapper = mount(PersonDetailCard, {
      props: { person: mockPerson },
    })
    expect(wrapper.text()).toContain('提出放弃原定北渡长江计划')
    expect(wrapper.text()).toContain('1935-01-29')
  })
})
