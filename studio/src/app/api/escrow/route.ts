import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { createEscrow, confirmEscrow, verifyMilestone, getEscrowStatus, listEscrowsForUser } from '@/services/escrow-engine';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const escrowId = request.nextUrl.searchParams.get('id');
    if (escrowId) {
      const escrow = await getEscrowStatus(escrowId);
      if (!escrow) return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
      return NextResponse.json({ escrow });
    }

    const escrows = await listEscrowsForUser(verified.uid);
    return NextResponse.json({ count: escrows.length, escrows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const verified = await verifyIdToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { smeUserId, smeName, totalAmountUsd, milestones } = body;
      if (!smeUserId || !smeName || !totalAmountUsd || !milestones) {
        return NextResponse.json({ error: 'smeUserId, smeName, totalAmountUsd, and milestones required' }, { status: 400 });
      }
      const investorDoc = await adminDb?.collection('diaspora_investors')?.doc(verified.uid)?.get();
      const investorName = investorDoc?.data()?.countryOfResidence || 'Diaspora Investor';
      const escrow = await createEscrow(verified.uid, investorName, smeUserId, smeName, totalAmountUsd, milestones);
      return NextResponse.json({ success: true, escrow }, { status: 201 });
    }

    if (action === 'confirm') {
      const { escrowId } = body;
      if (!escrowId) return NextResponse.json({ error: 'escrowId required' }, { status: 400 });
      const escrow = await confirmEscrow(escrowId, verified.uid);
      if (!escrow) return NextResponse.json({ error: 'Escrow not found or cannot be confirmed' }, { status: 400 });
      return NextResponse.json({ success: true, escrow });
    }

    if (action === 'verify_milestone') {
      const { escrowId, milestoneId, status, evidenceUrl } = body;
      if (!escrowId || !milestoneId || !status) {
        return NextResponse.json({ error: 'escrowId, milestoneId, and status required' }, { status: 400 });
      }
      if (!['verified', 'failed'].includes(status)) {
        return NextResponse.json({ error: 'status must be verified or failed' }, { status: 400 });
      }
      const escrow = await verifyMilestone(escrowId, milestoneId, verified.uid, status, evidenceUrl);
      if (!escrow) return NextResponse.json({ error: 'Milestone verification failed' }, { status: 400 });
      return NextResponse.json({ success: true, escrow });
    }

    return NextResponse.json({ error: 'Invalid action. Use create, confirm, or verify_milestone.' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
