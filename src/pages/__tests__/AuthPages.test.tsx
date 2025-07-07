import { render, screen, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'

jest.mock('@/lib/storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  __esModule: true,
}))


import SignIn from '../SignIn'
import SignUp from '../SignUp'
import * as storage from '@/lib/storage'

describe('Auth pages local storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores session on sign in', () => {
    render(<SignIn />);

    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(storage.setItem).toHaveBeenCalledWith('session', { user: { id: 'test@example.com', email: 'test@example.com' } });
  });

  it('stores session on sign up', () => {
    render(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Name/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(storage.setItem).toHaveBeenCalledWith('session', { user: { id: 'new@example.com', email: 'new@example.com', name: 'New User' } });
  });
});
