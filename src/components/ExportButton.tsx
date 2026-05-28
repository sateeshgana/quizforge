import { Download } from 'lucide-react'
import Papa from 'papaparse'
import type { Flashcard } from '../types'

interface Props { flashcards: Flashcard[] }

export function ExportButton({ flashcards }: Props) {
  const download = () => {
    const csv = Papa.unparse(flashcards.map((c) => ({ Front: c.front, Back: c.back })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'quizforge-flashcards.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" onClick={download}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors">
      <Download size={14} />Export to Anki CSV
    </button>
  )
}
