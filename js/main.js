const I18N = {
  ka: {
    nav_rooms: 'ნომრები',
    nav_gallery: 'გალერეა',
    nav_videos: 'ვიდეო',
    nav_booking: 'დაჯავშნა',
    hero_rooms_btn: 'აპარტამენტების ნახვა',
    hero_booking_btn: 'დაჯავშნა',
    rooms_title: 'აპარტამენტების ტიპები',
    booking_title: 'დაჯავშნის მოთხოვნა',
    booking_text: 'აირჩიე ნომრის ტიპი და თარიღები. სისტემა შეამოწმებს ხელმისაწვდომობას და მოთხოვნას Google Sheets-ში ჩაწერს.',
    select_room_type: 'აირჩიე ნომრის ტიპი',
    name_placeholder: 'სახელი და გვარი',
    phone_placeholder: 'ტელეფონი',
    email_placeholder: 'ელფოსტა სურვილისამებრ',
    guests_placeholder: 'სტუმრები',
    message_placeholder: 'კომენტარი',
    send_request: 'მოთხოვნის გაგზავნა',
    gallery_title: 'გალერეა',
    videos_title: 'ვიდეოები',
    contact_title: 'კონტაქტი',
    phone_label: 'ტელეფონი',
    map_label: 'რუკაზე ნახვა',
    details_btn: 'მეტის ნახვა',
    book_btn: 'დაჯავშნა',
    sending: 'იგზავნება...',
    success: 'მოთხოვნა მიღებულია. დაჯავშნის ნომერი: '
  },
  en: {
    nav_rooms: 'Rooms',
    nav_gallery: 'Gallery',
    nav_videos: 'Videos',
    nav_booking: 'Booking',
    hero_rooms_btn: 'View Apartments',
    hero_booking_btn: 'Book Now',
    rooms_title: 'Apartment Types',
    booking_title: 'Booking Request',
    booking_text: 'Choose room type and dates. The system will check availability and save your request.',
    select_room_type: 'Select room type',
    name_placeholder: 'Full Name',
    phone_placeholder: 'Phone Number',
    email_placeholder: 'Email (optional)',
    guests_placeholder: 'Guests',
    message_placeholder: 'Message',
    send_request: 'Send Request',
    gallery_title: 'Gallery',
    videos_title: 'Videos',
    contact_title: 'Contact',
    phone_label: 'Phone',
    map_label: 'View on Map',
    details_btn: 'View Details',
    book_btn: 'Book',
    sending: 'Sending...',
    success: 'Request received. Booking ID: '
  },
  ru: {
    nav_rooms: 'Номера',
    nav_gallery: 'Галерея',
    nav_videos: 'Видео',
    nav_booking: 'Бронирование',
    hero_rooms_btn: 'Смотреть апартаменты',
    hero_booking_btn: 'Забронировать',
    rooms_title: 'Типы апартаментов',
    booking_title: 'Запрос на бронирование',
    booking_text: 'Выберите тип номера и даты. Система проверит доступность и сохранит заявку.',
    select_room_type: 'Выберите тип номера',
    name_placeholder: 'Имя и фамилия',
    phone_placeholder: 'Телефон',
    email_placeholder: 'Email (необязательно)',
    guests_placeholder: 'Гости',
    message_placeholder: 'Комментарий',
    send_request: 'Отправить запрос',
    gallery_title: 'Галерея',
    videos_title: 'Видео',
    contact_title: 'Контакты',
    phone_label: 'Телефон',
    map_label: 'Открыть карту',
    details_btn: 'Подробнее',
    book_btn: 'Забронировать',
    sending: 'Отправка...',
    success: 'Запрос получен. Номер бронирования: '
  }
};

const CURRENCY = {
  GEL: { symbol: '₾', rate: 1 },
  USD: { symbol: '$', rate: 0.37 },
  EUR: { symbol: '€', rate: 0.34 }
};

