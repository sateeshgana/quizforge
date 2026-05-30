# Claude Code Guidelines

## Stack
React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 + Vitest + Netlify Functions v2

## Commands
- `npm run dev` — start dev server
- `npm test` — run tests (vitest)
- `npm run build` — TypeScript check + Vite build

## Key rules
- **TDD**: write failing test first, then implement
- `npm test` must pass before committing
- `npm run build` must pass before committing
- No unused imports — TypeScript strict mode rejects them
- Netlify Functions: `.mts` extension, `export default async (req: Request) => Response`
- LLM provider order: GROQ_API_KEY → DEEPSEEK_API_KEY → OPENAI_API_KEY

## Superpowers skills to use
When working in this repo, use these Claude Code superpowers skills:
- `/brainstorming` — before adding any new feature
- `/test-driven-development` — when implementing features or fixes
- `/systematic-debugging` — when hitting test failures or build errors
- `/writing-plans` — before tackling multi-file changes
- `/verification-before-completion` — always run tests + build before claiming done

## File structure
```
src/
  types.ts          — shared TypeScript interfaces
  App.tsx           — main component
  hooks/            — custom React hooks (+ .test.ts)
  components/       — UI components (+ .test.tsx)
  lib/llm.ts        — LLM provider-switching utility
netlify/functions/  — serverless API endpoints (.mts)
```
