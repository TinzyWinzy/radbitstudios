import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const colors = {
  background: '#0f0f13',
  primary: '#B8860B',
  text: '#FFFFFF',
  muted: '#A0A0A8',
  accent: '#F5E6B8',
};

function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#EAB308';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Digitally Ready';
  if (score >= 60) return 'Building Momentum';
  if (score >= 40) return 'Getting Started';
  return 'Early Stage';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const score = Math.min(100, Math.max(0, parseInt(searchParams.get('score') || '0', 10)));
  const userName = searchParams.get('user') || 'My Business';
  const category = searchParams.get('category') || 'Digital Readiness';

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${colors.background} 0%, #1a1a24 50%, #0f0f13 100%)`,
          fontFamily: 'Inter, sans-serif',
          padding: '60px',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '28px',
              fontWeight: 'bold',
            }}
          >
            R
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: colors.text }}>Radbit</div>
        </div>

        {/* Score circle */}
        <div
          style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            border: `8px solid ${scoreColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            boxShadow: `0 0 60px ${scoreColor}33`,
          }}
        >
          <div style={{ fontSize: '72px', fontWeight: '800', color: colors.text, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: '18px', color: colors.muted }}>/ 100</div>
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: scoreColor,
            marginBottom: '8px',
          }}
        >
          {scoreLabel}
        </div>

        {/* Category */}
        <div style={{ fontSize: '16px', color: colors.muted, marginBottom: '24px' }}>
          {category}
        </div>

        {/* User name */}
        <div style={{ fontSize: '14px', color: colors.muted }}>
          {userName}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: colors.muted,
          }}
        >
          <span>radbitstudios.co.zw</span>
          <span style={{ color: colors.primary }}>→</span>
          <span>Assess your business</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
