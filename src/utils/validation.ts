import { z } from 'zod';

const slug = z.
string().
min(1, 'Slug is required').
max(90).
regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only');

const optionalUrl = z.union([z.literal(''), z.string().url('Enter a valid URL (https://…)')]);

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.string().trim().email('Enter a valid email address').max(200),
  subject: z.string().trim().min(3, 'Subject is too short').max(150),
  message: z.string().trim().min(20, 'Message should be at least 20 characters').max(5000)
});

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(200),
  name: z.string().trim().max(100).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please confirm you agree to receive emails' }) })
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required')
});

export const setupSchema = z.
object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.
  string().
  min(12, 'Use at least 12 characters').
  regex(/[A-Z]/, 'Include an uppercase letter').
  regex(/[a-z]/, 'Include a lowercase letter').
  regex(/[0-9]/, 'Include a number'),
  confirm: z.string()
}).
refine((v) => v.password === v.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(60),
  slug,
  description: z.string().max(300),
  seoTitle: z.string().max(70, 'Keep SEO title under 70 characters'),
  metaDescription: z.string().max(170, 'Keep meta description under 170 characters')
});

export const authorSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100),
  displayName: z.string().trim().min(2, 'Display name is required').max(100),
  slug,
  bio: z.string().max(1200),
  role: z.string().max(100),
  email: z.union([z.literal(''), z.string().email('Enter a valid email')]),
  website: optionalUrl
});

export const sourceSchema = z.object({
  name: z.string().trim().min(2, 'Source name is required').max(150),
  url: z.string().url('Enter a valid source URL (https://…)'),
  publisher: z.string().max(150)
});

export const publishSchema = z.object({
  title: z.string().trim().min(10, 'Headline should be at least 10 characters').max(150),
  slug,
  excerpt: z.string().trim().min(40, 'Excerpt should be at least 40 characters').max(320),
  content: z.string().refine((v) => v.replace(/<[^>]*>/g, '').trim().length >= 200, 'Article body should be at least 200 characters'),
  categoryId: z.string({ required_error: 'Choose a category' }).min(1, 'Choose a category'),
  authorId: z.string({ required_error: 'Choose an author' }).min(1, 'Choose an author'),
  featuredImageId: z.string({ required_error: 'Add a featured image' }).min(1, 'Add a featured image'),
  canonicalUrl: optionalUrl
});

export function firstErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}