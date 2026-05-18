/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Legacy domains list (kept for compatibility)
    domains: [
      'images.unsplash.com',
      'ecommerce.routemisr.com',
      'alsahwa.om',
      'encrypted-tbn0.gstatic.com',
      'lh3.googleusercontent.com',
      'via.placeholder.com',
      'placehold.co',
      'pbs.twimg.com',
      'abs.twimg.com',
      'cdn.cloudinary.com',
      'res.cloudinary.com',
      'i.imgur.com',
    ],

    // Universal wildcard — allows any https image source.
    // This prevents runtime errors from any external CDN the data layer returns.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
