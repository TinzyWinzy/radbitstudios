import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpgradeModal } from '@/components/upgrade-modal';
import type { UpgradeInfo } from '@/services/feature-gate';
import React from 'react';

vi.mock('@/components/ui/dialog', () => {
  const Dialog = ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null;
  const DialogContent = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const DialogHeader = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const DialogTitle = ({ children }: { children: React.ReactNode }) =>
    React.createElement('h2', null, children);
  const DialogDescription = ({ children }: { children: React.ReactNode }) =>
    React.createElement('p', null, children);
  return { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
});

vi.mock('@/components/ui/button', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    React.createElement('button', props, props.children),
}));

vi.mock('lucide-react', () => ({
  Sparkles: () => React.createElement('span', null, 'Sparkles'),
  ArrowUpRight: () => React.createElement('span', null, 'ArrowUpRight'),
}));

describe('UpgradeModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnUpgrade = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('renders nothing when upgrade is null', () => {
    const { container } = render(
      React.createElement(UpgradeModal, { open: true, onOpenChange: mockOnOpenChange, upgrade: null })
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when upgradeTo is null', () => {
    const { container } = render(
      React.createElement(UpgradeModal, {
        open: true,
        onOpenChange: mockOnOpenChange,
        upgrade: { upgradeTo: null, price: 0, message: '', feature: '' },
      })
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders upgrade dialog for Growth plan', () => {
    const upgrade: UpgradeInfo = {
      upgradeTo: 'Growth',
      price: 5,
      message: 'Unlock more tools',
      feature: 'More credits',
    };
    render(React.createElement(UpgradeModal, { open: true, onOpenChange: mockOnOpenChange, upgrade }));
    expect(screen.getByText('Upgrade to Growth')).toBeTruthy();
    expect(screen.getByText('Unlock more tools')).toBeTruthy();
  });

  it('calls onUpgrade when provided', () => {
    const upgrade: UpgradeInfo = {
      upgradeTo: 'Growth',
      price: 5,
      message: 'Unlock more tools',
      feature: 'More credits',
    };
    render(React.createElement(UpgradeModal, {
      open: true,
      onOpenChange: mockOnOpenChange,
      upgrade,
      onUpgrade: mockOnUpgrade,
    }));
    fireEvent.click(screen.getAllByText(/Upgrade to Growth/)[1]);
    expect(mockOnUpgrade).toHaveBeenCalledOnce();
  });

  it('calls onOpenChange(false) when "Maybe later" clicked', () => {
    const upgrade: UpgradeInfo = {
      upgradeTo: 'Growth',
      price: 5,
      message: 'Unlock more tools',
      feature: 'More credits',
    };
    render(React.createElement(UpgradeModal, { open: true, onOpenChange: mockOnOpenChange, upgrade }));
    fireEvent.click(screen.getByText('Maybe later'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows Pro plan features', () => {
    const upgrade: UpgradeInfo = {
      upgradeTo: 'Pro',
      price: 15,
      message: 'Go unlimited',
      feature: 'Unlimited access',
    };
    render(React.createElement(UpgradeModal, { open: true, onOpenChange: mockOnOpenChange, upgrade }));
    expect(screen.getByText('Upgrade to Pro')).toBeTruthy();
  });
});
