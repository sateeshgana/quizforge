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
        className="w-full rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-400 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm" />
      <ModelSelector selected={selectedModel} onChange={onModelChange} />
      <div className="flex items-center justify-between">
        <span className={clsx('text-xs', wordCount < 20 ? 'text-amber-500' : 'text-gray-400')}>
          {wordCount} words{wordCount < 20 ? ' — need at least 20' : ''}
        </span>
        <button type="button" onClick={onGenerate} disabled={!canGenerate}
          className={clsx('px-5 py-2 rounded-lg text-sm font-medium transition-colors',
            canGenerate ? 'bg-sky-500 hover:bg-sky-400 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}>
          {isLoading ? 'Generating…' : '✨ Generate Study Set'}
        </button>
      </div>
    </div>
  )
}
