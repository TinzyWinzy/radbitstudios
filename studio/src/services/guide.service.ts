import { db } from '@/lib/firebase/firebase';
import {
  collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, Timestamp, serverTimestamp,
} from 'firebase/firestore';

export interface GuideStep {
  icon: string;
  title: string;
  body: string;
}

export interface GuideFaqItem {
  q: string;
  a: string;
}

export interface Guide {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  icon: string;
  readTime: string;
  category: string;
  steps: GuideStep[];
  tips: string[];
  faq: GuideFaqItem[];
  content: Record<string, unknown> | null;
  published: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COLLECTION = 'guides';

class GuideService {
  async create(guide: Omit<Guide, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...guide,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, guide: Partial<Omit<Guide, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      ...guide,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async getById(id: string): Promise<Guide | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Guide;
  }

  async getBySlug(slug: string): Promise<Guide | null> {
    const q = query(collection(db, COLLECTION), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Guide;
  }

  async listAll(): Promise<Guide[]> {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Guide));
  }

  async listPublished(): Promise<Guide[]> {
    const q = query(
      collection(db, COLLECTION),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Guide));
  }
}

export const guideService = new GuideService();
