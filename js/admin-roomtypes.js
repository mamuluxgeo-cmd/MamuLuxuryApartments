let ADMIN_ROOM_TYPES = [];

async function loadRoomTypes() {
  if (typeof $ === 'function' && $('statsGrid')) $('statsGrid').innerHTML = '';
  const panel = document.getElementById('mainPanel');
  if (!panel) return;

  panel.textContent = 'აპარტამენტების ტიპები იტვირთება...';

  const response = await apiGet('roomTypes');
  const roomTypes = response.data || [];
  ADMIN_ROOM_TYPES = roomTypes;

  panel.innerHTML =
    '<div class="panel-title-row">' +
      '<div><h3>Room Types Management</h3><p>აქედან მართავ მთავარ საიტზე გამოსაჩენ აპარტამენტის ბარათებს, ფასებს, ფოტოებს და აღწერებს.</p></div>' +
    '</div>' +
    renderRoomTypeForm() +
    renderRoomTypesTable(roomTypes);

  bindRoomTypeForm();
}

function rtField(label, html) {
  return '<label class="rt-field"><span>' + label + '</span>' + html + '</label>';
}

function renderRoomTypeForm() {
  return '<form class="room-type-editor" id="roomTypeForm">' +
    '<div class="rt-editor-head"><div><span class="eyebrow">Apartment Editor</span><h3>აპარტამენტის ტიპის რედაქტირება</h3><p>აირჩიე Edit, შეცვალე მონაცემები, ატვირთე ფოტო და დააჭირე შენახვას.</p></div><button type="submit" class="rt-save-btn">შენახვა</button></div>' +
    '<input type="hidden" name="TypeID" id="rtTypeID" />' +
    '<div class="rt-section"><h4>ძირითადი ინფორმაცია</h4><div class="rt-grid rt-grid-4">' +
      rtField('Type ID', '<input id="rtTypeIDVisible" placeholder="მაგ: TYPE-A" />') +
      rtField('სახელი KA', '<input name="Name_KA" id="rtName_KA" placeholder="ქართული სახელი" />') +
      rtField('Name EN', '<input name="Name_EN" id="rtName_EN" placeholder="English name" />') +
      rtField('Название RU', '<input name="Name_RU" id="rtName_RU" placeholder="Русское название" />') +
      rtField('კატეგორია KA', '<input name="Category_KA" id="rtCategory_KA" placeholder="ქართული კატეგორია" />') +
      rtField('Category EN', '<input name="Category_EN" id="rtCategory_EN" placeholder="English category" />') +
      rtField('Категория RU', '<input name="Category_RU" id="rtCategory_RU" placeholder="Русская категория" />') +
      rtField('Sort Order', '<input name="SortOrder" id="rtSortOrder" type="number" placeholder="1" />') +
      '<input type="hidden" name="Name" id="rtName" />' +
      '<input type="hidden" name="Category" id="rtCategory" />' +
    '</div></div>' +
    '<div class="rt-section"><h4>ფასი და პარამეტრები</h4><div class="rt-grid rt-grid-6">' +
      rtField('ფასი GEL', '<input name="Price" id="rtPrice" type="number" placeholder="ფასი ლარში" required />') +
      rtField('ძველი ფასი', '<input name="OldPrice" id="rtOldPrice" type="number" placeholder="სურვილისამებრ" />') +
      rtField('სტუმრები', '<input name="Guests" id="rtGuests" type="number" placeholder="5" />') +
      rtField('საძინებლები', '<input name="Bedrooms" id="rtBedrooms" type="number" placeholder="2" />') +
      rtField('აბაზანა', '<input name="Bathrooms" id="rtBathrooms" type="number" placeholder="1" />') +
      rtField('ფართი', '<input name="Area" id="rtArea" placeholder="70 m²" />') +
    '</div></div>' +
    '<div class="rt-section"><h4>ფოტოები და ვიდეო</h4>' +
      '<div class="rt-media-grid">' +
        '<div class="rt-upload-card">' +
          '<strong>მთავარი ფოტო</strong>' +
          '<p>ეს ფოტო გამოჩნდება მთავარ ბარათზე.</p>' +
          '<input name="MainImage" id="rtMainImage" placeholder="მთავარი ფოტო URL" />' +
          '<div class="rt-upload-actions"><input type="file" id="rtMainImageFile" accept="image/*" /><button type="button" onclick="uploadRoomTypeMainImage()">Upload Main Image</button></div>' +
        '</div>' +
        '<div class="rt-upload-card">' +
          '<strong>გალერეის ფოტოები</strong>' +
          '<p>ატვირთული ფოტო URL ავტომატურად დაემატება სიას.</p>' +
          '<input name="GalleryImages" id="rtGalleryImages" placeholder="ფოტო URL-ები მძიმით" />' +
          '<div class="rt-upload-actions"><input type="file" id="rtGalleryImageFile" accept="image/*" /><button type="button" onclick="uploadRoomTypeGalleryImage()">Upload Gallery Image</button></div>' +
        '</div>' +
      '</div>' +
      '<small id="roomTypeUploadStatus" class="rt-status"></small>' +
      '<div class="rt-grid rt-grid-1">' + rtField('YouTube Video', '<input name="YoutubeVideo" id="rtYoutubeVideo" placeholder="YouTube ლინკი" />') + '</div>' +
    '</div>' +
    '<div class="rt-section"><h4>აღწერები KA / EN / RU</h4>' +
      '<div class="rt-language-box"><h5>ქართული</h5><div class="rt-grid rt-grid-3">' +
        rtField('მოკლე აღწერა KA', '<textarea name="ShortDescription_KA" id="rtShortDescription_KA" placeholder="მოკლე აღწერა ქართულად"></textarea>') +
        rtField('სრული აღწერა KA', '<textarea name="FullDescription_KA" id="rtFullDescription_KA" placeholder="სრული აღწერა ქართულად"></textarea>') +
        rtField('Amenities KA', '<textarea name="Amenities_KA" id="rtAmenities_KA" placeholder="Wi-Fi, კონდიციონერი, აივანი"></textarea>') +
      '</div></div>' +
      '<div class="rt-language-box"><h5>English</h5><div class="rt-grid rt-grid-3">' +
        rtField('Short Description EN', '<textarea name="ShortDescription_EN" id="rtShortDescription_EN" placeholder="Short description in English"></textarea>') +
        rtField('Full Description EN', '<textarea name="FullDescription_EN" id="rtFullDescription_EN" placeholder="Full description in English"></textarea>') +
        rtField('Amenities EN', '<textarea name="Amenities_EN" id="rtAmenities_EN" placeholder="Wi-Fi, Air Conditioning, Balcony"></textarea>') +
      '</div></div>' +
      '<div class="rt-language-box"><h5>Русский</h5><div class="rt-grid rt-grid-3">' +
        rtField('Краткое описание RU', '<textarea name="ShortDescription_RU" id="rtShortDescription_RU" placeholder="Краткое описание на русском"></textarea>') +
        rtField('Полное описание RU', '<textarea name="FullDescription_RU" id="rtFullDescription_RU" placeholder="Полное описание на русском"></textarea>') +
        rtField('Удобства RU', '<textarea name="Amenities_RU" id="rtAmenities_RU" placeholder="Wi-Fi, кондиционер, балкон"></textarea>') +
      '</div></div>' +
      '<input type="hidden" name="ShortDescription" id="rtShortDescription" />' +
      '<input type="hidden" name="FullDescription" id="rtFullDescription" />' +
      '<input type="hidden" name="Amenities" id="rtAmenities" />' +
    '</div>' +
    '<div class="rt-section"><h4>გამოჩენა საიტზე</h4><div class="rt-grid rt-grid-3">' +
      rtField('Status', '<select name="Status" id="rtStatus"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>') +
      rtField('Featured', '<select name="Featured" id="rtFeatured"><option value="Yes">Yes</option><option value="No">No</option></select>') +
      '<div class="rt-form-message"><span id="roomTypeStatus"></span></div>' +
    '</div></div>' +
  '</form>';
}

