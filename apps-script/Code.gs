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
    'TypeID', 'Name', 'Name_KA', 'Name_EN', 'Name_RU',
    'Category', 'Category_KA', 'Category_EN', 'Category_RU',
    'ShortDescription', 'ShortDescription_KA', 'ShortDescription_EN', 'ShortDescription_RU',
    'FullDescription', 'FullDescription_KA', 'FullDescription_EN', 'FullDescription_RU',
    'Amenities', 'Amenities_KA', 'Amenities_EN', 'Amenities_RU',
    'Price', 'OldPrice', 'Guests', 'Bedrooms', 'Bathrooms', 'Area',
    'MainImage', 'GalleryImages', 'YoutubeVideo',
    'Status', 'Featured', 'SortOrder', 'CreatedAt', 'UpdatedAt'
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

const VALIDATIONS = {
  ROOM_TYPE_STATUS: ['Active', 'Inactive'],
  YES_NO: ['Yes', 'No'],
  ROOM_STATUS: ['Active', 'Inactive', 'Maintenance'],
  BOOKING_STATUS: ['New', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow'],
  BLOCK_SOURCE: ['Booking.com', 'Airbnb', 'Expedia', 'WhatsApp', 'Phone', 'Walk-in', 'Maintenance', 'Owner', 'Other'],
  BLOCK_STATUS: ['Active', 'Cancelled', 'Completed'],
  GALLERY_CATEGORY: ['Room', 'Reception', 'Terrace', 'Lobby', 'View', 'Interior', 'Exterior', 'Other'],
  GALLERY_STATUS: ['Active', 'Inactive'],
  VIDEO_CATEGORY: ['Apartment', 'General', 'Review', 'Other'],
  VIDEO_STATUS: ['Active', 'Inactive'],
  ADMIN_STATUS: ['Active', 'Inactive']
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Mamu Luxury')
    .addItem('Setup / განახლება', 'setupMamuLuxurySystem')
    .addItem('Fix validations only', 'fixValidationsOnly')
    .addItem('Add sample data', 'addSampleData')
    .addItem('Clear demo data', 'clearDemoData')
    .addToUi();
}

function setupMamuLuxurySystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(HEADERS).forEach(function(sheetName) {
    const sheet = getOrCreateSheet_(ss, sheetName);
    clearSheetValidations_(sheet);
    setupHeaders_(sheet, HEADERS[sheetName]);
    freezeAndStyle_(sheet);
  });

  setupSettings_(ss.getSheetByName(SHEETS.SETTINGS));
  setupAdmins_(ss.getSheetByName(SHEETS.ADMINS));
  sanitizeValidationColumns_(ss);
  setupValidations_(ss);
  addSampleData();
  log_('SETUP', 'System initialized or updated');

  SpreadsheetApp.getUi().alert('მზადაა! სისტემა განახლდა და validation შეცდომები გასუფთავდა.');
}

function fixValidationsOnly() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(function(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) clearSheetValidations_(sheet);
  });
  sanitizeValidationColumns_(ss);
  setupValidations_(ss);
  SpreadsheetApp.getUi().alert('Validation წესები გასწორებულია. ახლა ისევ გაუშვი Setup / განახლება.');
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function clearSheetValidations_(sheet) {
  if (!sheet) return;
  const rows = Math.max(sheet.getMaxRows(), 1);
  const cols = Math.max(sheet.getMaxColumns(), 1);
  sheet.getRange(1, 1, rows, cols).clearDataValidations();
}

function setupHeaders_(sheet, headers) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const existingHeaders = sheet.getLastRow() >= 1 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  const oldData = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues() : [];

  if (!oldData.length) {
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  const remappedRows = oldData.map(function(row) {
    const objectRow = {};
    existingHeaders.forEach(function(header, index) {
      if (header) objectRow[header] = row[index];
    });
    return headers.map(function(header) {
      return objectRow[header] !== undefined ? objectRow[header] : '';
    });
  });

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, remappedRows.length, headers.length).setValues(remappedRows);
}

