import { useState, useCallback, useEffect } from 'react'
import type { Confidence, CardProgress } from '../types'

const KEY = 'quizforge:progress'

function load(): CardProgress {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  catch { return {} }
}

export function useCardProgress() {
  const [progress, setProgress] = useState<CardProgress>(load)

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(progress)) }, [progress])

  const record = useCallback((cardId: string, confidence: Confidence) => {
    setProgress((p) => ({ ...p, [cardId]: { confidence, reviewedAt: Date.now() } }))
  }, [])

  const clear = useCallback(() => setProgress({}), [])

  return { progress, record, clear }
}
