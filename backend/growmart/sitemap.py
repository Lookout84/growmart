from django.http import HttpResponse
from django.utils import timezone
from products.models import Product, Category


def sitemap_xml(request):
    base = 'https://zelenyi-kutochok.com.ua'
    today = timezone.now().date().isoformat()

    urls = []

    # Static pages
    static_pages = [
        ('/', '1.0', 'weekly'),
        ('/products', '0.9', 'daily'),
        ('/blog', '0.8', 'weekly'),
        ('/about', '0.6', 'monthly'),
        ('/contact', '0.6', 'monthly'),
        ('/reviews', '0.6', 'monthly'),
        ('/pages/oplata-i-dostavka', '0.7', 'monthly'),
        ('/pages/garantiyi', '0.5', 'monthly'),
        ('/faq', '0.6', 'monthly'),
    ]
    for path, priority, freq in static_pages:
        urls.append(f'''  <url>
    <loc>{base}{path}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>''')

    # Category pages
    for cat in Category.objects.filter(is_active=True):
        urls.append(f'''  <url>
    <loc>{base}/products?category={cat.slug}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>''')

    # Product pages
    for product in Product.objects.filter(is_active=True).only('slug', 'updated_at'):
        lastmod = product.updated_at.date().isoformat() if product.updated_at else today
        urls.append(f'''  <url>
    <loc>{base}/products/{product.slug}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>''')

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += '\n'.join(urls)
    xml += '\n</urlset>'

    return HttpResponse(xml, content_type='application/xml')
