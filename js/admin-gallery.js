let ADMIN_GALLERY_ITEMS = [];

async function loadGalleryManagement() {
  if (typeof $ === 'function' && $('statsGrid')) $('statsGrid').innerHTML = '';
  const panel = document.getElementById('mainPanel');
  if (!panel) return;

  panel.textContent = 'გალერეა იტვირთება...';

  const response = await apiGet('gallery');
  const items = response.data || [];
  ADMIN_GALLERY_ITEMS = items;

  panel.innerHTML =
    '<div class="panel-title-row">' +
      '<div><h3>Gallery Management</h3><p>აქ ატვირთავ სასტუმროს საერთო ფოტოებს: რეცეფშენი, ტერასა, ხედები, ეზო, ლობი და სხვა სივრცეები.</p></div>' +
    '</div>' +
    renderGalleryForm() +
    renderGalleryTable(items);

  bindGalleryForm();
}

function renderGalleryForm() {
  return '<form class="room-type-editor" id="galleryForm">' +
    '<div class="rt-editor-head"><div><span class="eyebrow">Hotel Gallery</span><h3>სასტუმროს საერთო გალერეა</h3><p>ატვირთე ფოტო imgbb-ზე და შეინახე საიტის Gallery სექციაში.</p></div><button type="submit" class="rt-save-btn">შენახვა</button></div>' +
    '<input type="hidden" name="ID" id="galID" />' +
    '<div class="rt-section"><h4>ფოტოს ინფორმაცია</h4><div class="rt-grid rt-grid-4">' +
      '<label class="rt-field"><span>Title</span><input name="Title" id="galTitle" placeholder="მაგ: Reception / Terrace" required /></label>' +
      '<label class="rt-field"><span>Category</span><select name="Category" id="galCategory"><option value="Reception">Reception</option><option value="Terrace">Terrace</option><option value="Lobby">Lobby</option><option value="Exterior">Exterior</option><option value="View">View</option><option value="Interior">Interior</option><option value="Other">Other</option></select></label>' +
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

function renderGalleryTable(items) {
  if (!items.length) return '<div class="empty-state">გალერეის ფოტოები ჯერ არ არის.</div>';

  const rows = items.map(function (item) {
    const statusClass = 'status-' + String(item.Status || '').toLowerCase();
    return '<tr>' +
      '<td><img src="' + safe(item.ImageUrl) + '" alt="' + safe(item.Title) + '" style="width:88px;height:58px;object-fit:cover;border-radius:12px;border:1px solid rgba(255,255,255,.12)"></td>' +
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
