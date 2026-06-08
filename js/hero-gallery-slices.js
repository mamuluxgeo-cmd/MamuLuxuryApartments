// Adds diagonal cut photo slices to the hero section using Gallery photos.
(function () {
  let heroSlicesReady = false;
  let heroSlicesTimer = null;
  let heroSlicesIndex = 0;

  function getHeroGalleryItems() {
    try {
      if (typeof GALLERY_ITEMS !== 'undefined' && Array.isArray(GALLERY_ITEMS) && GALLERY_ITEMS.length) {
        return GALLERY_ITEMS.filter(function (item) { return item && item.url; });
      }
    } catch (error) {}

    return [];
  }

  function injectHeroSlicesStyles() {
    if (document.getElementById('heroGallerySlicesStyles')) return;

    const style = document.createElement('style');
    style.id = 'heroGallerySlicesStyles';
    style.textContent = `
      .hero-inner{position:relative;overflow:hidden;min-height:560px;display:flex;flex-direction:column;align-items:center;justify-content:center;isolation:isolate}
      .hero-inner::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 22% 20%,rgba(212,175,55,.12),transparent 28%),radial-gradient(circle at 78% 72%,rgba(212,175,55,.10),transparent 32%);pointer-events:none;z-index:0}
      .hero-photo-slices{position:absolute;inset:38px;z-index:1;pointer-events:auto;cursor:pointer;border-radius:32px;overflow:hidden}
      .hero-photo-slices::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,16,31,.72) 0%,rgba(7,16,31,.28) 30%,rgba(7,16,31,.18) 70%,rgba(7,16,31,.72) 100%),linear-gradient(180deg,rgba(7,16,31,.38),rgba(7,16,31,.58));z-index:3;pointer-events:none}
      .hero-photo-slices::after{content:"დაათვალიერე გალერეა";position:absolute;right:28px;bottom:26px;z-index:5;padding:12px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(7,16,31,.64);backdrop-filter:blur(16px);color:#fff;font-size:.82rem;font-weight:900;letter-spacing:.04em;opacity:.92;transform:translateY(6px);transition:.25s ease}
      .hero-photo-slices:hover::after{transform:translateY(0);background:linear-gradient(135deg,var(--gold2),var(--gold));color:#111827}
      .hero-slice{position:absolute;top:-10%;height:120%;width:24%;overflow:hidden;border:1px solid rgba(255,255,255,.16);box-shadow:0 22px 65px rgba(0,0,0,.28);transition:transform .55s ease,filter .55s ease,opacity .55s ease;opacity:.86}
      .hero-slice img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.08);transition:transform 6s ease,opacity .45s ease;filter:saturate(1.06) contrast(1.04)}
      .hero-photo-slices:hover .hero-slice img{transform:scale(1.16)}
      .hero-photo-slices:hover .hero-slice{filter:brightness(1.08);opacity:1}
      .hero-slice-1{left:-3%;clip-path:polygon(0 0,86% 0,100% 100%,14% 100%);transform:rotate(-3deg)}
      .hero-slice-2{left:17%;clip-path:polygon(14% 0,100% 0,86% 100%,0 100%);transform:rotate(2deg)}
      .hero-slice-3{left:38%;clip-path:polygon(0 0,84% 0,100% 100%,16% 100%);transform:rotate(-1deg)}
      .hero-slice-4{left:59%;clip-path:polygon(16% 0,100% 0,84% 100%,0 100%);transform:rotate(3deg)}
      .hero-slice-5{left:80%;clip-path:polygon(0 0,86% 0,100% 100%,14% 100%);transform:rotate(-2deg)}
      .hero-slice-1,.hero-slice-5{opacity:.54;filter:blur(.2px) brightness(.72)}
      .hero-slice-2,.hero-slice-4{opacity:.68;filter:brightness(.82)}
      .hero-inner>.eyebrow,.hero-inner>h1,.hero-inner>p,.hero-inner>.actions{position:relative;z-index:6;text-shadow:0 10px 32px rgba(0,0,0,.42)}
      .hero-inner>h1{max-width:780px}
      .hero-photo-slices.is-changing .hero-slice img{opacity:.32}
      body[data-theme='day'] .hero-photo-slices::before{background:linear-gradient(90deg,rgba(255,250,238,.76) 0%,rgba(255,250,238,.24) 30%,rgba(255,250,238,.18) 70%,rgba(255,250,238,.76) 100%),linear-gradient(180deg,rgba(255,250,238,.28),rgba(255,250,238,.48))}
      body[data-theme='day'] .hero-photo-slices::after{background:rgba(255,255,255,.62);color:#111827}
      body[data-theme='day'] .hero-inner>.eyebrow,body[data-theme='day'] .hero-inner>h1,body[data-theme='day'] .hero-inner>p,body[data-theme='day'] .hero-inner>.actions{text-shadow:0 10px 30px rgba(255,255,255,.55)}
      @media(max-width:1000px){.hero-inner{min-height:520px}.hero-photo-slices{inset:28px}.hero-slice{width:30%}.hero-slice-1{left:-8%}.hero-slice-2{left:14%}.hero-slice-3{left:38%}.hero-slice-4{left:62%}.hero-slice-5{left:84%}}
      @media(max-width:760px){.hero-inner{min-height:560px;padding-top:74px;padding-bottom:74px}.hero-photo-slices{inset:18px;border-radius:24px}.hero-slice{width:42%;height:112%;top:-6%}.hero-slice-1{left:-18%}.hero-slice-2{left:8%}.hero-slice-3{left:35%}.hero-slice-4{left:62%}.hero-slice-5{display:none}.hero-photo-slices::after{right:16px;bottom:16px;font-size:.72rem;padding:10px 14px}}
    `;

    document.head.appendChild(style);
  }

  function makeSlice(photo, index) {
    const slice = document.createElement('div');
    slice.className = 'hero-slice hero-slice-' + (index + 1);

    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.title || 'Mamu Luxury Apartments gallery photo';
    img.loading = 'lazy';

    slice.appendChild(img);
    return slice;
  }

  function scrollToGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderHeroSlices() {
    const hero = document.querySelector('.hero-inner');
    if (!hero) return false;

    const photos = getHeroGalleryItems();
    if (!photos.length) return false;

    injectHeroSlicesStyles();

    let panel = document.getElementById('heroPhotoSlices');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'heroPhotoSlices';
      panel.className = 'hero-photo-slices';
      panel.setAttribute('role', 'button');
      panel.setAttribute('tabindex', '0');
      panel.setAttribute('aria-label', 'Open gallery');
      hero.insertBefore(panel, hero.firstChild);

      panel.addEventListener('click', scrollToGallery);
      panel.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          scrollToGallery();
        }
      });
    }

    panel.innerHTML = '';

    const start = heroSlicesIndex % photos.length;
    for (let i = 0; i < Math.min(5, photos.length); i += 1) {
      panel.appendChild(makeSlice(photos[(start + i) % photos.length], i));
    }

    heroSlicesReady = true;
    return true;
  }

  function startHeroSlicesAuto() {
    if (heroSlicesTimer) clearInterval(heroSlicesTimer);

    heroSlicesTimer = setInterval(function () {
      const photos = getHeroGalleryItems();
      const panel = document.getElementById('heroPhotoSlices');
      if (!photos.length || !panel) return;

      heroSlicesIndex = (heroSlicesIndex + 1) % photos.length;
      panel.classList.add('is-changing');

      setTimeout(function () {
        renderHeroSlices();
        const currentPanel = document.getElementById('heroPhotoSlices');
        if (currentPanel) currentPanel.classList.remove('is-changing');
      }, 260);
    }, 5200);
  }

  function initHeroSlices() {
    let attempts = 0;
    const waiter = setInterval(function () {
      attempts += 1;
      if (renderHeroSlices()) {
        clearInterval(waiter);
        startHeroSlicesAuto();
      }
      if (attempts > 30) clearInterval(waiter);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSlices);
  } else {
    initHeroSlices();
  }
})();
