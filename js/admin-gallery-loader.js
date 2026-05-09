(function () {
  const waitForAdminCore = setInterval(function () {
    if (typeof window.loadView !== 'function') return;

    clearInterval(waitForAdminCore);

    const originalLoadView = window.loadView;

    window.loadView = function (view) {
      if (view === 'gallery' && typeof window.loadGalleryManagement === 'function') {
        return window.loadGalleryManagement();
      }

      return originalLoadView(view);
    };
  }, 50);
})();
