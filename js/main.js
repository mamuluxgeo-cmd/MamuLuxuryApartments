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

  renderSettings(settings);
  renderRoomTypes(roomTypes);
  populateBookingRoomTypes(roomTypes);
  renderGallery(gallery);
  renderVideos(videos);
  setupBookingForm();
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

    const image = item.MainImage || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

    article.innerHTML =
      '<img src="' + safeText(image) + '" alt="' + safeText(item.Name) + '">' +
      '<div class="card-content">' +
        '<h3>' + safeText(item.Name) + '</h3>' +
        '<p>' + safeText(item.ShortDescription) + '</p>' +
        '<div class="meta">' +
          '<span>👥 ' + safeText(item.Guests) + '</span>' +
          '<span>🛏️ ' + safeText(item.Bedrooms) + '</span>' +
          '<span>🛁 ' + safeText(item.Bathrooms) + '</span>' +
        '</div>' +
        '<h4>₾' + safeText(item.Price) + '</h4>' +
      '</div>';

    container.appendChild(article);
  });
}

function populateBookingRoomTypes(items) {
  const select = document.getElementById('bookingRoomType');
  if (!select) return;

  items.forEach(function (item) {
    const option = document.createElement('option');
    option.value = item.TypeID;
    option.textContent = item.Name + ' — ₾' + item.Price;
    select.appendChild(option);
  });
}

function renderGallery(items) {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  container.innerHTML = '';

  items.slice(0, 8).forEach(function (item) {
    if (!item.ImageUrl) return;
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = '<img src="' + safeText(item.ImageUrl) + '" alt="' + safeText(item.Title) + '">';
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
    status.textContent = 'იგზავნება...';

    const data = Object.fromEntries(new FormData(form).entries());
    const result = await apiPost('createBooking', data);

    if (result.success) {
      status.textContent = 'მოთხოვნა მიღებულია. დაჯავშნის ნომერი: ' + result.bookingId;
      form.reset();
    } else {
      status.textContent = result.error || 'დაფიქსირდა შეცდომა.';
    }
  });
}

document.addEventListener('DOMContentLoaded', loadSite);
