import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import type { Flashcard, CardProgress, Confidence } from '../types'

const CONFIDENCE_BUTTONS: { label: string; value: Confidence; color: string }[] = [
  { label: 'Again', value: 'again', color: 'bg-rose-500 hover:bg-rose-400' },
  { label: 'Hard',  value: 'hard',  color: 'bg-amber-500 hover:bg-amber-400' },
  { label: 'Easy',  value: 'easy',  color: 'bg-green-500 hover:bg-green-400' },
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
  if (!card) return <p className="text-gray-400 text-sm">No cards.</p>

  const next = () => { setIndex((i) => Math.min(i + 1, cards.length - 1)); setRevealed(false) }
  const prev = () => { setIndex((i) => Math.max(i - 1, 0));                 setRevealed(false) }

  const handleConfidence = (c: Confidence) => { onRecord(card.id, c); next() }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-gray-400">{index + 1} / {cards.length}</p>

      {/* Card */}
      <div onClick={() => setRevealed((v) => !v)}
        className="w-full max-w-xl min-h-48 rounded-2xl bg-white border-2 border-gray-200 p-8 flex items-center justify-center cursor-pointer hover:border-sky-400 transition-all shadow-sm hover:shadow-md">
        <div className="text-center">
          {!revealed ? (
            <p className="text-lg font-medium text-gray-800">{card.front}</p>
          ) : (
            <div>
              <p className="text-xs text-sky-500 mb-2 uppercase tracking-wider font-semibold">Answer</p>
              <p className="text-lg text-gray-700">{card.back}</p>
            </div>
          )}
          {!revealed && <p className="mt-4 text-xs text-gray-400">Click to reveal</p>}
        </div>
      </div>

      {/* Confidence buttons (only shown after reveal) */}
      {revealed && (
        <div className="flex gap-3">
          {CONFIDENCE_BUTTONS.map((b) => (
            <button key={b.value} type="button" onClick={() => handleConfidence(b.value)}
              className={clsx('px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm', b.color)}>
              {b.label}
            </button>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={prev} disabled={index === 0}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 disabled:opacity-30 shadow-sm transition-colors">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={next} disabled={index === cards.length - 1}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 disabled:opacity-30 shadow-sm transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