function renderRoomTypesTable(items) {
  if (!items.length) return '<div class="empty-state">Room Types ჯერ არ არის.</div>';

  const rows = items.map(function (item) {
    const statusClass = 'status-' + String(item.Status || '').toLowerCase();
    return '<tr>' +
      '<td><strong>' + safe(item.Name_KA || item.Name) + '</strong><br><small>' + safe(item.TypeID) + '</small></td>' +
      '<td>' + safe(item.Category_KA || item.Category) + '</td>' +
      '<td>' + money(item.Price) + '</td>' +
      '<td>' + safe(item.Guests) + ' / ' + safe(item.Bedrooms) + ' / ' + safe(item.Bathrooms) + '</td>' +
      '<td><span class="status-pill ' + statusClass + '">' + safe(item.Status) + '</span></td>' +
      '<td>' + safe(item.Featured) + '</td>' +
      '<td><button class="mini-btn" onclick="editRoomType(\'' + safe(item.TypeID) + '\')">Edit</button></td>' +
    '</tr>';
  }).join('');

  return '<div class="table-wrap"><table class="admin-table"><thead><tr>' +
    '<th>სახელი</th><th>კატეგორია</th><th>ფასი</th><th>Guests/Bed/Bath</th><th>სტატუსი</th><th>Featured</th><th>მოქმედება</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function syncFallbackLanguageFields() {
  const nameKa = document.getElementById('rtName_KA');
  const categoryKa = document.getElementById('rtCategory_KA');
  const shortKa = document.getElementById('rtShortDescription_KA');
  const fullKa = document.getElementById('rtFullDescription_KA');
  const amenitiesKa = document.getElementById('rtAmenities_KA');

  document.getElementById('rtName').value = nameKa ? nameKa.value : '';
  document.getElementById('rtCategory').value = categoryKa ? categoryKa.value : '';
  document.getElementById('rtShortDescription').value = shortKa ? shortKa.value : '';
  document.getElementById('rtFullDescription').value = fullKa ? fullKa.value : '';
  document.getElementById('rtAmenities').value = amenitiesKa ? amenitiesKa.value : '';
}

