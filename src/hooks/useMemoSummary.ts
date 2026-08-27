'use client'

import { useCallback, useEffect, useState } from 'react'
import { Memo } from '@/types/memo'

interface UseMemoSummaryResult {
  summary: string
  loading: boolean
  error: string | null
  summarize: () => Promise<void>
}

export const useMemoSummary = (
  memo: Memo | null,
  isOpen: boolean
): UseMemoSummaryResult => {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSummary('')
    setError(null)
    setLoading(false)
  }, [memo?.id, isOpen])

  const summarize = useCallback(async () => {
    if (!memo) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/memos/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: memo.title,
          content: memo.content,
        }),
      })

      const data = (await response.json()) as {
        summary?: string
        error?: string
      }

      if (!response.ok || !data.summary) {
        setError(data.error ?? '메모를 요약하지 못했습니다.')
        return
      }

      setSummary(data.summary)
    } catch (caughtError) {
      console.error('Memo summary request failed:', caughtError)
      setError('네트워크 오류로 요약을 가져오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [memo])

  return { summary, loading, error, summarize }
}
