let ADMIN_GALLERY_ITEMS = [];
let ADMIN_GALLERY_ROOM_TYPES = [];

async function loadGalleryManagement() {
  if (typeof $ === 'function' && $('statsGrid')) $('statsGrid').innerHTML = '';
  const panel = document.getElementById('mainPanel');
  if (!panel) return;

  panel.textContent = 'გალერეა იტვირთება...';

  const responses = await Promise.all([
    apiGet('gallery'),
    apiGet('roomTypes')
  ]);

  const items = responses[0].data || [];
  const roomTypes = responses[1].data || [];

  ADMIN_GALLERY_ITEMS = items;
  ADMIN_GALLERY_ROOM_TYPES = roomTypes;

  panel.innerHTML =
    '<div class="panel-title-row">' +
      '<div><h3>Gallery Management</h3><p>აქ ატვირთავ სასტუმროს საერთო ფოტოებს და შეგიძლია ფოტოები პირდაპირ ოთახებიდანაც წამოიღო.</p></div>' +
    '</div>' +
    renderGalleryForm() +
    renderRoomPhotoImportPanel(roomTypes) +
    renderGalleryTable(items);

  bindGalleryForm();
}

function renderGalleryForm() {
  return '<form class="room-type-editor" id="galleryForm">' +
    '<div class="rt-editor-head"><div><span class="eyebrow">Hotel Gallery</span><h3>სასტუმროს საერთო გალერეა</h3><p>ატვირთე ფოტო და შეინახე საიტის Gallery სექციაში.</p></div><button type="submit" class="rt-save-btn">შენახვა</button></div>' +
    '<input type="hidden" name="ID" id="galID" />' +
    '<div class="rt-section"><h4>ფოტოს ინფორმაცია</h4><div class="rt-grid rt-grid-4">' +
      '<label class="rt-field"><span>Title</span><input name="Title" id="galTitle" placeholder="მაგ: Reception / Terrace" required /></label>' +
      '<label class="rt-field"><span>Category</span><select name="Category" id="galCategory"><option value="Room">Room</option><option value="Reception">Reception</option><option value="Terrace">Terrace</option><option value="Lobby">Lobby</option><option value="Exterior">Exterior</option><option value="View">View</option><option value="Interior">Interior</option><option value="Other">Other</option></select></label>' +
      '<label class="rt-field"><span>Status</span><select name="Status" id="galStatus"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>' +
      '<label class="rt-field"><span>Sort Order</span><input name="SortOrder" id="galSortOrder" type="number" placeholder="1" /></label>' +
    '</div></div>' +
    '<div class="rt-section"><h4>ფოტოს ატვირთვა</h4><div class="rt-upload-card">' +
      '<strong>Gallery Image</strong>' +
      '<p>აირჩიე ფოტო, დააჭირე Upload-ს და URL ავტომატურად ჩაიწერება.</p>' +
      '<input name="ImageUrl" id="galImageUrl" placeholder="Image URL" required />' +
      '<div class="rt-upload-actions"><input type="file" id="galImageFile" accept="image/*" /><button type="button" onclick="uploadGalleryMainImage()">Upload Gallery Image</button></div>' +
      '<small id="galleryUploadStatus" class="rt-status"></small>' +
    '</div></div>' +
    '<div class="rt-form-message"><span id="galleryStatus"></span></div>' +
  '</form>';
}

