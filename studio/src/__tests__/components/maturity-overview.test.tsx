import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MaturityOverview } from '@/components/maturity-overview';
import type { AssessmentDoc } from '@/services/maturity';
import React from 'react';

vi.mock('@/components/ui/card', () => {
  const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) =>
    React.createElement('div', props, children);
  const CardContent = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const CardHeader = ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children);
  const CardTitle = ({ children }: { children: React.ReactNode }) =>
    React.createElement('h3', null, children);
  return { Card, CardContent, CardHeader, CardTitle };
});

vi.mock('lucide-react', () => ({
  Award: () => React.createElement('span', null, 'Award'),
  CheckCircle2: () => React.createElement('span', null, 'CheckCircle2'),
  ClipboardCheck: () => React.createElement('span', null, 'ClipboardCheck'),
  Sprout: () => React.createElement('span', null, 'Sprout'),
  TrendingUp: () => React.createElement('span', null, 'TrendingUp'),
  RefreshCw: () => React.createElement('span', null, 'RefreshCw'),
  ArrowUpCircle: () => React.createElement('span', null, 'ArrowUpCircle'),
  BarChart: () => React.createElement('span', null, 'BarChart'),
}));

describe('MaturityOverview', () => {
  const baseAssessment: AssessmentDoc = {
    id: 'a1',
    userId: 'u1',
    answers: {},
    overallScore: 65,
    categoryScores: { digitalPresence: 70, operations: 60 },
    completedAt: new Date('2026-01-15'),
    createdAt: new Date('2026-01-15'),
  };

  it('returns null when no profile', () => {
    const { container } = render(
      React.createElement(MaturityOverview, { assessments: [baseAssessment], hasProfile: false, benchmarkData: [] })
    );
    expect(container.innerHTML).toBe('');
  });

  it('returns null when no assessments', () => {
    const { container } = render(
      React.createElement(MaturityOverview, { assessments: [], hasProfile: true, benchmarkData: [] })
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders maturity score and level', () => {
    render(
      React.createElement(MaturityOverview, { assessments: [baseAssessment], hasProfile: true, benchmarkData: [] })
    );
    expect(screen.getByText('65')).toBeTruthy();
    expect(screen.getByText('Building Momentum')).toBeTruthy();
  });

  it('renders benchmark comparison when provided', () => {
    render(
      React.createElement(MaturityOverview, {
        assessments: [baseAssessment],
        hasProfile: true,
        benchmarkData: [
          { category: 'Digital Presence', benchmarkScore: 50 },
          { category: 'Operations', benchmarkScore: 55 },
        ],
      })
    );
    expect(screen.getByText('vs Industry Average')).toBeTruthy();
  });

  it('renders progress bar to next level', () => {
    render(
      React.createElement(MaturityOverview, { assessments: [baseAssessment], hasProfile: true, benchmarkData: [] })
    );
    expect(screen.getByText(/Progress to/)).toBeTruthy();
  });

  it('shows previous score when available', () => {
    const assessments: AssessmentDoc[] = [
      { ...baseAssessment, overallScore: 65 },
      { ...baseAssessment, id: 'a2', overallScore: 55 },
    ];
    render(
      React.createElement(MaturityOverview, { assessments, hasProfile: true, benchmarkData: [] })
    );
    expect(screen.getByText(/Previous score/)).toBeTruthy();
  });
});
