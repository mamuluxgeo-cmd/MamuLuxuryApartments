const SHEETS = {
  APARTMENTS: 'Apartments',
  BOOKINGS: 'Bookings',
  GALLERY: 'Gallery',
  VIDEOS: 'Videos',
  SETTINGS: 'Settings',
  ADMINS: 'Admins',
  LOGS: 'Logs'
};

const HEADERS = {
  Apartments: [
    'ID', 'Name', 'ShortDescription', 'FullDescription', 'Price', 'OldPrice', 'Guests',
    'Bedrooms', 'Bathrooms', 'Area', 'Location', 'MainImage', 'GalleryImages',
    'YoutubeVideo', 'Amenities', 'Status', 'Featured', 'SortOrder', 'CreatedAt', 'UpdatedAt'
  ],
  Bookings: [
    'BookingID', 'CreatedAt', 'ApartmentID', 'ApartmentName', 'GuestName', 'Phone', 'Email',
    'CheckIn', 'CheckOut', 'Guests', 'Message', 'Status', 'AdminNote', 'UpdatedAt'
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
  log_('SETUP', 'System initialized successfully');

  SpreadsheetApp.getUi().alert('მზადაა! ყველა საჭირო ფურცელი, სათაური, ვალიდაცია და საწყისი მონაცემი შეიქმნა.');
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function setupHeaders_(sheet, headers) {
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const isEmpty = current.every(function(value) { return value === ''; });
  if (isEmpty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
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
    ['hero_subtitle', 'კომფორტი, სისუფთავე და საუკეთესო ლოკაცია', 'მთავარი ქვესათაური', now],
    ['phone', '', 'საკონტაქტო ნომერი', now],
    ['whatsapp', '', 'WhatsApp ნომერი ქვეყნის კოდით', now],
    ['address', '', 'მისამართი', now],
    ['map_url', '', 'Google Maps ლინკი', now],
    ['facebook', '', 'Facebook ლინკი', now],
    ['instagram', '', 'Instagram ლინკი', now],
    ['tiktok', '', 'TikTok ლინკი', now],
    ['currency', 'GEL', 'ვალუტა', now],
    ['admin_session_hours', '12', 'ადმინის სესიის ხანგრძლივობა საათებში', now]
  ];
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function setupAdmins_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.appendRow(['admin', 'change-me-123', 'owner', 'Active', new Date()]);
}

function setupValidations_(ss) {
  setValidation_(ss.getSheetByName(SHEETS.APARTMENTS), 16, ['Active', 'Inactive']);
  setValidation_(ss.getSheetByName(SHEETS.APARTMENTS), 17, ['Yes', 'No']);
  setValidation_(ss.getSheetByName(SHEETS.BOOKINGS), 12, ['New', 'Confirmed', 'Cancelled', 'Completed']);
  setValidation_(ss.getSheetByName(SHEETS.GALLERY), 4, ['Room', 'View', 'Interior', 'Exterior', 'Other']);
  setValidation_(ss.getSheetByName(SHEETS.GALLERY), 5, ['Active', 'Inactive']);
  setValidation_(ss.getSheetByName(SHEETS.VIDEOS), 4, ['Apartment', 'General', 'Review', 'Other']);
  setValidation_(ss.getSheetByName(SHEETS.VIDEOS), 5, ['Active', 'Inactive']);
  setValidation_(ss.getSheetByName(SHEETS.ADMINS), 4, ['Active', 'Inactive']);
}

function setValidation_(sheet, column, values) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, column, Math.max(sheet.getMaxRows() - 1, 1)).setDataValidation(rule);
}

function addSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const apartments = ss.getSheetByName(SHEETS.APARTMENTS);
  const gallery = ss.getSheetByName(SHEETS.GALLERY);
  const videos = ss.getSheetByName(SHEETS.VIDEOS);

  if (apartments.getLastRow() <= 1) {
    apartments.appendRow([
      'APT001', 'Deluxe Sea View Apartment', 'ზღვის ხედით პრემიუმ აპარტამენტი',
      'კომფორტული აპარტამენტი თანამედროვე ინტერიერით, სრულად აღჭურვილი სამზარეულოთი და ლამაზი ხედით.',
      250, 300, 4, 1, 1, '55 m²', 'Batumi',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      '', '', 'Wi-Fi, კონდიციონერი, სამზარეულო, აივანი', 'Active', 'Yes', 1, new Date(), new Date()
    ]);
  }

  if (gallery.getLastRow() <= 1) {
    gallery.appendRow([
      'GAL001', 'Interior',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'Interior', 'Active', 1, new Date(), new Date()
    ]);
  }

  if (videos.getLastRow() <= 1) {
    videos.appendRow(['VID001', 'Mamu Luxury Apartments Video', '', 'General', 'Inactive', 1, new Date(), new Date()]);
  }
}

