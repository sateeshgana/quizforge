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
  const { studySet, isLoading, error, isRetryable, generate, reset } = useStudyGenerator()
  const { progress, record }                      = useCardProgress()

  const TABS: { id: Tab; label: string }[] = [
    { id: 'flashcards', label: `Flashcards${studySet ? ` (${studySet.flashcards.length})` : ''}` },
    { id: 'quiz',       label: `Quiz${studySet ? ` (${studySet.quiz.length})` : ''}` },
    { id: 'summary',    label: 'Summary' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
        <BookOpen size={22} className="text-sky-500" />
        <span className="font-bold text-lg text-gray-800">QuizForge</span>
        <span className="text-xs text-gray-400">AI-powered study sets</span>
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
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {TABS.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTab(t.id)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-sky-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <ExportButton flashcards={studySet.flashcards} />
                <button type="button" onClick={reset}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 text-xs transition-colors">
                  ← New Study Set
                </button>
              </div>
            </div>

            {tab === 'flashcards' && <FlashcardDeck cards={studySet.flashcards} progress={progress} onRecord={record} />}
            {tab === 'quiz'       && <QuizPanel questions={studySet.quiz} />}
            {tab === 'summary'    && <SummaryPanel bullets={studySet.summary} />}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-300 p-4 text-sm flex flex-col gap-1">
            <span className="text-red-600">{error}</span>
            {isRetryable && (
              <span className="text-red-500">
                This model may be overloaded or unavailable — try selecting a different model above.
              </span>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
