import { describe, it, expect } from 'vitest'
import {
  ForcePropertiesSchema,
  ForceFeatureSchema,
  ForcesCollectionSchema,
  TrajectoryPropertiesSchema,
  TrajectoryFeatureSchema,
  TrajectoriesCollectionSchema,
  EventRecordSchema,
  EventsFileSchema,
  PersonDecisionSchema,
  PersonSchema,
  PersonsFileSchema,
  MeetingParticipantSchema,
  MeetingSchema,
  MeetingsFileSchema,
} from './schema'

describe('zod schemas', () => {
  // ============================================================
  // ForcePropertiesSchema
  // ============================================================
  describe('ForcePropertiesSchema', () => {
    const validForce = {
      id: 'red-1st-army-1st-div-1935-01-22',
      type: 'force' as const,
      side: 'red' as const,
      name: '红一军团第一师',
      level: 'division' as const,
      parent_id: 'red-1st-army',
      commander: '李聚奎',
      strength: 3500,
      timestamp: '1935-01-22T08:00:00+08:00',
      status: 'marching' as const,
      next_destination: '习水',
      source: '《长征》刘统 p.142,《红军长征史》p.358',
    }

    it('should validate a correct force properties object', () => {
      const result = ForcePropertiesSchema.safeParse(validForce)
      expect(result.success).toBe(true)
    })

    it('should allow optional parent_id and next_destination to be missing', () => {
      const minimal = {
        id: 'test-unit-01',
        type: 'force' as const,
        side: 'red' as const,
        name: '测试部队',
        level: 'army' as const,
        commander: '测试',
        strength: 1000,
        timestamp: '1935-01-22T08:00:00+08:00',
        status: 'marching' as const,
        source: 'test',
      }
      const result = ForcePropertiesSchema.safeParse(minimal)
      expect(result.success).toBe(true)
    })

    it('should reject invalid side', () => {
      const invalid = { ...validForce, side: 'green' }
      const result = ForcePropertiesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject invalid level', () => {
      const invalid = { ...validForce, level: 'corps' }
      const result = ForcePropertiesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject invalid status', () => {
      const invalid = { ...validForce, status: 'sleeping' }
      const result = ForcePropertiesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject id with invalid format', () => {
      const invalid = { ...validForce, id: 'invalid id with spaces' }
      const result = ForcePropertiesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should validate id with proper format (lowercase, hyphens, digits)', () => {
      const validIds = [
        'red-1st-army-1935-01-19',
        'blue-guizhou-3rd-div-1935-01-28',
        'red-3rd-army-5th-div-1935-03-16',
      ]
      validIds.forEach((id) => {
        const result = ForcePropertiesSchema.safeParse({ ...validForce, id })
        expect(result.success).toBe(true)
      })
    })

    it('should reject timestamp without +08:00 timezone', () => {
      const invalid = { ...validForce, timestamp: '1935-01-22T08:00:00Z' }
      const result = ForcePropertiesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should accept timestamp ending with +08:00', () => {
      const result = ForcePropertiesSchema.safeParse({
        ...validForce,
        timestamp: '1935-01-22T08:00:00+08:00',
      })
      expect(result.success).toBe(true)
    })

    it('should reject negative strength', () => {
      const invalid = { ...validForce, strength: -100 }
      const result = ForcePropertiesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject missing required field commander', () => {
      const { commander: _, ...missing } = validForce
      const result = ForcePropertiesSchema.safeParse(missing)
      expect(result.success).toBe(false)
    })
  })

  // ============================================================
  // ForceFeatureSchema
  // ============================================================
  describe('ForceFeatureSchema', () => {
    const validFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [105.07, 27.83] as [number, number],
      },
      properties: {
        id: 'red-1st-army-1st-div-1935-01-22',
        type: 'force' as const,
        side: 'red' as const,
        name: '红一军团第一师',
        level: 'division' as const,
        commander: '李聚奎',
        strength: 3500,
        timestamp: '1935-01-22T08:00:00+08:00',
        status: 'marching' as const,
        source: '《长征》刘统 p.142',
      },
    }

    it('should validate a correct GeoJSON feature', () => {
      const result = ForceFeatureSchema.safeParse(validFeature)
      expect(result.success).toBe(true)
    })

    it('should reject non-Point geometry', () => {
      const invalid = {
        ...validFeature,
        geometry: { type: 'LineString', coordinates: [[105, 27]] },
      }
      const result = ForceFeatureSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject coordinates with wrong length', () => {
      const invalid = {
        ...validFeature,
        geometry: { type: 'Point', coordinates: [105.07] },
      }
      const result = ForceFeatureSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  // ============================================================
  // ForcesCollectionSchema
  // ============================================================
  describe('ForcesCollectionSchema', () => {
    it('should validate a correct FeatureCollection', () => {
      const collection = {
        type: 'FeatureCollection' as const,
        features: [],
      }
      const result = ForcesCollectionSchema.safeParse(collection)
      expect(result.success).toBe(true)
    })

    it('should reject wrong type', () => {
      const invalid = { type: 'Feature', features: [] }
      const result = ForcesCollectionSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  // ============================================================
  // EventRecordSchema
  // ============================================================
  describe('EventRecordSchema', () => {
    const validEvent = {
      id: 'evt-tucheng-battle-1935-01-28',
      type: 'battle' as const,
      title: '土城战役',
      timestamp: '1935-01-28T10:00:00+08:00',
      duration_hours: 8,
      location: [105.97, 28.04] as [number, number],
      participants: ['red-3rd-army', 'red-5th-army', 'guizhou-3rd-div'],
      outcome: 'red-retreat' as const,
      casualties_red: 3000,
      casualties_blue: 1000,
      description: '土城战役，红军与川军郭勋祺部激战',
      sources: ['《土城战役综述》', '《红军长征史》p.362'],
    }

    it('should validate a correct event record', () => {
      const result = EventRecordSchema.safeParse(validEvent)
      expect(result.success).toBe(true)
    })

    it('should allow optional fields to be missing', () => {
      const minimal = {
        id: 'evt-test-01',
        type: 'maneuver' as const,
        title: '测试事件',
        timestamp: '1935-01-22T08:00:00+08:00',
        location: [105.07, 27.83] as [number, number],
        participants: ['test-unit'],
        outcome: 'stalemate' as const,
        description: 'test',
        sources: ['test'],
      }
      const result = EventRecordSchema.safeParse(minimal)
      expect(result.success).toBe(true)
    })

    it('should reject invalid event type', () => {
      const invalid = { ...validEvent, type: 'party' }
      const result = EventRecordSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject invalid outcome', () => {
      const invalid = { ...validEvent, outcome: 'draw' }
      const result = EventRecordSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject empty participants array', () => {
      const invalid = { ...validEvent, participants: [] }
      const result = EventRecordSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject timestamp without +08:00', () => {
      const invalid = { ...validEvent, timestamp: '1935-01-28T10:00:00Z' }
      const result = EventRecordSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  // ============================================================
  // EventsFileSchema
  // ============================================================
  describe('EventsFileSchema', () => {
    it('should validate a correct events file', () => {
      const file = { events: [] }
      const result = EventsFileSchema.safeParse(file)
      expect(result.success).toBe(true)
    })
  })

  // ============================================================
  // PersonSchema
  // ============================================================
  describe('PersonSchema', () => {
    const validPerson = {
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

    it('should validate a correct person record', () => {
      const result = PersonSchema.safeParse(validPerson)
      expect(result.success).toBe(true)
    })

    it('should allow empty key_decisions', () => {
      const minimal = {
        id: 'person-test-01',
        name: '测试',
        role: '测试角色',
        key_decisions: [],
      }
      const result = PersonSchema.safeParse(minimal)
      expect(result.success).toBe(true)
    })

    it('should allow missing trajectory_ref', () => {
      const { trajectory_ref: _, ...rest } = validPerson
      const result = PersonSchema.safeParse(rest)
      expect(result.success).toBe(true)
    })

    it('should reject missing name', () => {
      const { name: _, ...rest } = validPerson
      const result = PersonSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })
  })

  // ============================================================
  // PersonsFileSchema
  // ============================================================
  describe('PersonsFileSchema', () => {
    it('should validate a correct persons file', () => {
      const file = { persons: [] }
      const result = PersonsFileSchema.safeParse(file)
      expect(result.success).toBe(true)
    })
  })

  // ============================================================
  // MeetingSchema
  // ============================================================
  describe('MeetingSchema', () => {
    const validMeeting = {
      id: 'meeting-zunyi-1935-01-15',
      name: '遵义会议',
      location: [106.92, 27.72] as [number, number],
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

    it('should validate a correct meeting record', () => {
      const result = MeetingSchema.safeParse(validMeeting)
      expect(result.success).toBe(true)
    })

    it('should reject empty resolutions', () => {
      const invalid = { ...validMeeting, resolutions: [] }
      const result = MeetingSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject empty participants', () => {
      const invalid = { ...validMeeting, participants: [] }
      const result = MeetingSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject date_end before date_start', () => {
      const invalid = {
        ...validMeeting,
        date_start: '1935-01-17',
        date_end: '1935-01-15',
      }
      const result = MeetingSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  // ============================================================
  // MeetingsFileSchema
  // ============================================================
  describe('MeetingsFileSchema', () => {
    it('should validate a correct meetings file', () => {
      const file = { meetings: [] }
      const result = MeetingsFileSchema.safeParse(file)
      expect(result.success).toBe(true)
    })
  })

  // ============================================================
  // TrajectoryPropertiesSchema
  // ============================================================
  describe('TrajectoryPropertiesSchema', () => {
    const validTraj = {
      id: 'traj-red-1st-army-1935-01-19-29',
      force_id: 'red-1st-army',
      segment_start: '1935-01-19',
      segment_end: '1935-01-29',
      phase: 'first-crossing',
      color: '#C0392B',
      source: '《红军长征在贵州》p.123',
    }

    it('should validate a correct trajectory properties object', () => {
      const result = TrajectoryPropertiesSchema.safeParse(validTraj)
      expect(result.success).toBe(true)
    })

    it('should reject invalid color format', () => {
      const invalid = { ...validTraj, color: 'red' }
      const result = TrajectoryPropertiesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should accept lowercase hex color', () => {
      const result = TrajectoryPropertiesSchema.safeParse({
        ...validTraj,
        color: '#c0392b',
      })
      expect(result.success).toBe(true)
    })
  })

  // ============================================================
  // TrajectoryFeatureSchema
  // ============================================================
  describe('TrajectoryFeatureSchema', () => {
    it('should validate a LineString feature', () => {
      const feature = {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [105.07, 27.83],
            [105.12, 27.90],
          ] as [number, number][],
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
      const result = TrajectoryFeatureSchema.safeParse(feature)
      expect(result.success).toBe(true)
    })

    it('should reject LineString with fewer than 2 coordinates', () => {
      const invalid = {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [[105.07, 27.83]],
        },
        properties: {
          id: 'traj-test-01',
          force_id: 'test',
          segment_start: '1935-01-19',
          segment_end: '1935-01-20',
          phase: 'first-crossing',
          color: '#C0392B',
          source: 'test',
        },
      }
      const result = TrajectoryFeatureSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  // ============================================================
  // TrajectoriesCollectionSchema
  // ============================================================
  describe('TrajectoriesCollectionSchema', () => {
    it('should validate a correct collection', () => {
      const collection = { type: 'FeatureCollection' as const, features: [] }
      const result = TrajectoriesCollectionSchema.safeParse(collection)
      expect(result.success).toBe(true)
    })
  })

  // ============================================================
  // MeetingParticipantSchema
  // ============================================================
  describe('MeetingParticipantSchema', () => {
    it('should validate a correct participant', () => {
      const participant = { person_id: 'person-mao-zedong', role: '政治局常委' }
      const result = MeetingParticipantSchema.safeParse(participant)
      expect(result.success).toBe(true)
    })

    it('should reject missing person_id', () => {
      const invalid = { role: '政治局常委' }
      const result = MeetingParticipantSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})
