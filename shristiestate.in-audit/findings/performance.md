# Performance & Core Web Vitals Specialist Findings: Shristi Estate

**Target:** `http://127.0.0.1:3000` / `https://shristiestate.in`  
**Category Score:** **78 / 100**  
**Category Weight:** 10%

---

## 1. Executive Summary

Shristi Estate displays strong frontend architecture with intelligent client-side code splitting, lazy-loaded modals and administration panels, and explicit touch-device bypasses in `InteractiveHeroTexture.tsx` to prevent Total Blocking Time (TBT) on mobile hardware.

However, several Core Web Vitals optimizations remain untapped:
1. Absence of the Speculation Rules API for instant navigation.
2. Render-blocking third-party Google Fonts stylesheet.
3. Missing `fetchpriority="high"` attribute on the hero LCP candidate.

---

## 2. Key Audit Diagnostics

### Diagnostic PERF-01: Speculation Rules & Preload Signals
Running `preload_check.py` on the dev server yielded:
```json
{
  "url": "http://127.0.0.1:3000/",
  "speculation_rules": {
    "inline_blocks": 0,
    "header_present": false,
    "actions": []
  },
  "preload_hints": 1,
  "prerender_links": 0,
  "bfcache_signals": {
    "cache_control_no_store": false,
    "unload_listener": false,
    "beforeunload_listener": false
  },
  "lcp_resource_hints": {
    "preload_lcp_candidate": false,
    "fetchpriority_high": 0
  },
  "score": 50,
  "recommendations": [
    "Add <script type=\"speculationrules\"> for prefetch+prerender on top user-paths. Saves entire next-navigation paint cost.",
    "Mark the LCP hero image with fetchpriority=\"high\" so the browser preloads it ahead of other resources."
  ]
}
```

### Diagnostic PERF-02: Production Asset Bundle Breakdown
The production build (`npm run build`) produced cleanly structured assets:
- `dist/index.html`: **6.15 kB** (gzip: 2.06 kB)
- `dist/assets/index-*.css`: **114.72 kB** (gzip: 17.68 kB)
- `dist/assets/vendor-icons-*.js`: **36.17 kB** (gzip: 7.54 kB)
- `dist/assets/vendor-react-*.js`: **180.66 kB** (gzip: 59.54 kB)
- `dist/assets/vendor-supabase-*.js`: **224.85 kB** (gzip: 58.93 kB)
- `dist/assets/index-*.js`: **284.14 kB** (gzip: 62.84 kB)
- `dist/assets/AdminPage-*.js`: **408.97 kB** (gzip: 76.84 kB) — properly separated from the visitor critical path!

---

## 3. Recommended Performance Optimizations

### 1. Implement Speculation Rules API (Near-Zero Millisecond Route Transitions)
Add the following snippet to `index.html` within `<head>`:
```html
<script type="speculationrules">
{
  "prerender": [
    {
      "source": "list",
      "urls": [
        "/properties",
        "/office-space",
        "/locations"
      ],
      "eagerness": "moderate"
    }
  ]
}
</script>
```
*Impact:* Chrome and Edge browsers will pre-render top landing pages in the background, achieving instantaneous page loads when users click navigation links.

### 2. Self-Host Space Grotesk Typography
Currently, `index.html` loads fonts via:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap">
```
*Impact:* Downloading fonts directly from `public/fonts/space-grotesk.woff2` eliminates external DNS preconnect overhead to `fonts.googleapis.com` and `fonts.gstatic.com` and accelerates First Contentful Paint (FCP).

### 3. Add `fetchpriority="high"` to LCP Preload
In `index.html`, update the hero preload link:
```html
<!-- Before -->
<link rel="preload" as="image" href="/hero-commercial-park.jpg" media="(min-width: 769px)">

<!-- After -->
<link rel="preload" as="image" href="/hero-commercial-park.jpg" media="(min-width: 769px)" fetchpriority="high">
```
*Impact:* Tells the browser's preload scanner that the hero texture image is the LCP candidate, preventing network queuing behind stylesheets or scripts.
