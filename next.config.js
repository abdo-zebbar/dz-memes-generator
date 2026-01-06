/** @type {import('next').NextConfig} */
const nextConfig = {
  // إعدادات الصور الجديدة
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;