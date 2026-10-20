"""Write dist/sitemap.xml from the canonical URL of every built HTML page.

The reference pages (schools, economists) are static files that the app links
to from JavaScript only: without a sitemap, neither crawlers nor the
ligne-de-crete.fr search index can find them.
"""
from pathlib import Path
import re, sys
from xml.sax.saxutils import escape

dist = Path(sys.argv[1] if len(sys.argv) > 1 else 'dist')
canonical = re.compile(r'<link rel="canonical" href="([^"]+)"')
urls = sorted({m.group(1) for p in dist.rglob('*.html')
               if (m := canonical.search(p.read_text(encoding='utf-8')))})
if len(urls) < 2:
    sys.exit(f'sitemap: only {len(urls)} canonical URL(s) found in {dist}')
body = ''.join(f'  <url><loc>{escape(u)}</loc></url>\n' for u in urls)
(dist / 'sitemap.xml').write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '</urlset>\n',
    encoding='utf-8')
print(f'sitemap: {len(urls)} URLs')
