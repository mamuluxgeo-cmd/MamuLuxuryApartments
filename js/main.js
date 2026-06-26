const I18N = {
  ka: {
    nav_rooms: 'ნომრები',
    nav_gallery: 'გალერეა',
    nav_videos: 'ვიდეო',
    nav_booking: 'დაჯავშნა',
    hero_welcome: 'მოგესალმებათ მამუ აპარტამენტი',
    hero_rooms_btn: 'აპარტამენტების ნახვა',
    hero_booking_btn: 'დაჯავშნა',
    rooms_title: 'აპარტამენტების ტიპები',
    gallery_title: 'გალერეა',
    videos_title: 'ვიდეოები',
    contact_title: 'კონტაქტი',
    phone_label: 'ტელეფონი',
    map_label: 'რუკაზე ნახვა',
    details_btn: 'ვრცლად',
    book_btn: 'დაჯავშნა'
  },
  en: {
    nav_rooms: 'Rooms',
    nav_gallery: 'Gallery',
    nav_videos: 'Videos',
    nav_booking: 'Booking',
    hero_welcome: 'Welcome to Mamu Apartment',
    hero_rooms_btn: 'View Apartments',
    hero_booking_btn: 'Book Now',
    rooms_title: 'Apartment Types',
    gallery_title: 'Gallery',
    videos_title: 'Videos',
    contact_title: 'Contact',
    phone_label: 'Phone',
    map_label: 'View on Map',
    details_btn: 'Details',
    book_btn: 'Book'
  },
  ru: {
    nav_rooms: 'Номера',
    nav_gallery: 'Галерея',
    nav_videos: 'Видео',
    nav_booking: 'Бронирование',
    hero_welcome: 'Вас приветствует Mamu Apartment',
    hero_rooms_btn: 'Смотреть апартаменты',
    hero_booking_btn: 'Забронировать',
    rooms_title: 'Типы апартаментов',
    gallery_title: 'Галерея',
    videos_title: 'Видео',
    contact_title: 'Контакты',
    phone_label: 'Телефон',
    map_label: 'Открыть карту',
    details_btn: 'Подробнее',
    book_btn: 'Забронировать'
  }
};

let CURRENT_LANG = localStorage.getItem('site_lang') || 'ka';
let LAST_ROOM_TYPES = [];

function bookingUrl() {
  return CONFIG.OTELMS_BOOKING_URL || 'https://booking-116144.otelms.com/booking/rooms';
}

function t(key) {
  return (I18N[CURRENT_LANG] && I18N[CURRENT_LANG][key]) || I18N.ka[key] || key;
}

function setExternalBookingLinks() {
  document.querySelectorAll('a[href="https://booking-116144.otelms.com/booking/rooms"]').forEach(function (link) {
    link.href = bookingUrl();
    link.target = '_blank';
    link.rel = 'noopener';
  });
}

function loadPhotoViewerAssets() {
  if (!document.querySelector('link[href="css/photo-lightbox.css"]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'css/photo-lightbox.css';
    document.head.appendChild(css);
  }

  if (!document.querySelector('script[src="js/photo-lightbox.js"]')) {
    const script = document.createElement('script');
    script.src = 'js/photo-lightbox.js';
    script.defer = true;
    document.body.appendChild(script);
  }
}

function setLanguage(lang) {
  CURRENT_LANG = I18N[lang] ? lang : CURRENT_LANG;
  localStorage.setItem('site_lang', CURRENT_LANG);
  document.documentElement.lang = CURRENT_LANG;

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('.language-switcher button[data-lang]').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.lang === CURRENT_LANG);
  });

  if (LAST_ROOM_TYPES.length) renderRoomTypes(LAST_ROOM_TYPES);
}

function initLanguageSwitcher() {
  document.querySelectorAll('.language-switcher button[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLanguage(this.dataset.lang);
    });
  });
  setLanguage(CURRENT_LANG);
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  setTheme(currentTheme === 'night' ? 'day' : 'night');
}

function safeText(value) {
  return String(value || '').replace(/[&<>]/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char];
  });
}

function upgradeImageUrl(url, width) {
  const value = String(url || '').trim();
  if (!value) return '';
  const targetWidth = width || 1600;

  if (value.indexOf('googleusercontent.com') !== -1) {
    if (/=s\d+[^/]*$/i.test(value)) return value.replace(/=s\d+[^/]*$/i, '=s' + targetWidth);
    if (/=w\d+[^/]*$/i.test(value)) return value.replace(/=w\d+[^/]*$/i, '=w' + targetWidth);
    if (/-w\d+-h\d+/i.test(value)) return value.replace(/-w\d+-h\d+/i, '-w' + targetWidth + '-h' + Math.round(targetWidth * 0.75));
  }

  return value;
}

function getYouTubeEmbedUrl(url) {
  const text = String(url || '');
  const match = text.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match ? 'https://www.youtube.com/embed/' + match[1] : '';
}

