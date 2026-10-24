# Local Image Storage System

This project manages and serves all images directly from the local file system.

## Important Note on Server Environment
> **Local Disk Requirement:**
> All uploaded photos are saved directly into this project folder (`public/images/`), and section image choices are stored in `data/site-images.json`.
> This system requires an environment with a **writable persistent disk** (such as a local computer, VPS like DigitalOcean/Linode/AWS EC2, or Docker container with a persistent volume mounted to `public/images` and `data`).
> It has **zero dependency on external cloud storage** (No Supabase Storage, No Firebase, No AWS S3).

## Directory Structure
- `public/images/hero/`: High-resolution commercial park textures and banner photos.
- `public/images/gallery/`: Campus, reception, lobby, and architectural galleries.
- `public/images/towers/`: Commercial tower elevations and building photos.
- `public/images/properties/`: Commercial unit interiors, workstations, and floor plans.
- `public/images/categories/`: Category hub banners (office space, IT parks, warehouses, etc.).
- `public/images/uploads/`: General administrative uploads.
- `data/site-images.json`: Local JSON file mapping images to site sections.

## API Endpoints (Admin Protected)
- `POST /api/admin/images/upload`: Uploads a new image with unique safe slugified name.
- `GET /api/admin/images`: Lists all images across all subfolders.
- `PUT /api/admin/images/replace`: Replaces an existing image while preserving the exact same URL path.
- `DELETE /api/admin/images/:name`: Deletes an image from the local project folder.
- `GET /api/admin/site-images`: Reads current `data/site-images.json`.
- `PUT /api/admin/site-images`: Updates `data/site-images.json`.