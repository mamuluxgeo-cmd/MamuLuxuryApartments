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

    if (!CONFIG.IMGBB_API_KEY) {
      reject(new Error('ImgBB API key არ არის მითითებული config.js-ში'));
      return;
    }

    const reader = new FileReader();

    reader.onload = async function () {
      try {
        const base64 = String(reader.result || '').replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
        const formData = new FormData();
        formData.append('image', base64);
        formData.append('name', (file.name || 'mamu-luxury-apartment').replace(/\.[^.]+$/, ''));

        const response = await fetch('https://api.imgbb.com/1/upload?key=' + encodeURIComponent(CONFIG.IMGBB_API_KEY), {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          reject(new Error((result && result.error && result.error.message) || 'ფოტოს ატვირთვა ვერ მოხერხდა'));
          return;
        }

        resolve({
          success: true,
          url: result.data && result.data.url ? result.data.url : '',
          displayUrl: result.data && result.data.display_url ? result.data.display_url : '',
          deleteUrl: result.data && result.data.delete_url ? result.data.delete_url : ''
        });
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