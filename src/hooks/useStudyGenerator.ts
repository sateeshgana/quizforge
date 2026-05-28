import { useState, useCallback } from 'react'
import type { StudySet } from '../types'
import { DEFAULT_MODEL } from '../models'

export function useStudyGenerator() {
  const [studySet,  setStudySet]  = useState<StudySet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const generate = useCallback(async (text: string, model: string = DEFAULT_MODEL) => {
    setIsLoading(true); setError(null); setStudySet(null)
    try {
      const res  = await fetch('/api/generate-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? 'Request failed')
      else         setStudySet(data as StudySet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => { setStudySet(null); setError(null) }, [])

  return { studySet, isLoading, error, generate, reset }
}
