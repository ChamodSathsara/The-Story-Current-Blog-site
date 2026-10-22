import React, { useEffect, useRef } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { useConsent } from '../../hooks/useConsent';
import type { AdSlots } from '../../types/models';

interface AdSlotProps {
  position: keyof AdSlots;
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

const heights = { horizontal: 'min-h-[100px] md:min-h-[120px]', rectangle: 'min-h-[260px]', vertical: 'min-h-[600px]' };

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Reserved, clearly separated ad position. Real ads load ONLY when AdSense is enabled,
 * a publisher ID and slot are configured, and the visitor has accepted cookies.
 */
export function AdSlot({ position, format = 'horizontal', className = '' }: AdSlotProps) {
  const { db } = useStore();
  const [consent] = useConsent();
  const s = db.settings;
  const slotId = s.adSlots[position];
  const live = s.adsenseEnabled && !!s.adsenseClientId && !!slotId && consent === 'accepted';
  const pushed = useRef(false);

  useEffect(() => {
    if (!live || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {

      /* ad blocked or script not ready */}
  }, [live]);

  if (live) {
    return (
      <aside aria-label="Advertisement" className={`my-8 ${className}`}>
        <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Advertisement</p>
        <ins className="adsbygoogle block" style={{ display: 'block' }} data-ad-client={s.adsenseClientId} data-ad-slot={slotId} data-ad-format="auto" data-full-width-responsive="true" />
      </aside>);

  }

  if (!s.showAdPlaceholders) return null;
  return (
    <aside aria-label="Advertisement placeholder" className={`my-8 flex ${heights[format]} items-center justify-center rounded-md border border-dashed border-border bg-muted ${className}`}>
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Advertisement</span>
    </aside>);

}
