import { NextRequest, NextResponse } from 'next/server';
import { searchAgents, seedAgents, getAgentLocations, getAgentServiceTypes } from '@/services/licensed-agents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const location = searchParams.get('location') || undefined;
    const seed = searchParams.get('seed');

    if (seed === 'true') {
      const count = await seedAgents();
      return NextResponse.json({ seeded: count });
    }

    if (searchParams.has('locations')) {
      return NextResponse.json({ locations: getAgentLocations() });
    }

    if (searchParams.has('services')) {
      return NextResponse.json({ services: getAgentServiceTypes() });
    }

    const agents = await searchAgents(search, location);
    return NextResponse.json({ agents, count: agents.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
