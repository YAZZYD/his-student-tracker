const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
})

const formatDate = (date: string): string => DATE_FORMATTER.format(new Date(date))

const getEvaluationColor = (
  score: number | null | undefined
): '#10b981' | '#3b82f6' | '#eab308' | '#f97316' | '#ef4444' | '#aeaeae' => {
  if (!score) return '#aeaeae'
  if (score >= 90) return '#10b981'
  if (score >= 80) return '#3b82f6'
  if (score >= 60) return '#eab308'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export { formatDate, getEvaluationColor }
