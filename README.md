# Shristi Estate (shristiestate.in)

> Production-ready, mobile-first commercial real estate discovery and lead generation platform for **Shristi Estate**, focused on Noida, Greater Noida, and Delhi-NCR.

---

## Architecture & Hierarchy

The platform implements the strict commercial hierarchy:

```text
PROPERTY CATEGORY (Office / IT Parks / Warehouses / Factory / Land / Shops)
        ↓
LOCATION (Sector 62 / 63 / 18 / 83 / 85 / Noida Expressway)
        ↓
BUILDINGS / PROJECTS (I-Thum / Noida One / Corenthum / Stellar IT Park / Advant Navis)
        ↓
AVAILABLE PROPERTIES (1,150 sq.ft Furnished / 750 sq.ft / 15,000 sq.ft)
        ↓
PROPERTY DETAILS (Specs / Amenities / Floor Plans / Pricing)
        ↓
ENQUIRE / WHATSAPP / CALL / SITE VISIT
```

---

## Tech Stack & Features

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (Custom Glassmorphism Design System)
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Database & Storage**: Dual-mode repository architecture
  - Direct connection to **Supabase** when configured (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
  - Automatic graceful fallback to reactive persistent browser storage with pre-seeded commercial inventory for Noida & NCR
- **Design Aesthetic**: Modern Glassmorphism (semi-transparent frosted glass cards, subtle borders, soft shadows, rounded corners, dark/light theme persistence, strictly **no gold/golden colors**)
- **Admin Portal** (`/admin`):
  - Overview metrics (total properties, active vacancies, lead statuses)
  - Property Management (Add, Edit status, Delete, Feature)
  - Building & Location Directory Management
  - Full Lead CRM pipeline (`New` → `Contacted` → `Qualified` → `Visit Scheduled` → `Converted` → `Closed`)
  - One-click CSV Lead export

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment (optional):
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build production bundle:
   ```bash
   npm run build
   ```

---

## Hostinger Deployment Instructions

This project is built to run flawlessly on **Hostinger Shared Web Hosting**, **Hostinger Cloud Hosting**, or any static web host without requiring a long-running Node.js server.

### Method 1: Hostinger File Manager / FTP (Recommended & Fast)

1. Run the production build command on your local machine:
   ```bash
   npm run build
   ```
2. Open the newly generated `dist/` directory.
3. Upload all contents of the `dist/` folder (including `index.html`, `assets/`, `favicon.svg`, and `.htaccess`) directly into your Hostinger domain root:
   ```text
   public_html/
   ├── .htaccess          <-- Crucial: handles client-side routing & caching
   ├── index.html
   ├── favicon.svg
   └── assets/
       ├── index-XXXX.js
       └── index-XXXX.css
   ```
4. **Why this prevents previous Hostinger asset errors**:
   - Standard Vite asset bundling places CSS and JS in a flat `/assets/` directory with explicit hashing, eliminating the missing CSS/JS bugs previously caused by Next.js `_next` folder permission conflicts on shared hosting.
   - The included `.htaccess` file ensures all clean URLs (e.g. `/office-space`, `/locations/sector-62`, `/admin`) route directly through `index.html` without 404 errors.

---

## Supabase Setup (Optional)

1. Create a project in [Supabase](https://supabase.com).
2. Navigate to the **SQL Editor** in Supabase and run the queries in `supabase_schema.sql`.
3. Copy your project URL and Anon Key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Rebuild the app with `npm run build`. The site will now sync all properties, buildings, and captured customer leads directly to Supabase.

---

## License & Commercial Notice

© 2026 Shristi Estate. All rights reserved.
Official Address: Unit No. 1035, 10th Floor, Tower-B, iThum Tower, Plot No. A-40, Sector-62, Noida, Uttar Pradesh 201309.