function renderRoomPhotoImportPanel(roomTypes) {
  const rows = (roomTypes || []).map(function (item) {
    const images = getRoomImagesForGalleryImport(item);
    const title = getRoomImportTitle(item);
    const disabled = images.length ? '' : ' disabled';
    const opacity = images.length ? '1' : '.45';

    return '<label class="rt-field" style="opacity:' + opacity + ';display:flex;gap:10px;align-items:flex-start;cursor:pointer;">' +
      '<input type="checkbox" name="roomPhotoImport" value="' + safe(item.TypeID) + '"' + disabled + ' style="width:auto;margin-top:4px;" />' +
      '<span><strong>' + safe(title) + '</strong><br><small>' + safe(item.TypeID) + ' • ფოტო: ' + images.length + '</small></span>' +
    '</label>';
  }).join('');

  return '<div class="room-type-editor">' +
    '<div class="rt-editor-head">' +
      '<div><span class="eyebrow">Import From Rooms</span><h3>ფოტოების წამოღება ოთახებიდან</h3><p>მონიშნე ოთახი/აპარტამენტი, მაგალითად 101, 102, 103 და დაადასტურე — მისი MainImage და GalleryImages ფოტოები დაემატება საერთო Gallery ალბომში.</p></div>' +
      '<button type="button" class="rt-save-btn" onclick="importSelectedRoomPhotosToGallery()">მონიშნულის წამოღება</button>' +
    '</div>' +
    '<div class="rt-section"><div class="rt-grid rt-grid-4">' + (rows || '<div class="empty-state">ოთახები ჯერ არ არის.</div>') + '</div></div>' +
    '<small id="roomPhotoImportStatus" class="rt-status"></small>' +
  '</div>';
}

function normalizeGalleryImportUrl(url) {
  let text = String(url || '').trim().replace(/&amp;/g, '&');
  if (!text) return '';

  if (/drive\.google\.com\/thumbnail\?/i.test(text)) return text;

  const driveFileMatch = text.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  const driveIdMatch = text.match(/[?&]id=([A-Za-z0-9_-]{20,})/);
  const driveId = driveFileMatch ? driveFileMatch[1] : (driveIdMatch ? driveIdMatch[1] : '');

  if (driveId && /drive\.google\.com/i.test(text)) {
    return 'https://drive.google.com/thumbnail?id=' + driveId + '&sz=w1600';
  }

  return /^https?:\/\//i.test(text) ? text : '';
}

function splitRoomPhotoUrls(value) {
  const text = String(value || '');
  const urls = text.match(/https?:\/\/[^\s,;|]+/gi) || [];
  return urls.map(normalizeGalleryImportUrl).filter(Boolean);
}

function pushUniqueUrl(list, url) {
  const cleanUrl = normalizeGalleryImportUrl(url);
  if (cleanUrl && list.indexOf(cleanUrl) === -1) list.push(cleanUrl);
}

function getRoomImagesForGalleryImport(item) {
  const images = [];
  pushUniqueUrl(images, item.MainImage);

  splitRoomPhotoUrls(item.GalleryImages).forEach(function (url) {
    pushUniqueUrl(images, url);
  });

  return images;
}

function getRoomImportTitle(item) {
  return item.Name_KA || item.Name || item.Name_EN || item.Name_RU || item.TypeID || 'Room';
}

function makeImportedGalleryId() {
  return 'GAL-ROOM-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getExistingGalleryUrlSet() {
  const set = {};
  ADMIN_GALLERY_ITEMS.forEach(function (item) {
    const url = normalizeGalleryImportUrl(item.ImageUrl);
    if (url) set[url] = true;
  });
  return set;
}

async function importSelectedRoomPhotosToGallery() {
  const status = document.getElementById('roomPhotoImportStatus');
  const checked = Array.from(document.querySelectorAll('input[name="roomPhotoImport"]:checked'));

  if (!checked.length) {
    if (status) status.textContent = 'ჯერ მონიშნე რომელი ოთახიდან წამოიღოს ფოტოები.';
    return;
  }

  if (status) status.textContent = 'ფოტოების წამოღება დაიწყო...';

  const selectedIds = checked.map(function (input) { return input.value; });
  const existingUrls = getExistingGalleryUrlSet();
  let added = 0;
  let skipped = 0;

  try {
    for (const typeId of selectedIds) {
      const room = ADMIN_GALLERY_ROOM_TYPES.find(function (item) {
        return String(item.TypeID) === String(typeId);
      });

      if (!room) continue;

      const title = getRoomImportTitle(room);
      const images = getRoomImagesForGalleryImport(room);

      for (let i = 0; i < images.length; i += 1) {
        const url = images[i];

        if (existingUrls[url]) {
          skipped += 1;
          continue;
        }

        const result = await apiPost('upsertGallery', {
          data: {
            ID: makeImportedGalleryId(),
            Title: title + ' — ფოტო ' + (i + 1),
            ImageUrl: url,
            Category: 'Room',
            Status: 'Active',
            SortOrder: Date.now() + added,
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString()
          }
        });

        if (!result.success) {
          throw new Error(result.error || 'გალერეაში ჩაწერა ვერ მოხერხდა');
        }

        existingUrls[url] = true;
        added += 1;
        if (status) status.textContent = 'ემატება გალერეაში: ' + added + ' ფოტო...';
      }
    }

    if (status) status.textContent = 'დასრულდა ✅ დაემატა ' + added + ' ფოტო. გამოტოვებულია დუბლიკატი: ' + skipped;
    setTimeout(loadGalleryManagement, 900);
  } catch (error) {
    if (status) status.textContent = error.message || 'ფოტოების წამოღება ვერ მოხერხდა';
  }
}

