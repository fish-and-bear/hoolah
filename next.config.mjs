/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the tracing root so the multi-lockfile inference warning goes
  // away and Vercel/Pages don't pull in noise from outside this dir.
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  // hoolah is fully static. The daily word is computed client-side from
  // a date seed, so there is nothing to render at request time.
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;
