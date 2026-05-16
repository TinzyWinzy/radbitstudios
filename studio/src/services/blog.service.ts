import { db } from '@/lib/firebase/firebase';
import {
  collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, Timestamp, serverTimestamp,
} from 'firebase/firestore';

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
  authorName: string;
  imageUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const COLLECTION = 'blog_posts';

class BlogService {
  async create(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...post,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async update(id: string, post: Partial<Omit<BlogPost, 'id' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      ...post,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async getById(id: string): Promise<BlogPost | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as BlogPost;
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const q = query(collection(db, COLLECTION), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as BlogPost;
  }

  async listAll(): Promise<BlogPost[]> {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
  }

  async listPublished(): Promise<BlogPost[]> {
    const q = query(
      collection(db, COLLECTION),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
  }
}

export const blogService = new BlogService();
