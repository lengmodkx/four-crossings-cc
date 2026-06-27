import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from './routes'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  })
}

describe('Vue Router — 5 base routes', () => {
  it('should resolve "/" to landing', async () => {
    const router = createTestRouter()
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('landing')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('should resolve "/phase-select" to phase-select', async () => {
    const router = createTestRouter()
    await router.push('/phase-select')
    expect(router.currentRoute.value.name).toBe('phase-select')
  })

  it('should resolve "/narrative/:phaseId" with param', async () => {
    const router = createTestRouter()
    await router.push('/narrative/first-crossing')
    expect(router.currentRoute.value.name).toBe('narrative')
    expect(router.currentRoute.value.params.phaseId).toBe('first-crossing')
  })

  it('should resolve "/explore/:phaseId" with param', async () => {
    const router = createTestRouter()
    await router.push('/explore/second-crossing')
    expect(router.currentRoute.value.name).toBe('explore')
    expect(router.currentRoute.value.params.phaseId).toBe('second-crossing')
  })

  it('should resolve "/meeting/:meetingId" with param', async () => {
    const router = createTestRouter()
    await router.push('/meeting/zunyi')
    expect(router.currentRoute.value.name).toBe('meeting')
    expect(router.currentRoute.value.params.meetingId).toBe('zunyi')
  })
})
