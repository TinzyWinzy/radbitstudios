import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error-boundary';
import React from 'react';

describe('ErrorBoundary', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => consoleSpy.mockClear());

  function GoodChild() {
    return <div>Child content</div>;
  }

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeTruthy();
  });

  it('renders default fallback on error', () => {
    function Bomb(): React.ReactNode {
      throw new Error('Test error');
    }
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText(/Test error/)).toBeTruthy();
  });

  it('renders custom fallback when provided', () => {
    function Bomb(): React.ReactNode {
      throw new Error('Test error');
    }
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error UI')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  it('resets error state on "Try again" click', () => {
    let shouldThrow = true;
    function ConditionalBomb() {
      if (shouldThrow) throw new Error('Test error');
      return <div>Child content</div>;
    }

    render(
      <ErrorBoundary>
        <ConditionalBomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();

    shouldThrow = false;
    fireEvent.click(screen.getByText('Try again'));

    expect(screen.getByText('Child content')).toBeTruthy();
  });
});