function freezeAndStyle_(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return;
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

function sanitizeValidationColumns_(ss) {
  sanitizeColumn_(ss.getSheetByName(SHEETS.GALLERY), 4, VALIDATIONS.GALLERY_CATEGORY, 'Other');
  sanitizeColumn_(ss.getSheetByName(SHEETS.GALLERY), 5, VALIDATIONS.GALLERY_STATUS, 'Active');
  sanitizeColumn_(ss.getSheetByName(SHEETS.ROOM_TYPES), 31, VALIDATIONS.ROOM_TYPE_STATUS, 'Active');
  sanitizeColumn_(ss.getSheetByName(SHEETS.ROOM_TYPES), 32, VALIDATIONS.YES_NO, 'Yes');
  sanitizeColumn_(ss.getSheetByName(SHEETS.ROOMS), 5, VALIDATIONS.ROOM_STATUS, 'Active');
  sanitizeColumn_(ss.getSheetByName(SHEETS.VIDEOS), 4, VALIDATIONS.VIDEO_CATEGORY, 'General');
  sanitizeColumn_(ss.getSheetByName(SHEETS.VIDEOS), 5, VALIDATIONS.VIDEO_STATUS, 'Active');
}

function sanitizeColumn_(sheet, column, allowedValues, fallback) {
  if (!sheet || sheet.getLastRow() < 2) return;
  const range = sheet.getRange(2, column, sheet.getLastRow() - 1, 1);
  const values = range.getValues().map(function(row) {
    const value = String(row[0] || '').trim();
    if (!value) return [fallback];
    return allowedValues.indexOf(value) !== -1 ? [value] : [fallback];
  });
  range.setValues(values);
}

function setupValidations_(ss) {
  setValidation_(ss.getSheetByName(SHEETS.ROOM_TYPES), 31, VALIDATIONS.ROOM_TYPE_STATUS);
  setValidation_(ss.getSheetByName(SHEETS.ROOM_TYPES), 32, VALIDATIONS.YES_NO);
  setValidation_(ss.getSheetByName(SHEETS.ROOMS), 5, VALIDATIONS.ROOM_STATUS);
  setValidation_(ss.getSheetByName(SHEETS.BOOKINGS), 16, VALIDATIONS.BOOKING_STATUS);
  setValidation_(ss.getSheetByName(SHEETS.MANUAL_BLOCKS), 8, VALIDATIONS.BLOCK_SOURCE);
  setValidation_(ss.getSheetByName(SHEETS.MANUAL_BLOCKS), 11, VALIDATIONS.BLOCK_STATUS);
  setValidation_(ss.getSheetByName(SHEETS.GALLERY), 4, VALIDATIONS.GALLERY_CATEGORY);
  setValidation_(ss.getSheetByName(SHEETS.GALLERY), 5, VALIDATIONS.GALLERY_STATUS);
  setValidation_(ss.getSheetByName(SHEETS.VIDEOS), 4, VALIDATIONS.VIDEO_CATEGORY);
  setValidation_(ss.getSheetByName(SHEETS.VIDEOS), 5, VALIDATIONS.VIDEO_STATUS);
  setValidation_(ss.getSheetByName(SHEETS.ADMINS), 4, VALIDATIONS.ADMIN_STATUS);
}

function setValidation_(sheet, column, values) {
  if (!sheet) return;
  const rowCount = Math.max(sheet.getMaxRows() - 1, 1);
  const range = sheet.getRange(2, column, rowCount, 1);
  range.clearDataValidations();
  const rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  range.setDataValidation(rule);
}

function addSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  seedRoomTypes_(ss.getSheetByName(SHEETS.ROOM_TYPES));
  seedRooms_(ss.getSheetByName(SHEETS.ROOMS));
  seedGallery_(ss.getSheetByName(SHEETS.GALLERY));
  seedVideos_(ss.getSheetByName(SHEETS.VIDEOS));
}