function getLocalizedField(item, baseName) {
  const suffix = '_' + CURRENT_LANG.toUpperCase();
  return item[baseName + suffix] || item[baseName] || '';
}

async function loadSite() {
  const savedTheme = localStorage.getItem('theme') || CONFIG.DEFAULT_THEME;
  setTheme(savedTheme);

  if (!CONFIG.GOOGLE_SCRIPT_URL) return;

  const responses = await Promise.all([
    apiGet('settings'),
    apiGet('roomTypes'),
    apiGet('gallery'),
    apiGet('videos')
  ]);

  const settings = responses[0].data || {};
  const roomTypes = responses[1].data || [];
  const gallery = responses[2].data || [];
  const videos = responses[3].data || [];

  LAST_ROOM_TYPES = roomTypes;
  renderSettings(settings);
  renderRoomTypes(roomTypes);
  renderGallery(gallery);
  renderVideos(videos);
  setLanguage(CURRENT_LANG);
  setExternalBookingLinks();
}

function renderSettings(settings) {
  document.title = settings.site_title || 'Mamu Luxury Apartments';
  document.getElementById('siteTitle').textContent = settings.site_title || 'Mamu Luxury Apartments';

  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    heroTitle.textContent = '';
    heroTitle.style.display = 'none';
  }

  const heroSubtitle = document.getElementById('heroSubtitle');
  if (heroSubtitle) heroSubtitle.textContent = '';

  if (settings.main_hero_image) {
    document.documentElement.style.setProperty('--hero-image', 'url("' + upgradeImageUrl(settings.main_hero_image, 1920) + '")');
  }

  const phone = settings.phone || '';
  const whatsapp = settings.whatsapp || '';
  const mapUrl = settings.map_url || '#';

  const phoneLink = document.getElementById('phoneLink');
  const mapLink = document.getElementById('mapLink');
  const whatsappLink = document.getElementById('whatsappLink');
  const whatsappFloat = document.getElementById('whatsappFloat');

  if (phone && phoneLink) {
    phoneLink.href = 'tel:' + phone;
    phoneLink.textContent = phone;
  }

  if (mapLink) mapLink.href = mapUrl;

  if (whatsapp) {
    const whatsappUrl = 'https://wa.me/' + String(whatsapp).replace(/\D/g, '');
    if (whatsappLink) whatsappLink.href = whatsappUrl;
    if (whatsappFloat) whatsappFloat.href = whatsappUrl;
  }
}

function renderRoomTypes(items) {
  const container = document.getElementById('roomTypes');
  if (!container) return;

  container.innerHTML = '';

  items.forEach(function (item, index) {
    const article = document.createElement('article');
    article.className = 'card';

    const image = upgradeImageUrl(item.MainImage || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 1200);
    const detailUrl = 'apartment.html?id=' + encodeURIComponent(item.TypeID);
    const name = getLocalizedField(item, 'Name');
    const shortDescription = getLocalizedField(item, 'ShortDescription');
    const loadingMode = index < 3 ? 'eager' : 'lazy';

    article.innerHTML =
      '<img src="' + safeText(image) + '" alt="' + safeText(name) + '" loading="' + loadingMode + '" decoding="async">' +
      '<div class="card-content">' +
        '<h3>' + safeText(name) + '</h3>' +
        '<p>' + safeText(shortDescription) + '</p>' +
        '<div class="meta">' +
          '<span>👥 ' + safeText(item.Guests) + '</span>' +
          '<span>🛏️ ' + safeText(item.Bedrooms) + '</span>' +
          '<span>🛁 ' + safeText(item.Bathrooms) + '</span>' +
        '</div>' +
        '<div class="card-actions">' +
          '<a class="ghost-btn small-btn" href="' + detailUrl + '">' + t('details_btn') + '</a>' +
          '<a class="liquid-btn small-btn" href="' + bookingUrl() + '" target="_blank" rel="noopener">' + t('book_btn') + '</a>' +
        '</div>' +
      '</div>';

    container.appendChild(article);
  });
}

function renderGallery(items) {
  const container = document.getElementById('galleryGrid');
  if (!container) return;
  container.innerHTML = '';

  items.forEach(function (item) {
    if (!item.ImageUrl) return;
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = '<img src="' + safeText(upgradeImageUrl(item.ImageUrl, 1200)) + '" alt="' + safeText(item.Title) + '" loading="lazy" decoding="async">';
    container.appendChild(card);
  });
}

function renderVideos(items) {
  const container = document.getElementById('videoGrid');
  if (!container) return;
  container.innerHTML = '';

  items.forEach(function (item) {
    const embedUrl = getYouTubeEmbedUrl(item.YoutubeUrl);
    if (!embedUrl) return;
    const card = document.createElement('article');
    card.className = 'card video-card';
    card.innerHTML = '<iframe src="' + embedUrl + '" title="' + safeText(item.Title) + '" loading="lazy" allowfullscreen></iframe>';
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  loadPhotoViewerAssets();
  initLanguageSwitcher();
  loadSite();
});
