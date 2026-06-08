// Makes contact buttons look clean and prevents the browser from showing raw tel: text in the bottom corner.
(function () {
  function getCurrentLang() {
    return (typeof CURRENT_LANG !== 'undefined' && CURRENT_LANG) ? CURRENT_LANG : (localStorage.getItem('site_lang') || 'ka');
  }

  function contactText(key) {
    const lang = getCurrentLang();
    const dict = {
      ka: { map: 'რუკაზე ნახვა', whatsapp: 'WhatsApp' },
      en: { map: 'View on Map', whatsapp: 'WhatsApp' },
      ru: { map: 'Открыть карту', whatsapp: 'WhatsApp' }
    };
    return (dict[lang] && dict[lang][key]) || dict.ka[key] || key;
  }

  function prettyPhone(phoneHref) {
    const raw = String(phoneHref || '').replace(/^tel:/i, '').trim();
    if (!raw) return 'Phone';
    return raw.replace(/(\+995)(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  function convertLinkToCleanButton(id, type) {
    const el = document.getElementById(id);
    if (!el) return;

    const href = el.getAttribute('href');
    if (href && href !== '#') {
      el.dataset.actionUrl = href;
      el.removeAttribute('href');
    }

    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');

    if (type === 'phone') {
      el.textContent = prettyPhone(el.dataset.actionUrl || href || el.textContent);
      el.setAttribute('aria-label', 'Call ' + el.textContent);
    }

    if (type === 'map') {
      el.textContent = contactText('map');
      el.setAttribute('aria-label', contactText('map'));
    }

    if (type === 'whatsapp') {
      el.textContent = contactText('whatsapp');
      el.setAttribute('aria-label', 'WhatsApp');
    }

    if (el.dataset.cleanBound === 'true') return;
    el.dataset.cleanBound = 'true';

    el.addEventListener('click', function (event) {
      event.preventDefault();
      const url = el.dataset.actionUrl;
      if (!url || url === '#') return;

      if (type === 'phone') {
        window.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    });

    el.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        el.click();
      }
    });
  }

  function fixContactButtons() {
    convertLinkToCleanButton('phoneLink', 'phone');
    convertLinkToCleanButton('mapLink', 'map');
    convertLinkToCleanButton('whatsappLink', 'whatsapp');
    convertLinkToCleanButton('whatsappFloat', 'whatsapp');
  }

  function injectContactButtonStyle() {
    if (document.getElementById('contactButtonFixStyles')) return;
    const style = document.createElement('style');
    style.id = 'contactButtonFixStyles';
    style.textContent = `
      .contact-list a[role='button'], .whatsapp-float[role='button']{cursor:pointer;user-select:none;text-decoration:none!important}
      .contact-list a[role='button']:focus-visible, .whatsapp-float[role='button']:focus-visible{outline:3px solid rgba(212,175,55,.55);outline-offset:3px}
      #phoneLink{min-width:150px;text-align:center}
    `;
    document.head.appendChild(style);
  }

  function initContactFix() {
    injectContactButtonStyle();
    fixContactButtons();

    const observer = new MutationObserver(function () {
      fixContactButtons();
    });

    ['phoneLink', 'mapLink', 'whatsappLink', 'whatsappFloat'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) observer.observe(el, { attributes: true, childList: true, subtree: true, attributeFilter: ['href'] });
    });

    document.addEventListener('click', function (event) {
      if (event.target.matches('.language-switcher button[data-lang]')) {
        setTimeout(fixContactButtons, 80);
      }
    });

    setTimeout(fixContactButtons, 400);
    setTimeout(fixContactButtons, 1200);
    setTimeout(fixContactButtons, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactFix);
  } else {
    initContactFix();
  }
})();
