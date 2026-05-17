import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Name Generator — Free Zimbabwe SME Name Ideas",
  description:
    "Free business name generator for Zimbabwean SMEs. Get Shona, English, and bilingual name ideas tailored to your industry.",
  alternates: { canonical: "/resources/tools/business-name-generator" },
};

const prefixes = [
  "Tafa", "Moyo", "Batsirai", "Pfumai", "Rufaro", "Chiedza", "Kuda", "Tariro", "Makanaka", "Rukudzo",
  "Peace", "Hope", "Grace", "Destiny", "Build", "Prosper", "Rise", "Chief", "Grand", "Prime",
];

const suffixes = [
  "Fresh", "Hub", "Enterprise", "Ventures", "Trading", "Solutions", "Holdings", "Industries", "Investments", "Generations",
  "Foods", "Creations", "Works", "Systems", "Partners", "Holdings", "Empower", "Impact", "Routes", "Distributors",
];

const industryModifiers: Record<string, { prefix: string[]; suffix: string[] }> = {
  default: { prefix: prefixes, suffix: suffixes },
  agriculture: { prefix: ["Mupunga", "Zviyo", "Gere", "Mbeu", "Muriwo", "Tobacco", "Fertile", "Harvest", "Golden", "Soil"], suffix: ["Farms", "Harvest", "Grains", "Fresh Produce", "Orchards", "Fields", "Agri", "EcoFarm", "Foods", "Growing"] },
  retail:     { prefix: ["Mbare", "Super", "Shoprite", "Quick", "Speedy", "Budget", "Urban", "Corner", "Main", "Express"], suffix: ["Store", "Mart", "Shop", "Bazaar", "Discount", "World", "Point", "Spot", "Retail", "Outlet"] },
  services:   { prefix: ["QuickFix", "Service", "Pro", "Total", "Complete", "First", "Master", "Expert", "Care", "Support"], suffix: ["Services", "Solutions", "Care", "Assist", "Help", "Agency", "Centre", "Desk", "Support", "Web"] },
  tech:       { prefix: ["Digital", "Smart", "Byte", "Code", "Logic", "Nexus", "Cipher", "Sync", "Tech", "Auto"], suffix: ["Systems", "Tech", "Labs", "Digital", "Software", "Apps", "Cloud", "Network", "Connect", "Dynamics"] },
  food:       { prefix: ["Taste", "Flavor", "Savory", "Spice", "Fresh", "Bite", "Happy", "Comfort", "Family", "Sizzle"], suffix: ["Kitchen", "Kitchen", "Bites", "Cuisine", "Eats", "Grill", "Bakery", "Tables", "Flavors", "Cafe"] },
  creative:   { prefix: ["Art", "Design", "Color", "Vision", "Frame", "Canvas", "Pixel", "Creative", "Bold", "Vivid"], suffix: ["Studio", "Designs", "Co.", "Agency", "Labs", "Lab", "Works", "Makers", "Creative", "Craft"] },
};

function generateNames(industry: string, count: number): string[] {
  const mods = industryModifiers[industry] || industryModifiers.default;
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const prefix = mods.prefix[Math.floor(Math.random() * mods.prefix.length)];
    const suffix = mods.suffix[Math.floor(Math.random() * mods.suffix.length)];
    const connector = Math.random() > 0.5 ? " " : "";
    names.push(`${prefix}${connector}${suffix}`);
  }
  return [...new Set(names)];
}

export default function BusinessNameGeneratorPage() {
  return (
    <div className="container max-w-2xl py-16">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">&larr; Back to Resources</Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Sparkles className="h-6 w-6" /></div>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Business Name Generator</h1>
          <p className="text-muted-foreground">Free name ideas for Zimbabwean SMEs</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Desktop form — no "use client", so shim with inline input */}
        <div className="rounded-xl border border-border/50 bg-card/30 p-6">
          <label htmlFor="industry-select" className="block text-sm font-medium mb-3">Select your industry</label>
          <select
            id="industry-select"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
            data-tool="nameGenIndustry"
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
            id="generate-btn"
            className="mt-4 w-full rounded-lg bg-primary text-primary-foreground font-medium py-2.5 hover:bg-primary/90 transition-colors"
          >
            Generate 10 Names
          </button>
        </div>

        <div
          id="names-output"
          className="grid gap-3 md:grid-cols-2"
        >
          {["Taffresh Fresh", "Moyo Hub", "Sizzle Foods", "Prime Hub"].map((name, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-card/50 p-4">
              <p className="font-semibold">{name}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-8 text-center">
        Names are generated algorithmically. Always check the PACRA name database before committing to a name.
      </p>

      <script dangerouslySetInnerHTML={{ __html: `
document.getElementById('generate-btn').addEventListener('click', function() {
  const industry = document.getElementById('industry-select').value;
  const prefixes = ['Tafa','Moyo','Batsirai','Pfumai','Rufaro','Chiedza','Kuda','Tariro','Makanaka','Rukudzo','Peace','Hope','Grace','Destiny','Build','Prosper','Rise'];
  const suffixes = ['Fresh','Hub','Enterprise','Ventures','Trading','Solutions','Holdings','Industries','Investments','Foods','Creations','Works'];
  const mods = {
    agriculture: {p:['Mupunga','Zviyo','Gere','Mbeu','Muriwo','Harvest','Golden','Soil'],s:['Farms','Harvest','Grains','Fresh Produce','Orchards','Agri']},
    retail: {p:['Mbare','Super','Quick','Budget','Urban','Corner','Main','Express'],s:['Store','Mart','Shop','Bazaar','World','Outlet']},
    services: {p:['QuickFix','Service','Pro','Total','Master','Expert','Care','Support'],s:['Services','Solutions','Care','Agency','Desk','Support']},
    tech: {p:['Digital','Smart','Byte','Code','Logic','Nexus','Cipher','Sync'],s:['Systems','Tech','Labs','Software','Apps','Cloud','Connect']},
    food: {p:['Taste','Flavor','Savory','Fresh','Bite','Happy','Comfort','Family'],s:['Kitchen','Bites','Cuisine','Eats','Grill','Bakery','Flavors']},
    creative: {p:['Art','Design','Color','Vision','Frame','Canvas','Pixel','Creative'],s:['Studio','Designs','Co.','Agency','Lab','Works','Makers']},
    default: {p: prefixes, s: suffixes}
  };
  const m = mods[industry] || mods.default;
  const names = [];
  for (let i = 0; i < 10; i++) {
    const pre = m.p[Math.floor(Math.random()*m.p.length)];
    const suf = m.s[Math.floor(Math.random()*m.s.length)];
    names.push(pre + (Math.random()>0.5?' ':'') + suf);
  }
  const container = document.getElementById('names-output');
  container.innerHTML = names.map(function(n){ return '<div class="rounded-lg border border-border/50 bg-card/50 p-4"><p class="font-semibold">'+n+'</p></div>'; }).join('');
});
      `}} />
    </div>
  );
}
