import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { clsx } from 'clsx'
import type { QuizQuestion } from '../types'

const LABELS = ['A', 'B', 'C', 'D'] as const

interface Props { questions: QuizQuestion[] }

export function QuizPanel({ questions }: Props) {
  const [index,    setIndex]    = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score,    setScore]    = useState(0)
  const [done,     setDone]     = useState(false)

  const q = questions[index]
  if (!q) return null

  const answerIndex = LABELS.indexOf(q.answer as typeof LABELS[number])
  const correctText = q.options[answerIndex]

  const handleSelect = (optionText: string, label: string) => {
    if (selected) return
    setSelected(optionText)
    if (label === q.answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 >= questions.length) { setDone(true); return }
    setIndex((i) => i + 1); setSelected(null)
  }

  if (done) return (
    <div className="text-center py-12">
      <p className="text-4xl font-bold text-indigo-400">{score} / {questions.length}</p>
      <p className="mt-2 text-gray-400">Quiz complete!</p>
      <button type="button" onClick={() => { setIndex(0); setSelected(null); setScore(0); setDone(false) }}
        className="mt-6 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
        Retake
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <p className="text-xs text-gray-500">{index + 1} / {questions.length} · Score: {score}</p>
      <p className="text-base font-medium text-gray-100">{q.question}</p>

      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const label = LABELS[i]
          const isCorrect = label === q.answer
          const isSelected = opt === selected
          return (
            <button key={i} type="button" onClick={() => handleSelect(opt, label)}
              className={clsx('text-left px-4 py-3 rounded-lg border text-sm transition-colors',
                !selected ? 'border-gray-700 bg-gray-800 hover:border-indigo-500 text-gray-200' :
                isCorrect ? 'border-green-500 bg-green-900/30 text-green-300' :
                isSelected ? 'border-red-500 bg-red-900/30 text-red-300' :
                'border-gray-700 bg-gray-800 text-gray-500')}>
              <span className="font-mono mr-2">{label}.</span>{opt}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={clsx('flex items-start gap-2 text-sm rounded-lg p-3',
          selected === correctText ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300')}>
          {selected === correctText ? <CheckCircle size={16} className="mt-0.5" /> : <XCircle size={16} className="mt-0.5" />}
          <div>
            <p className="font-medium">{selected === correctText ? 'Correct!' : `Incorrect. Answer: ${q.answer}. ${correctText}`}</p>
            <p className="mt-1 text-xs opacity-80">{q.explanation}</p>
          </div>
        </div>
      )}

      {selected && (
        <button type="button" onClick={next}
          className="self-end px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
          {index + 1 >= questions.length ? 'See results' : 'Next →'}
        </button>
      )}
    </div>
  )
}
