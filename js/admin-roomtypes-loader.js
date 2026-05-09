(function () {
  const waitForAdminCore = setInterval(function () {
    if (typeof window.loadView !== 'function') return;

    clearInterval(waitForAdminCore);

    const originalLoadView = window.loadView;

    window.loadView = function (view) {
      if (view === 'roomTypes' && typeof window.loadRoomTypes === 'function') {
        return window.loadRoomTypes();
      }

      return originalLoadView(view);
    };
  }, 50);
})();
