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
    if (urlInput) urlInput.value = result.url || result.displayUrl || '';
    setUploadStatus('მთავარი ფოტო აიტვირთა და URL ჩაიწერა');
  } catch (error) {
    setUploadStatus(error.message || 'ატვირთვა ვერ მოხერხდა');
  }
}

async function uploadRoomTypeGalleryImage() {
  const input = document.getElementById('rtGalleryImageFile');
  const galleryInput = document.getElementById('rtGalleryImages');

  if (!input || !input.files || !input.files[0]) {
    setUploadStatus('ჯერ აირჩიე გალერეის ფოტო');
    return;
  }

  setUploadStatus('გალერეის ფოტო იტვირთება...');

  try {
    const result = await uploadFileToImgbb(input.files[0]);
    const url = result.url || result.displayUrl || '';

    if (galleryInput && url) {
      const current = galleryInput.value.trim();
      galleryInput.value = current ? current + ', ' + url : url;
    }

    setUploadStatus('გალერეის ფოტო აიტვირთა და URL დაემატა');
  } catch (error) {
    setUploadStatus(error.message || 'ატვირთვა ვერ მოხერხდა');
  }
}
