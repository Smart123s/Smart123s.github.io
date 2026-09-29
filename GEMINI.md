Responsive design. Mobile and desktop.
Light/dark theme handled with prefers-color-scheme css.
Try to keep javascript to the minimum. Use HTML/CSS when possible.
Keep the design minimalist.
This is a static site that will be hosted on Github Pages.
When adding images or icons, always add their attributions to the attributions pages (en/attributions.html and hu/attributions.html).
When adding text, add both the English and Hungarian version across corresponding pages.
Multilingual URL structure:
- Root (/) is the English main page (index.html).
- /hu/ is the Hungarian main page (hu/index.html).
- Secondary English pages reside in /en/ (e.g. /en/attributions.html); /en/index.html redirects to the root (/).
- Secondary Hungarian pages reside in /hu/ (e.g. /hu/attributions.html).
- Root (/) has an inline script redirecting first-time visitors with Hungarian OS to /hu/, and continuing to redirect to /hu/ based on user preference until the user switches to English. This script is strictly for root (/) only.
- Language switcher uses standard HTML links (<a>) and must work 100% without JavaScript, while storing preference in localStorage if JS is enabled.
When adding a new section, always add a corresponding navigation link to the sticky header (.sticky-nav) on both English and Hungarian pages.
When updating personal info, experience, education, projects, publications, skills, or links, always keep the Schema.org JSON-LD structured data in index.html and hu/index.html updated.
When modifying page metadata, titles, descriptions, or preview images, always keep Open Graph (og:*) and Twitter Card (twitter:*) tags updated across all pages (index.html, hu/index.html, en/attributions.html, hu/attributions.html).
When adding new pages, add them to sitemap.xml with xhtml:link hreflang tags, and ensure canonical links (<link rel="canonical">) and hreflang links (<link rel="alternate" hreflang="...">) are present on each page.
When adding images, specify explicit width and height attributes, and use loading="lazy" for below-the-fold images to maintain high performance and prevent layout shift (CLS).
