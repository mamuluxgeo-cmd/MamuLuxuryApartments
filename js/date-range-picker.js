// Booking-style date range picker with hover highlight for check-in / check-out.
(function () {
  let activeField = 'checkin';
  let currentMonth = null;
  let hoverDate = '';
  let initialized = false;

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function toDateKey(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function parseDateKey(value) {
    const parts = String(value || '').split('-');
    if (parts.length !== 3) return null;
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function getForm() {
    return document.getElementById('bookingForm');
  }

  function getInput(name) {
    const form = getForm();
    return form ? form.querySelector('input[name="' + name + '"]') : null;
  }

  function getValue(name) {
    const input = getInput(name);
    return input ? input.value : '';
  }

  function setValue(name, value) {
    const input = getInput(name);
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function injectStyles() {
    if (document.getElementById('bookingRangePickerStyles')) return;

    const style = document.createElement('style');
    style.id = 'bookingRangePickerStyles';
    style.textContent = `
      .date-range-input{cursor:pointer;caret-color:transparent}.booking-range-picker{position:absolute;z-index:6000;width:min(360px,calc(100vw - 28px));padding:16px;border-radius:22px;border:1px solid rgba(255,255,255,.16);background:rgba(15,23,42,.97);box-shadow:0 26px 70px rgba(0,0,0,.38);backdrop-filter:blur(18px);color:#fff}.range-picker-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.range-picker-title{font-weight:900;color:var(--gold);letter-spacing:.02em}.range-picker-nav{display:flex;gap:8px}.range-picker-nav button,.range-picker-day{border:0;cursor:pointer}.range-picker-nav button{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;font-size:20px}.range-picker-nav button:hover{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#111827}.range-picker-weekdays,.range-picker-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.range-picker-weekdays span{text-align:center;font-size:12px;color:var(--muted);font-weight:800;padding:5px 0}.range-picker-day{height:40px;border-radius:12px;background:rgba(255,255,255,.055);color:#fff;font-weight:800;transition:.12s ease}.range-picker-day:hover{background:rgba(59,130,246,.72);color:#fff}.range-picker-day.muted{opacity:.32}.range-picker-day.start,.range-picker-day.end{background:#2563eb;color:#fff;box-shadow:0 8px 24px rgba(37,99,235,.35)}.range-picker-day.in-range{background:rgba(59,130,246,.32);color:#fff}.range-picker-day.hover-range{background:rgba(59,130,246,.50);color:#fff}.range-picker-foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px}.range-picker-foot button{border:0;background:transparent;color:#93c5fd;font-weight:900;cursor:pointer}.range-picker-foot button:hover{color:var(--gold)}body[data-theme='day'] .booking-range-picker{background:rgba(255,255,255,.98);color:#111827;border-color:rgba(15,23,42,.14)}body[data-theme='day'] .range-picker-nav button{background:rgba(15,23,42,.08);color:#111827}body[data-theme='day'] .range-picker-day{background:rgba(15,23,42,.055);color:#111827}body[data-theme='day'] .range-picker-day.start,body[data-theme='day'] .range-picker-day.end,body[data-theme='day'] .range-picker-day.in-range,body[data-theme='day'] .range-picker-day.hover-range{color:#fff}@media(max-width:600px){.booking-range-picker{left:14px!important;right:14px!important;width:auto}.range-picker-day{height:38px}}
    `;
    document.head.appendChild(style);
  }

  function ensurePicker() {
    let picker = document.getElementById('bookingRangePicker');
    if (picker) return picker;

    picker = document.createElement('div');
    picker.id = 'bookingRangePicker';
    picker.className = 'booking-range-picker';
    picker.style.display = 'none';
    picker.addEventListener('click', function (event) {
      event.stopPropagation();
    });
    document.body.appendChild(picker);
    return picker;
  }

  function positionPicker(anchor, picker) {
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 28);
    let left = rect.left + window.scrollX;
    if (left + width > window.scrollX + window.innerWidth - 14) {
      left = window.scrollX + window.innerWidth - width - 14;
    }
    picker.style.top = rect.bottom + window.scrollY + 8 + 'px';
    picker.style.left = Math.max(left, window.scrollX + 14) + 'px';
    picker.style.display = 'block';
  }

  function openPicker(field, anchor) {
    activeField = field;
    hoverDate = '';

    const selected = parseDateKey(anchor.value);
    const checkinDate = parseDateKey(getValue('checkin'));
    const today = new Date();
    currentMonth = selected || checkinDate || today;
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const picker = ensurePicker();
    positionPicker(anchor, picker);
    renderPicker();
  }

  function closePicker() {
    const picker = document.getElementById('bookingRangePicker');
    if (picker) picker.style.display = 'none';
    hoverDate = '';
  }

  function changeMonth(direction) {
    const base = currentMonth || new Date();
    currentMonth = new Date(base.getFullYear(), base.getMonth() + direction, 1);
    renderPicker();
  }

  function getDayClasses(date, key, monthStart, monthEnd) {
    const checkin = getValue('checkin');
    const checkout = getValue('checkout');
    const classes = [];

    if (date < monthStart || date > monthEnd) classes.push('muted');
    if (checkin && key === checkin) classes.push('start');
    if (checkout && key === checkout) classes.push('end');

    const rangeEnd = checkout || hoverDate;
    if (checkin && rangeEnd) {
      const min = checkin < rangeEnd ? checkin : rangeEnd;
      const max = checkin < rangeEnd ? rangeEnd : checkin;
      if (key > min && key < max) classes.push(checkout ? 'in-range' : 'hover-range');
    }

    return classes.join(' ');
  }

  function renderPicker() {
    const picker = document.getElementById('bookingRangePicker');
    if (!picker || picker.style.display === 'none') return;

    const month = currentMonth || new Date();
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    let html = '';
    html += '<div class="range-picker-head">';
    html += '<div class="range-picker-title">' + monthNames[month.getMonth()] + ' ' + month.getFullYear() + '</div>';
    html += '<div class="range-picker-nav"><button type="button" data-nav="-1">‹</button><button type="button" data-nav="1">›</button></div>';
    html += '</div>';
    html += '<div class="range-picker-weekdays">' + weekdays.map(function (day) { return '<span>' + day + '</span>'; }).join('') + '</div>';
    html += '<div class="range-picker-grid">';

    for (let i = 0; i < 42; i += 1) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + i);
      const key = toDateKey(day);
      html += '<button type="button" class="range-picker-day ' + getDayClasses(day, key, monthStart, monthEnd) + '" data-date="' + key + '">' + day.getDate() + '</button>';
    }

    html += '</div>';
    html += '<div class="range-picker-foot"><button type="button" data-clear="1">Clear</button><button type="button" data-today="1">Today</button></div>';
    picker.innerHTML = html;

    picker.querySelectorAll('[data-nav]').forEach(function (button) {
      button.addEventListener('click', function () { changeMonth(Number(button.dataset.nav)); });
    });

    picker.querySelectorAll('[data-date]').forEach(function (button) {
      button.addEventListener('mouseenter', function () {
        const key = button.dataset.date;
        const checkin = getValue('checkin');
        const checkout = getValue('checkout');
        hoverDate = checkin && !checkout ? key : '';
        renderPicker();
      });
      button.addEventListener('click', function () { selectDay(button.dataset.date); });
    });

    const clear = picker.querySelector('[data-clear]');
    if (clear) clear.addEventListener('click', function () {
      setValue('checkin', '');
      setValue('checkout', '');
      activeField = 'checkin';
      hoverDate = '';
      renderPicker();
      if (typeof updateBookingSummary === 'function') updateBookingSummary();
    });

    const todayButton = picker.querySelector('[data-today]');
    if (todayButton) todayButton.addEventListener('click', function () {
      const today = new Date();
      currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      renderPicker();
    });
  }

  function selectDay(key) {
    const checkin = getValue('checkin');
    const checkout = getValue('checkout');

    if (activeField === 'checkin' || !checkin || checkout) {
      setValue('checkin', key);
      setValue('checkout', '');
      activeField = 'checkout';
      hoverDate = '';
      renderPicker();
      if (typeof updateBookingSummary === 'function') updateBookingSummary();
      return;
    }

    if (key <= checkin) {
      setValue('checkin', key);
      setValue('checkout', '');
      activeField = 'checkout';
      hoverDate = '';
      renderPicker();
    } else {
      setValue('checkout', key);
      hoverDate = '';
      closePicker();
    }

    if (typeof updateBookingSummary === 'function') updateBookingSummary();
  }

  function init() {
    if (initialized) return;
    const checkin = getInput('checkin');
    const checkout = getInput('checkout');
    if (!checkin || !checkout) return;

    injectStyles();

    [checkin, checkout].forEach(function (input) {
      input.type = 'text';
      input.readOnly = true;
      input.autocomplete = 'off';
      input.classList.add('date-range-input');
    });

    checkin.addEventListener('click', function (event) {
      event.stopPropagation();
      openPicker('checkin', checkin);
    });

    checkout.addEventListener('click', function (event) {
      event.stopPropagation();
      openPicker('checkout', checkout);
    });

    document.addEventListener('click', function (event) {
      const picker = document.getElementById('bookingRangePicker');
      if (!picker) return;
      if (picker.contains(event.target) || event.target === checkin || event.target === checkout) return;
      closePicker();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closePicker();
    });

    initialized = true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    let attempts = 0;
    const timer = setInterval(function () {
      attempts += 1;
      init();
      if (initialized || attempts > 30) clearInterval(timer);
    }, 250);
  });
})();