function renderGalleryTable(items) {
  if (!items.length) return '<div class="empty-state">გალერეის ფოტოები ჯერ არ არის.</div>';

  const rows = items.map(function (item) {
    const statusClass = 'status-' + String(item.Status || '').toLowerCase();
    const imageUrl = normalizeGalleryImportUrl(item.ImageUrl);
    return '<tr>' +
      '<td><img src="' + safe(imageUrl) + '" alt="' + safe(item.Title) + '" style="width:88px;height:58px;object-fit:cover;border-radius:12px;border:1px solid rgba(255,255,255,.12)"></td>' +
      '<td><strong>' + safe(item.Title) + '</strong><br><small>' + safe(item.ID) + '</small></td>' +
      '<td>' + safe(item.Category) + '</td>' +
      '<td><span class="status-pill ' + statusClass + '">' + safe(item.Status) + '</span></td>' +
      '<td>' + safe(item.SortOrder) + '</td>' +
      '<td><button class="mini-btn" onclick="editGalleryItem(\'' + safe(item.ID) + '\')">Edit</button></td>' +
    '</tr>';
  }).join('');

  return '<div class="table-wrap"><table class="admin-table"><thead><tr><th>ფოტო</th><th>სათაური</th><th>კატეგორია</th><th>სტატუსი</th><th>Sort</th><th>მოქმედება</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function bindGalleryForm() {
  const form = document.getElementById('galleryForm');
  if (!form) return;

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const status = document.getElementById('galleryStatus');
    if (status) status.textContent = 'ინახება...';

    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.ID) data.ID = 'GAL-' + Date.now();

    const result = await apiPost('upsertGallery', { data: data });

    if (result.success) {
      if (status) status.textContent = 'გალერეის ფოტო შენახულია';
      form.reset();
      loadGalleryManagement();
    } else {
      if (status) status.textContent = result.error || 'შენახვა ვერ მოხერხდა';
    }
  });
}

async function uploadGalleryMainImage() {
  const input = document.getElementById('galImageFile');
  const urlInput = document.getElementById('galImageUrl');
  const status = document.getElementById('galleryUploadStatus');

  if (!input || !input.files || !input.files[0]) {
    if (status) status.textContent = 'ჯერ აირჩიე ფოტო';
    return;
  }

  if (status) status.textContent = 'ფოტო იტვირთება...';

  try {
    const result = await uploadFileToImgbb(input.files[0]);
    if (urlInput) urlInput.value = result.url || result.displayUrl || '';
    if (status) status.textContent = 'ფოტო აიტვირთა და URL ჩაიწერა';
  } catch (error) {
    if (status) status.textContent = error.message || 'ატვირთვა ვერ მოხერხდა';
  }
}

function editGalleryItem(id) {
  const item = ADMIN_GALLERY_ITEMS.find(function (galleryItem) {
    return String(galleryItem.ID) === String(id);
  });

  if (!item) return;

  document.getElementById('galID').value = item.ID || '';
  document.getElementById('galTitle').value = item.Title || '';
  document.getElementById('galCategory').value = item.Category || 'Other';
  document.getElementById('galStatus').value = item.Status || 'Active';
  document.getElementById('galSortOrder').value = item.SortOrder || '';
  document.getElementById('galImageUrl').value = item.ImageUrl || '';

  const status = document.getElementById('galleryStatus');
  if (status) status.textContent = 'რედაქტირდება: ' + (item.Title || item.ID);

  document.getElementById('galTitle').scrollIntoView({ behavior: 'smooth', block: 'center' });
}