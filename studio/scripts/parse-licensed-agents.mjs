import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseAgents(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('Validit') && !l.startsWith('y Year') && !l.startsWith('Agent BP') && !l.startsWith('number Name') && !l.startsWith('F64') && !l.startsWith('Number Physical') && !l.startsWith('Contact') && !l.startsWith('Number') && !l.startsWith('license fee') && !l.startsWith('receipt') && l !== 'F' && !l.startsWith('---'));

  const agents = [];
  let current = [];

  for (const line of lines) {
    if (/^2026\s+\d{6,15}/.test(line) || /^2026\s+\d{2}\d{6,}/.test(line)) {
      if (current.length > 0) {
        const parsed = parseSingleRecord(current.join(' ').replace(/\s+/g, ' '));
        if (parsed) agents.push(parsed);
      }
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    const parsed = parseSingleRecord(current.join(' ').replace(/\s+/g, ' '));
    if (parsed) agents.push(parsed);
  }

  return agents;
}

function parseSingleRecord(record) {
  try {
    const match = record.match(/^2026\s+(\d{6,20})\s+(.+)$/);
    if (!match) return null;

    const bpNumber = match[1];
    let rest = match[2];

    const f64Match = rest.match(/\b(R\d{1,4}|RR\d{1,4}|manual)\b/i);
    if (!f64Match) return null;

    const f64Number = f64Match[1].toUpperCase();
    const nameEnd = f64Match.index;
    const name = rest.slice(0, nameEnd).trim();

    let afterF64 = rest.slice(nameEnd + f64Match[0].length).trim();

    const emailMatch = afterF64.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (!emailMatch) return null;

    const email = emailMatch[1].toLowerCase();
    const addressEnd = emailMatch.index;
    let address = afterF64.slice(0, addressEnd).trim();
    let afterEmail = afterF64.slice(emailMatch.index + emailMatch[0].length).trim();

    address = address.replace(/\s+/g, ' ').trim();
    address = address.replace(/,\s*$/, '');

    const phoneMatch = afterEmail.match(/([\d]{6,15})/);
    let contactNumber = '';
    let receiptNumber = '';

    if (phoneMatch) {
      contactNumber = phoneMatch[1];
      const afterPhone = afterEmail.slice(phoneMatch.index + phoneMatch[0].length).trim();
      const receiptMatch = afterPhone.match(/(R\d{3,20})/);
      if (receiptMatch) {
        receiptNumber = receiptMatch[1];
      }
    }

    const location = inferLocation(address, name);

    return {
      bpNumber,
      name: name.replace(/\s+/g, ' ').trim(),
      f64Number,
      physicalAddress: address,
      email,
      contactNumber,
      licenseFeeReceipt: receiptNumber || undefined,
      location,
      services: inferServices(name, f64Number, address),
    };
  } catch {
    return null;
  }
}

function inferLocation(address, name) {
  const addr = (address + ' ' + name).toLowerCase();
  if (addr.includes('beitbridge') || addr.includes('beit')) return 'Beitbridge';
  if (addr.includes('harare') || addr.includes('hatfield') || addr.includes('southerton') || addr.includes('waterfalls') || addr.includes('eastlea') || addr.includes('belvedere') || addr.includes('msasa') || addr.includes('graniteside') || addr.includes('westgate') || addr.includes('chisipite') || addr.includes('greendale') || addr.includes('milton park') || addr.includes('avondale') || addr.includes('borrowdale') || addr.includes('belgravia') || addr.includes('mount pleasant') || addr.includes('gunhill') || addr.includes('marlborough') || addr.includes('newlands') || addr.includes('eastlea') || addr.includes('greendale') || addr.includes('highlands') || addr.includes('meyrick') || addr.includes('ridge') || addr.includes('ruwa') || addr.includes('tz') || addr.includes('belvedere') || addr.includes('hatfield') || addr.includes('workington') || addr.includes('robert mugabe') || addr.includes('nelson mandela') || addr.includes('herbert chitepo') || addr.includes('kwame nkrumah') || addr.includes('jason moyo') || addr.includes('samora') || addr.includes('speke') || addr.includes('selous') || addr.includes('angwa') || addr.includes('city') || addr.includes('airport')) return 'Harare';
  if (addr.includes('mutare') || addr.includes('dangamvura')) return 'Mutare';
  if (addr.includes('bulawayo') || addr.includes('belmont') || addr.includes('byo')) return 'Bulawayo';
  if (addr.includes('karoi')) return 'Karoi';
  if (addr.includes('norton')) return 'Norton';
  if (addr.includes('chirundu')) return 'Chirundu';
  if (addr.includes('plumtree')) return 'Plumtree';
  if (addr.includes('victoria falls') || addr.includes('chinotimba') || addr.includes('mkhosana')) return 'Victoria Falls';
  if (addr.includes('chiredzi')) return 'Chiredzi';
  if (addr.includes('chitungwiza') || addr.includes('zengeza')) return 'Chitungwiza';
  if (addr.includes('gweru')) return 'Gweru';
  if (addr.includes('kwekwe')) return 'Kwekwe';
  if (addr.includes('masvingo')) return 'Masvingo';
  if (addr.includes('nyamapanda')) return 'Nyamapanda';
  if (addr.includes('kadoma')) return 'Kadoma';
  return 'Other';
}

function inferServices(name, f64Number, address) {
  const combined = (name + ' ' + address).toLowerCase();
  const services = [];
  if (combined.includes('clearing') || combined.includes('clear') || combined.includes('customs')) services.push('clearing');
  if (combined.includes('freight') || combined.includes('cargo') || combined.includes('shipping') || combined.includes('logistic') || combined.includes('transport') || combined.includes('haul')) services.push('freight');
  if (combined.includes('forward') || combined.includes('export') || combined.includes('import')) services.push('international');
  if (combined.includes('investment')) services.push('investment');
  if (combined.includes('trading') || combined.includes('supplier') || combined.includes('enterprise') || combined.includes('trading')) services.push('trading');
  if (combined.includes('consult') || combined.includes('advisory') || combined.includes('fiscal') || combined.includes('tax')) services.push('consulting');
  if (services.length === 0) services.push('clearing');
  return services;
}

const text = readFileSync(resolve(__dirname, '../../database/Lcensed agents for 2026__extract.txt'), 'utf-8');
const agents = parseAgents(text);

const output = {
  metadata: {
    total: agents.length,
    generatedAt: new Date().toISOString(),
    source: 'ZIMRA Licensed Agents 2026',
  },
  agents: agents.filter(a => a.bpNumber.length >= 6),
};

writeFileSync(
  resolve(__dirname, '../src/services/agents-data.json'),
  JSON.stringify(output, null, 2),
  'utf-8'
);

console.log(`Parsed ${output.agents.length} agents`);
const locCounts = {};
output.agents.forEach(a => {
  locCounts[a.location] = (locCounts[a.location] || 0) + 1;
});
Object.entries(locCounts).sort((a, b) => b[1] - a[1]).forEach(([loc, count]) => {
  console.log(`  ${loc}: ${count}`);
});
