import React, { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, ImagePlus } from 'lucide-react';
import { FormField } from '../../components/admin/FormField';
import { MediaPicker } from '../../components/admin/MediaPicker';
import { PageHeader, Panel } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/CSwitch';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { useStore } from '../../contexts/StoreContext';
import type { AdSlots, SiteSettings } from '../../types/models';

const slotLabels: Record<keyof AdSlots, string> = {
  homeTop: 'Homepage — below featured', homeBetween: 'Between sections', articleTop: 'Article — below image', articleInline: 'Article — in content', sidebar: 'Desktop sidebar'
};

export function Settings() {
  const { db, updateSettings, clearDemoContent, restoreDemoContent } = useStore();
  const [f, setF] = useState<SiteSettings>(db.settings);
  const [picker, setPicker] = useState<'logoUrl' | 'faviconUrl' | null>(null);
  const set = <K extends keyof SiteSettings,>(k: K, v: SiteSettings[K]) => setF((p) => ({ ...p, [k]: v }));
  const demoCount = db.posts.filter((p) => p.demo).length;

  const save = () => {
    if (f.ga4Id && !/^G-[A-Z0-9]+$/.test(f.ga4Id)) return toast.error('GA4 Measurement ID should look like G-XXXXXXXXXX');
    if (f.adsenseClientId && !/^ca-pub-\d+$/.test(f.adsenseClientId)) return toast.error('AdSense publisher ID should look like ca-pub-1234567890');
    if (f.adsenseEnabled && !f.adsenseClientId) return toast.error('Add your AdSense publisher ID before enabling ads');
    updateSettings(f, 'Updated website settings');
    toast.success('Settings saved');
  };

  const text = (k: keyof SiteSettings, label: string, hint?: string) =>
  <FormField label={label} htmlFor={`set-${k}`} hint={hint}>
      <Input id={`set-${k}`} value={String(f[k] ?? '')} onChange={(e) => set(k, e.target.value as never)} />
    </FormField>;


  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Website Settings" description="Branding, social links, analytics and advertising." actions={<Button onClick={save}>Save all settings</Button>} />
      <div className="space-y-6">
        <Panel title="Branding">
          <div className="grid gap-6 md:grid-cols-2">
            {text('siteName', 'Website name')}
            {text('contactEmail', 'Contact email')}
            <FormField label="Website description" htmlFor="set-desc" className="md:col-span-2"><Textarea id="set-desc" rows={2} value={f.description} onChange={(e) => set('description', e.target.value)} /></FormField>
            {(['logoUrl', 'faviconUrl'] as const).map((k) =>
            <div key={k} className="flex items-center gap-4">
                <img src={f[k]} alt="" className="h-16 w-16 rounded-md border border-border object-cover" />
                <div>
                  <p className="text-sm font-medium">{k === 'logoUrl' ? 'Logo' : 'Favicon'}</p>
                  <Button variant="outline" size="sm" className="mt-1" onClick={() => setPicker(k)}><ImagePlus className="h-4 w-4" /> Change</Button>
                </div>
              </div>
            )}
            <FormField label="Footer text" htmlFor="set-foot" className="md:col-span-2"><Textarea id="set-foot" rows={2} value={f.footerText} onChange={(e) => set('footerText', e.target.value)} /></FormField>
          </div>
        </Panel>

        <Panel title="Social media">
          <div className="grid gap-4 md:grid-cols-2">
            {text('facebookUrl', 'Facebook page')}
            {text('twitterUrl', 'X / Twitter')}
            {text('instagramUrl', 'Instagram')}
            {text('youtubeUrl', 'YouTube')}
            {text('linkedinUrl', 'LinkedIn')}
          </div>
        </Panel>

        <Panel title="Analytics & verification" description="Loaded only after a visitor accepts analytics cookies.">
          <div className="grid gap-4 md:grid-cols-2">
            {text('ga4Id', 'Google Analytics 4 Measurement ID', 'Format: G-XXXXXXXXXX')}
            {text('gscVerification', 'Search Console verification code', 'The content value of the google-site-verification meta tag')}
          </div>
        </Panel>

        <Panel title="Google AdSense" description="Ads never load until AdSense is enabled, your account is approved and slot IDs are configured.">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div><p className="text-sm font-medium">Enable AdSense</p><p className="text-xs text-muted-foreground">Only turn on after Google approves your site</p></div>
              <Switch checked={f.adsenseEnabled} onCheckedChange={(v) => set('adsenseEnabled', v)} />
            </div>
            {text('adsenseClientId', 'Publisher ID', 'Format: ca-pub-1234567890123456')}
            <div className="grid gap-4 md:grid-cols-2">
              {(Object.keys(slotLabels) as (keyof AdSlots)[]).map((k) =>
              <FormField key={k} label={slotLabels[k]} htmlFor={`slot-${k}`} hint="Ad unit slot ID">
                  <Input id={`slot-${k}`} value={f.adSlots[k]} onChange={(e) => set('adSlots', { ...f.adSlots, [k]: e.target.value.replace(/\D/g, '') })} />
                </FormField>
              )}
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div><p className="text-sm font-medium">Show reserved placeholders</p><p className="text-xs text-muted-foreground">Dashed “Advertisement” boxes while ads are not live (prevents layout shift)</p></div>
              <Switch checked={f.showAdPlaceholders} onCheckedChange={(v) => set('showAdPlaceholders', v)} />
            </div>
          </div>
        </Panel>

        <Panel title="Homepage featured content">
          <p className="text-sm text-muted-foreground">
            Choose which articles appear as <strong>Featured</strong>, <strong>Breaking News</strong> and <strong>Trending</strong> using the “Homepage placement” switches in each article. Currently: {db.posts.filter((p) => p.isFeatured).length} featured, {db.posts.filter((p) => p.isBreaking).length} breaking, {db.posts.filter((p) => p.isTrending).length} trending.
          </p>
        </Panel>

        <Panel title="Demo content">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm text-muted-foreground">{demoCount > 0 ? `${demoCount} demo articles (and their demo images, sources and tags) are installed. Remove them before launch.` : 'No demo content installed.'}</p>
            </div>
            {demoCount > 0 ?
            <Button variant="destructive" onClick={() => {if (window.confirm('Remove all demo articles, images, sources and tags?')) {clearDemoContent();toast.success('Demo content removed');}}}>Remove demo content</Button> :

            <Button variant="outline" onClick={() => {restoreDemoContent();toast.success('Demo content restored');}}>Restore demo content</Button>
            }
          </div>
        </Panel>
      </div>
      <MediaPicker open={!!picker} onOpenChange={(o) => !o && setPicker(null)} title={picker === 'logoUrl' ? 'Select logo' : 'Select favicon'} onSelect={(id) => {const m = db.media.find((x) => x.id === id);if (m && picker) set(picker, m.url);}} />
    </div>);

}