'use client';

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminLayout } from './components/admin/AdminLayout';
import { PublicLayout } from './components/public/PublicLayout';
import { Toaster } from './components/ui/Sonner';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { Account } from './pages/admin/Account';
import { Analytics } from './pages/admin/Analytics';
import { Authors } from './pages/admin/Authors';
import { Categories } from './pages/admin/Categories';
import { Dashboard } from './pages/admin/Dashboard';
import { Inbox } from './pages/admin/Inbox';
import { Login } from './pages/admin/Login';
import { Media } from './pages/admin/Media';
import { PostEditor } from './pages/admin/PostEditor';
import { Posts } from './pages/admin/Posts';
import { SeoSettings } from './pages/admin/SeoSettings';
import { Settings } from './pages/admin/Settings';
import { Sources } from './pages/admin/Sources';
import { Subscribers } from './pages/admin/Subscribers';
import { Tags } from './pages/admin/Tags';
import { Article } from './pages/public/Article';
import { Author } from './pages/public/Author';
import { Category } from './pages/public/Category';
import { Contact } from './pages/public/Contact';
import { Home } from './pages/public/Home';
import { Newsletter } from './pages/public/Newsletter';
import { NotFound } from './pages/public/NotFound';
import { Search } from './pages/public/Search';
import { StaticPage } from './pages/public/StaticPage';
import { Tag } from './pages/public/Tag';
import { Unsubscribe } from './pages/public/Unsubscribe';

const STATIC_PAGES = ['about', 'privacy-policy', 'terms-and-conditions', 'editorial-policy', 'corrections-policy'];

export function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="article/:slug" element={<Article />} />
                <Route path="category/:slug" element={<Category />} />
                <Route path="tag/:slug" element={<Tag />} />
                <Route path="author/:slug" element={<Author />} />
                <Route path="search" element={<Search />} />
                <Route path="contact" element={<Contact />} />
                <Route path="newsletter" element={<Newsletter />} />
                <Route path="unsubscribe" element={<Unsubscribe />} />
                {STATIC_PAGES.map((slug) => <Route key={slug} path={slug} element={<StaticPage slug={slug} />} />)}
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="admin/login" element={<Login />} />
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="posts" element={<Posts />} />
                <Route path="posts/new" element={<PostEditor />} />
                <Route path="posts/:id" element={<PostEditor />} />
                <Route path="categories" element={<Categories />} />
                <Route path="tags" element={<Tags />} />
                <Route path="authors" element={<Authors />} />
                <Route path="sources" element={<Sources />} />
                <Route path="media" element={<Media />} />
                <Route path="inbox" element={<Inbox />} />
                <Route path="subscribers" element={<Subscribers />} />
                <Route path="seo" element={<SeoSettings />} />
                <Route path="settings" element={<Settings />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="account" element={<Account />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </StoreProvider>
    </ErrorBoundary>);

}
