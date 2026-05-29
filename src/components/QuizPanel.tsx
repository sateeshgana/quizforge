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
      <p className="text-4xl font-bold text-sky-500">{score} / {questions.length}</p>
      <p className="mt-2 text-gray-500">Quiz complete!</p>
      <button type="button" onClick={() => { setIndex(0); setSelected(null); setScore(0); setDone(false) }}
        className="mt-6 px-6 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium shadow-sm transition-colors">
        Retake
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <p className="text-xs text-gray-400">{index + 1} / {questions.length} · Score: {score}</p>
      <p className="text-base font-medium text-gray-800">{q.question}</p>

      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const label = LABELS[i]
          const isCorrect = label === q.answer
          const isSelected = opt === selected
          return (
            <button key={i} type="button" onClick={() => handleSelect(opt, label)}
              className={clsx('text-left px-4 py-3 rounded-xl border-2 text-sm transition-all shadow-sm',
                !selected ? 'border-gray-200 bg-white hover:border-sky-400 text-gray-700' :
                isCorrect ? 'border-green-400 bg-green-50 text-green-800' :
                isSelected ? 'border-rose-400 bg-rose-50 text-rose-800' :
                'border-gray-200 bg-gray-50 text-gray-400')}>
              <span className="font-mono mr-2 font-bold">{label}.</span>{opt}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={clsx('flex items-start gap-2 text-sm rounded-xl p-4 border',
          selected === correctText ? 'bg-green-50 text-green-700 border-green-200' : 'bg-rose-50 text-rose-700 border-rose-200')}>
          {selected === correctText ? <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> : <XCircle size={16} className="mt-0.5 flex-shrink-0" />}
          <div>
            <p className="font-medium">{selected === correctText ? 'Correct!' : `Incorrect. Answer: ${q.answer}. ${correctText}`}</p>
            <p className="mt-1 text-xs opacity-80">{q.explanation}</p>
          </div>
        </div>
      )}

      {selected && (
        <button type="button" onClick={next}
          className="self-end px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium shadow-sm transition-colors">
          {index + 1 >= questions.length ? 'See results' : 'Next →'}
        </button>
      )}
    </div>
  )
}