function seedRoomTypes_(sheet) {
  if (!sheet || sheet.getLastRow() > 1) return;
  const now = new Date();
  const img = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';
  const rows = [
    makeRoomTypeRow_('TYPE-A', '1 საძინებლიანი აპარტამენტი', '1 Bedroom Apartment', 'Апартаменты с 1 спальней', 150, 2, 1, 1, '45 m²', img, 1),
    makeRoomTypeRow_('TYPE-B', '2 საძინებლიანი აპარტამენტი — სტილი 1', '2 Bedroom Apartment Style 1', 'Апартаменты с 2 спальнями — стиль 1', 260, 5, 2, 1, '70 m²', img, 2),
    makeRoomTypeRow_('TYPE-C', '2 საძინებლიანი აპარტამენტი — სტილი 2', '2 Bedroom Apartment Style 2', 'Апартаменты с 2 спальнями — стиль 2', 280, 5, 2, 1, '75 m²', img, 3),
    makeRoomTypeRow_('TYPE-D', '2 საძინებლიანი აპარტამენტი — სტილი 3', '2 Bedroom Apartment Style 3', 'Апартаменты с 2 спальнями — стиль 3', 300, 5, 2, 1, '80 m²', img, 4),
    makeRoomTypeRow_('VIP', 'VIP 1 საძინებლიანი აპარტამენტი', 'VIP 1 Bedroom Apartment', 'VIP апартаменты с 1 спальней', 450, 3, 1, 1, '60 m²', img, 5)
  ];
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function makeRoomTypeRow_(typeId, nameKa, nameEn, nameRu, price, guests, bedrooms, bathrooms, area, image, sortOrder) {
  const now = new Date();
  const shortKa = 'კომფორტული აპარტამენტი მშვიდი დასვენებისთვის.';
  const shortEn = 'A comfortable apartment for a relaxing stay.';
  const shortRu = 'Комфортные апартаменты для спокойного отдыха.';
  const fullKa = 'მყუდრო და კომფორტული აპარტამენტი — იდეალური არჩევანი დასვენებისთვის.';
  const fullEn = 'A cozy and comfortable apartment — an ideal choice for a relaxing stay.';
  const fullRu = 'Уютные и комфортные апартаменты — идеальный выбор для отдыха.';
  const amenitiesKa = 'Wi-Fi, ტელეფონი, კონდიციონერი, ცენტრალური გათბობა, აივანი, სრულად აღჭურვილი სამზარეულო, სამზარეულოს ინვენტარი, მაცივარი, ელექტრო ქურა, სარეცხი მანქანა';
  const amenitiesEn = 'Wi-Fi, telephone, air conditioning, central heating, balcony, fully equipped kitchen, kitchenware, refrigerator, electric stove, washing machine';
  const amenitiesRu = 'Wi-Fi, телефон, кондиционер, центральное отопление, балкон, полностью оборудованная кухня, кухонные принадлежности, холодильник, электрическая плита, стиральная машина';

  return [
    typeId, nameKa, nameKa, nameEn, nameRu,
    'Apartment', 'აპარტამენტი', 'Apartment', 'Апартаменты',
    shortKa, shortKa, shortEn, shortRu,
    fullKa, fullKa, fullEn, fullRu,
    amenitiesKa, amenitiesKa, amenitiesEn, amenitiesRu,
    price, '', guests, bedrooms, bathrooms, area,
    image, '', '',
    'Active', 'Yes', sortOrder, now, now
  ];
}

function seedRooms_(sheet) {
  if (!sheet || sheet.getLastRow() > 1) return;
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
  if (!sheet || sheet.getLastRow() > 1) return;
  sheet.appendRow(['GAL001', 'Luxury Interior', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'Interior', 'Active', 1, new Date(), new Date()]);
}

function seedVideos_(sheet) {
  if (!sheet || sheet.getLastRow() > 1) return;
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
  const params = e && e.parameter ? e.parameter : {};

  if (params.payload) {
    try {
      const payload = JSON.parse(params.payload || '{}');
      return handlePostAction_(payload);
    } catch (error) {
      return json_({ success: false, error: String(error) });
    }
  }

  const action = params.action || 'health';
  if (action === 'health') return json_({ success: true, message: 'Mamu Luxury API is working' });
  if (action === 'roomTypes') return json_({ success: true, data: getRows_(SHEETS.ROOM_TYPES, { Status: 'Active' }) });
  if (action === 'rooms') return json_({ success: true, data: getRows_(SHEETS.ROOMS) });
  if (action === 'gallery') return json_({ success: true, data: getRows_(SHEETS.GALLERY, { Status: 'Active' }) });
  if (action === 'videos') return json_({ success: true, data: getRows_(SHEETS.VIDEOS, { Status: 'Active' }) });
  if (action === 'settings') return json_({ success: true, data: getSettings_() });
  if (action === 'availability') return json_(checkAvailability_(params));
  if (action === 'calendar') return json_(getCalendar_(params));
  return json_({ success: false, error: 'Unknown action' });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    return handlePostAction_(payload);
  } catch (error) {
    return json_({ success: false, error: String(error) });
  }
}