const DEFAULT_UNSPLASH_IMAGE = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';
const FALLBACK_ROOM_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#111827"/><text x="600" y="385" text-anchor="middle" fill="#f4d35e" font-family="Arial" font-size="44" font-weight="700">ფოტო არ არის ატვირთული</text><text x="600" y="445" text-anchor="middle" fill="#cbd5e1" font-family="Arial" font-size="26">ატვირთე ფოტო RoomTypes-ში MainImage ან GalleryImages ველში</text></svg>'
);

let CURRENT_LANG = localStorage.getItem('site_lang') || 'ka';
let CURRENT_CURRENCY = localStorage.getItem('site_currency') || 'GEL';
let LAST_ROOM_TYPES = [];
let GALLERY_ITEMS = [];
let GALLERY_INDEX = 0;
let GALLERY_TIMER = null;
let LIGHTBOX_OPEN = false;

function t(key) {
  return (I18N[CURRENT_LANG] && I18N[CURRENT_LANG][key]) || I18N.ka[key] || key;
}

function formatPriceGel(priceGel) {
  const currency = CURRENCY[CURRENT_CURRENCY] || CURRENCY.GEL;
  const amount = Math.round(Number(priceGel || 0) * currency.rate);
  return currency.symbol + amount.toLocaleString('ka-GE');
}

function applyExchangeRates(exchangeRates) {
  if (!exchangeRates || !exchangeRates.success || !exchangeRates.rates) return;
  if (Number(exchangeRates.rates.USD) > 0) CURRENCY.USD.rate = Number(exchangeRates.rates.USD);
  if (Number(exchangeRates.rates.EUR) > 0) CURRENCY.EUR.rate = Number(exchangeRates.rates.EUR);
  CURRENCY.GEL.rate = 1;
}

function setCurrency(currency) {
  CURRENT_CURRENCY = CURRENCY[currency] ? currency : 'GEL';
  localStorage.setItem('site_currency', CURRENT_CURRENCY);

  document.querySelectorAll('.currency-switcher button').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.currency === CURRENT_CURRENCY);
  });

  if (LAST_ROOM_TYPES.length) {
    renderRoomTypes(LAST_ROOM_TYPES);
    populateBookingRoomTypes(LAST_ROOM_TYPES);
  }
}

function initCurrencySwitcher() {
  document.querySelectorAll('.currency-switcher button').forEach(function (btn) {
    btn.addEventListener('click', function () { setCurrency(this.dataset.currency); });
  });
  setCurrency(CURRENT_CURRENCY);
}

function setLanguage(lang) {
  CURRENT_LANG = I18N[lang] ? lang : CURRENT_LANG;
  localStorage.setItem('site_lang', CURRENT_LANG);
  document.documentElement.lang = CURRENT_LANG;

  document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('.language-switcher button[data-lang]').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.lang === CURRENT_LANG);
  });
}

