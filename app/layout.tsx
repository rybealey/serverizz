import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import { OrganizationJsonLd, JsonLdScript } from "next-seo";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";

// We import the Font Awesome core CSS manually above, so stop it from
// injecting its own <style> at runtime (which causes oversized-icon flash).
config.autoAddCss = false;
import { AffiliateTracker } from "@/components/affiliate-tracker";
import {
  ORG,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/seo";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: ORG.legalName, url: SITE_URL }],
  creator: ORG.legalName,
  publisher: ORG.legalName,
  category: "technology",
  alternates: { canonical: "/" },
  // Don't let phone numbers / addresses in copy get auto-linked by Safari.
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: "/",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

// Set the theme attribute before paint so there's no light/dark flash.
const themeScript = `(function(){try{var t=localStorage.getItem('szz-theme')||'system';var r=(t==='system')?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',r);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <OrganizationJsonLd
          type="Organization"
          name={SITE_NAME}
          legalName={ORG.legalName}
          url={SITE_URL}
          logo={`${SITE_URL}/opengraph-image`}
          description={SITE_DESCRIPTION}
          email={ORG.email}
          address={{ "@type": "PostalAddress", ...ORG.address }}
          contactPoint={{
            "@type": "ContactPoint",
            contactType: "customer support",
            email: ORG.supportEmail,
          }}
        />
        <JsonLdScript
          id="website-jsonld"
          scriptKey="website-jsonld"
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            inLanguage: "en-US",
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          }}
        />
        {children}
        <AffiliateTracker />
      </body>
    </html>
  );
}
