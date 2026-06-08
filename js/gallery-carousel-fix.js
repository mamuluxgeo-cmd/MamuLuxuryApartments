// Keeps gallery carousel thumbnail movement inside the thumbnail strip only.
// This overrides the main carousel updater after main.js is loaded.
updateGalleryCarousel = function () {
  if (!GALLERY_ITEMS.length) return;

  const item = GALLERY_ITEMS[GALLERY_INDEX];
  const image = document.getElementById('galleryCarouselImage');
  const counter = document.getElementById('galleryCounter');
  const thumbs = document.getElementById('galleryThumbs');

  if (image) {
    image.classList.remove('is-visible');
    setTimeout(function () {
      image.src = item.url;
      image.alt = item.title;
      image.classList.add('is-visible');
    }, 80);
  }

  if (counter) counter.textContent = (GALLERY_INDEX + 1) + ' / ' + GALLERY_ITEMS.length;

  if (thumbs) {
    thumbs.innerHTML = GALLERY_ITEMS.map(function (photo, index) {
      return '<button type="button" class="gallery-thumb' + (index === GALLERY_INDEX ? ' active' : '') + '" onclick="galleryGoTo(' + index + ', true)" aria-label="Photo ' + (index + 1) + '"><img src="' + safeText(photo.url) + '" alt="' + safeText(photo.title) + '"></button>';
    }).join('');

    const activeThumb = thumbs.querySelector('.gallery-thumb.active');
    if (activeThumb) {
      const targetLeft = activeThumb.offsetLeft - (thumbs.clientWidth / 2) + (activeThumb.offsetWidth / 2);
      thumbs.scrollTo({ left: Math.max(targetLeft, 0), behavior: 'smooth' });
    }
  }

  updateGalleryLightbox();
};
