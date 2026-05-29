interface Props { bullets: string[] }

export function SummaryPanel({ bullets }: Props) {
  return (
    <ul className="space-y-3 max-w-xl mx-auto">
      {bullets.map((bullet, i) => (
        <li key={i} className="flex gap-3 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <span className="text-sky-500 font-bold flex-shrink-0">•</span>
          {bullet}
        </li>
      ))}
    </ul>
  )
}
