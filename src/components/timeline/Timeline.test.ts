import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import Timeline from './Timeline.vue'
import { useTimeStore, PHASES } from '@/stores/time'

describe('Timeline', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render all phase names', () => {
    const wrapper = mount(Timeline)

    const phaseButtons = wrapper.findAll('.phase-btn')
    expect(phaseButtons).toHaveLength(PHASES.length)

    // Check that each phase name is rendered
    for (const phase of PHASES) {
      expect(wrapper.text()).toContain(phase.name)
    }
  })

  it('should highlight the active phase', async () => {
    const wrapper = mount(Timeline)
    const store = useTimeStore()

    // Default: first-crossing active
    const activeBtn = wrapper.find('.phase-btn.active')
    expect(activeBtn.exists()).toBe(true)
    expect(activeBtn.text()).toContain('一渡赤水')

    // Switch to fourth-crossing
    store.setPhase('fourth-crossing')
    await nextTick()
    // After store update, the component should reflect it
    const activeBtns = wrapper.findAll('.phase-btn.active')
    expect(activeBtns).toHaveLength(1)
    expect(activeBtns[0].text()).toContain('四渡赤水')
  })

  it('should have a play button', () => {
    const wrapper = mount(Timeline)

    const playBtn = wrapper.find('.play-btn')
    expect(playBtn.exists()).toBe(true)
    expect(playBtn.text()).toBe('▶')
  })

  it('should toggle play/pause on button click', async () => {
    const wrapper = mount(Timeline)
    const store = useTimeStore()
    // Mock RAF to prevent real animation
    store._setRaf(() => 0)
    store._setCaf(() => {})

    const playBtn = wrapper.find('.play-btn')

    // Click to play
    await playBtn.trigger('click')
    expect(store.isPlaying).toBe(true)

    // Click to pause
    await playBtn.trigger('click')
    expect(store.isPlaying).toBe(false)
  })

  it('should display the current time', async () => {
    const wrapper = mount(Timeline)
    const store = useTimeStore()

    store.setTime('1935-01-25T14:30:00+08:00')
    await nextTick()

    const timeDisplay = wrapper.find('.time-display')
    expect(timeDisplay.exists()).toBe(true)
    expect(timeDisplay.text()).toContain('01-25')
    expect(timeDisplay.text()).toContain('14:30')
  })

  it('should render speed buttons with current speed highlighted', async () => {
    const wrapper = mount(Timeline)
    const store = useTimeStore()

    // Default speed 1
    const speedBtns = wrapper.findAll('.speed-btn')
    expect(speedBtns).toHaveLength(4)

    // Speed 1 is active by default
    const activeSpeed = wrapper.find('.speed-btn.active')
    expect(activeSpeed.text()).toBe('×1')

    // Change speed
    store.setSpeed(8)
    await nextTick()
    const updatedActiveSpeed = wrapper.find('.speed-btn.active')
    expect(updatedActiveSpeed.text()).toBe('×8')
  })

  it('should allow clicking a phase button to switch phases', async () => {
    const wrapper = mount(Timeline)
    const store = useTimeStore()

    const phaseButtons = wrapper.findAll('.phase-btn')
    // Click on the fourth phase button (四渡赤水)
    const fourthBtn = phaseButtons[3]
    await fourthBtn.trigger('click')

    expect(store.currentPhase).toBe('fourth-crossing')
  })

  it('should render the progress bar', () => {
    const wrapper = mount(Timeline)

    const progress = wrapper.find('.timeline-progress')
    expect(progress.exists()).toBe(true)
  })

  it('should render the track thumb', () => {
    const wrapper = mount(Timeline)

    const thumb = wrapper.find('.timeline-thumb')
    expect(thumb.exists()).toBe(true)
  })
})
