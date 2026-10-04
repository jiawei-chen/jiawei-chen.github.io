# Jiawei Chen — Academic Homepage

Static academic website for Jiawei Chen at Zhejiang University, published with GitHub Pages.

## Pages

- `index.html`: biography, research interests, highlights, news, background and awards.
- `publications.html`: selected publications, with surveys and tutorials first, followed by year groups and topic filters.

## Editing

Edit the page templates in `_source/`, metadata in `assets/profile.js` and `assets/publications.js`, styles in `assets/style.css`, and interactions in `assets/app.js`. Regenerate both pages with:

```sh
node _source/build-content.cjs
```

No build dependencies are required. The generated pages work directly on GitHub Pages. Existing `images/`, `paper/` and `files/` URLs are retained.

Oral labels describe verified presentation formats, including conference-wide full-paper talks; they do not always denote a selective honor. Source URLs are stored with each record. ESI labels and citation counts are supplied by the author and are static, not live metrics.

English text uses locally hosted Lato fonts in `assets/fonts/`, distributed under the SIL Open Font License included in that directory.
