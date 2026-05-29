export interface Model {
  id: string
  name: string
  badge: string
  context: string
  description: string
  provider: 'groq' | 'openrouter'
}

export const MODELS: Model[] = [
  { id: 'llama-3.1-8b-instant',                        name: 'Llama 3.1 8B',      badge: '⚡ Fastest',      context: '8k',   description: 'Best for quick results',    provider: 'groq'        },
  { id: 'llama-3.3-70b-versatile',                     name: 'Llama 3.3 70B',     badge: '🧠 Best Quality',  context: '128k', description: 'Most accurate study sets',  provider: 'groq'        },
  { id: 'qwen/qwen-2.5-72b-instruct:free',             name: 'Qwen 2.5 72B',      badge: '🆓 Smart',         context: '32k',  description: 'Strong reasoning, free',    provider: 'openrouter'  },
  { id: 'mistralai/mistral-7b-instruct:free',          name: 'Mistral 7B',        badge: '🆓 Fast',          context: '32k',  description: 'European AI, efficient',    provider: 'openrouter'  },
  { id: 'google/gemma-2-9b-it:free',                   name: 'Gemma 2 9B',        badge: '🆓 Google AI',     context: '8k',   description: 'Google open model',         provider: 'openrouter'  },
  { id: 'deepseek/deepseek-r1-distill-llama-70b:free', name: 'DeepSeek R1 70B',   badge: '🆓 Reasoning',     context: '32k',  description: 'Deep reasoning model',      provider: 'openrouter'  },
  { id: 'meta-llama/llama-3.1-8b-instruct:free',       name: 'Llama 3.1 8B',      badge: '🆓 Open Source',   context: '32k',  description: 'Meta open source model',    provider: 'openrouter'  },
  { id: 'microsoft/phi-3-mini-128k-instruct:free',     name: 'Phi-3 Mini',        badge: '🆓 Long Context',  context: '128k', description: 'Huge context window',       provider: 'openrouter'  },
]

export const DEFAULT_MODEL = MODELS[0].id

export function resolveModelConfig(model?: string): Model {
  return MODELS.find((m) => m.id === model) ?? MODELS[0]
}

export function resolveModel(model?: string): string {
  return resolveModelConfig(model).id
}
