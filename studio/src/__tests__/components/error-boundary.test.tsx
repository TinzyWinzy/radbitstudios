import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error-boundary';

function Bomb() {
  throw new Error('Test error');
}

function GoodChild() {
  return <div>Child content</div>;
}

describe('ErrorBoundary', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => consoleSpy.mockClear());

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeTruthy();
  });

  it('renders default fallback on error', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText(/Test error/)).toBeTruthy();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error UI')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  it('resets error state on "Try again" click', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();

    const tryAgain = screen.getByText('Try again');
    fireEvent.click(tryAgain);

    rerender(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeTruthy();
  });
});
