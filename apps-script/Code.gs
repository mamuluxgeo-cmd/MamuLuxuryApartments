const SHEETS = {
  ROOM_TYPES: 'RoomTypes',
  ROOMS: 'Rooms',
  BOOKINGS: 'Bookings',
  MANUAL_BLOCKS: 'ManualBlocks',
  GALLERY: 'Gallery',
  VIDEOS: 'Videos',
  SETTINGS: 'Settings',
  ADMINS: 'Admins',
  LOGS: 'Logs'
};

const HEADERS = {
  RoomTypes: [
    'TypeID', 'Name', 'Category', 'ShortDescription', 'FullDescription', 'Price', 'OldPrice',
    'Guests', 'Bedrooms', 'Bathrooms', 'Area', 'MainImage', 'GalleryImages', 'YoutubeVideo',
    'Amenities', 'Status', 'Featured', 'SortOrder', 'CreatedAt', 'UpdatedAt'
  ],
  Rooms: [
    'RoomID', 'RoomNumber', 'TypeID', 'Floor', 'Status', 'Note', 'CreatedAt', 'UpdatedAt'
  ],
  Bookings: [
    'BookingID', 'CreatedAt', 'RoomTypeID', 'RoomTypeName', 'RoomID', 'RoomNumber', 'GuestName',
    'Phone', 'Email', 'CheckIn', 'CheckOut', 'Nights', 'Guests', 'TotalPrice', 'Message',
    'Status', 'AdminNote', 'UpdatedAt'
  ],
  ManualBlocks: [
    'BlockID', 'CreatedAt', 'RoomID', 'RoomNumber', 'RoomTypeID', 'StartDate', 'EndDate',
    'Source', 'GuestName', 'Phone', 'Status', 'Reason', 'AdminNote', 'UpdatedAt'
  ],
  Gallery: [
    'ID', 'Title', 'ImageUrl', 'Category', 'Status', 'SortOrder', 'CreatedAt', 'UpdatedAt'
  ],
  Videos: [
    'ID', 'Title', 'YoutubeUrl', 'Category', 'Status', 'SortOrder', 'CreatedAt', 'UpdatedAt'
  ],
  Settings: ['Key', 'Value', 'Description', 'UpdatedAt'],
  Admins: ['Username', 'Password', 'Role', 'Status', 'CreatedAt'],
  Logs: ['CreatedAt', 'Action', 'Details']
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Mamu Luxury')
    .addItem('Setup / განახლება', 'setupMamuLuxurySystem')
    .addItem('Add sample data', 'addSampleData')
    .addItem('Clear demo data', 'clearDemoData')
    .addToUi();
}

function setupMamuLuxurySystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(HEADERS).forEach(function(sheetName) {
    const sheet = getOrCreateSheet_(ss, sheetName);
    setupHeaders_(sheet, HEADERS[sheetName]);
    freezeAndStyle_(sheet);
  });

  setupSettings_(ss.getSheetByName(SHEETS.SETTINGS));
  setupAdmins_(ss.getSheetByName(SHEETS.ADMINS));
  setupValidations_(ss);
  addSampleData();
  log_('SETUP', 'RoomTypes, Rooms, Bookings, ManualBlocks system initialized');

  SpreadsheetApp.getUi().alert('მზადაა! შეიქმნა RoomTypes, Rooms, Bookings, ManualBlocks და ყველა საჭირო ფურცელი.');
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function setupHeaders_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function freezeAndStyle_(sheet) {
  const lastCol = sheet.getLastColumn();
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, lastCol)
    .setFontWeight('bold')
    .setBackground('#111827')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');
  sheet.autoResizeColumns(1, lastCol);
}

function setupSettings_(sheet) {
  if (sheet.getLastRow() > 1) return;
  const now = new Date();
  const rows = [
    ['site_title', 'Mamu Luxury Apartments', 'საიტის მთავარი სახელი', now],
    ['hero_title', 'პრემიუმ აპარტამენტები ბათუმში', 'მთავარი დიდი სათაური', now],
    ['hero_subtitle', 'Luxury Liquid Glass experience in Batumi', 'მთავარი ქვესათაური', now],
    ['phone', '', 'საკონტაქტო ნომერი', now],
    ['whatsapp', '', 'WhatsApp ნომერი ქვეყნის კოდით', now],
    ['address', '', 'მისამართი', now],
    ['map_url', '', 'Google Maps ლინკი', now],
    ['facebook', '', 'Facebook ლინკი', now],
    ['instagram', '', 'Instagram ლინკი', now],
    ['tiktok', '', 'TikTok ლინკი', now],
    ['currency', 'GEL', 'ვალუტა', now],
    ['theme_default', 'night', 'day ან night', now],
    ['main_hero_image', '', 'მთავარი ფონის ფოტო', now],
    ['imgbb_api_key', '104cf2ebb4a05c7908280dff041c8609', 'imgbb API key', now],
    ['admin_session_hours', '12', 'ადმინის სესიის ხანგრძლივობა საათებში', now]
  ];
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function setupAdmins_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.appendRow(['admin', 'change-me-123', 'owner', 'Active', new Date()]);
}

