import { cn } from '@/lib/utils';

interface HeroBackgroundProps {
  className?: string;
}

export function HeroBackground({ className }: HeroBackgroundProps) {
  return (
    <div
      className={cn('fixed inset-0 z-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% 100%, hsl(40 95% 50% / 0.12), transparent 70%),
            radial-gradient(ellipse 80% 50% at 20% 90%, hsl(145 40% 25% / 0.08), transparent 60%),
            radial-gradient(ellipse 70% 60% at 80% 85%, hsl(40 80% 40% / 0.06), transparent 55%),
            linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 50%, hsl(var(--background) / 0.95) 100%)
          `,
          backgroundSize: '200% 200%',
          backgroundAttachment: 'fixed',
        }}
      />

      <div className="absolute inset-0 hidden md:block">
        <div
          className="absolute bottom-[15%] left-[12%] w-[12vw] h-[35vh] animate-ruins-float"
          style={{
            clipPath: 'polygon(50% 0%, 72% 100%, 28% 100%)',
            background: 'linear-gradient(180deg, hsl(40 50% 45% / 0.08), hsl(40 30% 30% / 0.04))',
            borderLeft: '1px solid hsl(40 50% 45% / 0.08)',
            borderRight: '1px solid hsl(40 50% 45% / 0.08)',
            filter: 'blur(0.5px)',
          }}
        />
        <div
          className="absolute bottom-[15%] left-[12%] w-[12vw] h-[35vh] opacity-[0.03]"
          style={{
            clipPath: 'polygon(50% 0%, 72% 100%, 28% 100%)',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(40 50% 50% / 0.5) 2px, transparent 3px)',
          }}
        />

        <div
          className="absolute bottom-[10%] right-[8%] w-[18vw] h-[40vh] animate-ruins-float-slow"
          style={{
            borderRadius: '50% / 80%',
            border: '1px solid hsl(40 50% 45% / 0.07)',
            background: 'radial-gradient(ellipse 60% 40% at 50% 100%, hsl(40 50% 40% / 0.04), transparent)',
            transform: 'rotate(5deg)',
          }}
        />
        <div
          className="absolute bottom-[16%] right-[13%] w-[10vw] h-[24vh] animate-ruins-float-slow"
          style={{
            borderRadius: '50% / 70%',
            border: '1px solid hsl(40 50% 45% / 0.05)',
            transform: 'rotate(-2deg)',
          }}
        />

        <div
          className="absolute bottom-[28%] left-[38%] w-[8vw] h-[20vh] animate-ruins-float-fast animate-stone-glow"
          style={{
            clipPath: 'polygon(50% 0%, 55% 15%, 70% 10%, 75% 25%, 60% 30%, 65% 50%, 80% 55%, 78% 70%, 55% 65%, 50% 100%, 45% 65%, 22% 70%, 20% 55%, 35% 50%, 40% 30%, 25% 25%, 30% 10%, 45% 15%)',
            background: 'linear-gradient(180deg, hsl(40 60% 50% / 0.10), hsl(40 40% 40% / 0.04))',
            border: '1px solid hsl(40 50% 45% / 0.06)',
          }}
        />

        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={`stone-${i}`}
            className="absolute animate-stone-glow-slow"
            style={{
              bottom: `${8 + i * 5}%`,
              left: `${20 + i * 10}%`,
              width: `${2 + (i % 3) * 1.5}vw`,
              height: `${1.5 + (i % 2) * 1}vh`,
              background: 'hsl(40 50% 45% / 0.04)',
              border: '1px solid hsl(40 50% 45% / 0.05)',
              borderRadius: '1px',
              animationDelay: `${i * 1.5}s`,
              opacity: 0.04 + i * 0.005,
              transform: `rotate(${i * 3 - 5}deg)`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        <div
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full animate-ray-drift"
          style={{
            background: 'radial-gradient(circle, hsl(40 95% 50% / 0.06), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full animate-ray-drift-slow"
          style={{
            background: 'radial-gradient(circle, hsl(145 40% 30% / 0.05), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] rounded-full animate-ray-drift"
          style={{
            background: 'radial-gradient(circle, hsl(30 80% 45% / 0.04), transparent 70%)',
            filter: 'blur(100px)',
            animationDelay: '-8s',
          }}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-full animate-ember-drift"
            style={{
              left: `${5 + (i * 17 + 3) % 90}%`,
              width: `${1.5 + (i * 3 + 7) % 3}px`,
              height: `${1.5 + (i * 3 + 7) % 3}px`,
              background: 'hsl(40 90% 60% / 0.6)',
              boxShadow: '0 0 4px hsl(40 90% 60% / 0.3)',
              animationDelay: `${(i * 13 + 5) % 18}s`,
              animationDuration: `${15 + (i * 7 + 11) % 20}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-[50vh] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  );
}
