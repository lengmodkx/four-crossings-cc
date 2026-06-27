import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  useTimeStore,
  PHASES,
  CAMPAIGN_START,
  CAMPAIGN_END,
  parseTime,
  formatTime,
} from './time'

describe('TimeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should have campaign start as initial time', () => {
      const store = useTimeStore()
      expect(store.currentTime).toBe(CAMPAIGN_START)
    })

    it('should have first phase as initial phase', () => {
      const store = useTimeStore()
      expect(store.currentPhase).toBe('first-crossing')
    })

    it('should not be playing initially', () => {
      const store = useTimeStore()
      expect(store.isPlaying).toBe(false)
    })

    it('should have speed 1 by default', () => {
      const store = useTimeStore()
      expect(store.speed).toBe(1)
    })
  })

  describe('setTime', () => {
    it('should update currentTime', () => {
      const store = useTimeStore()
      store.setTime('1935-01-25T12:00:00+08:00')
      expect(store.currentTime).toBe('1935-01-25T12:00:00+08:00')
    })

    it('should auto-sync phase based on time', () => {
      const store = useTimeStore()
      // Time in second phase
      store.setTime('1935-02-15T00:00:00+08:00')
      expect(store.currentPhase).toBe('second-crossing')
    })

    it('should clamp time to campaign start', () => {
      const store = useTimeStore()
      store.setTime('1930-01-01T00:00:00+08:00')
      expect(store.currentTime).toBe(CAMPAIGN_START)
    })

    it('should clamp time to campaign end', () => {
      const store = useTimeStore()
      store.setTime('1936-01-01T00:00:00+08:00')
      expect(store.currentTime).toBe(CAMPAIGN_END)
    })
  })

  describe('setPhase', () => {
    it('should switch to the specified phase', () => {
      const store = useTimeStore()
      store.setPhase('fourth-crossing')
      expect(store.currentPhase).toBe('fourth-crossing')
    })

    it('should set time to phase start when switching phase', () => {
      const store = useTimeStore()
      store.setPhase('fourth-crossing')
      expect(store.currentTime).toBe('1935-03-18T00:00:00+08:00')
    })

    it('should ignore unknown phase id', () => {
      const store = useTimeStore()
      store.setPhase('non-existent-phase')
      expect(store.currentPhase).toBe('first-crossing')
    })
  })

  describe('play / pause / togglePlay', () => {
    it('should set isPlaying to true when play is called', () => {
      const store = useTimeStore()
      // Replace RAF with noop to prevent side effects
      store._setRaf(() => 0)
      store._setCaf(() => {})
      store.play()
      expect(store.isPlaying).toBe(true)
    })

    it('should set isPlaying to false when pause is called', () => {
      const store = useTimeStore()
      store._setRaf(() => 0)
      store._setCaf(() => {})
      store.play()
      store.pause()
      expect(store.isPlaying).toBe(false)
    })

    it('should toggle isPlaying with togglePlay', () => {
      const store = useTimeStore()
      store._setRaf(() => 0)
      store._setCaf(() => {})
      expect(store.isPlaying).toBe(false)

      store.togglePlay()
      expect(store.isPlaying).toBe(true)

      store.togglePlay()
      expect(store.isPlaying).toBe(false)
    })
  })

  describe('setSpeed', () => {
    it('should change speed', () => {
      const store = useTimeStore()
      store.setSpeed(4)
      expect(store.speed).toBe(4)
    })

    it('should accept all valid speeds', () => {
      const store = useTimeStore()
      const speeds = [1, 2, 4, 8] as const
      for (const s of speeds) {
        store.setSpeed(s)
        expect(store.speed).toBe(s)
      }
    })
  })

  describe('phaseRange', () => {
    it('should return correct range for current phase', () => {
      const store = useTimeStore()
      store.setPhase('first-crossing')
      expect(store.phaseRange).toEqual({
        start: '1935-01-19T00:00:00+08:00',
        end: '1935-02-09T23:59:59+08:00',
      })
    })

    it('should update when phase changes', () => {
      const store = useTimeStore()
      store.setPhase('jinsha-river')
      expect(store.phaseRange).toEqual({
        start: '1935-04-08T00:00:00+08:00',
        end: '1935-05-09T23:59:59+08:00',
      })
    })
  })

  describe('auto-stop at phase end', () => {
    it('should auto-pause when time reaches phase end', () => {
      const store = useTimeStore()
      store.setPhase('first-crossing')
      // Set time just before phase end
      store.setTime('1935-02-09T23:50:00+08:00')

      // Mock RAF to simulate fast time
      let rafCallback: FrameRequestCallback | null = null
      let callCount = 0
      store._setRaf((cb) => {
        rafCallback = cb
        return ++callCount
      })
      store._setCaf(() => {})

      store.play()
      expect(store.isPlaying).toBe(true)

      // Simulate one RAF tick with a large time delta that pushes past phase end
      // 1 real second = 6 campaign hours at speed 1
      // We need enough deltaMs to push past the phase end
      // Current time: 1935-02-09T23:50:00, phase end: 1935-02-09T23:59:59
      // We need to advance ~10 minutes of campaign time
      // deltaMs needed = (10/60) / 6 * 1000 ≈ 27.7ms
      // Let's use a big delta: 10 real seconds = 60 campaign hours
      // deltaMs = 10000

      // But first tick sets lastRafTime, so we need two ticks
      if (rafCallback) {
        rafCallback(100)
      }
      if (rafCallback) {
        // This will push past phase end since 1s = 6h at speed 1
        // delta = 100000ms = 100s * 6h/s = 600h which is way past
        rafCallback(100100)
      }

      expect(store.isPlaying).toBe(false)
      // Time should be exactly at phase end
      expect(store.currentTime).toBe('1935-02-09T23:59:59+08:00')
    })

    it('should auto-pause when time reaches campaign end', () => {
      const store = useTimeStore()
      store.setPhase('jinsha-river')
      store.setTime('1935-05-09T23:50:00+08:00')

      let rafCallback: FrameRequestCallback | null = null
      let callCount = 0
      store._setRaf((cb) => {
        rafCallback = cb
        return ++callCount
      })
      store._setCaf(() => {})

      store.play()

      // First tick to set lastRafTime
      if (rafCallback) {
        rafCallback(100)
      }
      // Second tick with large delta
      if (rafCallback) {
        rafCallback(100100)
      }

      expect(store.isPlaying).toBe(false)
      expect(store.currentTime).toBe(CAMPAIGN_END)
    })
  })

  describe('currentPhaseIndex', () => {
    it('should return 0 for first phase', () => {
      const store = useTimeStore()
      store.setPhase('first-crossing')
      expect(store.currentPhaseIndex).toBe(0)
    })

    it('should return 4 for jinsha-river phase', () => {
      const store = useTimeStore()
      store.setPhase('jinsha-river')
      expect(store.currentPhaseIndex).toBe(4)
    })
  })

  describe('PHASES constant', () => {
    it('should have 5 phases', () => {
      expect(PHASES).toHaveLength(5)
    })

    it('should have correctly ordered phases', () => {
      expect(PHASES[0].id).toBe('first-crossing')
      expect(PHASES[1].id).toBe('second-crossing')
      expect(PHASES[2].id).toBe('third-crossing')
      expect(PHASES[3].id).toBe('fourth-crossing')
      expect(PHASES[4].id).toBe('jinsha-river')
    })
  })
})

describe('parseTime', () => {
  it('should parse ISO string to Date', () => {
    const d = parseTime('1935-01-19T00:00:00+08:00')
    expect(d).toBeInstanceOf(Date)
    expect(d.getFullYear()).toBe(1935)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(19)
  })
})

describe('formatTime', () => {
  it('should format Date to ISO string with +08:00', () => {
    const d = new Date('1935-01-19T00:00:00+08:00')
    const s = formatTime(d)
    expect(s).toBe('1935-01-19T00:00:00+08:00')
  })
})
