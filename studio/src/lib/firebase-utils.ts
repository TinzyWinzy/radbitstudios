import { Timestamp } from 'firebase-admin/firestore';

/**
 * Safely convert a Firestore Timestamp to a JavaScript Date.
 * Returns null if the input is null/undefined.
 */
export function toDateSafe(timestamp: Timestamp | undefined | null): Date | null {
  if (!timestamp) return null;
  try {
    return timestamp.toDate();
  } catch {
    return null;
  }
}
