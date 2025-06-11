/// <reference types="@testing-library/jest-dom" />
import { renderHook, waitFor } from '@testing-library/react'
import { useUserProfile } from '../useUserProfile'
import { supabase } from '@/lib/supabase'
import { jest } from '@jest/globals'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      // @ts-expect-error - test mock
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
      // @ts-expect-error - test mock
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    // @ts-expect-error - test mock
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'u1', email: 'a@b.com', name: 'Alice' } })
    }))
  }
}))

describe('useUserProfile', () => {
  it('fetches the current user profile', async () => {
    const { result } = renderHook(() => useUserProfile())
    await waitFor(() => expect(result.current.user?.name).toBe('Alice'))
  })
})
