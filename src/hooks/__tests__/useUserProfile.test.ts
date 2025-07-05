/// <reference types="@testing-library/jest-dom" />
import { renderHook, waitFor } from '@testing-library/react'
import { useUserProfile } from '../useUserProfile'
import { supabase } from '@/lib/supabase'
import { jest } from '@jest/globals'
import { setMockData } from '../../../test/localStorageSupabase'

// Supabase client is mapped to the localStorage mock via Jest config

describe('useUserProfile', () => {
  it('fetches the current user profile', async () => {
    setMockData({ users: [{ id: 'u1', email: 'a@b.com', name: 'Alice' }] })
    supabase.auth.getSession = jest
      .fn()
      .mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    supabase.auth.onAuthStateChange = jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))

    const { result } = renderHook(() => useUserProfile())
    await waitFor(() => expect(result.current.user?.name).toBe('Alice'))
  })
})
