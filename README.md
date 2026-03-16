# Film Archive

A minimal film photography gallery hosted on GitHub Pages.

## Setup

### 1. Fill in your Cloudinary credentials

Open `.env` and replace the placeholder values:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Upload photos to Cloudinary

In your Cloudinary Media Library, create folders named like:

- Malaysia_2025
- Taiwan_2025
- Vietnam_2025

Upload your photos into each folder.

### 3. Install dependencies

```bash
npm install
```

### 4. Generate the site

```bash
npm run generate
```

This fetches your photos from Cloudinary and writes all the HTML pages.

### 5. Deploy

```bash
git add .
git commit -m "generate pages"
git push
```

## Adding new photos later

1. Upload new photos to Cloudinary
2. Run `npm run generate` again
3. Push to GitHub
