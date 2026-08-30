import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav } from '@/components/bottom-nav';
import React from 'react';

const mockToggleSidebar = vi.fn();

vi.mock('next/link', () => ({
  default: ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement('a', { href, ...props }, props.children),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ toggleSidebar: mockToggleSidebar }),
}));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return actual;
});

describe('BottomNav', () => {
  it('renders all navigation items', () => {
    render(React.createElement(BottomNav));
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Actions')).toBeTruthy();
    expect(screen.getByText('Projects')).toBeTruthy();
  });

  it('renders nav links with correct hrefs', () => {
    render(React.createElement(BottomNav));
    const links = screen.getAllByRole('link');
    expect(links.find(l => l.getAttribute('href') === '/dashboard')).toBeTruthy();
    expect(links.find(l => l.getAttribute('href') === '/dashboard/actions')).toBeTruthy();
    expect(links.find(l => l.getAttribute('href') === '/dashboard/projects')).toBeTruthy();
  });
});