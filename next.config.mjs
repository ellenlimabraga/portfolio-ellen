/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the site can be hosted anywhere (GitHub Pages, Netlify, S3…)
  output: "export",
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
