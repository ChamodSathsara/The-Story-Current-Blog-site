import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, Circle, ExternalLink, Search, TrendingUp } from 'lucide-react';
import { PageHeader, Panel } from '../../components/admin/PageHeader';
import { useStore } from '../../contexts/StoreContext';
import { livePosts } from '../../utils/posts';

const tools = [
{ name: 'Google Analytics', desc: 'Users, sessions, pageviews, traffic sources, countries and devices.', href: 'https://analytics.google.com/', Icon: BarChart3 },
{ name: 'Google Search Console', desc: 'Search clicks, impressions, queries, CTR and average position.', href: 'https://search.google.com/search-console', Icon: Search },
{ name: 'Google Trends', desc: 'Research topic interest. Not a source of your site\'s traffic numbers.', href: 'https://trends.google.com/trends/', Icon: TrendingUp }];


const phase2 = ['Website users', 'Sessions', 'Pageviews', 'Top articles', 'Traffic sources', 'Countries', 'Devices', 'Search clicks', 'Impressions', 'Search queries', 'CTR', 'Average position'];

export function Analytics() {
  const { db } = useStore();
  const s = db.settings;
  const topInternal = [...livePosts(db)].filter((p) => p.views > 0).sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Analytics" description="Traffic is measured by free external tools. We never display invented metrics here." />
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map(({ name, desc, href, Icon }) =>
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="group rounded-lg border border-border bg-white p-5 transition hover:border-brand hover:shadow-sm">
            <Icon className="h-6 w-6 text-brand" />
            <p className="mt-3 flex items-center gap-1.5 font-semibold">{name}<ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand" /></p>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Setup status">
          <ul className="space-y-3 text-sm">
            {[
            [!!s.ga4Id, `GA4 measurement ID ${s.ga4Id ? `(${s.ga4Id})` : 'not configured'}`],
            [!!s.gscVerification, `Search Console verification ${s.gscVerification ? 'configured' : 'not configured'}`],
            [true, 'XML sitemap generated (submit /sitemap.xml in Search Console)']].
            map(([ok, label]) =>
            <li key={label as string} className="flex items-center gap-2">{ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}{label as string}</li>
            )}
          </ul>
          <Link to="/admin/settings" className="mt-4 inline-block text-sm font-semibold text-brand">Configure in Website Settings →</Link>
        </Panel>
        <Panel title="Internal article views" description="Counted by this site (one per browser session). Not a replacement for GA4.">
          {topInternal.length === 0 ?
          <p className="text-sm text-muted-foreground">No views recorded yet.</p> :

          <ol className="space-y-2 text-sm">
              {topInternal.map((p, i) =>
            <li key={p.id} className="flex justify-between gap-3"><span className="truncate"><span className="mr-2 font-semibold text-brand">{i + 1}</span>{p.title}</span><span className="tabular-nums text-muted-foreground">{p.views}</span></li>
            )}
            </ol>
          }
        </Panel>
      </div>

      <Panel title="Phase 2 — optional in-dashboard reporting" description="Prepared data module; connect the free GA4 Data API and Search Console API later via server-side credentials." className="mt-6">
        <div className="flex flex-wrap gap-2">
          {phase2.map((m) => <span key={m} className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground">{m}</span>)}
        </div>
      </Panel>
    </div>);

}