"use client";

import Script from "next/script";

// Affiliate referral tracking from our billing system (account.serverizz.com).
// aff.js defines the global CEAffTracker; the init below must run *after* it
// loads, so we drive it from the Script component's onReady handler rather than
// a separate inline <script> whose execution order isn't guaranteed.
declare global {
  interface Window {
    CEAffTracker?: {
      setParamNameId: (name: string) => void;
      setCookieDays: (days: number) => void;
      track: () => void;
    };
  }
}

export function AffiliateTracker() {
  return (
    <Script
      src="https://account.serverizz.com/templates/default/js/aff.js"
      strategy="afterInteractive"
      onReady={() => {
        const tracker = window.CEAffTracker;
        if (!tracker) return;
        tracker.setParamNameId("aff");
        tracker.setCookieDays(90);
        try {
          tracker.track();
        } catch {
          /* tracking is best-effort — never let it break the page */
        }
      }}
    />
  );
}
