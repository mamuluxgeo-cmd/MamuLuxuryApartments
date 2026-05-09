document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('status');

  if (!GOOGLE_SCRIPT_URL) {
    status.textContent = 'გთხოვთ config.js-ში ჩასვათ Google Apps Script URL.';
    return;
  }

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  status.textContent = 'იგზავნება...';

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      status.textContent = 'თქვენი მოთხოვნა წარმატებით გაიგზავნა!';
      e.target.reset();
    } else {
      status.textContent = 'დაფიქსირდა შეცდომა.';
    }
  } catch (error) {
    status.textContent = 'დაკავშირება ვერ მოხერხდა.';
  }
});
