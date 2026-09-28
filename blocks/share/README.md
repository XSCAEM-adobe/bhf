# Share

Social share buttons for the current page (used on education articles).

## Authoring

| Share |
| --- |
| Share : |
| X |
| Facebook |
| LinkedIn |

- One row per entry. Rows naming a supported network (`X`/`Twitter`, `Facebook`, `LinkedIn`) become share icons; any other text becomes the label.
- Share links are built at runtime from the page's canonical URL and `og:title` (or the page title), so the same block works on every article.
- Icons are loaded from `/icons/share-<network>.svg`.

## Layout

- Below 1200px: a horizontal row (13px label, 22px icons). On education articles it is moved to the end of the page.
- From 1200px: a vertical rail (16px label, 36px icons) that sits to the left of the article body and stays in view while scrolling.
