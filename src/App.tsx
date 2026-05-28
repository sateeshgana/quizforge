import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { TextInput }     from './components/TextInput'
import { FlashcardDeck } from './components/FlashcardDeck'
import { QuizPanel }     from './components/QuizPanel'
import { SummaryPanel }  from './components/SummaryPanel'
import { ExportButton }  from './components/ExportButton'
import { useStudyGenerator } from './hooks/useStudyGenerator'
import { useCardProgress }   from './hooks/useCardProgress'
import { DEFAULT_MODEL } from './models'

type Tab = 'flashcards' | 'quiz' | 'summary'

export default function App() {
  const [text,          setText]          = useState('')
  const [tab,           setTab]           = useState<Tab>('flashcards')
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const { studySet, isLoading, error, generate } = useStudyGenerator()
  const { progress, record }                      = useCardProgress()

  const TABS: { id: Tab; label: string }[] = [
    { id: 'flashcards', label: `Flashcards${studySet ? ` (${studySet.flashcards.length})` : ''}` },
    { id: 'quiz',       label: `Quiz${studySet ? ` (${studySet.quiz.length})` : ''}` },
    { id: 'summary',    label: 'Summary' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <BookOpen size={22} className="text-indigo-400" />
        <span className="font-bold text-lg">QuizForge</span>
        <span className="text-xs text-gray-500">AI-powered study sets</span>
      </header>

      <main className="max-w-3xl mx-auto p-6 flex flex-col gap-8">
        {!studySet ? (
          <TextInput
            value={text}
            onChange={setText}
            onGenerate={() => generate(text, selectedModel)}
            isLoading={isLoading}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                {TABS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTab(t.id)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <ExportButton flashcards={studySet.flashcards} />
                <button type="button" onClick={() => generate(text, selectedModel)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 text-xs">
                  Regenerate
                </button>
              </div>
            </div>

            {tab === 'flashcards' && <FlashcardDeck cards={studySet.flashcards} progress={progress} onRecord={record} />}
            {tab === 'quiz'       && <QuizPanel questions={studySet.quiz} />}
            {tab === 'summary'    && <SummaryPanel bullets={studySet.summary} />}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-300 text-sm">{error}</div>
        )}
      </main>
    </div>
  )
}
