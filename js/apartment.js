const APARTMENT_I18N = {
  ka: {
    nav_rooms: 'ნომრები',
    nav_gallery: 'გალერეა',
    nav_booking: 'დაჯავშნა',
    book_btn: 'დაჯავშნა',
    check_availability: 'შეამოწმე ხელმისაწვდომობა',
    amenities_title: 'კომფორტები',
    gallery_title: 'ფოტოები',
    choose_dates: 'აირჩიე თარიღები',
    choose_dates_text: 'შესვლის და გასვლის თარიღი აუცილებელია.',
    checking: 'მოწმდება...',
    checking_text: 'ვუკავშირდებით კალენდარს.',
    available: 'თავისუფალია ✅',
    unavailable: 'დაკავებულია ❌',
    available_text: 'ხელმისაწვდომია {count} ნომერი ამ თარიღებში.',
    unavailable_text: 'ამ თარიღებში ეს ტიპი დაკავებულია. სცადე სხვა თარიღი.',
    sending: 'იგზავნება...',
    success: 'მოთხოვნა მიღებულია. დაჯავშნის ნომერი: ',
    error: 'დაფიქსირდა შეცდომა.'
  },
  en: {
    nav_rooms: 'Rooms',
    nav_gallery: 'Gallery',
    nav_booking: 'Booking',
    book_btn: 'Book',
    check_availability: 'Check Availability',
    amenities_title: 'Amenities',
    gallery_title: 'Gallery',
    choose_dates: 'Choose dates',
    choose_dates_text: 'Check-in and check-out dates are required.',
    checking: 'Checking...',
    checking_text: 'Connecting to the calendar.',
    available: 'Available ✅',
    unavailable: 'Unavailable ❌',
    available_text: '{count} room(s) are available for these dates.',
    unavailable_text: 'This apartment type is unavailable for these dates. Try different dates.',
    sending: 'Sending...',
    success: 'Request received. Booking ID: ',
    error: 'Something went wrong.'
  },
  ru: {
    nav_rooms: 'Номера',
    nav_gallery: 'Галерея',
    nav_booking: 'Бронирование',
    book_btn: 'Забронировать',
    check_availability: 'Проверить доступность',
    amenities_title: 'Удобства',
    gallery_title: 'Фотографии',
    choose_dates: 'Выберите даты',
    choose_dates_text: 'Дата заезда и выезда обязательны.',
    checking: 'Проверяем...',
    checking_text: 'Подключаемся к календарю.',
    available: 'Доступно ✅',
    unavailable: 'Занято ❌',
    available_text: 'Доступно номеров: {count} на эти даты.',
    unavailable_text: 'Этот тип апартамента недоступен на эти даты. Попробуйте другие даты.',
    sending: 'Отправка...',
    success: 'Запрос получен. Номер бронирования: ',
    error: 'Произошла ошибка.'
  }
};

let CURRENT_LANG = localStorage.getItem('site_lang') || 'ka';
let CURRENT_ROOM = null;

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

function splitGallery(value) {
  return String(value || '').split(',').map(function (v) { return v.trim(); }).filter(Boolean);
}

function splitAmenities(value) {
  return String(value || '').split(',').map(function (v) { return v.trim(); }).filter(Boolean);
}

function getLocalizedField(item, baseName) {
  const suffix = '_' + CURRENT_LANG.toUpperCase();
  return item[baseName + suffix] || item[baseName] || '';
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

  const roomTypeId = qs('id') || 'TYPE-A';
  const response = await apiGet('roomTypes');
  const items = response.data || [];
  const room = items.find(function (item) {
    return String(item.TypeID) === String(roomTypeId);
  });

  if (!room) return;

  CURRENT_ROOM = room;
  renderRoom(room);
  setupBookingForm(room.TypeID);
  setupAvailabilityCheck(room.TypeID);
}

function renderRoom(room) {
  const name = getLocalizedField(room, 'Name');
  const category = getLocalizedField(room, 'Category') || 'Apartment';
  const fullDescription = getLocalizedField(room, 'FullDescription');
  const shortDescription = getLocalizedField(room, 'ShortDescription');
  const amenities = getLocalizedField(room, 'Amenities');

  document.title = name + ' — Mamu Luxury Apartments';
  document.getElementById('roomCategory').textContent = category;
  document.getElementById('roomName').textContent = name;
  document.getElementById('roomDescription').textContent = fullDescription || shortDescription || '';
  document.getElementById('roomMainImage').src = room.MainImage || document.getElementById('roomMainImage').src;
  document.getElementById('detailRoomTypeId').value = room.TypeID;
  document.getElementById('roomMeta').innerHTML =
    '<span>👥 ' + escapeHtml(room.Guests) + '</span>' +
    '<span>🛏️ ' + escapeHtml(room.Bedrooms) + '</span>' +
    '<span>🛁 ' + escapeHtml(room.Bathrooms) + '</span>' +
    '<span>📐 ' + escapeHtml(room.Area) + '</span>' +
    '<span>💎 ₾' + escapeHtml(room.Price) + '</span>';

  renderAmenities(amenities);

  const gallery = document.getElementById('detailGallery');
  gallery.innerHTML = '';
  const images = [room.MainImage].concat(splitGallery(room.GalleryImages));

  images.filter(Boolean).forEach(function (url) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(name) + '">';
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

function setupAvailabilityCheck(roomTypeId) {
  const button = document.getElementById('checkAvailabilityBtn');
  const box = document.getElementById('availabilityBox');
  const checkin = document.getElementById('detailCheckin');
  const checkout = document.getElementById('detailCheckout');

  if (!button || !box || !checkin || !checkout) return;

  button.textContent = tr('check_availability');

  button.addEventListener('click', async function () {
    if (!checkin.value || !checkout.value) {
      box.innerHTML = '<strong>' + tr('choose_dates') + '</strong><span>' + tr('choose_dates_text') + '</span>';
      box.className = 'calendar-preview warning';
      return;
    }

    box.innerHTML = '<strong>' + tr('checking') + '</strong><span>' + tr('checking_text') + '</span>';
    box.className = 'calendar-preview';

    const result = await apiGet('availability', {
      roomTypeId: roomTypeId,
      checkin: checkin.value,
      checkout: checkout.value
    });

    if (result.success && result.available) {
      box.innerHTML = '<strong>' + tr('available') + '</strong><span>' + tr('available_text').replace('{count}', result.count) + '</span>';
      box.className = 'calendar-preview available';
    } else {
      box.innerHTML = '<strong>' + tr('unavailable') + '</strong><span>' + tr('unavailable_text') + '</span>';
      box.className = 'calendar-preview unavailable';
    }
  });
}

function setupBookingForm(roomTypeId) {
  const form = document.getElementById('detailBookingForm');
  const status = document.getElementById('detailBookingStatus');
  if (!form || form.dataset.ready === 'true') return;

  form.dataset.ready = 'true';

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    status.textContent = tr('sending');

    const data = Object.fromEntries(new FormData(form).entries());
    data.roomTypeId = roomTypeId;
    data.language = CURRENT_LANG;

    const result = await apiPost('createBooking', data);

    if (result.success) {
      status.textContent = tr('success') + result.bookingId;
      form.reset();
      document.getElementById('detailRoomTypeId').value = roomTypeId;
    } else {
      status.textContent = result.error || tr('error');
    }
  });
}

document.addEventListener('DOMContentLoaded', loadApartment);
