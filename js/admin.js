function $(id) {
  return document.getElementById(id);
}

function showLogin() {
  $('loginScreen').classList.remove('hidden');
  $('dashboardScreen').classList.add('hidden');
}

function showDashboard() {
  $('loginScreen').classList.add('hidden');
  $('dashboardScreen').classList.remove('hidden');
}

function saveSession(user) {
  localStorage.setItem('mla_admin', JSON.stringify(user));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('mla_admin') || 'null');
  } catch (error) {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('mla_admin');
}

function safe(value) {
  return String(value || '').replace(/[&<>]/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char];
  });
}

async function login(username, password) {
  return apiPost('adminLogin', { username, password });
}

async function loadDashboard() {
  const panel = $('mainPanel');
  const stats = $('statsGrid');
  panel.textContent = 'იტვირთება...';

  const [bookingsRes, roomsRes] = await Promise.all([
    apiGet('bookings'),
    apiGet('rooms')
  ]);

  const bookings = bookingsRes.data || [];
  const rooms = roomsRes.data || [];
  const newBookings = bookings.filter(function (booking) {
    return String(booking.Status || '') === 'New';
  }).length;
  const confirmedBookings = bookings.filter(function (booking) {
    return String(booking.Status || '') === 'Confirmed';
  }).length;

  stats.innerHTML =
    '<div class="stats-card"><span class="eyebrow">Bookings</span><h3>' + bookings.length + '</h3><p>სულ ჯავშნები</p></div>' +
    '<div class="stats-card"><span class="eyebrow">New</span><h3>' + newBookings + '</h3><p>ახალი მოთხოვნები</p></div>' +
    '<div class="stats-card"><span class="eyebrow">Confirmed</span><h3>' + confirmedBookings + '</h3><p>დადასტურებული</p></div>' +
    '<div class="stats-card"><span class="eyebrow">Rooms</span><h3>' + rooms.length + '</h3><p>სულ ნომრები</p></div>';

  panel.innerHTML = '<h3>ბოლო ჯავშნები</h3>' + renderBookingsTable(bookings.slice(-8).reverse(), true);
}

async function loadBookings() {
  const panel = $('mainPanel');
  const stats = $('statsGrid');
  panel.textContent = 'ჯავშნები იტვირთება...';
  stats.innerHTML = '';

  const response = await apiGet('bookings');
  const bookings = response.data || [];

  panel.innerHTML =
    '<div class="panel-title-row">' +
      '<div><h3>ჯავშნების მართვა</h3><p>აქ ჩანს საიტიდან შემოსული ყველა მოთხოვნა.</p></div>' +
    '</div>' +
    renderBookingsTable(bookings.reverse(), false);
}

function renderBookingsTable(bookings, compact) {
  if (!bookings.length) {
    return '<div class="empty-state">ჯავშნები ჯერ არ არის.</div>';
  }

  const rows = bookings.map(function (booking) {
    const phone = String(booking.Phone || '').replace(/\D/g, '');
    const whatsapp = phone ? '<a class="table-link" href="https://wa.me/' + phone + '" target="_blank">WhatsApp</a>' : '-';
    const statusClass = 'status-' + String(booking.Status || 'New').toLowerCase();

    return '<tr>' +
      '<td><strong>' + safe(booking.BookingID) + '</strong></td>' +
      '<td>' + safe(booking.GuestName) + '<br><small>' + safe(booking.Phone) + '</small></td>' +
      '<td>' + safe(booking.RoomTypeName) + '</td>' +
      '<td>' + safe(booking.CheckIn) + '<br><small>' + safe(booking.CheckOut) + '</small></td>' +
      '<td>' + safe(booking.Guests) + '</td>' +
      '<td><span class="status-pill ' + statusClass + '">' + safe(booking.Status || 'New') + '</span></td>' +
      (compact ? '' : '<td>' + whatsapp + '</td>') +
    '</tr>';
  }).join('');

  return '<div class="table-wrap"><table class="admin-table"><thead><tr>' +
    '<th>ID</th><th>სტუმარი</th><th>ტიპი</th><th>თარიღები</th><th>სტუმრები</th><th>სტატუსი</th>' +
    (compact ? '' : '<th>კავშირი</th>') +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

async function loadRooms() {
  $('statsGrid').innerHTML = '';
  $('mainPanel').innerHTML = '<h3>Rooms</h3><p>ნომრების მართვა დაემატება შემდეგ ნაბიჯში.</p>';
}

async function loadCalendar() {
  $('statsGrid').innerHTML = '';
  $('mainPanel').innerHTML = '<h3>Calendar</h3><p>20 ნომრის კალენდარი დაემატება შემდეგ ნაბიჯებში.</p>';
}

async function loadSettings() {
  $('statsGrid').innerHTML = '';
  $('mainPanel').innerHTML = '<h3>Settings</h3><p>საიტის პარამეტრების რედაქტირება დაემატება შემდეგ ნაბიჯში.</p>';
}

function loadView(view) {
  if (view === 'bookings') return loadBookings();
  if (view === 'rooms') return loadRooms();
  if (view === 'calendar') return loadCalendar();
  if (view === 'settings') return loadSettings();
  return loadDashboard();
}

function bindEvents() {
  $('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const status = $('loginStatus');
    status.textContent = 'მოწმდება...';

    const data = Object.fromEntries(new FormData(this).entries());
    const result = await login(data.username, data.password);

    if (result.success) {
      saveSession({ username: data.username });
      showDashboard();
      loadDashboard();
    } else {
      status.textContent = result.error || 'არასწორი მონაცემები';
    }
  });

  $('logoutBtn').addEventListener('click', function () {
    clearSession();
    showLogin();
  });

  $('refreshBtn').addEventListener('click', function () {
    const activeButton = document.querySelector('.nav-btn.active');
    loadView(activeButton ? activeButton.dataset.view : 'dashboard');
  });

  document.querySelectorAll('.nav-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('.nav-btn').forEach(function (btn) {
        btn.classList.remove('active');
      });

      this.classList.add('active');
      $('panelTitle').textContent = this.textContent;
      loadView(this.dataset.view);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  bindEvents();

  if (getSession()) {
    showDashboard();
    loadDashboard();
  } else {
    showLogin();
  }
});
