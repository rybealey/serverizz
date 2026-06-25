import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "newsroom.serverizz.com" },
      // WordPress serves author avatars (avatar_urls) from Gravatar.
      { protocol: "https", hostname: "secure.gravatar.com" },
    ],
  },
  async redirects() {
    // Legacy WordPress/Divi URLs from the previous site. Ordered specific ->
    // catch-all, since Next.js checks redirects in array order (first match
    // wins) and before the filesystem. All 308 (permanent) for SEO.
    return [
      { source: "/wordpress", destination: "/hosting/wordpress", permanent: true },
      { source: "/hosting/reseller", destination: "/hosting", permanent: true },

      // Infrastructure / products (specific first, then catch-all -> /hosting)
      { source: "/infrastructure/virtual-private-servers", destination: "/vps", permanent: true },
      { source: "/infrastructure/dedicated-servers", destination: "/dedicated", permanent: true },
      { source: "/infrastructure/grid-hosting", destination: "/hosting", permanent: true },
      { source: "/infrastructure/:path*", destination: "/hosting", permanent: true },
      { source: "/server/vps-1-1-1", destination: "/vps", permanent: true },
      { source: "/virtual-machines", destination: "/vps", permanent: true },
      { source: "/grid/:path*", destination: "/hosting", permanent: true },
      { source: "/addon/:path*", destination: "/hosting", permanent: true },

      // Web design (discontinued -> contact/support)
      { source: "/service/web-design", destination: "/support", permanent: true },
      {
        source: "/web-design-serverizz-unlimited-web-design-subscription",
        destination: "/support",
        permanent: true,
      },

      // Legal / policy
      { source: "/policy/refund-policy", destination: "/legal/refunds", permanent: true },
      { source: "/policy/cookie-policy", destination: "/legal/cookies", permanent: true },
      { source: "/about/terms-and-conditions", destination: "/legal/terms", permanent: true },

      // Company / about
      { source: "/about/contact", destination: "/support", permanent: true },
      { source: "/about/contributions", destination: "/about", permanent: true },
      { source: "/about/serverizz-papers", destination: "/about", permanent: true },
      { source: "/impact", destination: "/why", permanent: true },

      // Marketing "points" pages (specific first, then catch-all -> /blog)
      { source: "/points/wordpress", destination: "/hosting/wordpress", permanent: true },
      { source: "/points/free-domain-name", destination: "/domains", permanent: true },
      { source: "/points/:path*", destination: "/blog", permanent: true },

      // Legacy editorial / taxonomy / pagination -> newsroom
      { source: "/articles/:path*", destination: "/blog", permanent: true },
      { source: "/topics/:path*", destination: "/blog", permanent: true },
      { source: "/category/:path*", destination: "/blog", permanent: true },
      { source: "/page/:path*", destination: "/blog", permanent: true },
      { source: "/2025/:path*", destination: "/blog", permanent: true },
    ];
  },
};

export default nextConfig;
