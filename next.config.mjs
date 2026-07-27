/** @type {import('next').NextConfig} */

// When building for GitHub Pages (project site served under /portfolio-ellen),
// set GITHUB_PAGES=true so assets resolve under the repo path.
const isPages = process.env.GITHUB_PAGES === "true";
const repo = "portfolio-ellen";

const nextConfig = {
  // Static export so the site can be hosted anywhere (GitHub Pages, Netlify, S3…)
  output: "export",
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  basePath: isPages ? `/${repo}` : undefined,
  assetPrefix: isPages ? `/${repo}/` : undefined,
};

export default nextConfig;
