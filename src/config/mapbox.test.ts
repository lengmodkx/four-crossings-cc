import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getMapboxToken, clearTokenCache } from './mapbox'

describe('getMapboxToken', () => {
  beforeEach(() => {
    clearTokenCache()
  })

  it('should return token from VITE_MAPBOX_TOKEN env var', () => {
    // In vitest, import.meta.env is available when using vite config
    // We set it via process.env which Vite maps for VITE_ prefixed vars
    process.env.VITE_MAPBOX_TOKEN = 'pk.test-token-123'
    try {
      const token = getMapboxToken()
      expect(token).toBe('pk.test-token-123')
    } finally {
      delete process.env.VITE_MAPBOX_TOKEN
    }
  })

  it('should throw when VITE_MAPBOX_TOKEN is not set', () => {
    // Ensure the env var is not set
    delete process.env.VITE_MAPBOX_TOKEN
    expect(() => getMapboxToken()).toThrow('VITE_MAPBOX_TOKEN')
  })

  it('should throw when VITE_MAPBOX_TOKEN is empty string', () => {
    process.env.VITE_MAPBOX_TOKEN = ''
    try {
      expect(() => getMapboxToken()).toThrow('VITE_MAPBOX_TOKEN')
    } finally {
      delete process.env.VITE_MAPBOX_TOKEN
    }
  })

  it('should cache token after first read', () => {
    process.env.VITE_MAPBOX_TOKEN = 'pk.cached-token'
    try {
      const first = getMapboxToken()
      expect(first).toBe('pk.cached-token')
      // Even if we change the env var, cached value is returned
      process.env.VITE_MAPBOX_TOKEN = 'pk.different-token'
      const second = getMapboxToken()
      expect(second).toBe('pk.cached-token')
    } finally {
      delete process.env.VITE_MAPBOX_TOKEN
    }
  })

  it('should clear cache with clearTokenCache', () => {
    process.env.VITE_MAPBOX_TOKEN = 'pk.first-token'
    try {
      const first = getMapboxToken()
      expect(first).toBe('pk.first-token')

      clearTokenCache()

      process.env.VITE_MAPBOX_TOKEN = 'pk.second-token'
      const second = getMapboxToken()
      expect(second).toBe('pk.second-token')
    } finally {
      delete process.env.VITE_MAPBOX_TOKEN
    }
  })
})
