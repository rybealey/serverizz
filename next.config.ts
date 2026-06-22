import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/wordpress",
        destination: "/hosting/wordpress",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
