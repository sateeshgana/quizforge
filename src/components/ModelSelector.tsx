import { MODELS } from '../models'

interface Props {
  selected: string
  onChange: (id: string) => void
}

export function ModelSelector({ selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-gray-400">Choose model</span>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Model selection">
        {MODELS.map((m) => {
          const isSelected = m.id === selected
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(m.id)}
              className={`flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/40 text-gray-100'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              <span className="text-xs font-medium text-indigo-400">{m.badge}</span>
              <span className="text-sm font-semibold">{m.name}</span>
              <span className="text-xs text-gray-500">{m.context} · {m.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
