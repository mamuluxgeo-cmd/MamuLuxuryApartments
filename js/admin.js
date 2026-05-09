let ADMIN_ROOMS = [];

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

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function overlaps(startA, endA, startB, endB) {
  if (!startA || !endA || !startB || !endB) return false;
  return new Date(startA) < new Date(endB) && new Date(startB) < new Date(endA);
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
  ADMIN_ROOMS = rooms;

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

  const [bookingsRes, roomsRes] = await Promise.all([
    apiGet('bookings'),
    apiGet('rooms')
  ]);

  const bookings = bookingsRes.data || [];
  ADMIN_ROOMS = roomsRes.data || [];

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
    const roomSelect = compact ? '' : renderRoomSelect(booking);
    const actions = compact ? '' : '<td><div class="row-actions">' +
      '<button onclick="assignRoom(\'' + safe(booking.BookingID) + '\', \'room-' + safe(booking.BookingID) + '\', \'Confirmed\')">Assign + Confirm</button>' +
      '<button onclick="changeBookingStatus(\'' + safe(booking.BookingID) + '\', \'Cancelled\')">Cancel</button>' +
      '<button onclick="changeBookingStatus(\'' + safe(booking.BookingID) + '\', \'CheckedIn\')">Check In</button>' +
      '<button onclick="changeBookingStatus(\'' + safe(booking.BookingID) + '\', \'CheckedOut\')">Check Out</button>' +
    '</div></td>';

    return '<tr>' +
      '<td><strong>' + safe(booking.BookingID) + '</strong></td>' +
      '<td>' + safe(booking.GuestName) + '<br><small>' + safe(booking.Phone) + '</small></td>' +
      '<td>' + safe(booking.RoomTypeName) + '<br><small>' + safe(booking.RoomTypeID) + '</small></td>' +
      '<td>' + safe(booking.CheckIn) + '<br><small>' + safe(booking.CheckOut) + '</small></td>' +
      '<td>' + safe(booking.Guests) + '</td>' +
      '<td>' + (booking.RoomNumber ? '<strong>' + safe(booking.RoomNumber) + '</strong>' : roomSelect) + '</td>' +
      '<td><span class="status-pill ' + statusClass + '">' + safe(booking.Status || 'New') + '</span></td>' +
      (compact ? '' : '<td>' + whatsapp + '</td>') +
      actions +
    '</tr>';
  }).join('');

  return '<div class="table-wrap"><table class="admin-table"><thead><tr>' +
    '<th>ID</th><th>სტუმარი</th><th>ტიპი</th><th>თარიღები</th><th>სტუმრები</th><th>ნომერი</th><th>სტატუსი</th>' +
    (compact ? '' : '<th>კავშირი</th><th>მოქმედება</th>') +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function renderRoomSelect(booking) {
  const filteredRooms = ADMIN_ROOMS.filter(function (room) {
    return String(room.TypeID) === String(booking.RoomTypeID) && String(room.Status) === 'Active';
  });

  if (!filteredRooms.length) {
    return '<small>ამ ტიპის ნომერი ვერ მოიძებნა</small>';
  }

  const options = filteredRooms.map(function (room) {
    return '<option value="' + safe(room.RoomID) + '">' + safe(room.RoomNumber) + ' / ' + safe(room.TypeID) + '</option>';
  }).join('');

  return '<select class="room-select" id="room-' + safe(booking.BookingID) + '"><option value="">აირჩიე ნომერი</option>' + options + '</select>';
}

async function assignRoom(bookingId, selectId, status) {
  const select = document.getElementById(selectId);
  if (!select || !select.value) {
    alert('ჯერ აირჩიე ნომერი');
    return;
  }

  const booking = await findBookingById(bookingId);
  if (!booking) {
    alert('ჯავშანი ვერ მოიძებნა');
    return;
  }

  const result = await apiPost('assignRoomToBooking', {
    bookingId: bookingId,
    roomId: select.value,
    checkin: booking.CheckIn,
    checkout: booking.CheckOut,
    status: status || 'Confirmed'
  });

  if (result.success) {
    loadBookings();
  } else {
    alert(result.error || 'ნომრის მინიჭება ვერ მოხერხდა');
  }
}

async function findBookingById(bookingId) {
  const response = await apiGet('bookings');
  const bookings = response.data || [];
  return bookings.find(function (booking) {
    return String(booking.BookingID) === String(bookingId);
  });
}

async function changeBookingStatus(bookingId, status) {
  const result = await apiPost('updateBookingStatus', {
    bookingId: bookingId,
    status: status
  });

  if (result.success) {
    loadBookings();
  } else {
    alert(result.error || 'სტატუსის შეცვლა ვერ მოხერხდა');
  }
}

async function loadRooms() {
  $('statsGrid').innerHTML = '';
  $('mainPanel').innerHTML = '<h3>Rooms</h3><p>ნომრების მართვა დაემატება შემდეგ ნაბიჯში.</p>';
}

