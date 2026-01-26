/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  compiler: {
    styledComponents: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },

  // ✅ CORRECTO EN NEXT 15
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.0.144:3000",
  ],
};

module.exports = nextConfig;
