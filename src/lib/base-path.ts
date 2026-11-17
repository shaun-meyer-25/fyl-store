// next/image bypasses basePath auto-prefixing when images.unoptimized is
// set (required for static export), so any <Image> pointing at a public/
// asset needs this applied manually. No-op when NEXT_PUBLIC_BASE_PATH is
// unset (i.e. on the normal dynamic/Vercel build).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
