import { useCallback, useEffect, useState } from 'react';

export type ConsentState = 'accepted' | 'rejected' | null;
const KEY = 'tsc_consent';
const EVENT = 'tsc-consent-change';

function read(): ConsentState {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(KEY);
  return v === 'accepted' || v === 'rejected' ? v : null;
}

export function useConsent(): [ConsentState, (v: Exclude<ConsentState, null>) => void] {
  const [consent, setConsentState] = useState<ConsentState>(read);
  useEffect(() => {
    const sync = () => setConsentState(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  const setConsent = useCallback((v: Exclude<ConsentState, null>) => {
    localStorage.setItem(KEY, v);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [consent, setConsent];
}
