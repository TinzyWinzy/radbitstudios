import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationBell } from '@/components/notification-bell';
import React from 'react';

vi.mock('@/components/ui/button', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    React.createElement('button', props, props.children),
}));

vi.mock('@/components/ui/popover', () => {
  const Popover = ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? React.createElement('div', { 'data-testid': 'popover' }, children) : React.createElement('div', null, children);
  const PopoverContent = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const PopoverTrigger = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  return { Popover, PopoverContent, PopoverTrigger };
});

vi.mock('lucide-react', () => ({
  Bell: () => React.createElement('span', null, 'Bell'),
  Loader2: () => React.createElement('span', null, 'Loader'),
  CheckCheck: () => React.createElement('span', null, 'CheckCheck'),
  ExternalLink: () => React.createElement('span', null, 'ExternalLink'),
}));

vi.mock('@/services/notifications/notifications-service', () => ({
  markAsRead: vi.fn().mockResolvedValue(undefined),
  markAllAsRead: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn((_q: unknown, callback: (snap: { docs: unknown[] }) => void) => {
    callback({ docs: [] });
    return vi.fn();
  }),
}));

vi.mock('@/lib/firebase/firebase', () => ({
  db: {},
}));

describe('NotificationBell', () => {
  it('renders bell icon', () => {
    render(React.createElement(NotificationBell, { userId: 'user-1' }));
    expect(screen.getByText('Bell')).toBeTruthy();
  });
});
