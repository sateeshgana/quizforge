# 📚 QuizForge

> Paste any text → get AI-generated flashcards, quiz questions, and a TL;DR summary instantly. Free, no signup.

**[✨ Try it live →](https://YOUR-SITE.netlify.app)**

## Features

- 🃏 10 AI-generated flashcards with flip animation
- ✅ 5 multiple-choice quiz questions with explanations
- 📝 TL;DR bullet summary
- 📊 Spaced repetition confidence tracking (Easy / Hard / Again)
- 📥 Export flashcards to Anki CSV
- 🆓 Powered by Groq llama-3.1-8b-instant (free tier)

## Local dev

```bash
git clone https://github.com/YOUR_USERNAME/quizforge
cd quizforge && npm install
cp .env.example .env   # add GROQ_API_KEY
npm install -g netlify-cli
netlify dev
```

Get a free Groq API key at [console.groq.com](https://console.groq.com)

## Deploy your own

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/quizforge)

Set env var: `GROQ_API_KEY`

## Tech stack

- React 18 + TypeScript + Vite + Tailwind CSS v4
- Netlify Functions v2 (serverless)
- Groq API (llama-3.1-8b-instant, JSON mode)
- PapaParse (Anki CSV export)

## License

MIT