function initLanguageSwitcher() {
  document.querySelectorAll('.language-switcher button[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLanguage(this.dataset.lang);
      if (LAST_ROOM_TYPES.length) {
        renderRoomTypes(LAST_ROOM_TYPES);
        populateBookingRoomTypes(LAST_ROOM_TYPES);
      }
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

function getYouTubeEmbedUrl(url) {
  const text = String(url || '');
  const match = text.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match ? 'https://www.youtube.com/embed/' + match[1] : '';
}

function getLocalizedField(item, baseName) {
  const suffix = '_' + CURRENT_LANG.toUpperCase();
  return item[baseName + suffix] || item[baseName] || '';
}

function normalizeImageUrl(url) {
  let text = String(url || '').trim();
  if (!text) return '';

  text = text.replace(/&amp;/g, '&');

  if (/drive\.google\.com\/thumbnail\?/i.test(text)) {
    return text;
  }

  const driveFileMatch = text.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  const driveIdMatch = text.match(/[?&]id=([A-Za-z0-9_-]{20,})/);
  const driveId = driveFileMatch ? driveFileMatch[1] : (driveIdMatch ? driveIdMatch[1] : '');

  if (driveId && /drive\.google\.com/i.test(text)) {
    return 'https://drive.google.com/thumbnail?id=' + driveId + '&sz=w1600';
  }

  return /^https?:\/\//i.test(text) ? text : '';
}

function splitImageList(value) {
  const text = String(value || '');
  const urls = text.match(/https?:\/\/[^\s,;|]+/gi) || [];
  return urls.map(normalizeImageUrl).filter(Boolean);
}

function isDefaultImage(url) {
  const text = String(url || '');
  return text.indexOf('images.unsplash.com/photo-1505693416388') !== -1;
}

function addImageCandidate(images, value) {
  splitImageList(value).forEach(function (url) {
    if (images.indexOf(url) === -1) images.push(url);
  });
}

function getRoomImages(item) {
  const images = [];

  ['MainImage', 'ImageUrl', 'ImageURL', 'Photo', 'PhotoUrl', 'PhotoURL', 'GalleryImages'].forEach(function (key) {
    addImageCandidate(images, item[key]);
  });

  Object.keys(item || {}).forEach(function (key) {
    const lower = key.toLowerCase();
    if (lower.indexOf('image') !== -1 || lower.indexOf('photo') !== -1 || lower.indexOf('url') !== -1) {
      if (lower.indexOf('youtube') === -1 && lower.indexOf('video') === -1 && lower.indexOf('map') === -1) {
        addImageCandidate(images, item[key]);
      }
    }
  });

  const uploadedImages = images.filter(function (url) { return !isDefaultImage(url); });
  return uploadedImages.length ? uploadedImages : images;
}

function getRoomMainImage(item) {
  return getRoomImages(item)[0] || FALLBACK_ROOM_IMAGE;
}

async function loadSite() {
  const savedTheme = localStorage.getItem('theme') || CONFIG.DEFAULT_THEME;
  setTheme(savedTheme);
  if (!CONFIG.GOOGLE_SCRIPT_URL) return;

  const responses = await Promise.all([
    apiGet('settings'),
    apiGet('roomTypes'),
    apiGet('gallery'),
    apiGet('videos'),
    apiGet('exchangeRates')
  ]);

  const settings = responses[0].data || {};
  const roomTypes = responses[1].data || [];
  const gallery = responses[2].data || [];
  const videos = responses[3].data || [];
  const exchangeRates = responses[4] || {};

  applyExchangeRates(exchangeRates);

  LAST_ROOM_TYPES = roomTypes;
  renderSettings(settings);
  renderRoomTypes(roomTypes);
  populateBookingRoomTypes(roomTypes);
  renderGallery(gallery);
  renderVideos(videos);
  setupBookingForm();
  setLanguage(CURRENT_LANG);
  setCurrency(CURRENT_CURRENCY);
}

function renderSettings(settings) {
  document.title = settings.site_title || 'Mamu Luxury Apartments';
  document.getElementById('siteTitle').textContent = settings.site_title || 'Mamu Luxury Apartments';
  document.getElementById('heroTitle').textContent = settings.hero_title || 'Mamu Luxury Apartments';
  document.getElementById('heroSubtitle').textContent = settings.hero_subtitle || '';

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

  items.forEach(function (item) {
    const article = document.createElement('article');
    article.className = 'card';

    const image = getRoomMainImage(item);
    const detailUrl = 'apartment.html?id=' + encodeURIComponent(item.TypeID);
    const name = getLocalizedField(item, 'Name');
    const shortDescription = getLocalizedField(item, 'ShortDescription');

    article.innerHTML =
      '<a class="card-image-link" href="' + detailUrl + '" aria-label="' + safeText(name) + '">' +
        '<img src="' + safeText(image) + '" alt="' + safeText(name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + FALLBACK_ROOM_IMAGE + '\';">' +
      '</a>' +
      '<div class="card-content">' +
        '<h3>' + safeText(name) + '</h3>' +
        '<p>' + safeText(shortDescription) + '</p>' +
        '<div class="meta">' +
          '<span>👥 ' + safeText(item.Guests) + '</span>' +
          '<span>🛏️ ' + safeText(item.Bedrooms) + '</span>' +
          '<span>🛁 ' + safeText(item.Bathrooms) + '</span>' +
        '</div>' +
        '<h4>' + formatPriceGel(item.Price) + '</h4>' +
        '<div class="card-actions">' +
          '<a class="ghost-btn small-btn" href="' + detailUrl + '">' + t('details_btn') + '</a>' +
          '<a class="liquid-btn small-btn" href="#booking" onclick="selectRoomType(\'' + safeText(item.TypeID) + '\')">' + t('book_btn') + '</a>' +
        '</div>' +
      '</div>';

    container.appendChild(article);
  });
}

function selectRoomType(typeId) {
  const select = document.getElementById('bookingRoomType');
  if (select) select.value = typeId;
}

function populateBookingRoomTypes(items) {
  const select = document.getElementById('bookingRoomType');
  if (!select) return;

  select.innerHTML = '<option value="">' + t('select_room_type') + '</option>';

  items.forEach(function (item) {
    const option = document.createElement('option');
    option.value = item.TypeID;
    option.textContent = getLocalizedField(item, 'Name') + ' — ' + formatPriceGel(item.Price);
    select.appendChild(option);
  });
}

function renderGallery(items) {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  injectGalleryCarouselStyles();
  stopGalleryAuto();
  container.innerHTML = '';

  GALLERY_ITEMS = (items || [])
    .map(function (item) {
      return {
        title: item.Title || 'Gallery photo',
        url: normalizeImageUrl(item.ImageUrl),
        sort: Number(item.SortOrder || 999999)
      };
    })
    .filter(function (item) { return item.url; })
    .sort(function (a, b) { return a.sort - b.sort; });

  GALLERY_INDEX = 0;

  if (!GALLERY_ITEMS.length) {
    container.innerHTML = '<div class="empty-state">გალერეის ფოტოები ჯერ არ არის.</div>';
    return;
  }

  container.innerHTML =
    '<div class="gallery-carousel" id="galleryCarousel">' +
      '<div class="gallery-main-frame" id="galleryMainFrame" onclick="openGalleryLightbox(GALLERY_INDEX)">' +
        '<img id="galleryCarouselImage" src="" alt="Gallery" loading="lazy">' +
        '<div class="gallery-gradient"></div>' +
        '<div class="gallery-counter" id="galleryCounter"></div>' +
      '</div>' +
      '<button type="button" class="gallery-nav-btn gallery-prev" onclick="galleryPrev(true)" aria-label="Previous">‹</button>' +
      '<button type="button" class="gallery-nav-btn gallery-next" onclick="galleryNext(true)" aria-label="Next">›</button>' +
      '<div class="gallery-thumbs" id="galleryThumbs"></div>' +
    '</div>';

  updateGalleryCarousel();
  startGalleryAuto();
}

function updateGalleryCarousel() {
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
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  updateGalleryLightbox();
}

function galleryGoTo(index, manual) {
  if (!GALLERY_ITEMS.length) return;
  GALLERY_INDEX = (index + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
  updateGalleryCarousel();
  if (manual) restartGalleryAuto();
}

function galleryNext(manual) {
  galleryGoTo(GALLERY_INDEX + 1, manual);
}

function galleryPrev(manual) {
  galleryGoTo(GALLERY_INDEX - 1, manual);
}

function startGalleryAuto() {
  stopGalleryAuto();
  if (GALLERY_ITEMS.length <= 1 || LIGHTBOX_OPEN) return;
  GALLERY_TIMER = setInterval(function () {
    galleryNext(false);
  }, 4200);
}

function stopGalleryAuto() {
  if (GALLERY_TIMER) clearInterval(GALLERY_TIMER);
  GALLERY_TIMER = null;
}

function restartGalleryAuto() {
  stopGalleryAuto();
  startGalleryAuto();
}

function ensureGalleryLightbox() {
  let lightbox = document.getElementById('galleryLightbox');
  if (lightbox) return lightbox;

  lightbox = document.createElement('div');
  lightbox.id = 'galleryLightbox';
  lightbox.className = 'gallery-lightbox';
  lightbox.innerHTML =
    '<button type="button" class="lightbox-close" onclick="closeGalleryLightbox()" aria-label="Close">×</button>' +
    '<button type="button" class="lightbox-arrow lightbox-prev" onclick="galleryPrev(true)" aria-label="Previous">‹</button>' +
    '<img id="lightboxImage" src="" alt="Gallery enlarged photo">' +
    '<button type="button" class="lightbox-arrow lightbox-next" onclick="galleryNext(true)" aria-label="Next">›</button>' +
    '<div class="lightbox-counter" id="lightboxCounter"></div>';

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) closeGalleryLightbox();
  });

  document.body.appendChild(lightbox);
  return lightbox;
}

function openGalleryLightbox(index) {
  if (!GALLERY_ITEMS.length) return;
  GALLERY_INDEX = index;
  LIGHTBOX_OPEN = true;
  stopGalleryAuto();

  const lightbox = ensureGalleryLightbox();
  lightbox.classList.add('open');
  document.body.classList.add('no-scroll');

  updateGalleryCarousel();
  updateGalleryLightbox();
}

function closeGalleryLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  if (lightbox) lightbox.classList.remove('open');
  LIGHTBOX_OPEN = false;
  document.body.classList.remove('no-scroll');
  startGalleryAuto();
}

