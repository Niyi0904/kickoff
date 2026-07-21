import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Point turbopack to the kickoff-web directory to resolve tailwindcss correctly
  // (avoids the monorepo lockfile resolution issue)
  turbopack: {
    root: "C:\\Users\\LG\\Desktop\\project\\team_management\\kickoff-web",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
};

export default nextConfig;
