// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pageRedirects from './src/data/page-redirects.json' with { type: 'json' };

// BASE_PATH lets the same site build for a GitHub Pages preview (/Knollwood-Village/)
// and for the real domain (/). Cloudflare Pages and the custom domain use '/'.
const base = process.env.BASE_PATH || '/';

/** Prefix root-relative links in Markdown with the base path. */
function rehypeBaseLinks() {
  const prefix = base.replace(/\/$/, '');
  const walk = (node) => {
    if (node.type === 'element') {
      const attr = node.tagName === 'a' ? 'href' : node.tagName === 'img' ? 'src' : null;
      if (attr && typeof node.properties?.[attr] === 'string') {
        const v = node.properties[attr];
        if (v.startsWith('/') && !v.startsWith('//') && prefix) node.properties[attr] = prefix + v;
      }
    }
    (node.children || []).forEach(walk);
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  site: 'https://knollwoodvillage.org',
  base,
  trailingSlash: 'always',
  integrations: [sitemap()],
  redirects: pageRedirects,
  markdown: { rehypePlugins: [rehypeBaseLinks] },
  build: { format: 'directory' },
});
