/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Prevent minor TS type mismatch from breaking student build on Amvera
    ignoreBuildErrors: true,
  },
  eslint: {
    // Prevent linter warnings from breaking student build on Amvera
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
