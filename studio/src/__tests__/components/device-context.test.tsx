import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeviceProvider, useDevice } from '@/contexts/device-context';

vi.mock('@/lib/device', () => ({
  getDeviceCapabilities: () => ({
    tier: 'high' as const,
    prefersReducedMotion: false,
    isTouchDevice: false,
    connection: { saveData: false, effectiveType: '4g', downlink: 10, rtt: 50 },
  }),
}));

function TestConsumer() {
  const caps = useDevice();
  return (
    <div>
      <span data-testid="tier">{caps.tier}</span>
      <span data-testid="reduced-motion">{String(caps.prefersReducedMotion)}</span>
      <span data-testid="touch">{String(caps.isTouchDevice)}</span>
      <span data-testid="save-data">{String(caps.saveData)}</span>
    </div>
  );
}

describe('DeviceProvider', () => {
  it('provides device capabilities', () => {
    render(
      <DeviceProvider>
        <TestConsumer />
      </DeviceProvider>
    );
    expect(screen.getByTestId('tier').textContent).toBe('high');
    expect(screen.getByTestId('reduced-motion').textContent).toBe('false');
    expect(screen.getByTestId('touch').textContent).toBe('false');
    expect(screen.getByTestId('save-data').textContent).toBe('false');
  });

  it('throws when useDevice used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useDevice must be used within DeviceProvider');
    consoleSpy.mockRestore();
  });
});
