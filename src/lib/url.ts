/** Build a site URL that respects the configured base path. Use for every internal link in components. */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!path.startsWith('/')) return path;
  return base + path;
}