function setupValidations_(ss) {
  setValidation_(ss.getSheetByName(SHEETS.ROOM_TYPES), 16, ['Active', 'Inactive']);
  setValidation_(ss.getSheetByName(SHEETS.ROOM_TYPES), 17, ['Yes', 'No']);
  setValidation_(ss.getSheetByName(SHEETS.ROOMS), 5, ['Active', 'Inactive', 'Maintenance']);
  setValidation_(ss.getSheetByName(SHEETS.BOOKINGS), 16, ['New', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow']);
  setValidation_(ss.getSheetByName(SHEETS.MANUAL_BLOCKS), 8, ['Booking.com', 'Airbnb', 'Expedia', 'WhatsApp', 'Phone', 'Walk-in', 'Maintenance', 'Owner', 'Other']);
  setValidation_(ss.getSheetByName(SHEETS.MANUAL_BLOCKS), 11, ['Active', 'Cancelled', 'Completed']);
  setValidation_(ss.getSheetByName(SHEETS.GALLERY), 4, ['Room', 'View', 'Interior', 'Exterior', 'Other']);
  setValidation_(ss.getSheetByName(SHEETS.GALLERY), 5, ['Active', 'Inactive']);
  setValidation_(ss.getSheetByName(SHEETS.VIDEOS), 4, ['Apartment', 'General', 'Review', 'Other']);
  setValidation_(ss.getSheetByName(SHEETS.VIDEOS), 5, ['Active', 'Inactive']);
  setValidation_(ss.getSheetByName(SHEETS.ADMINS), 4, ['Active', 'Inactive']);
}

function setValidation_(sheet, column, values) {
  if (!sheet) return;
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  sheet.getRange(2, column, Math.max(sheet.getMaxRows() - 1, 1)).setDataValidation(rule);
}

function addSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  seedRoomTypes_(ss.getSheetByName(SHEETS.ROOM_TYPES));
  seedRooms_(ss.getSheetByName(SHEETS.ROOMS));
  seedGallery_(ss.getSheetByName(SHEETS.GALLERY));
  seedVideos_(ss.getSheetByName(SHEETS.VIDEOS));
}

function seedRoomTypes_(sheet) {
  if (sheet.getLastRow() > 1) return;
  const now = new Date();
  const img = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';
  const rows = [
    ['TYPE-A', '1 Bedroom Apartment', 'One Bedroom', 'კომფორტული 1 საძინებლიანი აპარტამენტი', 'პრემიუმ სტილის 1 საძინებლიანი აპარტამენტი კომფორტული დასვენებისთვის.', 180, '', 3, 1, 1, '45 m²', img, '', '', 'Wi-Fi, კონდიციონერი, სამზარეულო, აივანი', 'Active', 'Yes', 1, now, now],
    ['TYPE-B', '2 Bedroom Apartment Style 1', 'Two Bedroom', '2 საძინებლიანი აპარტამენტი — სტილი 1', 'ფართო 2 საძინებლიანი აპარტამენტი ოჯახისთვის ან მეგობრებისთვის.', 260, '', 5, 2, 1, '70 m²', img, '', '', 'Wi-Fi, კონდიციონერი, სამზარეულო, აივანი', 'Active', 'Yes', 2, now, now],
    ['TYPE-C', '2 Bedroom Apartment Style 2', 'Two Bedroom', '2 საძინებლიანი აპარტამენტი — სტილი 2', 'განსხვავებული დიზაინის 2 საძინებლიანი აპარტამენტი კომფორტული სივრცით.', 280, '', 5, 2, 1, '75 m²', img, '', '', 'Wi-Fi, კონდიციონერი, სამზარეულო, აივანი', 'Active', 'Yes', 3, now, now],
    ['TYPE-D', '2 Bedroom Apartment Style 3', 'Two Bedroom', '2 საძინებლიანი აპარტამენტი — სტილი 3', 'ელეგანტური 2 საძინებლიანი აპარტამენტი განსხვავებული ინტერიერით.', 300, '', 5, 2, 1, '80 m²', img, '', '', 'Wi-Fi, კონდიციონერი, სამზარეულო, აივანი', 'Active', 'Yes', 4, now, now],
    ['VIP', 'VIP 1 Bedroom Apartment', 'VIP', 'VIP 1 საძინებლიანი აპარტამენტი', 'განსაკუთრებული VIP აპარტამენტი პრემიუმ დეტალებით და გამორჩეული კომფორტით.', 450, '', 3, 1, 1, '60 m²', img, '', '', 'Wi-Fi, კონდიციონერი, VIP სივრცე, აივანი', 'Active', 'Yes', 5, now, now]
  ];
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function seedRooms_(sheet) {
  if (sheet.getLastRow() > 1) return;
  const now = new Date();
  const rooms = [];
  for (let i = 1; i <= 5; i++) rooms.push(['ROOM-A' + i, '10' + i, 'TYPE-A', 1, 'Active', '', now, now]);
  for (let i = 1; i <= 5; i++) rooms.push(['ROOM-B' + i, '20' + i, 'TYPE-B', 2, 'Active', '', now, now]);
  for (let i = 1; i <= 5; i++) rooms.push(['ROOM-C' + i, '30' + i, 'TYPE-C', 3, 'Active', '', now, now]);
  for (let i = 1; i <= 4; i++) rooms.push(['ROOM-D' + i, '40' + i, 'TYPE-D', 4, 'Active', '', now, now]);
  rooms.push(['ROOM-VIP1', 'VIP501', 'VIP', 5, 'Active', '', now, now]);
  sheet.getRange(2, 1, rooms.length, rooms[0].length).setValues(rooms);
}

function seedGallery_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.appendRow(['GAL001', 'Luxury Interior', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'Interior', 'Active', 1, new Date(), new Date()]);
}

function seedVideos_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.appendRow(['VID001', 'Mamu Luxury Apartments Video', '', 'General', 'Inactive', 1, new Date(), new Date()]);
}

