import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "api.dicebear.com"],
  },
  async rewrites() {
    const backendDest = process.env.BACKEND_URL
      ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api/:path*`
      : "http://localhost:5000/api/:path*";
    return [
      {
        source: "/api/:path*",
        destination: backendDest,
      },
    ];
  },
};

export default nextConfig;
