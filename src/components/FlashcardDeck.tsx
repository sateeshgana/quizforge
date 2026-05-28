import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import type { Flashcard, CardProgress, Confidence } from '../types'

const CONFIDENCE_BUTTONS: { label: string; value: Confidence; color: string }[] = [
  { label: 'Again', value: 'again', color: 'bg-red-600 hover:bg-red-500' },
  { label: 'Hard',  value: 'hard',  color: 'bg-amber-600 hover:bg-amber-500' },
  { label: 'Easy',  value: 'easy',  color: 'bg-green-600 hover:bg-green-500' },
]

interface Props {
  cards: Flashcard[]
  progress: CardProgress
  onRecord: (cardId: string, confidence: Confidence) => void
}

export function FlashcardDeck({ cards, progress: _progress, onRecord }: Props) {
  const [index,    setIndex]    = useState(0)
  const [revealed, setRevealed] = useState(false)

  const card = cards[index]
  if (!card) return <p className="text-gray-500 text-sm">No cards.</p>

  const next = () => { setIndex((i) => Math.min(i + 1, cards.length - 1)); setRevealed(false) }
  const prev = () => { setIndex((i) => Math.max(i - 1, 0));                 setRevealed(false) }

  const handleConfidence = (c: Confidence) => { onRecord(card.id, c); next() }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-gray-500">{index + 1} / {cards.length}</p>

      {/* Card */}
      <div onClick={() => setRevealed((v) => !v)}
        className="w-full max-w-xl min-h-48 rounded-2xl bg-gray-800 border border-gray-700 p-8 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
        <div className="text-center">
          {!revealed ? (
            <p className="text-lg font-medium text-gray-100">{card.front}</p>
          ) : (
            <div>
              <p className="text-xs text-indigo-400 mb-2 uppercase tracking-wider">Answer</p>
              <p className="text-lg text-gray-100">{card.back}</p>
            </div>
          )}
          {!revealed && <p className="mt-4 text-xs text-gray-600">Click to reveal</p>}
        </div>
      </div>

      {/* Confidence buttons (only shown after reveal) */}
      {revealed && (
        <div className="flex gap-3">
          {CONFIDENCE_BUTTONS.map((b) => (
            <button key={b.value} type="button" onClick={() => handleConfidence(b.value)}
              className={clsx('px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors', b.color)}>
              {b.label}
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={prev} disabled={index === 0}
          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 disabled:opacity-30">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={next} disabled={index === cards.length - 1}
          className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-gray-200 disabled:opacity-30">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
