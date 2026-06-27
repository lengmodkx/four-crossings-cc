import { describe, it, expect } from 'vitest'
import type {
  LngLat,
  ForceSide,
  ForceLevel,
  ForceStatus,
  ForceProperties,
  ForceFeature,
  ForcesCollection,
  TrajectoryProperties,
  TrajectoryFeature,
  TrajectoriesCollection,
  EventType,
  EventOutcome,
  EventRecord,
  EventsFile,
  PersonDecision,
  Person,
  PersonsFile,
  Meeting,
  MeetingsFile,
} from './types'
import {
  DATA_MODEL_VERSION,
  FORCE_SIDES,
  FORCE_LEVELS,
  FORCE_STATUSES,
  EVENT_TYPES,
  EVENT_OUTCOMES,
  MEETING_PARTICIPANT_TYPES,
} from './types'

describe('TypeScript type definitions', () => {
  describe('runtime constants', () => {
    it('should export DATA_MODEL_VERSION', () => {
      expect(DATA_MODEL_VERSION).toBe('0.1.0')
    })

    it('should export FORCE_SIDES', () => {
      expect(FORCE_SIDES).toEqual(['red', 'blue'])
    })

    it('should export FORCE_LEVELS', () => {
      expect(FORCE_LEVELS).toContain('army')
      expect(FORCE_LEVELS).toContain('division')
      expect(FORCE_LEVELS).toContain('regiment')
    })

    it('should export FORCE_STATUSES', () => {
      expect(FORCE_STATUSES).toContain('marching')
      expect(FORCE_STATUSES).toContain('engaged')
      expect(FORCE_STATUSES).toContain('resting')
      expect(FORCE_STATUSES).toContain('crossing')
    })

    it('should export EVENT_TYPES', () => {
      expect(EVENT_TYPES).toContain('battle')
      expect(EVENT_TYPES).toContain('meeting')
      expect(EVENT_TYPES).toContain('crossing')
      expect(EVENT_TYPES).toContain('maneuver')
    })

    it('should export EVENT_OUTCOMES', () => {
      expect(EVENT_OUTCOMES).toContain('red-advance')
      expect(EVENT_OUTCOMES).toContain('red-retreat')
      expect(EVENT_OUTCOMES).toContain('blue-advance')
      expect(EVENT_OUTCOMES).toContain('blue-retreat')
      expect(EVENT_OUTCOMES).toContain('stalemate')
    })
  })

  describe('LngLat', () => {
    it('should accept a valid [lng, lat] tuple', () => {
      const point: LngLat = [105.97, 28.04]
      expect(point[0]).toBe(105.97)
      expect(point[1]).toBe(28.04)
    })
  })

  describe('ForceProperties', () => {
    it('should accept a valid ForceProperties object', () => {
      const props: ForceProperties = {
        id: 'red-1st-army-1st-div-1935-01-22',
        type: 'force',
        side: 'red',
        name: '红一军团第一师',
        level: 'division',
        parent_id: 'red-1st-army',
        commander: '李聚奎',
        strength: 3500,
        timestamp: '1935-01-22T08:00:00+08:00',
        status: 'marching',
        next_destination: '习水',
        source: '《长征》刘统 p.142,《红军长征史》p.358',
      }
      expect(props.side).toBe('red')
      expect(props.level).toBe('division')
    })

    it('should accept ForceSide "blue"', () => {
      const props: ForceProperties = {
        id: 'blue-guizhou-3rd-div-1935-01-28',
        type: 'force',
        side: 'blue',
        name: '黔军第三师',
        level: 'division',
        commander: '何知重',
        strength: 5000,
        timestamp: '1935-01-28T10:00:00+08:00',
        status: 'engaged',
        source: '《土城战役综述》',
      }
      expect(props.side).toBe('blue')
      expect(props.status).toBe('engaged')
    })

    it('should support all ForceLevel variants from FORCE_LEVELS', () => {
      FORCE_LEVELS.forEach((level) => {
        const props: ForceProperties = {
          id: `test-${level}-01`,
          type: 'force',
          side: 'red',
          name: `测试${level}`,
          level,
          commander: '测试',
          strength: 1000,
          timestamp: '1935-01-22T08:00:00+08:00',
          status: 'marching',
          source: 'test',
        }
        expect(props.level).toBe(level)
      })
    })

    it('should support all ForceStatus variants from FORCE_STATUSES', () => {
      FORCE_STATUSES.forEach((status) => {
        const props: ForceProperties = {
          id: `test-status-${status}-01`,
          type: 'force',
          side: 'red',
          name: `测试${status}`,
          level: 'army',
          commander: '测试',
          strength: 1000,
          timestamp: '1935-01-22T08:00:00+08:00',
          status,
          source: 'test',
        }
        expect(props.status).toBe(status)
      })
    })

    it('should type-check that ForceSide matches FORCE_SIDES values', () => {
      const sides: ForceSide[] = [...FORCE_SIDES]
      expect(sides).toHaveLength(2)
    })
  })

  describe('ForceFeature', () => {
    it('should accept a valid GeoJSON Feature', () => {
      const feature: ForceFeature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [105.07, 27.83] },
        properties: {
          id: 'red-1st-army-1st-div-1935-01-22',
          type: 'force',
          side: 'red',
          name: '红一军团第一师',
          level: 'division',
          parent_id: 'red-1st-army',
          commander: '李聚奎',
          strength: 3500,
          timestamp: '1935-01-22T08:00:00+08:00',
          status: 'marching',
          next_destination: '习水',
          source: '《长征》刘统 p.142',
        },
      }
      expect(feature.type).toBe('Feature')
      expect(feature.geometry.type).toBe('Point')
      expect(feature.geometry.coordinates).toEqual([105.07, 27.83])
    })
  })

  describe('ForcesCollection', () => {
    it('should accept a valid FeatureCollection', () => {
      const collection: ForcesCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      expect(collection.type).toBe('FeatureCollection')
      expect(collection.features).toHaveLength(0)
    })
  })

  describe('TrajectoryProperties', () => {
    it('should accept a valid trajectory properties object', () => {
      const props: TrajectoryProperties = {
        id: 'traj-red-1st-army-1935-01-19-29',
        force_id: 'red-1st-army',
        segment_start: '1935-01-19',
        segment_end: '1935-01-29',
        phase: 'first-crossing',
        color: '#C0392B',
        source: '《红军长征在贵州》p.123',
      }
      expect(props.force_id).toBe('red-1st-army')
      expect(props.phase).toBe('first-crossing')
    })
  })

  describe('TrajectoryFeature', () => {
    it('should accept a valid LineString trajectory feature', () => {
      const feature: TrajectoryFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [105.07, 27.83],
            [105.12, 27.90],
            [105.97, 28.04],
          ],
        },
        properties: {
          id: 'traj-red-1st-army-1935-01-19-29',
          force_id: 'red-1st-army',
          segment_start: '1935-01-19',
          segment_end: '1935-01-29',
          phase: 'first-crossing',
          color: '#C0392B',
          source: '《红军长征在贵州》p.123',
        },
      }
      expect(feature.geometry.type).toBe('LineString')
      expect(feature.geometry.coordinates).toHaveLength(3)
    })
  })

  describe('TrajectoriesCollection', () => {
    it('should accept a valid trajectories collection', () => {
      const collection: TrajectoriesCollection = {
        type: 'FeatureCollection',
        features: [],
      }
      expect(collection.type).toBe('FeatureCollection')
    })
  })

  describe('EventRecord', () => {
    it('should accept a valid battle event', () => {
      const record: EventRecord = {
        id: 'evt-tucheng-battle-1935-01-28',
        type: 'battle',
        title: '土城战役',
        timestamp: '1935-01-28T10:00:00+08:00',
        duration_hours: 8,
        location: [105.97, 28.04],
        participants: ['red-3rd-army', 'red-5th-army', 'guizhou-3rd-div'],
        outcome: 'red-retreat',
        casualties_red: 3000,
        casualties_blue: 1000,
        description: '土城战役，红军与川军郭勋祺部激战',
        sources: ['《土城战役综述》', '《红军长征史》p.362'],
      }
      expect(record.type).toBe('battle')
      expect(record.outcome).toBe('red-retreat')
    })

    it('should support all EventType variants from EVENT_TYPES', () => {
      EVENT_TYPES.forEach((t) => {
        const record: EventRecord = {
          id: `evt-test-${t}-01`,
          type: t,
          title: `测试${t}`,
          timestamp: '1935-01-22T08:00:00+08:00',
          location: [105.07, 27.83],
          participants: ['test-unit'],
          outcome: 'red-advance',
          description: 'test',
          sources: ['test'],
        }
        expect(record.type).toBe(t)
      })
    })

    it('should support all EventOutcome variants from EVENT_OUTCOMES', () => {
      EVENT_OUTCOMES.forEach((o) => {
        const record: EventRecord = {
          id: `evt-outcome-${o.replace(/-/g, '_')}-01`,
          type: 'battle',
          title: `测试${o}`,
          timestamp: '1935-01-22T08:00:00+08:00',
          location: [105.07, 27.83],
          participants: ['test-unit'],
          outcome: o,
          description: 'test',
          sources: ['test'],
        }
        expect(record.outcome).toBe(o)
      })
    })
  })

  describe('EventsFile', () => {
    it('should accept a valid events file structure', () => {
      const file: EventsFile = {
        events: [],
      }
      expect(file.events).toHaveLength(0)
    })
  })

  describe('PersonDecision', () => {
    it('should accept a valid person decision', () => {
      const decision: PersonDecision = {
        timestamp: '1935-01-29',
        event_id: 'evt-zuixi-meeting',
        decision: '提出回师黔北',
      }
      expect(decision.timestamp).toBe('1935-01-29')
    })
  })

  describe('Person', () => {
    it('should accept a valid person record', () => {
      const person: Person = {
        id: 'person-mao-zedong',
        name: '毛泽东',
        role: '中央政治局常委',
        trajectory_ref: 'traj-central-committee',
        key_decisions: [
          {
            timestamp: '1935-01-29',
            event_id: 'evt-zuixi-meeting',
            decision: '提出回师黔北',
          },
        ],
      }
      expect(person.name).toBe('毛泽东')
      expect(person.key_decisions).toHaveLength(1)
    })
  })

  describe('PersonsFile', () => {
    it('should accept a valid persons file structure', () => {
      const file: PersonsFile = {
        persons: [],
      }
      expect(file.persons).toHaveLength(0)
    })
  })

  describe('Meeting', () => {
    it('should accept a valid meeting record', () => {
      const meeting: Meeting = {
        id: 'meeting-zunyi-1935-01-15',
        name: '遵义会议',
        location: [106.92, 27.72],
        date_start: '1935-01-15',
        date_end: '1935-01-17',
        background: '第五次反围剿失败后，红军到达遵义',
        resolutions: ['确立毛泽东领导地位', '改变原定北渡长江计划'],
        participants: [
          {
            person_id: 'person-mao-zedong',
            role: '政治局常委',
          },
        ],
        related_event_ids: ['evt-zuixi-meeting'],
        sources: ['《遵义会议文献》', '《毛泽东年谱》'],
      }
      expect(meeting.name).toBe('遵义会议')
      expect(meeting.resolutions).toHaveLength(2)
    })
  })

  describe('MeetingsFile', () => {
    it('should accept a valid meetings file structure', () => {
      const file: MeetingsFile = {
        meetings: [],
      }
      expect(file.meetings).toHaveLength(0)
    })
  })
})
