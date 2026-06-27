import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import {
  validateForcesCollection,
  validateEventsFile,
  validatePersonsFile,
  validateMeetingsFile,
  validateTrajectoriesCollection,
  validateAllData,
} from './validate'

describe('data validation script', () => {
  let tmpDir: string

  afterEach(() => {
    if (tmpDir && existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  function createDataDir(): string {
    const dir = mkdtempSync(join(tmpdir(), 'four-crossings-validate-test-'))
    mkdirSync(dir, { recursive: true })
    tmpDir = dir
    return dir
  }

  function writeJsonFile(dir: string, filename: string, data: unknown): void {
    writeFileSync(join(dir, filename), JSON.stringify(data, null, 2), 'utf-8')
  }

  // ============================================================
  // validateForcesCollection
  // ============================================================
  describe('validateForcesCollection', () => {
    it('should pass for valid forces.geojson', () => {
      const dir = createDataDir()
      const validForces = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [105.07, 27.83] },
            properties: {
              id: 'red-1st-army-1935-01-22',
              type: 'force',
              side: 'red',
              name: '红一军团',
              level: 'army',
              commander: '林彪',
              strength: 8000,
              timestamp: '1935-01-22T08:00:00+08:00',
              status: 'marching',
              source: '《红军长征史》p.358',
            },
          },
        ],
      }
      writeJsonFile(dir, 'forces.geojson', validForces)
      const { valid, errors } = validateForcesCollection(dir)
      expect(valid).toBe(true)
      expect(errors).toHaveLength(0)
    })

    it('should fail for invalid forces.geojson (bad side)', () => {
      const dir = createDataDir()
      const invalidForces = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [105.07, 27.83] },
            properties: {
              id: 'bad-unit',
              type: 'force',
              side: 'green', // invalid side
              name: '测试部队',
              level: 'army',
              commander: '测试',
              strength: 1000,
              timestamp: '1935-01-22T08:00:00+08:00',
              status: 'marching',
              source: '测试来源',
            },
          },
        ],
      }
      writeJsonFile(dir, 'forces.geojson', invalidForces)
      const { valid, errors } = validateForcesCollection(dir)
      expect(valid).toBe(false)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail for invalid forces.geojson (bad timestamp)', () => {
      const dir = createDataDir()
      const invalidForces = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [105.07, 27.83] },
            properties: {
              id: 'red-1st-army-1935-01-22',
              type: 'force',
              side: 'red',
              name: '红一军团',
              level: 'army',
              commander: '林彪',
              strength: 8000,
              timestamp: '1935-01-22T08:00:00Z', // UTC not +08:00
              status: 'marching',
              source: '《红军长征史》p.358',
            },
          },
        ],
      }
      writeJsonFile(dir, 'forces.geojson', invalidForces)
      const { valid, errors } = validateForcesCollection(dir)
      expect(valid).toBe(false)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should report file not found', () => {
      const dir = createDataDir()
      // Don't write forces.geojson
      const { valid, errors } = validateForcesCollection(dir)
      expect(valid).toBe(false)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toMatch(/not found/i)
    })
  })

  // ============================================================
  // validateEventsFile
  // ============================================================
  describe('validateEventsFile', () => {
    it('should pass for valid events.json', () => {
      const dir = createDataDir()
      const validEvents = {
        events: [
          {
            id: 'evt-tucheng-battle-1935-01-28',
            type: 'battle',
            title: '土城战役',
            timestamp: '1935-01-28T10:00:00+08:00',
            location: [105.97, 28.04],
            participants: ['red-3rd-army', 'red-5th-army'],
            outcome: 'red-retreat',
            description: '土城战役',
            sources: ['《土城战役综述》'],
          },
        ],
      }
      writeJsonFile(dir, 'events.json', validEvents)
      const { valid, errors } = validateEventsFile(dir)
      expect(valid).toBe(true)
      expect(errors).toHaveLength(0)
    })

    it('should fail for events.json with empty participants', () => {
      const dir = createDataDir()
      const invalidEvents = {
        events: [
          {
            id: 'evt-tucheng-battle-1935-01-28',
            type: 'battle',
            title: '土城战役',
            timestamp: '1935-01-28T10:00:00+08:00',
            location: [105.97, 28.04],
            participants: [], // empty array
            outcome: 'red-retreat',
            description: '土城战役',
            sources: ['《土城战役综述》'],
          },
        ],
      }
      writeJsonFile(dir, 'events.json', invalidEvents)
      const { valid, errors } = validateEventsFile(dir)
      expect(valid).toBe(false)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  // ============================================================
  // validatePersonsFile
  // ============================================================
  describe('validatePersonsFile', () => {
    it('should pass for valid persons.json', () => {
      const dir = createDataDir()
      const validPersons = {
        persons: [
          {
            id: 'person-mao-zedong',
            name: '毛泽东',
            role: '中央政治局常委',
            key_decisions: [
              {
                timestamp: '1935-01-29',
                event_id: 'evt-zuixi-meeting',
                decision: '提出回师黔北',
              },
            ],
          },
        ],
      }
      writeJsonFile(dir, 'persons.json', validPersons)
      const { valid, errors } = validatePersonsFile(dir)
      expect(valid).toBe(true)
      expect(errors).toHaveLength(0)
    })

    it('should fail for persons.json with missing name', () => {
      const dir = createDataDir()
      const invalidPersons = {
        persons: [
          {
            id: 'person-mao-zedong',
            role: '中央政治局常委',
            key_decisions: [],
          },
        ],
      }
      writeJsonFile(dir, 'persons.json', invalidPersons)
      const { valid, errors } = validatePersonsFile(dir)
      expect(valid).toBe(false)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  // ============================================================
  // validateMeetingsFile
  // ============================================================
  describe('validateMeetingsFile', () => {
    it('should pass for valid meetings.json', () => {
      const dir = createDataDir()
      const validMeetings = {
        meetings: [
          {
            id: 'meeting-zunyi-1935-01-15',
            name: '遵义会议',
            location: [106.92, 27.72],
            date_start: '1935-01-15',
            date_end: '1935-01-17',
            background: '第五次反围剿失败后',
            resolutions: ['确立毛泽东领导地位'],
            participants: [{ person_id: 'person-mao-zedong', role: '政治局常委' }],
            related_event_ids: [],
            sources: ['《遵义会议文献》'],
          },
        ],
      }
      writeJsonFile(dir, 'meetings.json', validMeetings)
      const { valid, errors } = validateMeetingsFile(dir)
      expect(valid).toBe(true)
      expect(errors).toHaveLength(0)
    })

    it('should fail for meetings.json with date_end before date_start', () => {
      const dir = createDataDir()
      const invalidMeetings = {
        meetings: [
          {
            id: 'meeting-zunyi-1935-01-15',
            name: '遵义会议',
            location: [106.92, 27.72],
            date_start: '1935-01-17',
            date_end: '1935-01-15', // before date_start
            background: '第五次反围剿失败后',
            resolutions: ['确立毛泽东领导地位'],
            participants: [{ person_id: 'person-mao-zedong', role: '政治局常委' }],
            related_event_ids: [],
            sources: ['《遵义会议文献》'],
          },
        ],
      }
      writeJsonFile(dir, 'meetings.json', invalidMeetings)
      const { valid, errors } = validateMeetingsFile(dir)
      expect(valid).toBe(false)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  // ============================================================
  // validateTrajectoriesCollection
  // ============================================================
  describe('validateTrajectoriesCollection', () => {
    it('should pass for valid trajectories.geojson', () => {
      const dir = createDataDir()
      const validTrajs = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [105.07, 27.83],
                [105.12, 27.90],
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
          },
        ],
      }
      writeJsonFile(dir, 'trajectories.geojson', validTrajs)
      const { valid, errors } = validateTrajectoriesCollection(dir)
      expect(valid).toBe(true)
      expect(errors).toHaveLength(0)
    })

    it('should fail for trajectories.geojson with single-coordinate LineString', () => {
      const dir = createDataDir()
      const invalidTrajs = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [[105.07, 27.83]], // only 1 coordinate
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
          },
        ],
      }
      writeJsonFile(dir, 'trajectories.geojson', invalidTrajs)
      const { valid, errors } = validateTrajectoriesCollection(dir)
      expect(valid).toBe(false)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  // ============================================================
  // validateAllData
  // ============================================================
  describe('validateAllData', () => {
    it('should return results for all data files (with valid data)', () => {
      const dir = createDataDir()

      // Write all valid files
      writeJsonFile(dir, 'forces.geojson', {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [105.07, 27.83] },
            properties: {
              id: 'red-1st-army-1935-01-22',
              type: 'force',
              side: 'red',
              name: '红一军团',
              level: 'army',
              commander: '林彪',
              strength: 8000,
              timestamp: '1935-01-22T08:00:00+08:00',
              status: 'marching',
              source: 'test',
            },
          },
        ],
      })

      writeJsonFile(dir, 'events.json', {
        events: [
          {
            id: 'evt-tucheng-battle-1935-01-28',
            type: 'battle',
            title: '土城战役',
            timestamp: '1935-01-28T10:00:00+08:00',
            location: [105.97, 28.04],
            participants: ['red-3rd-army'],
            outcome: 'red-retreat',
            description: '土城战役',
            sources: ['test'],
          },
        ],
      })

      writeJsonFile(dir, 'persons.json', {
        persons: [
          {
            id: 'person-mao-zedong',
            name: '毛泽东',
            role: '中央政治局常委',
            key_decisions: [],
          },
        ],
      })

      writeJsonFile(dir, 'meetings.json', {
        meetings: [
          {
            id: 'meeting-zunyi-1935-01-15',
            name: '遵义会议',
            location: [106.92, 27.72],
            date_start: '1935-01-15',
            date_end: '1935-01-17',
            background: '第五次反围剿失败后',
            resolutions: ['确立毛泽东领导地位'],
            participants: [{ person_id: 'person-mao-zedong', role: '政治局常委' }],
            related_event_ids: [],
            sources: ['《遵义会议文献》'],
          },
        ],
      })

      writeJsonFile(dir, 'trajectories.geojson', {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [105.07, 27.83],
                [105.12, 27.90],
              ],
            },
            properties: {
              id: 'traj-red-1st-army-1935-01-19-29',
              force_id: 'red-1st-army',
              segment_start: '1935-01-19',
              segment_end: '1935-01-29',
              phase: 'first-crossing',
              color: '#C0392B',
              source: 'test',
            },
          },
        ],
      })

      const results = validateAllData(dir)

      expect(results).toHaveProperty('forces')
      expect(results).toHaveProperty('events')
      expect(results).toHaveProperty('persons')
      expect(results).toHaveProperty('meetings')
      expect(results).toHaveProperty('trajectories')

      // All should be valid
      Object.values(results).forEach((r) => {
        expect(r.valid).toBe(true)
        expect(r.errors).toHaveLength(0)
      })
    })

    it('should handle missing files gracefully', () => {
      const dir = createDataDir()
      // Don't write any files
      const results = validateAllData(dir)

      // Missing files should report errors
      Object.values(results).forEach((r) => {
        expect(r.valid).toBe(false)
        expect(r.errors.length).toBeGreaterThan(0)
      })
    })
  })
})
