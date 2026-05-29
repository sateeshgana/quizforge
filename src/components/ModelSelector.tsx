import { MODELS } from '../models'
import type { Model } from '../models'

interface Props {
  selected: string
  onChange: (id: string) => void
}

function ModelRow({ m, isSelected, onChange }: { m: Model; isSelected: boolean; onChange: (id: string) => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected ? 'true' : 'false'}
      onClick={() => onChange(m.id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all border-l-4 ${
        isSelected
          ? 'border-sky-500 bg-sky-50 text-sky-800'
          : 'border-transparent text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className="text-xs font-semibold w-28 flex-shrink-0">{m.badge}</span>
      <span className="font-medium flex-1">{m.name}</span>
      <span className="text-xs text-gray-400 flex-shrink-0">{m.context}</span>
    </button>
  )
}

export function ModelSelector({ selected, onChange }: Props) {
  const groqModels = MODELS.filter((m) => m.provider === 'groq')
  const openrouterModels = MODELS.filter((m) => m.provider === 'openrouter')

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500 font-medium">Choose model</span>
      <div
        className="max-h-64 overflow-y-auto flex flex-col gap-2 border border-gray-200 rounded-xl bg-white p-2 shadow-sm"
        role="radiogroup"
        aria-label="Model selection"
      >
        <div role="group">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">Groq</p>
          {groqModels.map((m) => (
            <ModelRow key={m.id} m={m} isSelected={m.id === selected} onChange={onChange} />
          ))}
        </div>
        <div role="group">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-1">OpenRouter (free)</p>
          {openrouterModels.map((m) => (
            <ModelRow key={m.id} m={m} isSelected={m.id === selected} onChange={onChange} />
          ))}
        </div>
      </div>
    </div>
  )
}