function clearDemoData() {
  [SHEETS.ROOM_TYPES, SHEETS.ROOMS, SHEETS.BOOKINGS, SHEETS.MANUAL_BLOCKS, SHEETS.GALLERY, SHEETS.VIDEOS].forEach(function(name) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
    if (sheet && sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  });
  log_('CLEAR_DEMO', 'Demo data cleared');
}

function doGet(e) {
  const action = e.parameter.action || 'health';
  if (action === 'health') return json_({ success: true, message: 'Mamu Luxury API is working' });
  if (action === 'roomTypes') return json_({ success: true, data: getRows_(SHEETS.ROOM_TYPES, { Status: 'Active' }) });
  if (action === 'rooms') return json_({ success: true, data: getRows_(SHEETS.ROOMS) });
  if (action === 'gallery') return json_({ success: true, data: getRows_(SHEETS.GALLERY, { Status: 'Active' }) });
  if (action === 'videos') return json_({ success: true, data: getRows_(SHEETS.VIDEOS, { Status: 'Active' }) });
  if (action === 'settings') return json_({ success: true, data: getSettings_() });
  if (action === 'availability') return json_(checkAvailability_(e.parameter));
  if (action === 'calendar') return json_(getCalendar_(e.parameter));
  return json_({ success: false, error: 'Unknown action' });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = payload.action || 'createBooking';
    if (action === 'createBooking') return createBooking_(payload);
    if (action === 'adminLogin') return adminLogin_(payload);
    if (action === 'updateBookingStatus') return updateBookingStatus_(payload);
    if (action === 'assignRoomToBooking') return assignRoomToBooking_(payload);
    if (action === 'createManualBlock') return createManualBlock_(payload);
    if (action === 'updateManualBlock') return updateManualBlock_(payload);
    if (action === 'upsertRoomType') return upsertRow_(SHEETS.ROOM_TYPES, 'TypeID', payload.data);
    if (action === 'upsertRoom') return upsertRow_(SHEETS.ROOMS, 'RoomID', payload.data);
    if (action === 'upsertGallery') return upsertRow_(SHEETS.GALLERY, 'ID', payload.data);
    if (action === 'upsertVideo') return upsertRow_(SHEETS.VIDEOS, 'ID', payload.data);
    if (action === 'updateSetting') return updateSetting_(payload.key, payload.value);
    return json_({ success: false, error: 'Unknown action' });
  } catch (error) {
    return json_({ success: false, error: String(error) });
  }
}

