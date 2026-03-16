// ============================================
// FILM GALLERY — PAGE GENERATOR
// Run with: npm run generate
// ============================================

const cloudinary = require('cloudinary').v2;
const fs         = require('fs');
const path       = require('path');
require('dotenv').config();

const config = require('./config.js');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// HELPERS
// ============================================

function toDisplayName(folderName) { return folderName.split('_')[0]; }
function toSlug(folderName)        { return folderName.split('_')[0].toLowerCase(); }
function toYear(folderName)        { return folderName.split('_')[1] || ''; }

function buildUrl(publicId, transforms) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}

// ============================================
// FETCH
// ============================================

async function getFolders() {
  const result = await cloudinary.api.root_folders();
  return result.folders;
}

async function getImagesInFolder(folderPath) {
  const result = await cloudinary.search
    .expression(`folder:${folderPath}`)
    .sort_by('public_id', 'asc')
    .max_results(500)
    .execute();

  return result.resources.map((resource, index) => {
    const id = resource.public_id;
    return {
      publicId:    id,
      src:         buildUrl(id, 'w_1400,q_auto,f_auto'),
      thumb:       buildUrl(id, 'w_800,q_auto,f_auto'),
      placeholder: buildUrl(id, 'w_20,q_1,f_auto,e_blur:800'),
      alt:         id.split('/').pop().replace(/_/g, ' '),
      number:      String(index + 1).padStart(2, '0'),
    };
  });
}

async function getImageByPublicId(publicId) {
  if (!publicId) return null;
  try {
    const result = await cloudinary.api.resource(publicId);
    const id = result.public_id;
    return {
      src:         buildUrl(id, 'w_1400,q_auto,f_auto'),
      thumb:       buildUrl(id, 'w_800,q_auto,f_auto'),
      placeholder: buildUrl(id, 'w_20,q_1,f_auto,e_blur:800'),
    };
  } catch (e) {
    console.warn(`    ⚠️  Could not find image: ${publicId}`);
    return null;
  }
}

// ============================================
// BLUR-UP — placeholder fades to real image
// ============================================
const blurUpStyles = `
  .photo-item { background-size: cover; background-position: center; }
  .photo-item img { opacity: 0; transition: opacity 0.4s ease; }
  .photo-item img.loaded { opacity: 1; }
`;

const blurUpScript = `
  document.querySelectorAll('.photo-item img').forEach(img => {
    img.addEventListener('load', () => img.classList.add('loaded'));
    if (img.complete) img.classList.add('loaded');
  });
`;

