export interface Model {
  id: string
  name: string
  badge: string
  context: string
  description: string
}

export const MODELS: Model[] = [
  { id: 'llama-3.1-8b-instant',    name: 'Llama 3.1 8B',  badge: '⚡ Fastest',      context: '8k',   description: 'Best for quick results' },
  { id: 'gemma2-9b-it',            name: 'Gemma 2 9B',     badge: '⚡ Fast',          context: '8k',   description: 'Strong instruction following' },
  { id: 'mixtral-8x7b-32768',      name: 'Mixtral 8×7B',   badge: '📄 Long Context', context: '32k',  description: 'Best for large texts' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B',  badge: '🧠 Best Quality', context: '128k', description: 'Most accurate study sets' },
]

export const DEFAULT_MODEL = MODELS[0].id
