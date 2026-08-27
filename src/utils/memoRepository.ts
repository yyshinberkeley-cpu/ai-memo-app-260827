import { v4 as uuidv4 } from 'uuid'
import { Memo, MemoFormData } from '@/types/memo'
import {
  getSupabaseClient,
  mapFormToInsert,
  mapMemoToRow,
  mapRowToMemo,
  type MemoRow,
} from '@/utils/supabaseClient'

const handleError = (action: string, error: { message: string } | null) => {
  if (!error) return
  console.error(`Supabase ${action} failed:`, error.message)
  throw new Error(error.message)
}

export const memoRepository = {
  getMemos: async (): Promise<Memo[]> => {
    const { data, error } = await getSupabaseClient()
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false })

    handleError('getMemos', error)
    return ((data as MemoRow[] | null) ?? []).map(mapRowToMemo)
  },

  addMemo: async (memo: Memo): Promise<Memo> => {
    const { data, error } = await getSupabaseClient()
      .from('memos')
      .insert(mapMemoToRow(memo))
      .select()
      .single()

    handleError('addMemo', error)
    return mapRowToMemo(data as MemoRow)
  },

  createFromForm: async (formData: MemoFormData): Promise<Memo> => {
    const row = mapFormToInsert(uuidv4(), formData)
    const { data, error } = await getSupabaseClient()
      .from('memos')
      .insert(row)
      .select()
      .single()

    handleError('createFromForm', error)
    return mapRowToMemo(data as MemoRow)
  },

  updateMemo: async (id: string, formData: MemoFormData): Promise<Memo> => {
    const { data, error } = await getSupabaseClient()
      .from('memos')
      .update({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
      })
      .eq('id', id)
      .select()
      .single()

    handleError('updateMemo', error)
    return mapRowToMemo(data as MemoRow)
  },

  deleteMemo: async (id: string): Promise<void> => {
    const { error } = await getSupabaseClient()
      .from('memos')
      .delete()
      .eq('id', id)
    handleError('deleteMemo', error)
  },

  upsertMemos: async (memos: Memo[]): Promise<void> => {
    if (memos.length === 0) return

    const { error } = await getSupabaseClient()
      .from('memos')
      .upsert(memos.map(mapMemoToRow), { onConflict: 'id' })

    handleError('upsertMemos', error)
  },

  clearMemos: async (): Promise<void> => {
    const { error } = await getSupabaseClient()
      .from('memos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    handleError('clearMemos', error)
  },
}
