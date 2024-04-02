/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: () => {
    return [
      // set a proxy to backend
      {
        source: process.env.BACKEND_PROXY + "/:path*",
        destination: process.env.NEXT_PUBLIC_BACKEND_URL + "/:path*",
      },
    ];
  },
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
