const APARTMENT_I18N = {
  ka: {
    nav_rooms: 'ნომრები',
    nav_gallery: 'გალერეა',
    nav_booking: 'დაჯავშნა',
    book_btn: 'დაჯავშნა',
    back_btn: 'უკან დაბრუნება',
    amenities_title: 'კომფორტები',
    gallery_title: 'ფოტოები'
  },
  en: {
    nav_rooms: 'Rooms',
    nav_gallery: 'Gallery',
    nav_booking: 'Booking',
    book_btn: 'Book',
    back_btn: 'Back',
    amenities_title: 'Amenities',
    gallery_title: 'Gallery'
  },
  ru: {
    nav_rooms: 'Номера',
    nav_gallery: 'Галерея',
    nav_booking: 'Бронирование',
    book_btn: 'Забронировать',
    back_btn: 'Назад',
    amenities_title: 'Удобства',
    gallery_title: 'Фотографии'
  }
};

let CURRENT_LANG = localStorage.getItem('site_lang') || 'ka';
let CURRENT_ROOM = null;

function bookingUrl() {
  return CONFIG.OTELMS_BOOKING_URL || 'https://booking-116144.otelms.com/booking/rooms';
}

function tr(key) {
  return (APARTMENT_I18N[CURRENT_LANG] && APARTMENT_I18N[CURRENT_LANG][key]) || APARTMENT_I18N.ka[key] || key;
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = document.body.getAttribute('data-theme');
  setTheme(current === 'night' ? 'day' : 'night');
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
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

function splitGallery(value) {
  return String(value || '')
    .split(/[\n,;|]+/)
    .map(function (v) { return v.trim(); })
    .filter(Boolean);
}

function uniqueImages(images) {
  const seen = {};
  return images.filter(function (url) {
    const clean = String(url || '').trim();
    if (!clean || seen[clean]) return false;
    seen[clean] = true;
    return true;
  });
}

function getRoomGalleryImages(room) {
  return uniqueImages([
    room.MainImage,
    room.GalleryImages,
    room.Gallery,
    room.Gallery_Images,
    room.ImageUrls,
    room.ImageURLS,
    room.Images
  ].reduce(function (all, value) {
    return all.concat(splitGallery(value));
  }, []));
}

function splitAmenities(value) {
  return String(value || '').split(',').map(function (v) { return v.trim(); }).filter(Boolean);
}

function getLocalizedField(item, baseName) {
  const suffix = '_' + CURRENT_LANG.toUpperCase();
  return item[baseName + suffix] || item[baseName] || '';
}

function setBookingLinks() {
  document.querySelectorAll('a[href="https://booking-116144.otelms.com/booking/rooms"]').forEach(function (link) {
    link.href = bookingUrl();
    link.target = '_blank';
    link.rel = 'noopener';
  });
}

function setLanguage(lang) {
  CURRENT_LANG = APARTMENT_I18N[lang] ? lang : CURRENT_LANG;
  localStorage.setItem('site_lang', CURRENT_LANG);
  document.documentElement.lang = CURRENT_LANG;

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = tr(el.dataset.i18n);
  });

  document.querySelectorAll('.language-switcher button[data-lang]').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.lang === CURRENT_LANG);
  });

  if (CURRENT_ROOM) renderRoom(CURRENT_ROOM);
}

function initLanguageSwitcher() {
  document.querySelectorAll('.language-switcher button[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLanguage(this.dataset.lang);
    });
  });
  setLanguage(CURRENT_LANG);
}

async function loadApartment() {
  const savedTheme = localStorage.getItem('theme') || CONFIG.DEFAULT_THEME;
  setTheme(savedTheme);
  initLanguageSwitcher();
  setBookingLinks();

  const roomTypeId = qs('id') || 'TYPE-A';
  const response = await apiGet('roomTypes');
  const items = response.data || [];
  const room = items.find(function (item) {
    return String(item.TypeID) === String(roomTypeId);
  });

  if (!room) return;

  CURRENT_ROOM = room;
  renderRoom(room);
}

function renderRoom(room) {
  const name = getLocalizedField(room, 'Name');
  const category = getLocalizedField(room, 'Category') || 'Apartment';
  const fullDescription = getLocalizedField(room, 'FullDescription');
  const shortDescription = getLocalizedField(room, 'ShortDescription');
  const amenities = getLocalizedField(room, 'Amenities');
  const mainImage = upgradeImageUrl(room.MainImage || document.getElementById('roomMainImage').src, 1800);

  document.title = name + ' — Mamu Luxury Apartments';
  document.getElementById('roomCategory').textContent = category;
  document.getElementById('roomName').textContent = name;
  document.getElementById('roomDescription').textContent = fullDescription || shortDescription || '';
  document.getElementById('roomMainImage').src = mainImage;
  document.getElementById('roomMainImage').loading = 'eager';
  document.getElementById('roomMainImage').decoding = 'async';

  document.getElementById('roomMeta').innerHTML =
    '<span>👥 ' + escapeHtml(room.Guests) + '</span>' +
    '<span>🛏️ ' + escapeHtml(room.Bedrooms) + '</span>' +
    '<span>🛁 ' + escapeHtml(room.Bathrooms) + '</span>' +
    '<span>📐 ' + escapeHtml(room.Area) + '</span>';

  renderAmenities(amenities);
  renderDetailGallery(room, name);
}

function renderDetailGallery(room, name) {
  const gallery = document.getElementById('detailGallery');
  if (!gallery) return;

  gallery.innerHTML = '';
  const images = getRoomGalleryImages(room);

  images.forEach(function (url, index) {
    const card = document.createElement('article');
    card.className = 'card';
    const loadingMode = index < 2 ? 'eager' : 'lazy';
    card.innerHTML = '<img src="' + escapeHtml(upgradeImageUrl(url, 1600)) + '" alt="' + escapeHtml(name) + '" loading="' + loadingMode + '" decoding="async">';
    gallery.appendChild(card);
  });
}

function renderAmenities(value) {
  const section = document.getElementById('amenitiesSection');
  const grid = document.getElementById('amenitiesGrid');
  if (!grid || !section) return;

  const items = splitAmenities(value);

  if (items.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  grid.innerHTML = '';

  items.forEach(function (item) {
    const badge = document.createElement('div');
    badge.className = 'meta';
    badge.innerHTML = '<span>✨ ' + escapeHtml(item) + '</span>';
    grid.appendChild(badge);
  });
}

document.addEventListener('DOMContentLoaded', loadApartment);