function createBooking_(data) {
  const availability = checkAvailability_({ roomTypeId: data.roomTypeId, checkin: data.checkin, checkout: data.checkout });
  if (!availability.success || availability.availableRooms.length === 0) {
    return json_({ success: false, error: 'ამ თარიღებში არჩეული ნომრის ტიპი დაკავებულია.' });
  }
  const roomType = findById_(SHEETS.ROOM_TYPES, 'TypeID', data.roomTypeId) || {};
  const nights = calculateNights_(data.checkin, data.checkout);
  const price = Number(roomType.Price || 0);
  const total = nights * price;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.BOOKINGS);
  const bookingId = 'BK-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  sheet.appendRow([
    bookingId, new Date(), data.roomTypeId || '', roomType.Name || data.roomTypeName || '', '', '', data.name || '',
    data.phone || '', data.email || '', data.checkin || '', data.checkout || '', nights, data.guests || '', total,
    data.message || data.note || '', 'New', '', new Date()
  ]);
  log_('BOOKING_CREATED', bookingId);
  return json_({ success: true, bookingId: bookingId, availableRooms: availability.availableRooms });
}

function createManualBlock_(payload) {
  const data = payload.data || payload;
  const availability = checkAvailability_({ roomTypeId: data.RoomTypeID, roomId: data.RoomID, checkin: data.StartDate, checkout: data.EndDate });
  if (!availability.success || availability.availableRooms.length === 0) {
    return json_({ success: false, error: 'ეს ნომერი/ტიპი ამ თარიღებში უკვე დაკავებულია.' });
  }
  const room = data.RoomID ? findById_(SHEETS.ROOMS, 'RoomID', data.RoomID) : availability.availableRooms[0];
  const block = {
    BlockID: data.BlockID || 'BLK-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss'),
    CreatedAt: data.CreatedAt || new Date(),
    RoomID: room.RoomID || '',
    RoomNumber: room.RoomNumber || '',
    RoomTypeID: room.TypeID || data.RoomTypeID || '',
    StartDate: data.StartDate || '',
    EndDate: data.EndDate || '',
    Source: data.Source || 'Other',
    GuestName: data.GuestName || '',
    Phone: data.Phone || '',
    Status: data.Status || 'Active',
    Reason: data.Reason || '',
    AdminNote: data.AdminNote || '',
    UpdatedAt: new Date()
  };
  return upsertRow_(SHEETS.MANUAL_BLOCKS, 'BlockID', block);
}

function updateManualBlock_(payload) {
  return upsertRow_(SHEETS.MANUAL_BLOCKS, 'BlockID', payload.data || payload);
}

function checkAvailability_(params) {
  const roomTypeId = params.roomTypeId || params.RoomTypeID || '';
  const roomId = params.roomId || params.RoomID || '';
  const checkin = params.checkin || params.StartDate;
  const checkout = params.checkout || params.EndDate;
  if (!checkin || !checkout) return { success: false, error: 'checkin და checkout აუცილებელია' };

  let rooms = getRows_(SHEETS.ROOMS, { Status: 'Active' });
  if (roomTypeId) rooms = rooms.filter(function(room) { return String(room.TypeID) === String(roomTypeId); });
  if (roomId) rooms = rooms.filter(function(room) { return String(room.RoomID) === String(roomId); });

  const activeBookings = getRows_(SHEETS.BOOKINGS).filter(function(b) {
    return ['Confirmed', 'CheckedIn'].indexOf(String(b.Status)) !== -1;
  });
  const activeBlocks = getRows_(SHEETS.MANUAL_BLOCKS, { Status: 'Active' });

  const availableRooms = rooms.filter(function(room) {
    const booked = activeBookings.some(function(b) {
      return String(b.RoomID) === String(room.RoomID) && rangesOverlap_(checkin, checkout, b.CheckIn, b.CheckOut);
    });
    const blocked = activeBlocks.some(function(block) {
      return String(block.RoomID) === String(room.RoomID) && rangesOverlap_(checkin, checkout, block.StartDate, block.EndDate);
    });
    return !booked && !blocked;
  });

  return { success: true, available: availableRooms.length > 0, count: availableRooms.length, availableRooms: availableRooms };
}

function getCalendar_(params) {
  const start = params.start;
  const end = params.end;
  const rooms = getRows_(SHEETS.ROOMS);
  const bookings = getRows_(SHEETS.BOOKINGS).filter(function(b) {
    return ['New', 'Confirmed', 'CheckedIn'].indexOf(String(b.Status)) !== -1 && rangesOverlap_(start, end, b.CheckIn, b.CheckOut);
  });
  const blocks = getRows_(SHEETS.MANUAL_BLOCKS, { Status: 'Active' }).filter(function(block) {
    return rangesOverlap_(start, end, block.StartDate, block.EndDate);
  });
  return { success: true, rooms: rooms, bookings: bookings, blocks: blocks };
}

