"use client";

import { useEffect, useRef } from "react";
import { GETTERMS_ACCOUNT } from "@/lib/legal";

/**
 * Renders a GetTerms managed legal document inline.
 *
 * We use `mode="direct"`, so GetTerms injects the document HTML straight into
 * the container (rather than displaying it inside a visible iframe), which lets
 * us theme it with the site's own CSS — see `.szz-getterms` in globals.css.
 *
 * Quirk: GetTerms' `embed.js` scans the DOM for `.getterms-document-embed`
 * exactly once, at script-load time — it has no MutationObserver — so it can't
 * see a container that only appears after a client-side navigation. We therefore
 * (re)inject the loader on every mount. The page gives this component a `key` of
 * the slug, so switching legal docs fully remounts the (empty) container before
 * the fresh loader runs and each loader finds exactly one container to fill.
 */
const EMBED_SRC = "https://gettermscdn.com/dist/js/embed.js";
const EMBED_ENV = "https://gettermscdn.com";
const LOADER_ID = "getterms-embed-js";

export function GetTermsDocument({ document: doc }: { document: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Start from a clean container and drop any prior loader so a re-run (soft
    // navigation, Strict Mode) can never stack a second copy of the document.
    container.innerHTML = "";
    window.document.getElementById(LOADER_ID)?.remove();

    const script = window.document.createElement("script");
    script.id = LOADER_ID;
    script.src = EMBED_SRC;
    script.async = true;
    window.document.body.appendChild(script);

    return () => {
      script.remove();
      container.innerHTML = "";
    };
  }, [doc]);

  return (
    <div
      ref={ref}
      className="getterms-document-embed szz-getterms"
      data-getterms={GETTERMS_ACCOUNT}
      data-getterms-document={doc}
      data-getterms-lang="en-us"
      data-getterms-mode="direct"
      data-getterms-env={EMBED_ENV}
    />
  );
}
