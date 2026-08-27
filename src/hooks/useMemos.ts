'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Memo, MemoFormData } from '@/types/memo'
import { isSupabaseConfigured } from '@/utils/supabaseClient'
import { memoRepository } from '@/utils/memoRepository'
import { migrateLocalStorageToSupabase, seedSampleData } from '@/utils/seedData'

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const loadMemos = async () => {
      setLoading(true)
      try {
        if (!isSupabaseConfigured()) {
          console.error(
            'Supabase 환경 변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요.'
          )
          setMemos([])
          return
        }

        await migrateLocalStorageToSupabase()
        await seedSampleData()
        const loadedMemos = await memoRepository.getMemos()
        setMemos(loadedMemos)
      } catch (error) {
        console.error('Failed to load memos:', error)
        setMemos([])
      } finally {
        setLoading(false)
      }
    }

    void loadMemos()
  }, [])

  const createMemo = useCallback(
    async (formData: MemoFormData): Promise<Memo> => {
      const newMemo = await memoRepository.createFromForm(formData)
      setMemos(prev => [newMemo, ...prev])
      return newMemo
    },
    []
  )

  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<void> => {
      const updatedMemo = await memoRepository.updateMemo(id, formData)
      setMemos(prev => prev.map(memo => (memo.id === id ? updatedMemo : memo)))
    },
    []
  )

  const deleteMemo = useCallback(async (id: string): Promise<void> => {
    await memoRepository.deleteMemo(id)
    setMemos(prev => prev.filter(memo => memo.id !== id))
  }, [])

  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(memo => memo.id === id)
    },
    [memos]
  )

  const filteredMemos = useMemo(() => {
    let filtered = memos

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  const clearAllMemos = useCallback(async (): Promise<void> => {
    await memoRepository.clearMemos()
    setMemos([])
    setSearchQuery('')
    setSelectedCategory('all')
  }, [])

  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    memos: filteredMemos,
    allMemos: memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,
    searchMemos,
    filterByCategory,
    clearAllMemos,
  }
}
