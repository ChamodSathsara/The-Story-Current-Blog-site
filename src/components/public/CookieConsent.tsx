import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { useConsent } from '../../hooks/useConsent';

export function CookieConsent() {
  const [consent, setConsent] = useConsent();
  return (
    <AnimatePresence>
      {consent === null &&
      <motion.div
        role="dialog"
        aria-label="Cookie preferences"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-lg border border-border bg-white p-4 shadow-2xl md:p-5">
        
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Cookie className="hidden h-8 w-8 shrink-0 text-brand md:block" />
            <p className="flex-1 text-sm text-muted-foreground">
              We use essential cookies to run this site. With your permission we'd also use analytics and advertising cookies (Google Analytics, Google AdSense) to understand readership and fund our journalism.{' '}
              <Link to="/privacy-policy" className="font-medium text-ink underline hover:text-brand">Privacy Policy</Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => setConsent('rejected')} className="h-10 rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted">Essential only</button>
              <button onClick={() => setConsent('accepted')} className="h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-deep">Accept all</button>
            </div>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}