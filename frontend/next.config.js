const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['C:\\hiberfil.sys', 'C:\\pagefile.sys', 'C:\\swapfile.sys'],
    };
    return config;
  },
};

module.exports = withPWA(nextConfig);
