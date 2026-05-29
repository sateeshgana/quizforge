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
  { id: 'deepseek/deepseek-v4-flash:free',              name: 'DeepSeek V4 Flash', badge: '🆓 Smart',         context: '1M',   description: 'Fast & smart, 1M context',  provider: 'openrouter'  },
  { id: 'openai/gpt-oss-20b:free',                     name: 'GPT-OSS 20B',       badge: '🆓 Fast',          context: '131k', description: 'OpenAI open model, fast',   provider: 'openrouter'  },
  { id: 'google/gemma-4-31b-it:free',                  name: 'Gemma 4 31B',       badge: '🆓 Google AI',     context: '262k', description: 'Google open model',         provider: 'openrouter'  },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free',      name: 'Nemotron Super 120B', badge: '🆓 Reasoning',   context: '1M',   description: 'NVIDIA powerful reasoner',  provider: 'openrouter'  },
  { id: 'openai/gpt-oss-120b:free',                    name: 'GPT-OSS 120B',      badge: '🆓 Open Source',   context: '131k', description: 'OpenAI large open model',   provider: 'openrouter'  },
  { id: 'moonshotai/kimi-k2.6:free',                   name: 'Kimi K2.6',         badge: '🆓 Long Context',  context: '262k', description: 'Moonshot long context AI',  provider: 'openrouter'  },
]

export const DEFAULT_MODEL = MODELS[0].id

export function resolveModelConfig(model?: string): Model {
  return MODELS.find((m) => m.id === model) ?? MODELS[0]
}

export function resolveModel(model?: string): string {
  return resolveModelConfig(model).id
}
