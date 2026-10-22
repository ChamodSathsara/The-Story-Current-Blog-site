import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStore } from '../contexts/StoreContext';
import type { Post, PostSeo, PostStatus } from '../types/models';
import { readingTime, slugify, uid } from '../utils/format';
import { firstErrors, publishSchema } from '../utils/validation';

const AUTOSAVE_MS = 20000;

export function blankPost(authorId: string | null): Post {
  const now = new Date().toISOString();
  return {
    id: '', title: '', slug: '', subtitle: '', excerpt: '', content: '', categoryId: null, authorId, featuredImageId: null,
    tagIds: [], sources: [], status: 'draft', isFeatured: false, isBreaking: false, isTrending: false,
    seo: { seoTitle: '', metaDescription: '', focusKeyword: '', secondaryKeywords: '', canonicalUrl: '', ogTitle: '', ogDescription: '', ogImageId: null, noindex: false },
    readingTime: 1, publishedAt: null, scheduledAt: null, createdAt: now, updatedAt: now, views: 0
  };
}

export function usePostEditor(postId?: string) {
  const { db, upsert } = useStore();
  const navigate = useNavigate();
  const existing = postId ? db.posts.find((p) => p.id === postId) : undefined;
  const defaultAuthor = db.authors.find((a) => a.active && a.isOrganization)?.id ?? db.authors.find((a) => a.active)?.id ?? null;

  const [post, setPost] = useState<Post>(() => existing ?? blankPost(defaultAuthor));
  const [snapshot, setSnapshot] = useState(() => JSON.stringify(existing ?? blankPost(defaultAuthor)));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<string | null>(existing ? existing.updatedAt : null);
  const [autoSaving, setAutoSaving] = useState(false);
  const slugTouched = useRef(!!existing);
  const dirty = JSON.stringify(post) !== snapshot;

  const update = useCallback((patch: Partial<Post>) => {
    setPost((p) => {
      const next = { ...p, ...patch };
      if (patch.title !== undefined && !slugTouched.current) next.slug = slugify(patch.title);
      return next;
    });
  }, []);

  const updateSeo = useCallback((patch: Partial<PostSeo>) => setPost((p) => ({ ...p, seo: { ...p.seo, ...patch } })), []);

  const setSlug = (v: string) => {
    slugTouched.current = true;
    update({ slug: slugify(v) });
  };

  const slugTaken = (slug: string, id: string) => db.posts.some((p) => p.slug === slug && p.id !== id);

  const persist = useCallback((next: Post, logMsg?: string, silent = false) => {
    const now = new Date().toISOString();
    const isNew = !next.id;
    const item: Post = { ...next, id: next.id || uid(), readingTime: readingTime(next.content), updatedAt: now, createdAt: next.createdAt || now };
    upsert('posts', item, logMsg);
    setPost(item);
    setSnapshot(JSON.stringify(item));
    setLastSaved(now);
    if (!silent && logMsg) toast.success(logMsg.split(' "')[0]);
    if (isNew) navigate(`/admin/posts/${item.id}`, { replace: true });
    return item;
  }, [upsert, navigate]);

  const saveDraft = () => {
    if (post.title.trim().length < 3) return setErrors({ title: 'Add a headline before saving' });
    const slug = post.slug || slugify(post.title);
    if (slugTaken(slug, post.id)) return setErrors({ slug: 'Another article already uses this slug' });
    setErrors({});
    persist({ ...post, slug }, `Saved "${post.title}"`);
  };

  const validateForPublish = (): boolean => {
    const parsed = publishSchema.safeParse({ ...post, canonicalUrl: post.seo.canonicalUrl });
    const errs = parsed.success ? {} : firstErrors(parsed.error);
    if (slugTaken(post.slug, post.id)) errs.slug = 'Another article already uses this slug';
    const img = db.media.find((m) => m.id === post.featuredImageId);
    if (img && !img.alt.trim()) errs.featuredImageAlt = 'Featured image needs alt text';
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error(`Fix ${Object.keys(errs).length} issue(s) before publishing`);
      return false;
    }
    return true;
  };

  const publish = () => {
    if (!validateForPublish()) return;
    const now = new Date().toISOString();
    const publishedAt = post.status === 'published' && post.publishedAt ? post.publishedAt : post.publishedAt && new Date(post.publishedAt) <= new Date() ? post.publishedAt : now;
    persist({ ...post, status: 'published', publishedAt, scheduledAt: null }, `Published "${post.title}"`);
  };

  const schedule = () => {
    if (!post.scheduledAt || new Date(post.scheduledAt) <= new Date()) return setErrors({ scheduledAt: 'Choose a future date and time' });
    if (!validateForPublish()) return;
    persist({ ...post, status: 'scheduled', publishedAt: post.scheduledAt }, `Scheduled "${post.title}"`);
  };

  const setStatus = (status: PostStatus, label: string) => {
    if (!post.id) return;
    persist({ ...post, status }, `${label} "${post.title}"`);
  };

  // Autosave drafts
  const latest = useRef({ post, dirty, persist });
  latest.current = { post, dirty, persist };
  useEffect(() => {
    const t = window.setInterval(() => {
      const { post: p, dirty: d, persist: save } = latest.current;
      if (!d || p.status !== 'draft' || p.title.trim().length < 3 || !p.id) return;
      setAutoSaving(true);
      save({ ...p, slug: p.slug || slugify(p.title) }, undefined, true);
      window.setTimeout(() => setAutoSaving(false), 600);
    }, AUTOSAVE_MS);
    return () => window.clearInterval(t);
  }, []);

  // Unsaved-change warning
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  return { post, exists: !!existing || !!post.id, notFound: !!postId && !existing && !post.id, update, updateSeo, setSlug, errors, dirty, lastSaved, autoSaving, saveDraft, publish, schedule, setStatus };
}