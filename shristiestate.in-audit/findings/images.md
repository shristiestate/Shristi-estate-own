# Image SEO Specialist Findings: Shristi Estate

**Target:** `https://shristiestate.in`  
**Category Score:** **82 / 100**  
**Category Weight:** 5%

---

## 1. Executive Summary

Shristi Estate maintains an organized local asset library under `public/images/` with dedicated subdirectories for `towers`, `properties`, and `categories`. The application includes automated fallback alt-text generation functions (`getPropertyImageAlt`, `getTowerImageAlt`) ensuring descriptive alt tags based on area, furnishing, building, and location.

The primary opportunities in this category are **modern format conversion (WebP/AVIF)** for hero and category assets and ensuring explicit dimension attributes to eliminate Cumulative Layout Shift (CLS).

---

## 2. Findings

### Strength: Contextual Alt-Text Generation
Functions in `src/utils/seoHelpers.ts` construct natural, keyword-rich image alt descriptions:
```typescript
// Example output:
// "1150 sq ft furnished office space for lease in i-Thum Sector 62 Noida"
```
This guarantees that even when administrators omit custom alt tags in the CMS, every image tag receives relevant commercial metadata.

### Finding IMG-01 (Medium): Legacy Formats for Hero & Category Images
- **Evidence:**
  - `public/hero-commercial-park.jpg` (117 KB JPEG)
  - `public/images/founder.jpg`
  - `public/images/categories/*.jpg`
- **Issue:** Modern WebP and AVIF formats achieve 30% to 50% smaller byte weights at equivalent visual quality.
- **Remediation:** Convert static category and hero imagery to WebP. In `scripts/compress-hero.ps1`, WebP generation can be integrated directly.

### Finding IMG-02 (Low): Explicit Width & Height on Image Elements
- To prevent layout shifts (CLS), verify that dynamic `<img />` tags across `PropertyCard` and building banners specify `width` and `height` attributes or CSS aspect ratios (`aspect-[16/10]`).

---

## 3. Action Items

1. Convert hero background and category previews to `.webp`.
2. Ensure all `<img>` elements declare `loading="lazy"` and `decoding="async"`, except for the single above-the-fold hero LCP element.