async function loadCalendar() {
  $('statsGrid').innerHTML = '';
  const panel = $('mainPanel');
  panel.textContent = 'კალენდარი იტვირთება...';

  const startDate = new Date();
  const endDate = addDays(startDate, 14);
  const [calendarRes, roomsRes] = await Promise.all([
    apiGet('calendar', { start: toIsoDate(startDate), end: toIsoDate(endDate) }),
    apiGet('rooms')
  ]);

  const rooms = calendarRes.rooms || roomsRes.data || [];
  const bookings = calendarRes.bookings || [];
  const blocks = calendarRes.blocks || [];
  ADMIN_ROOMS = roomsRes.data || rooms;
  const dates = [];

  for (let i = 0; i < 14; i++) {
    dates.push(toIsoDate(addDays(startDate, i)));
  }

  panel.innerHTML =
    '<div class="panel-title-row">' +
      '<div><h3>14 დღის კალენდარი</h3><p>მწვანე თავისუფალია, ლურჯი ახალი მოთხოვნაა, წითელი დადასტურებულია, იასამნისფერი გარე ჯავშანი/ბლოკია.</p></div>' +
    '</div>' +
    renderManualBlockForm() +
    renderCalendarGrid(rooms, bookings, blocks, dates);

  bindManualBlockForm();
}

function renderManualBlockForm() {
  const roomOptions = ADMIN_ROOMS.filter(function (room) {
    return String(room.Status) === 'Active';
  }).map(function (room) {
    return '<option value="' + safe(room.RoomID) + '" data-type="' + safe(room.TypeID) + '">' + safe(room.RoomNumber) + ' / ' + safe(room.TypeID) + '</option>';
  }).join('');

  return '<form class="manual-block-form" id="manualBlockForm">' +
    '<div><strong>Manual Block / External Booking</strong><p>Booking.com, Airbnb, ტელეფონი ან რემონტი — აქედან ხელით დაბლოკე ნომერი.</p></div>' +
    '<select name="RoomID" required><option value="">აირჩიე ნომერი</option>' + roomOptions + '</select>' +
    '<select name="Source" required><option value="Booking.com">Booking.com</option><option value="Airbnb">Airbnb</option><option value="WhatsApp">WhatsApp</option><option value="Phone">Phone</option><option value="Maintenance">Maintenance</option><option value="Owner">Owner</option><option value="Other">Other</option></select>' +
    '<input type="date" name="StartDate" required />' +
    '<input type="date" name="EndDate" required />' +
    '<input type="text" name="GuestName" placeholder="სტუმარი / მიზეზი" />' +
    '<input type="tel" name="Phone" placeholder="ტელეფონი" />' +
    '<button type="submit">დაბლოკვა</button>' +
    '<small id="manualBlockStatus"></small>' +
  '</form>';
}

function bindManualBlockForm() {
  const form = $('manualBlockForm');
  if (!form) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const status = $('manualBlockStatus');
    status.textContent = 'ინახება...';

    const data = Object.fromEntries(new FormData(form).entries());
    const room = ADMIN_ROOMS.find(function (item) {
      return String(item.RoomID) === String(data.RoomID);
    });

    data.RoomNumber = room ? room.RoomNumber : '';
    data.RoomTypeID = room ? room.TypeID : '';
    data.Status = 'Active';
    data.Reason = data.GuestName || data.Source;

    const result = await apiPost('createManualBlock', { data: data });

    if (result.success) {
      status.textContent = 'დაბლოკვა დამატებულია';
      form.reset();
      loadCalendar();
    } else {
      status.textContent = result.error || 'დაბლოკვა ვერ დაემატა';
    }
  });
}

function renderCalendarGrid(rooms, bookings, blocks, dates) {
  const header = dates.map(function (date) {
    const day = new Date(date);
    return '<div class="cal-cell cal-head">' + (day.getMonth() + 1) + '/' + day.getDate() + '</div>';
  }).join('');

  const rows = rooms.map(function (room) {
    const cells = dates.map(function (date) {
      const nextDate = toIsoDate(addDays(new Date(date), 1));
      const booking = bookings.find(function (item) {
        return String(item.RoomID) === String(room.RoomID) && overlaps(date, nextDate, item.CheckIn, item.CheckOut);
      });
      const block = blocks.find(function (item) {
        return String(item.RoomID) === String(room.RoomID) && overlaps(date, nextDate, item.StartDate, item.EndDate);
      });

      if (booking) {
        const cls = String(booking.Status) === 'New' ? 'cal-new' : 'cal-booked';
        return '<div class="cal-cell ' + cls + '" title="' + safe(booking.GuestName) + '">' + safe(booking.Status) + '</div>';
      }

      if (block) {
        return '<div class="cal-cell cal-block" title="' + safe(block.Source) + '">Block</div>';
      }

      return '<div class="cal-cell cal-free">Free</div>';
    }).join('');

    return '<div class="cal-room"><strong>' + safe(room.RoomNumber) + '</strong><small>' + safe(room.TypeID) + '</small></div>' + cells;
  }).join('');

  return '<div class="calendar-wrap"><div class="calendar-grid" style="grid-template-columns:140px repeat(' + dates.length + ', minmax(92px, 1fr));">' +
    '<div class="cal-cell cal-head sticky-room">Room</div>' + header + rows +
    '</div></div>';
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
