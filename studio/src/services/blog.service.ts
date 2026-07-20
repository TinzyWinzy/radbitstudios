import { db } from '@/lib/firebase/firebase';
import {
  collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, Timestamp, serverTimestamp, arrayUnion,
} from 'firebase/firestore';
import type { ArticleCategory, ContentClusterSlug } from '@/data/content-clusters';

export type EditorialStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published';
export type ReviewGates = { factualClaimsChecked: boolean; firsthandContextAdded: boolean; proofBoundariesChecked: boolean; internalLinksChecked: boolean };
export type PublicationAuditEntry = { action: string; actor: string; at: string; fromStatus?: EditorialStatus; toStatus?: EditorialStatus };

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string | Record<string, unknown> | null;
  tags: string[];
  published: boolean;
  status?: EditorialStatus;
  category?: ArticleCategory;
  cluster?: ContentClusterSlug;
  pillarSlug?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  scheduledAt?: Timestamp | null;
  publishedAt?: Timestamp;
  readingMinutes?: number;
  relatedSlugs?: string[];
  serviceLinks?: string[];
  industryLinks?: string[];
  faq?: Array<{ question: string; answer: string }>;
  reviewGates?: ReviewGates;
  publicationAudit?: PublicationAuditEntry[];
  authorName: string;
  authorBio?: string;
  imageUrl?: string;
  editorial?: {
    metaDescription: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    searchIntent: string;
    readerLevel: string;
    schemaRecommendations: string[];
    internalLinks: Array<{ topic: string; reason: string }>;
    authoritativeSources: Array<{ name: string; url: string; purpose: string }>;
    contentGraph: Record<string, string[]>;
    reviewNotes: string[];
  };
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
    const current = await getDoc(doc(db, COLLECTION, id));
    const previousStatus = current.exists() ? (current.data().status as EditorialStatus | undefined) : undefined;
    const nextStatus = post.status;
    await updateDoc(doc(db, COLLECTION, id), {
      ...post,
      updatedAt: serverTimestamp(),
      ...(nextStatus && nextStatus !== previousStatus ? {
        publicationAudit: arrayUnion({ action: 'status_changed', actor: post.authorName || 'Radbit editor', at: new Date().toISOString(), fromStatus: previousStatus || 'draft', toStatus: nextStatus }),
      } : {}),
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
