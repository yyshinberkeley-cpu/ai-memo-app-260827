'use client'

import { useEffect } from 'react'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'
import { useMemoSummary } from '@/hooks/useMemoSummary'
import MemoContent from './MemoContent'

interface MemoDetailProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoDetail({
  memo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailProps) {
  const { summary, loading, error, summarize } = useMemoSummary(memo, isOpen)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !memo) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleEdit = () => {
    onEdit(memo)
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      data-testid="memo-detail-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-detail-title"
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={event => event.stopPropagation()}
        data-testid="memo-detail-viewer"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-4">
              <h2
                id="memo-detail-title"
                className="text-xl font-semibold text-gray-900 mb-3"
              >
                {memo.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
                >
                  {MEMO_CATEGORIES[
                    memo.category as keyof typeof MEMO_CATEGORIES
                  ] || memo.category}
                </span>
                <span className="text-xs text-gray-500">
                  작성 {formatDate(memo.createdAt)}
                </span>
                <span className="text-xs text-gray-500">
                  수정 {formatDate(memo.updatedAt)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="상세 보기 닫기"
              data-testid="memo-detail-close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <MemoContent content={memo.content} variant="detail" />
          </div>

          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-blue-900">AI 요약</h3>
              <button
                type="button"
                onClick={() => {
                  void summarize()
                }}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                data-testid="memo-summarize"
              >
                {loading ? '요약 중...' : summary ? '다시 요약' : '메모 요약'}
              </button>
            </div>
            {error && (
              <p
                className="text-sm text-red-600"
                data-testid="memo-summary-error"
              >
                {error}
              </p>
            )}
            {!error && summary && (
              <p
                className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800"
                data-testid="memo-summary-text"
              >
                {summary}
              </p>
            )}
            {!error && !summary && !loading && (
              <p className="text-sm text-gray-500">
                버튼을 누르면 Gemini가 이 메모를 짧게 정리합니다.
              </p>
            )}
          </div>

          {memo.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {memo.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              data-testid="memo-detail-edit"
            >
              편집
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              data-testid="memo-detail-delete"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
