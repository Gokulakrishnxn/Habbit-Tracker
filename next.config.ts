import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't ship source maps to browsers, so the deployed site doesn't expose the original source.
  productionBrowserSourceMaps: false,
  // Don't advertise the framework in an X-Powered-By response header.
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
