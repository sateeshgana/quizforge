import { renderHook, act } from '@testing-library/react'
import { useCardProgress } from './useCardProgress'

beforeEach(() => localStorage.clear())

describe('useCardProgress', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useCardProgress())
    expect(result.current.progress).toEqual({})
  })

  it('records confidence for a card', () => {
    const { result } = renderHook(() => useCardProgress())
    act(() => result.current.record('card-1', 'easy'))
    expect(result.current.progress['card-1'].confidence).toBe('easy')
  })

  it('persists across re-mounts', () => {
    const { result: r1 } = renderHook(() => useCardProgress())
    act(() => r1.current.record('card-1', 'hard'))
    const { result: r2 } = renderHook(() => useCardProgress())
    expect(r2.current.progress['card-1'].confidence).toBe('hard')
  })

  it('clears all progress', () => {
    const { result } = renderHook(() => useCardProgress())
    act(() => result.current.record('card-1', 'again'))
    act(() => result.current.clear())
    expect(result.current.progress).toEqual({})
  })
})
