import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('next/link', () => ({
  default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement('a', { href: props.href, ...props }, props.children),
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

const mockUser = { displayName: 'John Doe', email: 'john@example.com', photoURL: '' };
const mockLogout = vi.fn().mockResolvedValue(undefined);

vi.mock('@/contexts/auth-context', () => ({
  AuthContext: {
    Provider: ({ children, value }: { children: React.ReactNode; value: unknown }) =>
      React.createElement('div', { 'data-testid': 'auth-provider' }, children),
    Consumer: ({ children }: { children: (value: unknown) => React.ReactNode }) =>
      children(mockUser),
  },
}));

// Import after mocks
const { UserNav } = require('@/components/user-nav') as typeof import('@/components/user-nav');

describe('UserNav', () => {
  it('renders user avatar with initials', () => {
    // Mock useContext to return our user
    const authContext = require('@/contexts/auth-context');
    const originalConsumer = authContext.AuthContext.Consumer;
    authContext.AuthContext.Consumer = ({ children }: { children: (value: unknown) => React.ReactNode }) =>
      children({ user: mockUser, logout: mockLogout });

    render(React.createElement(UserNav));
    expect(screen.getByText('JD')).toBeTruthy();

    authContext.AuthContext.Consumer = originalConsumer;
  });

  it('returns null when no user', () => {
    const authContext = require('@/contexts/auth-context');
    const originalConsumer = authContext.AuthContext.Consumer;
    authContext.AuthContext.Consumer = ({ children }: { children: (value: unknown) => React.ReactNode }) =>
      children({ user: null, logout: mockLogout });

    const { container } = render(React.createElement(UserNav));
    expect(container.innerHTML).toBe('');

    authContext.AuthContext.Consumer = originalConsumer;
  });
});
