import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNav } from '@/components/bottom-nav';
import React from 'react';

const mockToggleSidebar = vi.fn();

vi.mock('next/link', () => ({
  default: (props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    React.createElement('a', { href: props.href, ...props }, props.children),
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

vi.mock('lucide-react', () => ({
  Home: () => React.createElement('span', null, 'Home'),
  Briefcase: () => React.createElement('span', null, 'Briefcase'),
  Wand2: () => React.createElement('span', null, 'Wand2'),
  Users: () => React.createElement('span', null, 'Users'),
  Handshake: () => React.createElement('span', null, 'Handshake'),
  PanelLeft: () => React.createElement('span', null, 'PanelLeft'),
}));

describe('BottomNav', () => {
  it('renders all navigation items', () => {
    render(React.createElement(BottomNav));
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Tenders')).toBeTruthy();
    expect(screen.getByText('Toolkit')).toBeTruthy();
    expect(screen.getByText('Invest')).toBeTruthy();
    expect(screen.getByText('Community')).toBeTruthy();
    expect(screen.getByText('Menu')).toBeTruthy();
  });

  it('renders nav links with correct hrefs', () => {
    render(React.createElement(BottomNav));
    const links = screen.getAllByRole('link');
    expect(links.find(l => l.getAttribute('href') === '/dashboard')).toBeTruthy();
    expect(links.find(l => l.getAttribute('href') === '/tenders')).toBeTruthy();
    expect(links.find(l => l.getAttribute('href') === '/toolkit')).toBeTruthy();
    expect(links.find(l => l.getAttribute('href') === '/investor-portal')).toBeTruthy();
    expect(links.find(l => l.getAttribute('href') === '/community')).toBeTruthy();
  });
});
