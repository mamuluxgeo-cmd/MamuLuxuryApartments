// Fixes admin Bookings view when Apps Script has no direct `bookings` GET action.
// It reads bookings through the existing `calendar` action with a wide date range.

async function getAdminBookings() {
  const calendarRes = await apiGet('calendar', {
    start: '2000-01-01',
    end: '2100-01-01'
  });

  if (calendarRes && calendarRes.success !== false && Array.isArray(calendarRes.bookings)) {
    return calendarRes.bookings;
  }

  const directRes = await apiGet('bookings');
  if (directRes && directRes.success !== false && Array.isArray(directRes.data)) {
    return directRes.data;
  }

  return [];
}

loadDashboard = async function () {
  const panel = $('mainPanel');
  const stats = $('statsGrid');
  panel.textContent = 'იტვირთება...';

  const [bookings, roomsRes] = await Promise.all([
    getAdminBookings(),
    apiGet('rooms')
  ]);

  const rooms = roomsRes.data || [];
  ADMIN_ROOMS = rooms;

  const activeRevenueBookings = bookings.filter(function (booking) {
    return ['Confirmed', 'CheckedIn', 'CheckedOut'].indexOf(String(booking.Status || '')) !== -1;
  });

  const totalRevenue = activeRevenueBookings.reduce(function (sum, booking) {
    return sum + Number(booking.TotalPrice || 0);
  }, 0);

  const totalNights = activeRevenueBookings.reduce(function (sum, booking) {
    return sum + Number(booking.Nights || 0);
  }, 0);

  const occupancy = rooms.length ? Math.round((totalNights / (rooms.length * 30)) * 100) : 0;
  const newBookings = bookings.filter(function (booking) {
    return String(booking.Status || '') === 'New';
  }).length;
  const confirmedBookings = bookings.filter(function (booking) {
    return String(booking.Status || '') === 'Confirmed';
  }).length;

  stats.innerHTML =
    '<div class="stats-card"><span class="eyebrow">Revenue</span><h3>' + money(totalRevenue) + '</h3><p>დადასტურებული შემოსავალი</p></div>' +
    '<div class="stats-card"><span class="eyebrow">Occupancy</span><h3>' + occupancy + '%</h3><p>30 დღეზე გათვლილი დატვირთულობა</p></div>' +
    '<div class="stats-card"><span class="eyebrow">New</span><h3>' + newBookings + '</h3><p>ახალი მოთხოვნები</p></div>' +
    '<div class="stats-card"><span class="eyebrow">Confirmed</span><h3>' + confirmedBookings + '</h3><p>დადასტურებული</p></div>';

  panel.innerHTML = renderRevenueDashboard(bookings, rooms) + '<h3>ბოლო ჯავშნები</h3>' + renderBookingsTable(bookings.slice(-8).reverse(), true);
};

loadBookings = async function () {
  const panel = $('mainPanel');
  const stats = $('statsGrid');
  panel.textContent = 'ჯავშნები იტვირთება...';
  stats.innerHTML = '';

  const [bookings, roomsRes] = await Promise.all([
    getAdminBookings(),
    apiGet('rooms')
  ]);

  ADMIN_ROOMS = roomsRes.data || [];

  panel.innerHTML =
    '<div class="panel-title-row">' +
      '<div><h3>ჯავშნების მართვა</h3><p>აქ ჩანს საიტიდან შემოსული ყველა მოთხოვნა.</p></div>' +
    '</div>' +
    renderBookingsTable(bookings.slice().reverse(), false);
};

findBookingById = async function (bookingId) {
  const bookings = await getAdminBookings();
  return bookings.find(function (booking) {
    return String(booking.BookingID) === String(bookingId);
  });
};