function clearDemoData() {
  [SHEETS.APARTMENTS, SHEETS.GALLERY, SHEETS.VIDEOS].forEach(function(name) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
  });
  log_('CLEAR_DEMO', 'Demo data cleared');
}

function doGet(e) {
  const action = e.parameter.action || 'health';

  if (action === 'health') return json_({ success: true, message: 'Mamu Luxury API is working' });
  if (action === 'apartments') return json_({ success: true, data: getRows_(SHEETS.APARTMENTS, { Status: 'Active' }) });
  if (action === 'gallery') return json_({ success: true, data: getRows_(SHEETS.GALLERY, { Status: 'Active' }) });
  if (action === 'videos') return json_({ success: true, data: getRows_(SHEETS.VIDEOS, { Status: 'Active' }) });
  if (action === 'settings') return json_({ success: true, data: getSettings_() });

  return json_({ success: false, error: 'Unknown action' });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = payload.action || 'createBooking';

    if (action === 'createBooking') return createBooking_(payload);
    if (action === 'adminLogin') return adminLogin_(payload);
    if (action === 'updateBookingStatus') return updateBookingStatus_(payload);
    if (action === 'upsertApartment') return upsertRow_(SHEETS.APARTMENTS, 'ID', payload.data);
    if (action === 'upsertGallery') return upsertRow_(SHEETS.GALLERY, 'ID', payload.data);
    if (action === 'upsertVideo') return upsertRow_(SHEETS.VIDEOS, 'ID', payload.data);
    if (action === 'updateSetting') return updateSetting_(payload.key, payload.value);

    return json_({ success: false, error: 'Unknown action' });
  } catch (error) {
    return json_({ success: false, error: String(error) });
  }
}

function createBooking_(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.BOOKINGS);
  const bookingId = 'BK-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  sheet.appendRow([
    bookingId, new Date(), data.apartmentId || '', data.apartmentName || '', data.name || '',
    data.phone || '', data.email || '', data.checkin || '', data.checkout || '', data.guests || '',
    data.message || data.note || '', 'New', '', new Date()
  ]);
  log_('BOOKING_CREATED', bookingId);
  return json_({ success: true, bookingId: bookingId });
}

function adminLogin_(payload) {
  const admins = getRows_(SHEETS.ADMINS, { Status: 'Active' });
  const found = admins.find(function(admin) {
    return String(admin.Username) === String(payload.username) && String(admin.Password) === String(payload.password);
  });

  if (!found) return json_({ success: false, error: 'არასწორი ლოგინი ან პაროლი' });

  return json_({
    success: true,
    user: { username: found.Username, role: found.Role },
    token: Utilities.getUuid()
  });
}

function updateBookingStatus_(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.BOOKINGS);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idCol = headers.indexOf('BookingID') + 1;
  const statusCol = headers.indexOf('Status') + 1;
  const noteCol = headers.indexOf('AdminNote') + 1;
  const updatedCol = headers.indexOf('UpdatedAt') + 1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol - 1] === payload.bookingId) {
      sheet.getRange(i + 1, statusCol).setValue(payload.status || 'New');
      if (payload.adminNote !== undefined) sheet.getRange(i + 1, noteCol).setValue(payload.adminNote);
      sheet.getRange(i + 1, updatedCol).setValue(new Date());
      return json_({ success: true });
    }
  }
  return json_({ success: false, error: 'Booking not found' });
}

function upsertRow_(sheetName, idKey, data) {
  if (!data) return json_({ success: false, error: 'Missing data' });
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idIndex = headers.indexOf(idKey);
  let id = data[idKey] || data.ID;

  if (!id) id = sheetName.substring(0, 3).toUpperCase() + '-' + Utilities.getUuid().slice(0, 8);
  data[idKey] = id;
  data.UpdatedAt = new Date();
  if (!data.CreatedAt) data.CreatedAt = new Date();

  const outputRow = headers.map(function(header) { return data[header] !== undefined ? data[header] : ''; });

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idIndex] === id) {
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

  return rows.sort(function(a, b) {
    return Number(a.SortOrder || 9999) - Number(b.SortOrder || 9999);
  });
}

function getSettings_() {
  const rows = getRows_(SHEETS.SETTINGS);
  const settings = {};
  rows.forEach(function(row) { settings[row.Key] = row.Value; });
  return settings;
}

function log_(action, details) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.LOGS);
  if (sheet) sheet.appendRow([new Date(), action, details]);
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
