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

function renderRoomTypeForm() {
  return '<form class="settings-form" id="roomTypeForm">' +
    '<input type="hidden" name="TypeID" id="rtTypeID" />' +
    '<label><span>Type ID</span><input id="rtTypeIDVisible" placeholder="მაგ: TYPE-A" /></label>' +
    '<label><span>Name</span><input name="Name" id="rtName" placeholder="Apartment name" required /></label>' +
    '<label><span>Category</span><input name="Category" id="rtCategory" placeholder="One Bedroom / Two Bedroom / VIP" /></label>' +
    '<label><span>Price GEL</span><input name="Price" id="rtPrice" type="number" placeholder="ფასი ლარში" required /></label>' +
    '<label><span>Old Price</span><input name="OldPrice" id="rtOldPrice" type="number" placeholder="ძველი ფასი სურვილისამებრ" /></label>' +
    '<label><span>Guests</span><input name="Guests" id="rtGuests" type="number" placeholder="სტუმრები" /></label>' +
    '<label><span>Bedrooms</span><input name="Bedrooms" id="rtBedrooms" type="number" placeholder="საძინებლები" /></label>' +
    '<label><span>Bathrooms</span><input name="Bathrooms" id="rtBathrooms" type="number" placeholder="აბაზანა" /></label>' +
    '<label><span>Area</span><input name="Area" id="rtArea" placeholder="მაგ: 70 m²" /></label>' +
    '<label><span>Main Image URL</span><input name="MainImage" id="rtMainImage" placeholder="მთავარი ფოტო URL" /></label>' +
    '<div class="upload-row"><input type="file" id="rtMainImageFile" accept="image/*" /><button type="button" onclick="uploadRoomTypeMainImage()">Upload Main Image</button></div>' +
    '<label><span>Gallery Images</span><input name="GalleryImages" id="rtGalleryImages" placeholder="ფოტო URL-ები მძიმით" /></label>' +
    '<div class="upload-row"><input type="file" id="rtGalleryImageFile" accept="image/*" /><button type="button" onclick="uploadRoomTypeGalleryImage()">Upload Gallery Image</button></div>' +
    '<small id="roomTypeUploadStatus"></small>' +
    '<label><span>YouTube Video</span><input name="YoutubeVideo" id="rtYoutubeVideo" placeholder="YouTube ლინკი" /></label>' +
    '<label><span>Short Description</span><textarea name="ShortDescription" id="rtShortDescription" placeholder="მოკლე აღწერა"></textarea></label>' +
    '<label><span>Full Description</span><textarea name="FullDescription" id="rtFullDescription" placeholder="სრული აღწერა"></textarea></label>' +
    '<label><span>Amenities</span><textarea name="Amenities" id="rtAmenities" placeholder="Wi-Fi, კონდიციონერი, აივანი"></textarea></label>' +
    '<label><span>Status</span><select name="Status" id="rtStatus"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>' +
    '<label><span>Featured</span><select name="Featured" id="rtFeatured"><option value="Yes">Yes</option><option value="No">No</option></select></label>' +
    '<label><span>Sort Order</span><input name="SortOrder" id="rtSortOrder" type="number" placeholder="1" /></label>' +
    '<button type="submit">Room Type შენახვა</button>' +
    '<small id="roomTypeStatus"></small>' +
  '</form>';
}

function renderRoomTypesTable(items) {
  if (!items.length) return '<div class="empty-state">Room Types ჯერ არ არის.</div>';

  const rows = items.map(function (item) {
    const statusClass = 'status-' + String(item.Status || '').toLowerCase();
    return '<tr>' +
      '<td><strong>' + safe(item.Name) + '</strong><br><small>' + safe(item.TypeID) + '</small></td>' +
      '<td>' + safe(item.Category) + '</td>' +
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

function editRoomType(typeId) {
  const item = ADMIN_ROOM_TYPES.find(function (rt) {
    return String(rt.TypeID) === String(typeId);
  });

  if (!item) return;

  document.getElementById('rtTypeID').value = item.TypeID || '';
  document.getElementById('rtTypeIDVisible').value = item.TypeID || '';
  document.getElementById('rtName').value = item.Name || '';
  document.getElementById('rtCategory').value = item.Category || '';
  document.getElementById('rtPrice').value = item.Price || '';
  document.getElementById('rtOldPrice').value = item.OldPrice || '';
  document.getElementById('rtGuests').value = item.Guests || '';
  document.getElementById('rtBedrooms').value = item.Bedrooms || '';
  document.getElementById('rtBathrooms').value = item.Bathrooms || '';
  document.getElementById('rtArea').value = item.Area || '';
  document.getElementById('rtMainImage').value = item.MainImage || '';
  document.getElementById('rtGalleryImages').value = item.GalleryImages || '';
  document.getElementById('rtYoutubeVideo').value = item.YoutubeVideo || '';
  document.getElementById('rtShortDescription').value = item.ShortDescription || '';
  document.getElementById('rtFullDescription').value = item.FullDescription || '';
  document.getElementById('rtAmenities').value = item.Amenities || '';
  document.getElementById('rtStatus').value = item.Status || 'Active';
  document.getElementById('rtFeatured').value = item.Featured || 'Yes';
  document.getElementById('rtSortOrder').value = item.SortOrder || '';

  const status = document.getElementById('roomTypeStatus');
  if (status) status.textContent = 'რედაქტირდება: ' + (item.Name || item.TypeID);

  document.getElementById('rtName').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
