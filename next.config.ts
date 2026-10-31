import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/tenants", destination: "/negocios", permanent: true },
    ];
  },
};

export default nextConfig;
