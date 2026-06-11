import { db } from '@/lib/firebase/firebase';
import {
  collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, Timestamp, serverTimestamp,
} from 'firebase/firestore';

export interface SeoProblem {
  title: string;
  description: string;
}

export interface SeoSolution {
  title: string;
  description: string;
}

export interface SeoStep {
  title: string;
  description: string;
}

export interface SeoPage {
  id?: string;
  type: 'industry' | 'usecase';
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  problems: SeoProblem[];
  solutions: SeoSolution[];
  features: string[];
  steps: SeoStep[];
  benefits: string[];
  cta: string;
  keywords: string[];
  published: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COLLECTION = 'seo_pages';

class SeoPageService {
  async create(page: Omit<SeoPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...page,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, page: Partial<Omit<SeoPage, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      ...page,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async getById(id: string): Promise<SeoPage | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as SeoPage;
  }

  async getBySlug(slug: string): Promise<SeoPage | null> {
    const q = query(collection(db, COLLECTION), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as SeoPage;
  }

  async listAll(): Promise<SeoPage[]> {
    const q = query(collection(db, COLLECTION), orderBy('slug', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SeoPage));
  }
}

export const seoPageService = new SeoPageService();
