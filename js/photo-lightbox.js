(function () {
  let images = [];
  let currentIndex = 0;
  let overlay;
  let overlayImage;
  let counter;

  function normalizeUrl(url) {
    return String(url || '').trim();
  }

  function collectImages(clickedImage) {
    const scope = clickedImage.closest('#detailGallery, #galleryGrid, .detail-hero') || document;
    const selector = scope.classList && scope.classList.contains('detail-hero') ? '#roomMainImage' : 'img';

    images = Array.from(scope.querySelectorAll(selector))
      .map(function (img) {
        return {
          src: normalizeUrl(img.dataset.full || img.currentSrc || img.src),
          alt: img.alt || 'Photo'
        };
      })
      .filter(function (item) { return item.src; });

    const clickedSrc = normalizeUrl(clickedImage.dataset.full || clickedImage.currentSrc || clickedImage.src);
    currentIndex = Math.max(0, images.findIndex(function (item) { return item.src === clickedSrc; }));
  }

  function ensureOverlay() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'photo-lightbox';
    overlay.innerHTML =
      '<button type="button" class="photo-lightbox-close" aria-label="Close">×</button>' +
      '<button type="button" class="photo-lightbox-prev" aria-label="Previous">‹</button>' +
      '<img alt="Photo preview">' +
      '<button type="button" class="photo-lightbox-next" aria-label="Next">›</button>' +
      '<div class="photo-lightbox-counter"></div>';

    document.body.appendChild(overlay);
    overlayImage = overlay.querySelector('img');
    counter = overlay.querySelector('.photo-lightbox-counter');

    overlay.querySelector('.photo-lightbox-close').addEventListener('click', closeLightbox);
    overlay.querySelector('.photo-lightbox-prev').addEventListener('click', function (event) {
      event.stopPropagation();
      showImage(currentIndex - 1);
    });
    overlay.querySelector('.photo-lightbox-next').addEventListener('click', function (event) {
      event.stopPropagation();
      showImage(currentIndex + 1);
    });

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (!overlay.classList.contains('active')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (event.key === 'ArrowRight') showImage(currentIndex + 1);
    });
  }

  function showImage(index) {
    if (!images.length) return;
    currentIndex = (index + images.length) % images.length;
    overlayImage.src = images[currentIndex].src;
    overlayImage.alt = images[currentIndex].alt;
    counter.textContent = (currentIndex + 1) + ' / ' + images.length;
  }

  function openLightbox(clickedImage) {
    ensureOverlay();
    collectImages(clickedImage);
    showImage(currentIndex);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (event) {
    const img = event.target.closest('#galleryGrid img, #detailGallery img, #roomMainImage');
    if (!img) return;
    event.preventDefault();
    openLightbox(img);
  });
})();
