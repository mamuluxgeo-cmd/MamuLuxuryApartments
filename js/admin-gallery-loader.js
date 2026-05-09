(function () {
  function activateGalleryButton(button) {
    document.querySelectorAll('.nav-btn').forEach(function (btn) {
      btn.classList.remove('active');
    });

    button.classList.add('active');

    const title = document.getElementById('panelTitle');
    if (title) title.textContent = 'Gallery';

    if (typeof window.loadGalleryManagement === 'function') {
      window.loadGalleryManagement();
    }
  }

  function bindGalleryNavigation() {
    const galleryButton = document.querySelector('.nav-btn[data-view="gallery"]');
    if (!galleryButton || galleryButton.dataset.galleryReady === 'true') return false;

    galleryButton.dataset.galleryReady = 'true';

    galleryButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      activateGalleryButton(galleryButton);
    }, true);

    return true;
  }

  const waitForButton = setInterval(function () {
    if (bindGalleryNavigation()) {
      clearInterval(waitForButton);
    }
  }, 50);
})();
