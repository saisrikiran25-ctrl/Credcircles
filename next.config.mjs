/** @type {import('next').NextConfig} */
const isGitHubPagesBuild = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'Credcircles';
const basePath = isGitHubPagesBuild ? `/${repoName}` : '';

const nextConfig = {
  reactStrictMode: true,
  output: isGitHubPagesBuild ? 'export' : undefined,
  trailingSlash: isGitHubPagesBuild ? true : false,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: isGitHubPagesBuild ? `${basePath}/` : undefined,
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/dev.db', './public/dev.db'],
    },
  },
};

export default nextConfig;