// ============================================
// GENERATE GALLERY SUB-PAGE
// ============================================
function generateGalleryPage(folderName, images, allFolders) {
  const displayName = toDisplayName(folderName);
  const year        = toYear(folderName);

  const navLinks = allFolders.map(f => {
    const slug     = toSlug(f.name);
    const name     = toDisplayName(f.name);
    const isActive = f.name === folderName;
    return `<li><a href="../${slug}/index.html"${isActive ? ' class="active"' : ''}>${name}</a></li>`;
  }).join('\n      ');

  const photoItems = images.map(img => `
    <div class="photo-item" data-full="${img.src}" style="background-image:url('${img.placeholder}')">
      <img src="${img.thumb}" alt="${img.alt}" loading="lazy">
      <span class="photo-number">${img.number}</span>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName} — Film Archive</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <style>${blurUpStyles}</style>
</head>
<body>

  <nav>
    <span class="nav-logo">Film Archive</span>
    <ul class="nav-links">
      <li><a href="../index.html">Home</a></li>
      ${navLinks}
    </ul>
  </nav>

  <a class="back-link" href="../index.html">← Home</a>

  <header class="gallery-header">
    <h1>${displayName}</h1>
    <p class="gallery-meta">${year} &nbsp;·&nbsp; 35mm film &nbsp;·&nbsp; ${images.length} photographs</p>
  </header>

  <div class="gallery-grid">
    ${photoItems}
  </div>

  <div class="lightbox" role="dialog" aria-label="Photo viewer">
    <button class="lightbox-close" aria-label="Close">Close ✕</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous">←</button>
    <div class="lightbox-img-wrap">
      <img src="" alt="">
    </div>
    <button class="lightbox-nav lightbox-next" aria-label="Next">→</button>
    <span class="lightbox-counter"></span>
  </div>

  <footer>
    <span>Film Archive — ${year}</span>
    <span>${displayName}</span>
  </footer>

  <script src="../js/lightbox.js"></script>
  <script>${blurUpScript}</script>
</body>
</html>`;
}

// ============================================
// GENERATE HOMEPAGE
// ============================================
function generateHomepage(folders, heroImg) {
  const navLinks = folders.map(f => {
    const slug = toSlug(f.name);
    const name = toDisplayName(f.name);
    return `<li><a href="${slug}/index.html">${name}</a></li>`;
  }).join('\n      ');

  const cards = folders.map(f => {
    const slug  = toSlug(f.name);
    const name  = toDisplayName(f.name);
    const year  = toYear(f.name);
    const cover = f.coverImage;
    return `
      <a href="${slug}/index.html" class="country-card">
        <div class="card-image"${cover ? ` style="background-image:url('${cover.placeholder}')"` : ''}>
          ${cover ? `<img src="${cover.thumb}" alt="${name}" loading="lazy">` : ''}
        </div>
        <div class="card-meta">
          <span class="card-title">${name}</span>
          <span class="card-count">— <span class="card-arrow">→</span></span>
        </div>
        <p class="card-year">${year}</p>
      </a>`;
  }).join('');

  const heroSrc         = heroImg?.src         || folders[0]?.coverImage?.src         || '';
  const heroPlaceholder = heroImg?.placeholder  || folders[0]?.coverImage?.placeholder || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Film — A Travel Archive</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <style>
    .hero{position:relative;height:80vh;overflow:hidden;background-image:url('${heroPlaceholder}');background-size:cover;background-position:center}
    .hero-img{width:100%;height:100%;object-fit:cover;filter:saturate(0.85) brightness(0.75);opacity:0;transition:opacity 0.6s ease}
    .hero-img.loaded{opacity:1}
    .hero-text{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:48px}
    .hero-eyebrow{color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px}
    .hero-title{font-family:var(--font-serif);font-size:clamp(40px,7vw,80px);font-weight:400;font-style:italic;color:#fff;line-height:1.1}
    .countries-section{padding:64px 40px}
    .section-label{text-transform:uppercase;font-size:10px;letter-spacing:0.2em;color:var(--muted);margin-bottom:32px;padding-bottom:12px;border-bottom:1px solid var(--border)}
    .countries-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
    .country-card{display:block;text-decoration:none;color:inherit}
    .card-image{aspect-ratio:4/5;overflow:hidden;margin-bottom:14px;background:var(--border);background-size:cover;background-position:center}
    .card-image img{width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease,filter 0.5s ease,opacity 0.4s ease;filter:saturate(0.85);opacity:0}
    .card-image img.loaded{opacity:1}
    .country-card:hover .card-image img{transform:scale(1.04);filter:saturate(1)}
    .card-meta{display:flex;justify-content:space-between;align-items:baseline}
    .card-title{font-family:var(--font-serif);font-size:20px;font-weight:400;font-style:italic}
    .card-count{color:var(--muted);font-size:11px}
    .card-year{color:var(--muted);font-size:10px;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px}
    .card-arrow{display:inline-block;transition:transform 0.2s}
    .country-card:hover .card-arrow{transform:translateX(4px)}
    .about-strip{border-top:1px solid var(--border);padding:40px;display:flex;gap:80px}
    .about-label{font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--muted);white-space:nowrap;padding-top:3px}
    .about-text{color:var(--muted);line-height:1.8;max-width:560px}
    @media(max-width:900px){.countries-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:768px){
      .hero-text{padding:28px}
      .countries-section{padding:40px 20px}
      .countries-grid{grid-template-columns:1fr;gap:40px}
      .card-image{aspect-ratio:3/2}
      .about-strip{flex-direction:column;gap:16px;padding:32px 20px}
    }
  </style>
</head>
<body>

  <nav>
    <span class="nav-logo">Film Archive</span>
    <ul class="nav-links">
      <li><a href="index.html" class="active">Home</a></li>
      ${navLinks}
    </ul>
  </nav>

  <section class="hero">
    <img class="hero-img" src="${heroSrc}" alt="Film Archive">
    <div class="hero-text">
      <p class="hero-eyebrow">35mm Film — 2025</p>
      <h1 class="hero-title">A year<br>in Asia.</h1>
    </div>
  </section>

  <section class="countries-section">
    <p class="section-label">Collections</p>
    <div class="countries-grid">
      ${cards}
    </div>
  </section>

  <div class="about-strip">
    <span class="about-label">About</span>
    <p class="about-text">
      Shot on 35mm film across Southeast Asia and Taiwan.
      All photographs taken with a film camera — grain, light leaks and all.
      An archive of places, light, and time.
    </p>
  </div>

  <footer>
    <span>Film Archive — 2025</span>
    <span>35mm</span>
  </footer>

  <script>
    document.querySelectorAll('.hero-img, .card-image img').forEach(img => {
      img.addEventListener('load', () => img.classList.add('loaded'));
      if (img.complete) img.classList.add('loaded');
    });
  </script>

</body>
</html>`;
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('🎞  Connecting to Cloudinary...');

  const folders = await getFolders();
  console.log(`📁  Found ${folders.length} folders:`, folders.map(f => f.name).join(', '));

  console.log('\n🖼  Fetching hero image...');
  const heroImg = await getImageByPublicId(config.hero);

  for (const folder of folders) {
    const slug = toSlug(folder.name);

    console.log(`\n📷  Fetching images from ${folder.name}...`);
    const images = await getImagesInFolder(folder.path);
    console.log(`    Found ${images.length} images`);

    const coverId = config.covers?.[folder.name];
    if (coverId) {
      console.log(`    Using configured cover: ${coverId}`);
      folder.coverImage = await getImageByPublicId(coverId);
    } else {
      folder.coverImage = images[0] ? {
        src:         images[0].src,
        thumb:       images[0].thumb,
        placeholder: images[0].placeholder,
      } : null;
    }

    const dir = path.join(__dirname, slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const html = generateGalleryPage(folder.name, images, folders);
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    console.log(`    ✅  Written to ${slug}/index.html`);
  }

  console.log('\n🏠  Generating homepage...');
  const homepageHtml = generateHomepage(folders, heroImg);
  fs.writeFileSync(path.join(__dirname, 'index.html'), homepageHtml);
  console.log('    ✅  Written to index.html');

  console.log('\n✨  Done! Now run:');
  console.log('    git add .');
  console.log('    git commit -m "update gallery"');
  console.log('    git push');
}

main().catch(err => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
