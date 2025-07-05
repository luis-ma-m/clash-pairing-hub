/// <reference types="@testing-library/jest-dom" />
import { renderHook, waitFor } from '@testing-library/react'
import { useUserProfile } from '../useUserProfile'
import { setItem } from '@/lib/storage'

beforeEach(() => {
  setItem('session', { user: { id: 'u1', email: 'a@b.com' } })
  setItem('users', [
    { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'user', is_active: true }
  ])
})

describe('useUserProfile', () => {
  it('fetches the current user profile', async () => {
    const { result } = renderHook(() => useUserProfile())
    await waitFor(() => expect(result.current.user?.name).toBe('Alice'))
  })
})
