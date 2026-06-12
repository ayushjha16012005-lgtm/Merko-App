import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@merko/ui', '@merko/types', '@merko/config'],
};

export default nextConfig;
