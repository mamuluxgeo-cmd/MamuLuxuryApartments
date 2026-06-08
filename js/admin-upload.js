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

async function uploadRoomTypeMainImage() {
  const input = document.getElementById('rtMainImageFile');
  const urlInput = document.getElementById('rtMainImage');

  if (!input || !input.files || !input.files[0]) {
    setUploadStatus('ჯერ აირჩიე მთავარი ფოტო');
    return;
  }

  setUploadStatus('მთავარი ფოტო იტვირთება...');

  try {
    const result = await uploadFileToImgbb(input.files[0]);
    const url = result.url || result.displayUrl || '';
    if (urlInput) urlInput.value = url;
    setUploadStatus('მთავარი ფოტო აიტვირთა. ახლა დააჭირე შენახვას.');
  } catch (error) {
    setUploadStatus(error.message || 'ატვირთვა ვერ მოხერხდა');
  }
}

async function uploadRoomTypeGalleryImage() {
  const input = document.getElementById('rtGalleryImageFile');
  const galleryInput = document.getElementById('rtGalleryImages');

  if (!input || !input.files || input.files.length === 0) {
    setUploadStatus('ჯერ აირჩიე ერთი ან რამდენიმე გალერეის ფოტო');
    return;
  }

  const files = Array.from(input.files);
  let uploaded = 0;
  setUploadStatus('გალერეის ფოტოები იტვირთება: 0/' + files.length);

  for (const file of files) {
    try {
      const result = await uploadFileToImgbb(file);
      const url = result.url || result.displayUrl || '';
      appendUrlToInput(galleryInput, url);
      uploaded += 1;
      setUploadStatus('გალერეის ფოტოები იტვირთება: ' + uploaded + '/' + files.length);
    } catch (error) {
      setUploadStatus((error && error.message) ? error.message : 'ერთ-ერთი ფოტოს ატვირთვა ვერ მოხერხდა');
      return;
    }
  }

  setUploadStatus('აიტვირთა ' + uploaded + ' ფოტო. ახლა დააჭირე შენახვას.');
}