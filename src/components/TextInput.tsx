import { clsx } from 'clsx'
import { ModelSelector } from './ModelSelector'

interface Props {
  value: string
  onChange: (v: string) => void
  onGenerate: () => void
  isLoading: boolean
  selectedModel: string
  onModelChange: (id: string) => void
}

export function TextInput({ value, onChange, onGenerate, isLoading, selectedModel, onModelChange }: Props) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const canGenerate = wordCount >= 20 && !isLoading

  return (
    <div className="flex flex-col gap-3">
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={10}
        placeholder="Paste your lecture notes, textbook chapter, or any text here…"
        className="w-full rounded-xl bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <ModelSelector selected={selectedModel} onChange={onModelChange} />
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs', wordCount < 20 ? 'text-amber-400' : 'text-gray-500')}>
          {wordCount} words{wordCount < 20 ? ' — need at least 20' : ''}
        </span>
        <button type="button" onClick={onGenerate} disabled={!canGenerate}
          className={clsx('px-5 py-2 rounded-lg text-sm font-medium transition-colors',
            canGenerate ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed')}>
          {isLoading ? 'Generating…' : '✨ Generate Study Set'}
        </button>
      </div>
    </div>
  )
}
