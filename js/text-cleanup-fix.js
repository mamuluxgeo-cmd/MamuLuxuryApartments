// Prevent photo URLs from appearing as room descriptions in any language.
// Some old rows have image links accidentally saved in ShortDescription_EN / FullDescription_EN.
(function () {
  function isUrlLike(value) {
    const text = String(value || '').trim();
    if (!text) return false;
    return /^https?:\/\//i.test(text) || /images\.unsplash\.com|drive\.google\.com|googleusercontent\.com|imgbb\.com|ibb\.co/i.test(text);
  }

  function cleanText(value) {
    const text = String(value || '').trim();
    return isUrlLike(text) ? '' : text;
  }

  const originalGetLocalizedField = window.getLocalizedField;

  window.getLocalizedField = function (item, baseName) {
    item = item || {};

    const lang = (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG) ? CURRENT_LANG : 'ka';
    const suffix = '_' + String(lang).toUpperCase();

    const candidates = [
      item[baseName + suffix],
      item[baseName],
      item[baseName + '_KA'],
      item[baseName + '_EN'],
      item[baseName + '_RU']
    ];

    for (let i = 0; i < candidates.length; i += 1) {
      const cleaned = cleanText(candidates[i]);
      if (cleaned) return cleaned;
    }

    if (typeof originalGetLocalizedField === 'function') {
      return cleanText(originalGetLocalizedField(item, baseName));
    }

    return '';
  };

  window.cleanRoomText = cleanText;
})();
