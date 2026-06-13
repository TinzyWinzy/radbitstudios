'use client';

import { useState } from "react";

const allPrefixes = [
  'Tafa', 'Moyo', 'Batsirai', 'Pfumai', 'Rufaro', 'Chiedza', 'Kuda',
  'Tariro', 'Makanaka', 'Rukudzo', 'Peace', 'Hope', 'Grace', 'Destiny',
  'Build', 'Prosper', 'Rise',
];

const allSuffixes = [
  'Fresh', 'Hub', 'Enterprise', 'Ventures', 'Trading', 'Solutions',
  'Holdings', 'Industries', 'Investments', 'Foods', 'Creations', 'Works',
];

const industryMods: Record<string, { p: string[]; s: string[] }> = {
  agriculture: {
    p: ['Mupunga', 'Zviyo', 'Gere', 'Mbeu', 'Muriwo', 'Harvest', 'Golden', 'Soil'],
    s: ['Farms', 'Harvest', 'Grains', 'Fresh Produce', 'Orchards', 'Agri'],
  },
  retail: {
    p: ['Mbare', 'Super', 'Quick', 'Budget', 'Urban', 'Corner', 'Main', 'Express'],
    s: ['Store', 'Mart', 'Shop', 'Bazaar', 'World', 'Outlet'],
  },
  services: {
    p: ['QuickFix', 'Service', 'Pro', 'Total', 'Master', 'Expert', 'Care', 'Support'],
    s: ['Services', 'Solutions', 'Care', 'Agency', 'Desk', 'Support'],
  },
  tech: {
    p: ['Digital', 'Smart', 'Byte', 'Code', 'Logic', 'Nexus', 'Cipher', 'Sync'],
    s: ['Systems', 'Tech', 'Labs', 'Software', 'Apps', 'Cloud', 'Connect'],
  },
  food: {
    p: ['Taste', 'Flavor', 'Savory', 'Fresh', 'Bite', 'Happy', 'Comfort', 'Family'],
    s: ['Kitchen', 'Bites', 'Cuisine', 'Eats', 'Grill', 'Bakery', 'Flavors'],
  },
  creative: {
    p: ['Art', 'Design', 'Color', 'Vision', 'Frame', 'Canvas', 'Pixel', 'Creative'],
    s: ['Studio', 'Designs', 'Co.', 'Agency', 'Lab', 'Works', 'Makers'],
  },
};

function generate(industry: string): string[] {
  const m = industryMods[industry] || { p: allPrefixes, s: allSuffixes };
  const names: string[] = [];
  for (let i = 0; i < 10; i++) {
    const pre = m.p[Math.floor(Math.random() * m.p.length)];
    const suf = m.s[Math.floor(Math.random() * m.s.length)];
    names.push(pre + (Math.random() > 0.5 ? ' ' : '') + suf);
  }
  return names;
}

const sampleNames = ['Taffresh Fresh', 'Moyo Hub', 'Sizzle Foods', 'Prime Hub'];

export function BusinessNameGenerator() {
  const [industry, setIndustry] = useState('default');
  const [names, setNames] = useState(sampleNames);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/50 bg-card/30 p-6">
        <label htmlFor="industry-select" className="block text-sm font-medium mb-3">
          Select your industry
        </label>
        <select
          id="industry-select"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
        >
          <option value="default">All industries</option>
          <option value="agriculture">Agriculture & Farming</option>
          <option value="retail">Retail & Shop</option>
          <option value="services">Services & Consulting</option>
          <option value="tech">Technology & Software</option>
          <option value="food">Food & Catering</option>
          <option value="creative">Creative & Design</option>
        </select>
        <button
          onClick={() => setNames(generate(industry))}
          className="mt-4 w-full rounded-lg bg-primary text-primary-foreground font-medium py-2.5 hover:bg-primary/90 transition-colors"
        >
          Generate 10 Names
        </button>
      </div>

      <div
        className="grid gap-3 md:grid-cols-2"
        role="region"
        aria-live="polite"
        aria-label="Generated business names"
      >
        {names.map((name, i) => (
          <div key={i} className="rounded-lg border border-border/50 bg-card/50 p-4">
            <p className="font-semibold">{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
