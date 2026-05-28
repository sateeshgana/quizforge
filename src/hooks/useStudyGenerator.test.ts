import { renderHook, act } from '@testing-library/react'
import { useStudyGenerator } from './useStudyGenerator'
import { vi } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch
beforeEach(() => mockFetch.mockReset())

const mockStudySet = {
  flashcards: [{ id: '1', front: 'Q', back: 'A' }],
  quiz: [],
  summary: ['Point 1'],
}

describe('useStudyGenerator', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useStudyGenerator())
    expect(result.current.studySet).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('sets loading during fetch', async () => {
    let resolveDeferred!: (v: unknown) => void
    const deferred = new Promise((res) => { resolveDeferred = res })
    mockFetch.mockImplementation(() => deferred.then(() => ({ ok: true, json: async () => mockStudySet })))
    const { result } = renderHook(() => useStudyGenerator())
    act(() => { result.current.generate('some text longer than 50 chars here yes this is long enough') })
    expect(result.current.isLoading).toBe(true)
    // Clean up: resolve the deferred so the hook can finish
    resolveDeferred(undefined)
    await act(async () => {})
  })

  it('stores studySet on success', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockStudySet })
    const { result } = renderHook(() => useStudyGenerator())
    await act(async () => {
      await result.current.generate('some text longer than 50 chars here yes this is long enough')
    })
    expect(result.current.studySet?.flashcards[0].front).toBe('Q')
    expect(result.current.isLoading).toBe(false)
  })

  it('stores error on failure', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({ error: 'API error' }) })
    const { result } = renderHook(() => useStudyGenerator())
    await act(async () => {
      await result.current.generate('some text longer than 50 chars here yes this is long enough')
    })
    expect(result.current.error).toBe('API error')
  })
})