function updateGalleryLightbox() {
  if (!LIGHTBOX_OPEN || !GALLERY_ITEMS.length) return;

  const item = GALLERY_ITEMS[GALLERY_INDEX];
  const image = document.getElementById('lightboxImage');
  const counter = document.getElementById('lightboxCounter');

  if (image) {
    image.src = item.url;
    image.alt = item.title;
  }

  if (counter) counter.textContent = (GALLERY_INDEX + 1) + ' / ' + GALLERY_ITEMS.length;
}

function bindGalleryKeyboard() {
  document.addEventListener('keydown', function (event) {
    if (!LIGHTBOX_OPEN) return;
    if (event.key === 'Escape') closeGalleryLightbox();
    if (event.key === 'ArrowRight') galleryNext(true);
    if (event.key === 'ArrowLeft') galleryPrev(true);
  });
}

function injectGalleryCarouselStyles() {
  if (document.getElementById('galleryCarouselStyles')) return;

  const style = document.createElement('style');
  style.id = 'galleryCarouselStyles';
  style.textContent = `
    .gallery-grid{display:block}.gallery-carousel{position:relative;width:100%;border:1px solid var(--border);background:linear-gradient(145deg,var(--card),rgba(255,255,255,.035));border-radius:34px;padding:18px;box-shadow:var(--shadow);overflow:hidden}.gallery-main-frame{position:relative;width:100%;aspect-ratio:16/9;border-radius:26px;overflow:hidden;background:rgba(0,0,0,.26);cursor:zoom-in}.gallery-main-frame img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transform:scale(1.015);transition:opacity .34s ease,transform .5s ease}.gallery-main-frame img.is-visible{opacity:1;transform:scale(1)}.gallery-gradient{position:absolute;inset:0;background:linear-gradient(180deg,transparent 62%,rgba(0,0,0,.45));pointer-events:none}.gallery-counter,.lightbox-counter{position:absolute;right:18px;bottom:18px;padding:9px 14px;border-radius:999px;background:rgba(7,16,31,.72);border:1px solid rgba(255,255,255,.18);color:#fff;font-weight:900;backdrop-filter:blur(14px)}.gallery-nav-btn{position:absolute;top:calc(50% - 34px);z-index:4;width:58px;height:58px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(7,16,31,.68);color:#fff;font-size:48px;line-height:1;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(16px);transition:.22s ease}.gallery-nav-btn:hover{transform:translateY(-2px) scale(1.04);background:linear-gradient(135deg,var(--gold2),var(--gold));color:#111827}.gallery-prev{left:30px}.gallery-next{right:30px}.gallery-thumbs{display:flex;gap:12px;overflow-x:auto;padding:16px 4px 2px;scrollbar-width:thin}.gallery-thumb{flex:0 0 112px;height:76px;border:2px solid transparent;border-radius:16px;overflow:hidden;padding:0;background:transparent;cursor:pointer;opacity:.68;transition:.22s ease}.gallery-thumb img{width:100%;height:100%;object-fit:cover;display:block}.gallery-thumb.active{opacity:1;border-color:var(--gold);box-shadow:0 10px 28px rgba(212,175,55,.25)}.gallery-thumb:hover{opacity:1;transform:translateY(-2px)}.gallery-lightbox{position:fixed;inset:0;z-index:5000;display:none;align-items:center;justify-content:center;background:rgba(2,6,23,.92);backdrop-filter:blur(16px);padding:34px}.gallery-lightbox.open{display:flex}.gallery-lightbox img{max-width:min(1180px,92vw);max-height:86vh;width:auto;height:auto;border-radius:24px;object-fit:contain;box-shadow:0 28px 90px rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.14)}.lightbox-close{position:fixed;top:22px;right:24px;width:52px;height:52px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.1);color:#fff;font-size:34px;cursor:pointer;z-index:5002}.lightbox-arrow{position:fixed;top:50%;transform:translateY(-50%);width:64px;height:64px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.1);color:#fff;font-size:54px;line-height:1;display:grid;place-items:center;cursor:pointer;z-index:5002}.lightbox-prev{left:24px}.lightbox-next{right:24px}.lightbox-close:hover,.lightbox-arrow:hover{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#111827}.lightbox-counter{position:fixed;left:50%;right:auto;bottom:26px;transform:translateX(-50%)}.no-scroll{overflow:hidden}@media(max-width:820px){.gallery-carousel{border-radius:24px;padding:10px}.gallery-main-frame{aspect-ratio:4/3;border-radius:18px}.gallery-nav-btn{width:44px;height:44px;font-size:34px;top:calc(50% - 26px)}.gallery-prev{left:16px}.gallery-next{right:16px}.gallery-thumb{flex-basis:78px;height:56px;border-radius:12px}.gallery-lightbox{padding:18px}.lightbox-arrow{width:48px;height:48px;font-size:38px}.lightbox-prev{left:10px}.lightbox-next{right:10px}.lightbox-close{top:12px;right:12px;width:46px;height:46px}.gallery-lightbox img{max-width:94vw;max-height:78vh;border-radius:18px}}
  `;

  document.head.appendChild(style);
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
    card.innerHTML = '<iframe src="' + embedUrl + '" title="' + safeText(item.Title) + '" allowfullscreen></iframe>';
    container.appendChild(card);
  });
}

function setupBookingForm() {
  const form = document.getElementById('bookingForm');
  const status = document.getElementById('bookingStatus');
  if (!form || form.dataset.ready === 'true') return;

  form.dataset.ready = 'true';

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    status.textContent = t('sending');

    const data = Object.fromEntries(new FormData(form).entries());
    data.language = CURRENT_LANG;
    data.currency = CURRENT_CURRENCY;

    const result = await apiPost('createBooking', data);

    if (result.success) {
      status.textContent = t('success') + result.bookingId;
      form.reset();
    } else {
      status.textContent = result.error || 'Error.';
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  bindGalleryKeyboard();
  initLanguageSwitcher();
  initCurrencySwitcher();
  loadSite();
});