'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Layers,
  ShieldCheck,
  CheckCircle,
  FileText,
  Cpu,
  BarChart3,
  AlertTriangle,
  GitBranch,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface OpsLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function OpsLayout({ children, params }: OpsLayoutProps) {
  const pathname = usePathname();
  const locale = params?.locale || 'en';

  const navItems = [
    { label: 'Executive Ops', href: `/${locale}/ops`, icon: Activity, exact: true },
    { label: 'Opportunities', href: `/${locale}/ops/opportunities`, icon: Layers },
    { label: 'Decisions & Approvals', href: `/${locale}/ops/decisions`, icon: CheckCircle },
    { label: 'Evidence Store', href: `/${locale}/ops/evidence`, icon: FileText },
    { label: 'Holon Registry', href: `/${locale}/ops/holons`, icon: Cpu },
    { label: 'Evaluations & Regret', href: `/${locale}/ops/evaluations`, icon: TrendingUp },
    { label: 'Learning & Calibration', href: `/${locale}/ops/learning`, icon: BarChart3 },
    { label: 'Monitoring & Alerts', href: `/${locale}/ops/monitoring`, icon: AlertTriangle },
    { label: 'Evolution Proposals', href: `/${locale}/ops/evolution`, icon: GitBranch },
    { label: 'Vincent H4 Doctrine', href: `/${locale}/ops/settings/vincent`, icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Banner / System Status */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-950">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                RADBIT AEHML KERNEL
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                v0.1.0 POC
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Adaptive Evolutionary Holonic Commercial Decision Engine</p>
          </div>
        </div>

        {/* Global Governance Badge */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Vincent H4 Governance: <span className="text-emerald-400 font-semibold">Active</span></span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Human-in-the-Loop: <span className="text-cyan-400 font-semibold">Enforced</span></span>
          </div>
        </div>
      </header>

      {/* Sub Navigation Bar */}
      <nav className="border-b border-slate-800/60 bg-slate-900/40 px-6 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 py-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">{children}</main>
    </div>
  );
}
