import { db } from '@/lib/firebase/firebase';
import {
  collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc,
  query, orderBy, Timestamp, serverTimestamp,
} from 'firebase/firestore';

export interface FaqItem {
  id?: string;
  category: string;
  question: string;
  answer: string;
  link?: string;
  linkText?: string;
  order: number;
  published: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COLLECTION = 'faq_items';

class FaqService {
  async create(item: Omit<FaqItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, item: Partial<Omit<FaqItem, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      ...item,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async getById(id: string): Promise<FaqItem | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as FaqItem;
  }

  async listAll(): Promise<FaqItem[]> {
    const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FaqItem));
  }

  async listPublished(): Promise<FaqItem[]> {
    const q = query(
      collection(db, COLLECTION),
      orderBy('order', 'asc'),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as FaqItem))
      .filter(i => i.published);
  }
}

export const faqService = new FaqService();
