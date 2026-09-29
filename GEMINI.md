Responsive design. Mobile and desktop.
Light/dark theme handled with prefers-color-scheme css.
Try to keep javascript to the minimum. Use HTML/CSS when possible.
Keep the design minimalist.
This is a static site that will be hosted on Github Pages.
When adding images or icons, always add their attributions to the attributions page (attributions.html).
When adding text, add both the English and Hungarian version.
When adding a new section, always add a corresponding navigation link to the sticky header (.sticky-nav) with both English and Hungarian versions.
When updating personal info, experience, education, projects, publications, skills, or links, always keep the Schema.org JSON-LD structured data in index.html updated.
When modifying page metadata, titles, descriptions, or preview images, always keep Open Graph (og:*) and Twitter Card (twitter:*) tags updated in both index.html and attributions.html.
When adding new pages, add them to sitemap.xml and ensure canonical links (<link rel="canonical">) are present.
When adding images, specify explicit width and height attributes, and use loading="lazy" for below-the-fold images to maintain high performance and prevent layout shift (CLS).