function handlePostAction_(payload) {
  const action = payload.action || 'createBooking';
  if (action === 'createBooking') return createBooking_(payload);
  if (action === 'adminLogin') return adminLogin_(payload);
  if (action === 'updateBookingStatus') return updateBookingStatus_(payload);
  if (action === 'assignRoomToBooking') return assignRoomToBooking_(payload);
  if (action === 'createManualBlock') return createManualBlock_(payload);
  if (action === 'updateManualBlock') return updateManualBlock_(payload);
  if (action === 'upsertRoomType') return upsertRow_(SHEETS.ROOM_TYPES, 'TypeID', normalizeRoomTypeData_(payload.data));
  if (action === 'upsertRoom') return upsertRow_(SHEETS.ROOMS, 'RoomID', payload.data);
  if (action === 'upsertGallery') return upsertRow_(SHEETS.GALLERY, 'ID', payload.data);
  if (action === 'upsertVideo') return upsertRow_(SHEETS.VIDEOS, 'ID', payload.data);
  if (action === 'updateSetting') return updateSetting_(payload.key, payload.value);
  if (action === 'uploadImage') return uploadImage_(payload);
  return json_({ success: false, error: 'Unknown action: ' + action });
}

function normalizeRoomTypeData_(data) {
  data = data || {};
  data.Name = data.Name || data.Name_KA || data.Name_EN || data.Name_RU || '';
  data.Category = data.Category || data.Category_KA || data.Category_EN || data.Category_RU || '';
  data.ShortDescription = data.ShortDescription || data.ShortDescription_KA || data.ShortDescription_EN || data.ShortDescription_RU || '';
  data.FullDescription = data.FullDescription || data.FullDescription_KA || data.FullDescription_EN || data.FullDescription_RU || '';
  data.Amenities = data.Amenities || data.Amenities_KA || data.Amenities_EN || data.Amenities_RU || '';
  return data;
}

function uploadImage_(payload) {
  try {
    const settings = getSettings_();
    const apiKey = settings.imgbb_api_key || '104cf2ebb4a05c7908280dff041c8609';
    if (!apiKey) return json_({ success: false, error: 'ImgBB API key არ არის მითითებული Settings ფურცელში.' });

    const raw = String(payload.imageBase64 || '');
    if (!raw) return json_({ success: false, error: 'ფოტო არ არის მიღებული.' });

    const base64 = raw.indexOf(',') !== -1 ? raw.split(',').pop() : raw;
    const fileName = String(payload.fileName || 'mamu-luxury-apartment').replace(/\.[^.]+$/, '').slice(0, 80);

    const response = UrlFetchApp.fetch('https://api.imgbb.com/1/upload?key=' + encodeURIComponent(apiKey), {
      method: 'post',
      muteHttpExceptions: true,
      payload: {
        image: base64,
        name: fileName
      }
    });

    const code = response.getResponseCode();
    const text = response.getContentText();
    const result = JSON.parse(text || '{}');

    if (code < 200 || code >= 300 || !result.success) {
      const message = result && result.error && result.error.message ? result.error.message : 'ImgBB ატვირთვის შეცდომა';
      return json_({ success: false, error: message });
    }

    return json_({
      success: true,
      url: result.data && result.data.url ? result.data.url : '',
      displayUrl: result.data && result.data.display_url ? result.data.display_url : '',
      deleteUrl: result.data && result.data.delete_url ? result.data.delete_url : ''
    });
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