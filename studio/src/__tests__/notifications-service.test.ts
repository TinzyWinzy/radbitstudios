import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createNotification, markAsRead, markAllAsRead } from '@/services/notifications/notifications-service';
import { addDoc, doc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';

vi.mock('firebase/firestore', () => {
  const mockDoc = vi.fn((_db: any, _col: string, id?: string) => ({ type: 'doc', id }));
  const mockCollection = vi.fn((_db: any, name: string) => ({ type: 'collection', name }));
  const mockAddDoc = vi.fn().mockResolvedValue({ id: 'notif-1' });
  const mockUpdateDoc = vi.fn().mockResolvedValue(undefined);

  const mockBatch = {
    update: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  };
  const mockWriteBatch = vi.fn(() => mockBatch);

  const mockQuery = vi.fn((..._args: any[]) => ({ type: 'query' }));
  const mockWhere = vi.fn((..._args: any[]) => ({ type: 'where' }));
  const mockOrderBy = vi.fn((..._args: any[]) => ({ type: 'orderBy' }));
  const mockLimit = vi.fn((n: number) => ({ type: 'limit', n }));
  const mockGetDocs = vi.fn().mockResolvedValue({
    empty: false,
    docs: [
      { id: 'n1', data: () => ({ userId: 'u1', read: false, title: 'Test', body: 'Body', type: 'system', createdAt: { toDate: () => new Date() } }) },
      { id: 'n2', data: () => ({ userId: 'u1', read: true, title: 'Old', body: 'Done', type: 'system', createdAt: { toDate: () => new Date() } }) },
    ],
    forEach: (cb: (doc: { id: string; ref: string }) => void) => {
      [{ id: 'n1', ref: 'ref/n1' }, { id: 'n2', ref: 'ref/n2' }].forEach(cb);
    },
  });

  const mockServerTimestamp = vi.fn(() => ({ type: 'serverTimestamp' }));

  return {
    doc: mockDoc,
    collection: mockCollection,
    addDoc: mockAddDoc,
    updateDoc: mockUpdateDoc,
    writeBatch: mockWriteBatch,
    getDocs: mockGetDocs,
    query: mockQuery,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    serverTimestamp: mockServerTimestamp,
    type: {
      Timestamp: class {
        toDate() { return new Date(); }
      },
    },
  };
});

describe('Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('creates a notification with correct fields', async () => {
      const data = {
        userId: 'user-1',
        title: 'Assessment Complete',
        body: 'Your results are ready.',
        type: 'assessment' as const,
        read: false,
        link: '/dashboard',
      };

      await createNotification(data);

      expect(addDoc).toHaveBeenCalledOnce();
      const args = vi.mocked(addDoc).mock.calls[0];
      expect(args[0]).toEqual({ type: 'collection', name: 'notifications' });
      expect(args[1]).toMatchObject({
        userId: 'user-1',
        title: 'Assessment Complete',
        body: 'Your results are ready.',
        type: 'assessment',
        read: false,
        link: '/dashboard',
      });
      expect((args[1] as any).createdAt).toEqual({ type: 'serverTimestamp' });
    });

    it('creates notification without optional link', async () => {
      await createNotification({
        userId: 'user-2',
        title: 'Insights Ready',
        body: 'New tips available',
        type: 'insights',
        read: false,
      });

      const args = vi.mocked(addDoc).mock.calls[0];
      expect((args[1] as any).link).toBeUndefined();
    });
  });

  describe('markAsRead', () => {
    it('updates notification read status to true', async () => {
      await markAsRead('notif-1');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'notifications', 'notif-1');
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { read: true });
    });
  });

  describe('markAllAsRead', () => {
    it('uses writeBatch to mark all unread as read', async () => {
      await markAllAsRead('user-1');

      expect(writeBatch).toHaveBeenCalledOnce();
      expect(getDocs).toHaveBeenCalledOnce();
    });

    it('does nothing when no unread notifications exist', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        empty: true,
        docs: [],
        forEach: (_cb: any) => {},
      } as any);

      await markAllAsRead('user-empty');

      expect(writeBatch).not.toHaveBeenCalled();
    });
  });
});
