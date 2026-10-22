import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createSeedDatabase, defaultSettings } from '../data/seed';
import type { ActivityLog, CollectionKey, Collections, Database, SiteSettings } from '../types/models';
import { uid } from '../utils/format';

/**
 * Data layer. In this preview it persists to the browser; every method maps 1:1 to a
 * server action / Drizzle query in the production deployment (see docs/DEPLOYMENT.md).
 */
const STORAGE_KEY = 'tsc_db_v1';

type Item<K extends CollectionKey> = Collections[K][number];

interface StoreValue {
  db: Database;
  upsert: <K extends CollectionKey>(key: K, item: Item<K>, log?: string) => void;
  remove: <K extends CollectionKey>(key: K, ids: string[], log?: string) => void;
  updateSettings: (patch: Partial<SiteSettings>, log?: string) => void;
  logActivity: (action: string, entity: string, details: string) => void;
  incrementViews: (postId: string) => void;
  clearDemoContent: () => void;
  restoreDemoContent: () => void;
  setActor: (name: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadDb(): Database {
  if (typeof window === 'undefined') return createSeedDatabase();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Database;
      return { ...parsed, settings: { ...defaultSettings, ...parsed.settings } };
    }
  } catch {

    /* fall through to seed */}
  return createSeedDatabase();
}

export function StoreProvider({ children }: {children: React.ReactNode;}) {
  const [db, setDb] = useState<Database>(loadDb);
  const actorRef = useRef('System');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      toast.error('Browser storage is full. Remove unused media to free space.');
    }
  }, [db]);

  const makeLog = (action: string, entity: string, details: string): ActivityLog => ({
    id: uid(), action, entity, details, actor: actorRef.current, createdAt: new Date().toISOString()
  });

  const upsert = useCallback(<K extends CollectionKey,>(key: K, item: Item<K>, log?: string) => {
    setDb((prev) => {
      const list = prev[key] as unknown as Array<{id: string;}>;
      const target = item as unknown as {id: string;};
      const exists = list.some((i) => i.id === target.id);
      const next = exists ? list.map((i) => i.id === target.id ? target : i) : [target, ...list];
      const activity = log ? [makeLog(exists ? 'updated' : 'created', String(key), log), ...prev.activity].slice(0, 300) : prev.activity;
      return { ...prev, [key]: next, activity };
    });
  }, []);

  const remove = useCallback(<K extends CollectionKey,>(key: K, ids: string[], log?: string) => {
    setDb((prev) => {
      const list = prev[key] as unknown as Array<{id: string;}>;
      const activity = log ? [makeLog('deleted', String(key), log), ...prev.activity].slice(0, 300) : prev.activity;
      return { ...prev, [key]: list.filter((i) => !ids.includes(i.id)), activity };
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<SiteSettings>, log?: string) => {
    setDb((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
      activity: log ? [makeLog('updated', 'settings', log), ...prev.activity].slice(0, 300) : prev.activity
    }));
  }, []);

  const logActivity = useCallback((action: string, entity: string, details: string) => {
    setDb((prev) => ({ ...prev, activity: [makeLog(action, entity, details), ...prev.activity].slice(0, 300) }));
  }, []);

  const incrementViews = useCallback((postId: string) => {
    setDb((prev) => ({ ...prev, posts: prev.posts.map((p) => p.id === postId ? { ...p, views: p.views + 1 } : p) }));
  }, []);

  const clearDemoContent = useCallback(() => {
    setDb((prev) => {
      const keep = <T extends {demo?: boolean;},>(arr: T[]) => arr.filter((x) => !x.demo);
      return {
        ...prev,
        posts: keep(prev.posts), media: keep(prev.media), sources: keep(prev.sources), tags: keep(prev.tags),
        activity: [makeLog('deleted', 'demo', 'Removed demo seed content'), ...prev.activity]
      };
    });
  }, []);

  const restoreDemoContent = useCallback(() => {
    const seed = createSeedDatabase();
    setDb((prev) => {
      const merge = <T extends {id: string;},>(cur: T[], add: T[]) => [...cur, ...add.filter((a) => !cur.some((c) => c.id === a.id))];
      return {
        ...prev,
        posts: merge(prev.posts, seed.posts), media: merge(prev.media, seed.media), sources: merge(prev.sources, seed.sources),
        tags: merge(prev.tags, seed.tags), authors: merge(prev.authors, seed.authors), categories: merge(prev.categories, seed.categories),
        activity: [makeLog('created', 'demo', 'Restored demo seed content'), ...prev.activity]
      };
    });
  }, []);

  const setActor = useCallback((name: string) => {
    actorRef.current = name;
  }, []);

  const value = useMemo<StoreValue>(
    () => ({ db, upsert, remove, updateSettings, logActivity, incrementViews, clearDemoContent, restoreDemoContent, setActor }),
    [db, upsert, remove, updateSettings, logActivity, incrementViews, clearDemoContent, restoreDemoContent, setActor]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
