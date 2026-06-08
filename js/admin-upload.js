function uploadFileToImgbb(file) {
  return new Promise(function (resolve, reject) {
    if (!file) {
      reject(new Error('ფაილი არჩეული არ არის'));
      return;
    }

    if (!file.type || file.type.indexOf('image/') !== 0) {
      reject(new Error('აირჩიე მხოლოდ ფოტო ფაილი'));
      return;
    }

    const reader = new FileReader();

    reader.onload = async function () {
      try {
        const result = await apiPost('uploadImage', {
          imageBase64: reader.result,
          fileName: file.name || 'mamu-luxury-apartment'
        });

        if (!result.success) {
          reject(new Error(result.error || 'ფოტოს ატვირთვა ვერ მოხერხდა'));
          return;
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = function () {
      reject(new Error('ფაილის წაკითხვა ვერ მოხერხდა'));
    };

    reader.readAsDataURL(file);
  });
}

function setUploadStatus(text) {
  const status = document.getElementById('roomTypeUploadStatus');
  if (status) status.textContent = text;
}

function appendUrlToInput(input, url) {
  if (!input || !url) return;

  const current = input.value.trim();
  const parts = current
    ? current.split(/[\n,;|]+/).map(function (item) { return item.trim(); }).filter(Boolean)
    : [];

  if (parts.indexOf(url) === -1) parts.push(url);
  input.value = parts.join('\n');
}

function syncRoomTypeFallbackFieldsForUpload() {
  if (typeof syncFallbackLanguageFields === 'function') {
    syncFallbackLanguageFields();
  }
}

function collectRoomTypeFormDataForUpload() {
  const form = document.getElementById('roomTypeForm');
  const visibleId = document.getElementById('rtTypeIDVisible');
  const hiddenId = document.getElementById('rtTypeID');

  if (!form) {
    throw new Error('ჯერ გახსენი Room Types-ში კონკრეტული ოთახი Edit ღილაკით');
  }

  syncRoomTypeFallbackFieldsForUpload();

  const data = Object.fromEntries(new FormData(form).entries());
  const typeId = (data.TypeID || (visibleId ? visibleId.value : '') || '').trim();

  if (!typeId) {
    throw new Error('ჯერ აირჩიე ოთახი Edit ღილაკით ან შეავსე Type ID');
  }

  data.TypeID = typeId;
  if (hiddenId) hiddenId.value = typeId;

  return data;
}

async function autoSaveRoomTypePhotos() {
  const data = collectRoomTypeFormDataForUpload();
  const result = await apiPost('upsertRoomType', { data: data });

  if (!result.success) {
    throw new Error(result.error || 'ფოტო აიტვირთა, მაგრამ ოთახზე შენახვა ვერ მოხერხდა');
  }

  return result;
}

async function uploadRoomTypeMainImage() {
  const input = document.getElementById('rtMainImageFile');
  const urlInput = document.getElementById('rtMainImage');

  if (!input || !input.files || !input.files[0]) {
    setUploadStatus('ჯერ აირჩიე მთავარი ფოტო კომპიუტერიდან');
    return;
  }

  setUploadStatus('მთავარი ფოტო იტვირთება...');

  try {
    const result = await uploadFileToImgbb(input.files[0]);
    const url = result.url || result.displayUrl || '';

    if (!url) {
      throw new Error('ფოტო აიტვირთა, მაგრამ URL ვერ მივიღეთ');
    }

    if (urlInput) urlInput.value = url;

    setUploadStatus('ფოტო აიტვირთა, ახლა ოთახზე ინახება...');
    await autoSaveRoomTypePhotos();

    setUploadStatus('მთავარი ფოტო აიტვირთა და ავტომატურად დაემატა ამ ოთახს ✅');

    if (typeof loadRoomTypes === 'function') {
      setTimeout(loadRoomTypes, 700);
    }
  } catch (error) {
    setUploadStatus(error.message || 'ატვირთვა ვერ მოხერხდა');
  }
}

async function uploadRoomTypeGalleryImage() {
  const input = document.getElementById('rtGalleryImageFile');
  const galleryInput = document.getElementById('rtGalleryImages');

  if (!input || !input.files || input.files.length === 0) {
    setUploadStatus('ჯერ აირჩიე ერთი ან რამდენიმე ფოტო კომპიუტერიდან');
    return;
  }

  const files = Array.from(input.files);
  let uploaded = 0;

  setUploadStatus('ფოტოები იტვირთება: 0/' + files.length);

  try {
    for (const file of files) {
      const result = await uploadFileToImgbb(file);
      const url = result.url || result.displayUrl || '';

      if (!url) {
        throw new Error('ერთ-ერთი ფოტო აიტვირთა, მაგრამ URL ვერ მივიღეთ');
      }

      appendUrlToInput(galleryInput, url);
      uploaded += 1;
      setUploadStatus('ფოტოები იტვირთება: ' + uploaded + '/' + files.length);
    }

    setUploadStatus('ფოტოები აიტვირთა, ახლა ოთახზე ინახება...');
    await autoSaveRoomTypePhotos();

    setUploadStatus('აიტვირთა ' + uploaded + ' ფოტო და ავტომატურად დაემატა ამ ოთახს ✅');

    if (typeof loadRoomTypes === 'function') {
      setTimeout(loadRoomTypes, 700);
    }
  } catch (error) {
    setUploadStatus((error && error.message) ? error.message : 'ფოტოების ატვირთვა ვერ მოხერხდა');
  }
}