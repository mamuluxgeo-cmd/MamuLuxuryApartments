function getBookingSummaryText(key) {
  const lang = (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG) ? CURRENT_LANG : 'ka';
  const dictionary = {
    ka: {
      choose: 'აირჩიე შესვლის და გასვლის თარიღი — ღამეებისა და ჯამის სანახავად.',
      invalid: 'გასვლის თარიღი უნდა იყოს შესვლის თარიღზე გვიანი.',
      nights: 'ღამე',
      nightPrice: '1 ღამის ფასი',
      total: 'ჯამი',
      guests: 'სტუმარი'
    },
    en: {
      choose: 'Choose check-in and check-out dates to see nights and total price.',
      invalid: 'Check-out date must be after check-in date.',
      nights: 'night(s)',
      nightPrice: 'Price per night',
      total: 'Total',
      guests: 'guest(s)'
    },
    ru: {
      choose: 'Выберите даты заезда и выезда, чтобы увидеть ночи и итоговую сумму.',
      invalid: 'Дата выезда должна быть позже даты заезда.',
      nights: 'ночей',
      nightPrice: 'Цена за ночь',
      total: 'Итого',
      guests: 'гостей'
    }
  };

  return (dictionary[lang] && dictionary[lang][key]) || dictionary.ka[key] || key;
}

function getBookingCurrency() {
  const currencyCode = (typeof CURRENT_CURRENCY !== 'undefined' && CURRENT_CURRENCY) ? CURRENT_CURRENCY : 'GEL';
  const currencyMap = (typeof CURRENCY !== 'undefined' && CURRENCY) ? CURRENCY : { GEL: { symbol: '₾', rate: 1 } };
  return currencyMap[currencyCode] || currencyMap.GEL || { symbol: '₾', rate: 1 };
}

function formatBookingMoney(priceGel) {
  const currency = getBookingCurrency();
  const amount = Math.round(Number(priceGel || 0) * Number(currency.rate || 1));
  return String(currency.symbol || '₾') + amount.toLocaleString('ka-GE');
}

function getBookingDateValue(form, fieldName, fallbackId) {
  const input = form.querySelector('[name="' + fieldName + '"]') || document.getElementById(fallbackId);
  return input ? input.value : '';
}

function getBookingNights(checkin, checkout) {
  if (!checkin || !checkout) return 0;

  const start = new Date(checkin + 'T00:00:00');
  const end = new Date(checkout + 'T00:00:00');
  const diff = end.getTime() - start.getTime();

  if (!Number.isFinite(diff) || diff <= 0) return -1;
  return Math.ceil(diff / 86400000);
}

function getRoomTypePrice(roomTypeId) {
  if (roomTypeId && typeof LAST_ROOM_TYPES !== 'undefined' && Array.isArray(LAST_ROOM_TYPES)) {
    const room = LAST_ROOM_TYPES.find(function (item) {
      return String(item.TypeID) === String(roomTypeId);
    });

    if (room && Number(room.Price) > 0) return Number(room.Price);
  }

  const select = document.getElementById('bookingRoomType');
  if (select && select.selectedOptions && select.selectedOptions[0]) {
    const optionText = select.selectedOptions[0].textContent || '';
    const match = optionText.replace(/,/g, '').match(/([0-9]+(?:\.[0-9]+)?)/g);
    if (match && match.length) return Number(match[match.length - 1]);
  }

  return 0;
}

function ensureBookingSummaryBox(form) {
  let box = document.getElementById('bookingPriceSummary');
  if (box) return box;

  box = document.createElement('div');
  box.id = 'bookingPriceSummary';
  box.className = 'booking-price-summary';
  box.textContent = getBookingSummaryText('choose');

  const dateRow = form.querySelector('.form-row');
  if (dateRow && dateRow.parentNode) {
    dateRow.parentNode.insertBefore(box, dateRow.nextSibling);
  } else {
    form.insertBefore(box, form.firstChild.nextSibling);
  }

  return box;
}

function updateBookingPriceSummary() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const box = ensureBookingSummaryBox(form);
  const select = document.getElementById('bookingRoomType');
  const roomTypeId = select ? select.value : '';
  const checkin = getBookingDateValue(form, 'checkin', 'detailCheckin');
  const checkout = getBookingDateValue(form, 'checkout', 'detailCheckout');
  const nights = getBookingNights(checkin, checkout);
  const price = getRoomTypePrice(roomTypeId);

  box.classList.remove('warning');

  if (!checkin || !checkout) {
    box.textContent = getBookingSummaryText('choose');
    return;
  }

  if (nights < 1) {
    box.classList.add('warning');
    box.textContent = getBookingSummaryText('invalid');
    return;
  }

  const total = nights * price;
  box.innerHTML =
    '<strong>' + getBookingSummaryText('nights') + ': ' + nights + '</strong>' +
    '<span>' + getBookingSummaryText('nightPrice') + ': ' + formatBookingMoney(price) + '</span>' +
    '<span>' + getBookingSummaryText('total') + ': ' + formatBookingMoney(total) + '</span>';
}

function injectBookingSummaryStyles() {
  if (document.getElementById('bookingSummaryStyles')) return;

  const style = document.createElement('style');
  style.id = 'bookingSummaryStyles';
  style.textContent = `
    .booking-price-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:15px 18px;border-radius:20px;border:1px solid rgba(212,175,55,.35);background:linear-gradient(135deg,rgba(212,175,55,.16),rgba(255,255,255,.06));color:var(--text);font-weight:800;box-shadow:0 12px 34px rgba(212,175,55,.1)}
    .booking-price-summary strong{color:var(--gold);font-size:1.04rem}.booking-price-summary span{color:var(--muted)}.booking-price-summary.warning{border-color:rgba(239,68,68,.45);background:rgba(239,68,68,.1);color:#fecaca}
    body[data-theme='day'] .booking-price-summary{background:linear-gradient(135deg,rgba(212,175,55,.17),rgba(255,255,255,.75))}
    @media(max-width:820px){.booking-price-summary{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);
}

function bindBookingSummary() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  injectBookingSummaryStyles();
  ensureBookingSummaryBox(form);

  ['change', 'input'].forEach(function (eventName) {
    form.addEventListener(eventName, function (event) {
      if (event.target.matches('select,input[type="date"],input[name="guests"]')) {
        updateBookingPriceSummary();
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (event.target.matches('.currency-switcher button,[data-lang]')) {
      setTimeout(updateBookingPriceSummary, 80);
    }
  });

  const select = document.getElementById('bookingRoomType');
  if (select) {
    const observer = new MutationObserver(function () {
      updateBookingPriceSummary();
    });
    observer.observe(select, { childList: true, subtree: true });
  }

  const oldSelectRoomType = window.selectRoomType;
  if (typeof oldSelectRoomType === 'function') {
    window.selectRoomType = function (typeId) {
      oldSelectRoomType(typeId);
      setTimeout(updateBookingPriceSummary, 30);
    };
  }

  updateBookingPriceSummary();
  setTimeout(updateBookingPriceSummary, 800);
  setTimeout(updateBookingPriceSummary, 1800);
}

document.addEventListener('DOMContentLoaded', bindBookingSummary);