function bindRoomTypeForm() {
  const form = document.getElementById('roomTypeForm');
  if (!form) return;

  const visibleId = document.getElementById('rtTypeIDVisible');
  const hiddenId = document.getElementById('rtTypeID');

  if (visibleId && hiddenId) {
    visibleId.addEventListener('input', function () {
      hiddenId.value = this.value.trim();
    });
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    syncFallbackLanguageFields();

    const status = document.getElementById('roomTypeStatus');
    if (status) status.textContent = 'ინახება...';

    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.TypeID) data.TypeID = visibleId.value.trim() || 'TYPE-' + Date.now();

    const result = await apiPost('upsertRoomType', { data: data });

    if (result.success) {
      if (status) status.textContent = 'Room Type შენახულია';
      form.reset();
      loadRoomTypes();
    } else {
      if (status) status.textContent = result.error || 'შენახვა ვერ მოხერხდა';
    }
  });
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function editRoomType(typeId) {
  const item = ADMIN_ROOM_TYPES.find(function (rt) {
    return String(rt.TypeID) === String(typeId);
  });

  if (!item) return;

  setInputValue('rtTypeID', item.TypeID);
  setInputValue('rtTypeIDVisible', item.TypeID);
  setInputValue('rtName_KA', item.Name_KA || item.Name);
  setInputValue('rtName_EN', item.Name_EN);
  setInputValue('rtName_RU', item.Name_RU);
  setInputValue('rtCategory_KA', item.Category_KA || item.Category);
  setInputValue('rtCategory_EN', item.Category_EN);
  setInputValue('rtCategory_RU', item.Category_RU);
  setInputValue('rtName', item.Name_KA || item.Name);
  setInputValue('rtCategory', item.Category_KA || item.Category);
  setInputValue('rtPrice', item.Price);
  setInputValue('rtOldPrice', item.OldPrice);
  setInputValue('rtGuests', item.Guests);
  setInputValue('rtBedrooms', item.Bedrooms);
  setInputValue('rtBathrooms', item.Bathrooms);
  setInputValue('rtArea', item.Area);
  setInputValue('rtMainImage', item.MainImage);
  setInputValue('rtGalleryImages', item.GalleryImages);
  setInputValue('rtYoutubeVideo', item.YoutubeVideo);
  setInputValue('rtShortDescription_KA', item.ShortDescription_KA || item.ShortDescription);
  setInputValue('rtShortDescription_EN', item.ShortDescription_EN);
  setInputValue('rtShortDescription_RU', item.ShortDescription_RU);
  setInputValue('rtFullDescription_KA', item.FullDescription_KA || item.FullDescription);
  setInputValue('rtFullDescription_EN', item.FullDescription_EN);
  setInputValue('rtFullDescription_RU', item.FullDescription_RU);
  setInputValue('rtAmenities_KA', item.Amenities_KA || item.Amenities);
  setInputValue('rtAmenities_EN', item.Amenities_EN);
  setInputValue('rtAmenities_RU', item.Amenities_RU);
  setInputValue('rtShortDescription', item.ShortDescription_KA || item.ShortDescription);
  setInputValue('rtFullDescription', item.FullDescription_KA || item.FullDescription);
  setInputValue('rtAmenities', item.Amenities_KA || item.Amenities);
  setInputValue('rtStatus', item.Status || 'Active');
  setInputValue('rtFeatured', item.Featured || 'Yes');
  setInputValue('rtSortOrder', item.SortOrder);

  const status = document.getElementById('roomTypeStatus');
  if (status) status.textContent = 'რედაქტირდება: ' + (item.Name_KA || item.Name || item.TypeID);

  document.getElementById('rtName_KA').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
