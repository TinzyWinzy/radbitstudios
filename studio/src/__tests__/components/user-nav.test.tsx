import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('next/link', () => ({
  default: ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement('a', { href, ...props }, props.children),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/ui/avatar', () => {
  const Avatar = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const AvatarImage = () => null;
  const AvatarFallback = ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children);
  return { Avatar, AvatarImage, AvatarFallback };
});

vi.mock('@/components/ui/button', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    React.createElement('button', props, props.children),
}));

vi.mock('@/components/ui/dropdown-menu', () => {
  const DropdownMenu = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const DropdownMenuContent = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const DropdownMenuItem = (props: React.HTMLAttributes<HTMLDivElement>) =>
    React.createElement('div', props, props.children);
  const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const DropdownMenuSeparator = () => React.createElement('hr', null);
  const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  return { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger };
});

import type { AppUser } from '@/types/user';
import type { AuthContextType } from '@/contexts/auth-context';

const mockUser: Partial<AppUser> = { displayName: 'John Doe', email: 'john@example.com', photoURL: '' };
const mockLogout = vi.fn().mockResolvedValue(undefined);

vi.mock('@/contexts/auth-context', () => {
  const ctx = React.createContext(undefined as unknown as AuthContextType);
  return { AuthContext: ctx };
});

import { AuthContext } from '@/contexts/auth-context';
import { UserNav } from '@/components/user-nav';

describe('UserNav', () => {
  it('renders user avatar with initials', () => {
    render(
      React.createElement(
        AuthContext.Provider,
        { value: { user: mockUser as AppUser, loading: false, role: null, logout: mockLogout, signUp: vi.fn(), signIn: vi.fn(), signInWithGoogle: vi.fn(), refreshUserData: vi.fn(), deleteAccount: vi.fn() } },
        React.createElement(UserNav)
      )
    );
    expect(screen.getByText('JD')).toBeTruthy();
  });

  it('returns null when no user', () => {
    const { container } = render(
      React.createElement(
        AuthContext.Provider,
        { value: { user: null, loading: false, role: null, logout: mockLogout, signUp: vi.fn(), signIn: vi.fn(), signInWithGoogle: vi.fn(), refreshUserData: vi.fn(), deleteAccount: vi.fn() } },
        React.createElement(UserNav)
      )
    );
    expect(container.innerHTML).toBe('');
  });
});
