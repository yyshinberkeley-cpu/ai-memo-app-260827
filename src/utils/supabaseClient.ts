import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Memo, MemoFormData } from '@/types/memo'

export interface MemoRow {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

let client: SupabaseClient | null = null

export const getSupabaseEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return { url, key }
}

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseEnv()
  return Boolean(url && key)
}

export const getSupabaseClient = (): SupabaseClient => {
  if (client) return client

  const { url, key } = getSupabaseEnv()
  if (!url || !key) {
    throw new Error(
      'Supabase 환경 변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 .env.local에 설정하세요.'
    )
  }

  client = createClient(url, key)
  return client
}

export const mapRowToMemo = (row: MemoRow): Memo => ({
  id: row.id,
  title: row.title,
  content: row.content,
  category: row.category,
  tags: row.tags ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const mapMemoToRow = (memo: Memo): MemoRow => ({
  id: memo.id,
  title: memo.title,
  content: memo.content,
  category: memo.category,
  tags: memo.tags,
  created_at: memo.createdAt,
  updated_at: memo.updatedAt,
})

export const mapFormToInsert = (
  id: string,
  formData: MemoFormData
): MemoRow => {
  const now = new Date().toISOString()
  return {
    id,
    title: formData.title,
    content: formData.content,
    category: formData.category,
    tags: formData.tags,
    created_at: now,
    updated_at: now,
  }
}
