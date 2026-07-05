import { adminDb } from '@/lib/firebase/firebase-admin';

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

export async function geocodeLocation(destination: string): Promise<{ latitude: number; longitude: number; formattedAddress: string } | null> {
  if (!MAPS_API_KEY) return null;
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${MAPS_API_KEY}`);
    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.[0]) return null;
    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng, formattedAddress: data.results[0].formatted_address };
  } catch {
    return null;
  }
}

export interface StockCount {
  id: string;
  userId: string;
  itemName: string;
  quantity: number;
  unit: string;
  photoUrl?: string;
  countedAt: string;
  notes?: string;
}

export interface DeliveryCheckpoint {
  id: string;
  userId: string;
  destination: string;
  latitude: number;
  longitude: number;
  status: 'en_route' | 'arrived' | 'confirmed' | 'failed';
  photoUrl?: string;
  confirmedAt?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  employeeName: string;
  clockIn: string;
  clockOut?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  method: 'biometric' | 'gps' | 'manual';
}

export interface AssetRecord {
  id: string;
  userId: string;
  assetName: string;
  assetType: string;
  lastMaintenance: string;
  nextMaintenanceDue: string;
  status: 'operational' | 'maintenance' | 'broken' | 'decommissioned';
  utilizationRate?: number;
  notes?: string;
}

// --- Stock ---

export async function recordStockCount(
  userId: string, itemName: string, quantity: number, unit: string, photoUrl?: string, notes?: string,
): Promise<StockCount> {
  const record: StockCount = {
    id: `stk-${Date.now().toString(36)}`,
    userId, itemName, quantity, unit, photoUrl, notes,
    countedAt: new Date().toISOString(),
  };
  await adminDb.collection('operational_mirror').doc(userId).collection('stock').add(record);
  return record;
}

export async function getStockLevels(userId: string): Promise<StockCount[]> {
  const snap = await adminDb.collection('operational_mirror').doc(userId)
    .collection('stock').orderBy('countedAt', 'desc').limit(100).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as StockCount));
}

export async function getConsolidatedStock(userId: string): Promise<{ itemName: string; totalQuantity: number; unit: string; lastCounted: string }[]> {
  const stock = await getStockLevels(userId);
  const grouped = new Map<string, { total: number; unit: string; last: string }>();
  for (const s of stock) {
    const existing = grouped.get(s.itemName);
    if (existing) {
      existing.total = s.quantity;
      if (s.countedAt > existing.last) existing.last = s.countedAt;
    } else {
      grouped.set(s.itemName, { total: s.quantity, unit: s.unit, last: s.countedAt });
    }
  }
  return Array.from(grouped.entries()).map(([itemName, v]) => ({ itemName, totalQuantity: v.total, unit: v.unit, lastCounted: v.last }));
}

// --- Deliveries ---

export async function recordDeliveryCheckpoint(
  userId: string, destination: string, latitude: number, longitude: number, status: DeliveryCheckpoint['status'], photoUrl?: string,
): Promise<DeliveryCheckpoint> {
  const record: DeliveryCheckpoint = {
    id: `del-${Date.now().toString(36)}`,
    userId, destination, latitude, longitude, status, photoUrl,
    confirmedAt: status === 'confirmed' || status === 'arrived' ? new Date().toISOString() : undefined,
  };
  await adminDb.collection('operational_mirror').doc(userId).collection('deliveries').add(record);
  return record;
}

export async function getRecentDeliveries(userId: string, limit = 20): Promise<DeliveryCheckpoint[]> {
  const snap = await adminDb.collection('operational_mirror').doc(userId)
    .collection('deliveries').orderBy('confirmedAt', 'desc').limit(limit).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as DeliveryCheckpoint));
}

// --- Attendance ---

export async function clockIn(
  userId: string, employeeName: string, method: AttendanceRecord['method'], gpsLatitude?: number, gpsLongitude?: number,
): Promise<AttendanceRecord> {
  const existing = await adminDb.collection('operational_mirror').doc(userId)
    .collection('attendance').where('employeeName', '==', employeeName).where('clockOut', '==', null).limit(1).get();
  if (!existing.empty) {
    throw new Error(`${employeeName} is already clocked in — clock out first`);
  }

  const record: AttendanceRecord = {
    id: `att-${Date.now().toString(36)}`,
    userId, employeeName, method, gpsLatitude, gpsLongitude,
    clockIn: new Date().toISOString(),
  };
  await adminDb.collection('operational_mirror').doc(userId).collection('attendance').add(record);
  return record;
}

export async function clockOut(userId: string, employeeName: string): Promise<AttendanceRecord | null> {
  const snap = await adminDb.collection('operational_mirror').doc(userId)
    .collection('attendance').where('employeeName', '==', employeeName).where('clockOut', '==', null).limit(1).get();
  if (snap.empty) return null;

  const doc = snap.docs[0];
  const data = doc.data() as AttendanceRecord;
  const clockOutTime = new Date().toISOString();
  await doc.ref.update({ clockOut: clockOutTime });

  return { ...data, clockOut: clockOutTime };
}

export async function getTimesheet(userId: string, from?: string, to?: string): Promise<AttendanceRecord[]> {
  let query: FirebaseFirestore.Query = adminDb.collection('operational_mirror').doc(userId)
    .collection('attendance').orderBy('clockIn', 'desc').limit(100);
  if (from) query = query.where('clockIn', '>=', from);
  if (to) query = query.where('clockIn', '<=', to);
  const snap = await query.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));
}

// --- Assets ---

export async function recordAssetMaintenance(
  userId: string, assetName: string, assetType: string, status: AssetRecord['status'], nextMaintenanceDue: string, notes?: string,
): Promise<AssetRecord> {
  const record: AssetRecord = {
    id: `ast-${Date.now().toString(36)}`,
    userId, assetName, assetType, status, notes,
    lastMaintenance: new Date().toISOString(),
    nextMaintenanceDue,
  };
  await adminDb.collection('operational_mirror').doc(userId).collection('assets').add(record);
  return record;
}

export async function getAssetHealth(userId: string): Promise<AssetRecord[]> {
  const snap = await adminDb.collection('operational_mirror').doc(userId)
    .collection('assets').orderBy('nextMaintenanceDue', 'asc').get();
  return snap.docs.map(d => {
    const data = d.data() as AssetRecord;
    const dueDate = new Date(data.nextMaintenanceDue);
    if (data.status === 'operational' && dueDate < new Date()) {
      return { ...data, status: 'maintenance' as const };
    }
    return data;
  });
}

export async function getOperationalSummary(userId: string): Promise<{
  stockItems: number;
  activeDeliveries: number;
  employeesClockedIn: number;
  assetsInMaintenance: number;
}> {
  const stockCount = (await getConsolidatedStock(userId)).length;
  const deliveries = (await getRecentDeliveries(userId)).filter(d => d.status !== 'confirmed').length;
  const attendanceSnap = await adminDb.collection('operational_mirror').doc(userId)
    .collection('attendance').where('clockOut', '==', null).get();
  const assets = (await getAssetHealth(userId)).filter(a => a.status === 'maintenance' || a.status === 'broken').length;

  return {
    stockItems: stockCount,
    activeDeliveries: deliveries,
    employeesClockedIn: attendanceSnap.size,
    assetsInMaintenance: assets,
  };
}
