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
  const baseResponses = [
    { score: 3, category: 'digitalPresence', question: 'Do you have a website?', answer: 'Yes' },
    { score: 3, category: 'digitalPresence', question: 'Do you use social media?', answer: 'Yes' },
    { score: 2, category: 'operations', question: 'Do you use accounting software?', answer: 'Sometimes' },
    { score: 3, category: 'operations', question: 'Do you track inventory?', answer: 'Yes' },
    { score: 2, category: 'strategy', question: 'Do you have a business plan?', answer: 'Draft' },
  ];

  const baseAssessment: AssessmentDoc = {
    id: 'a1',
    responses: baseResponses,
    createdAt: { toDate: () => new Date('2026-06-13') },
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
    expect(screen.getAllByText('Building Momentum')[0]).toBeTruthy();
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
      baseAssessment,
      {
        id: 'a2',
        responses: [
          { score: 2, category: 'digitalPresence', question: 'Do you have a website?', answer: 'No' },
          { score: 2, category: 'operations', question: 'Do you use accounting software?', answer: 'No' },
          { score: 1, category: 'strategy', question: 'Do you have a business plan?', answer: 'No' },
        ],
        createdAt: { toDate: () => new Date('2026-01-15') },
      },
    ];
    render(
      React.createElement(MaturityOverview, { assessments, hasProfile: true, benchmarkData: [] })
    );
    expect(screen.getByText(/Previous score/)).toBeTruthy();
  });
});
