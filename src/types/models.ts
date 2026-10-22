export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export type SourceType =
'original' |
'official' |
'government' |
'news' |
'research' |
'press_release' |
'other';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  order: number;
  enabled: boolean;
  seoTitle: string;
  metaDescription: string;
  demo?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  demo?: boolean;
}

export interface AuthorSocials {
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
}

export interface Author {
  id: string;
  fullName: string;
  displayName: string;
  slug: string;
  avatarUrl: string;
  bio: string;
  role: string;
  email: string;
  showEmail: boolean;
  website: string;
  socials: AuthorSocials;
  active: boolean;
  isOrganization: boolean;
  demo?: boolean;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  publisher: string;
  publishedDate: string;
  type: SourceType;
  note: string;
  demo?: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  alt: string;
  caption: string;
  credit: string;
  license: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
  demo?: boolean;
}

export interface PostSource {
  sourceId: string;
  note: string;
}

export interface PostSeo {
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageId: string | null;
  noindex: boolean;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  categoryId: string | null;
  authorId: string | null;
  featuredImageId: string | null;
  tagIds: string[];
  sources: PostSource[];
  status: PostStatus;
  isFeatured: boolean;
  isBreaking: boolean;
  isTrending: boolean;
  seo: PostSeo;
  readingTime: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  views: number;
  demo?: boolean;
}

export type MessageStatus = 'unread' | 'read' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed';

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: SubscriberStatus;
  consent: boolean;
  consentAt: string;
  consentText: string;
  signupSource: string;
  verifiedAt: string | null;
  unsubscribeToken: string;
  createdAt: string;
  unsubscribedAt: string | null;
}

export interface AdSlots {
  homeTop: string;
  homeBetween: string;
  articleTop: string;
  articleInline: string;
  sidebar: string;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  contactEmail: string;
  footerText: string;
  defaultSeoTitle: string;
  defaultMetaDescription: string;
  defaultOgImageUrl: string;
  ga4Id: string;
  gscVerification: string;
  adsenseEnabled: boolean;
  adsenseClientId: string;
  adSlots: AdSlots;
  showAdPlaceholders: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  details: string;
  actor: string;
  createdAt: string;
}

export interface Database {
  version: number;
  adminUsers: AdminUser[];
  authors: Author[];
  categories: Category[];
  tags: Tag[];
  posts: Post[];
  sources: Source[];
  media: MediaItem[];
  messages: ContactMessage[];
  subscribers: Subscriber[];
  settings: SiteSettings;
  activity: ActivityLog[];
}

export type Collections = Omit<Database, 'version' | 'settings' | 'activity'>;
export type CollectionKey = keyof Collections;