function assignRoomToBooking_(payload) {
  const availability = checkAvailability_({ roomId: payload.roomId, checkin: payload.checkin, checkout: payload.checkout });
  if (!availability.success || availability.availableRooms.length === 0) return json_({ success: false, error: 'ეს ნომერი ამ თარიღებში დაკავებულია.' });
  const room = findById_(SHEETS.ROOMS, 'RoomID', payload.roomId);
  if (!room) return json_({ success: false, error: 'Room not found' });
  return updateBookingFields_(payload.bookingId, {
    RoomID: room.RoomID,
    RoomNumber: room.RoomNumber,
    Status: payload.status || 'Confirmed',
    AdminNote: payload.adminNote || ''
  });
}

function updateBookingStatus_(payload) {
  return updateBookingFields_(payload.bookingId, {
    Status: payload.status || 'New',
    AdminNote: payload.adminNote
  });
}

function updateBookingFields_(bookingId, fields) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.BOOKINGS);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][headers.indexOf('BookingID')]) === String(bookingId)) {
      Object.keys(fields).forEach(function(key) {
        const index = headers.indexOf(key);
        if (index >= 0 && fields[key] !== undefined) sheet.getRange(i + 1, index + 1).setValue(fields[key]);
      });
      const updatedIndex = headers.indexOf('UpdatedAt');
      if (updatedIndex >= 0) sheet.getRange(i + 1, updatedIndex + 1).setValue(new Date());
      return json_({ success: true });
    }
  }
  return json_({ success: false, error: 'Booking not found' });
}

function adminLogin_(payload) {
  const admins = getRows_(SHEETS.ADMINS, { Status: 'Active' });
  const found = admins.find(function(admin) {
    return String(admin.Username) === String(payload.username) && String(admin.Password) === String(payload.password);
  });
  if (!found) return json_({ success: false, error: 'არასწორი ლოგინი ან პაროლი' });
  return json_({ success: true, user: { username: found.Username, role: found.Role }, token: Utilities.getUuid() });
}

function upsertRow_(sheetName, idKey, data) {
  if (!data) return json_({ success: false, error: 'Missing data' });
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIndex = headers.indexOf(idKey);
  let id = data[idKey];
  if (!id) id = sheetName.substring(0, 3).toUpperCase() + '-' + Utilities.getUuid().slice(0, 8);
  data[idKey] = id;
  data.UpdatedAt = new Date();
  if (!data.CreatedAt) data.CreatedAt = new Date();
  const outputRow = headers.map(function(header) { return data[header] !== undefined ? data[header] : ''; });
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIndex]) === String(id)) {
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([outputRow]);
      return json_({ success: true, id: id, updated: true });
    }
  }
  sheet.appendRow(outputRow);
  return json_({ success: true, id: id, created: true });
}

function updateSetting_(key, value) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.SETTINGS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      sheet.getRange(i + 1, 4).setValue(new Date());
      return json_({ success: true });
    }
  }
  sheet.appendRow([key, value, '', new Date()]);
  return json_({ success: true });
}

function getRows_(sheetName, filters) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  let rows = values.map(function(row) {
    const obj = {};
    headers.forEach(function(header, index) { obj[header] = row[index]; });
    return obj;
  });
  if (filters) {
    Object.keys(filters).forEach(function(key) {
      rows = rows.filter(function(row) { return String(row[key]) === String(filters[key]); });
    });
  }
  return rows.sort(function(a, b) { return Number(a.SortOrder || 9999) - Number(b.SortOrder || 9999); });
}

function getSettings_() {
  const rows = getRows_(SHEETS.SETTINGS);
  const settings = {};
  rows.forEach(function(row) { settings[row.Key] = row.Value; });
  return settings;
}

function findById_(sheetName, key, value) {
  return getRows_(sheetName).find(function(row) { return String(row[key]) === String(value); });
}

function calculateNights_(start, end) {
  const ms = normalizeDate_(end).getTime() - normalizeDate_(start).getTime();
  return Math.max(Math.ceil(ms / 86400000), 1);
}

function rangesOverlap_(startA, endA, startB, endB) {
  if (!startA || !endA || !startB || !endB) return false;
  const aStart = normalizeDate_(startA).getTime();
  const aEnd = normalizeDate_(endA).getTime();
  const bStart = normalizeDate_(startB).getTime();
  const bEnd = normalizeDate_(endB).getTime();
  return aStart < bEnd && bStart < aEnd;
}

function normalizeDate_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const parts = String(value).split('-');
  if (parts.length === 3) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function log_(action, details) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.LOGS);
  if (sheet) sheet.appendRow([new Date(), action, details]);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
