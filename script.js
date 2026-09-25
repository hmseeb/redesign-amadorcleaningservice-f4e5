/* =========================================================
   Amador Cleaning Services — site behaviour
   Vanilla JS, no dependencies. Every enhancement degrades
   gracefully: forms still work with JavaScript disabled.
   ========================================================= */
(function () {
  'use strict';

  var LEADR_ENDPOINT = 'https://vision.leadrai.com/api/forms/5e6338cda0747c9e54ab52e79da8b442';

  /* ---------- Current year in footer ---------- */
  function setYear() {
    var nodes = document.querySelectorAll('#year');
    var year = String(new Date().getFullYear());
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = year;
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    function close() {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    document.addEventListener('click', function (e) {
      if (!links.classList.contains('is-open')) return;
      if (links.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) close();
    });
  }

  /* ---------- Sticky header shadow ---------- */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el, index) {
      el.style.transitionDelay = (Math.min(index % 4, 3) * 70) + 'ms';
      observer.observe(el);
    });
  }

  /* ---------- Form helpers ---------- */
  function statusFor(form) {
    var card = form.closest('.form-card') || form.parentNode;
    return card ? card.querySelector('.form-status') : null;
  }

  function showStatus(form, type, title, detail) {
    var box = statusFor(form);
    if (!box) return;
    var text = box.querySelector('span');
    if (text) {
      text.innerHTML = '';
      var strong = document.createElement('strong');
      strong.textContent = title;
      text.appendChild(strong);
      text.appendChild(document.createTextNode(detail));
    }
    box.classList.remove('is-success', 'is-error');
    box.classList.add('is-visible', type === 'error' ? 'is-error' : 'is-success');
  }

  function hideStatus(form) {
    var box = statusFor(form);
    if (box) box.classList.remove('is-visible', 'is-success', 'is-error');
  }

  function setPageFields() {
    var fields = document.querySelectorAll('input[name="_page"]');
    for (var i = 0; i < fields.length; i++) fields[i].value = window.location.href;
  }

  /* Show the confirmation when we come back from a plain HTML POST */
  function handleSubmittedParam() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('submitted') !== '1') return;

    var forms = document.querySelectorAll('form[action="' + LEADR_ENDPOINT + '"]');
    if (!forms.length) return;

    var target = forms[0];
    showStatus(
      target,
      'success',
      'Thanks, your message was sent. ',
      "We'll get back to you shortly to confirm your cleaning."
    );
    target.reset();

    // Bring the confirmation into view without jumping on page load.
    window.setTimeout(function () {
      var box = statusFor(target);
      if (box && box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 260);
  }

  function validate(form) {
    var invalid = null;
    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var ok = field.checkValidity ? field.checkValidity() : String(field.value).trim() !== '';
      if (!ok && !invalid) invalid = field;
    }

    if (invalid) {
      showStatus(form, 'error', 'Please check the form. ', 'A few required details are missing or invalid.');
      if (invalid.focus) invalid.focus();
      return false;
    }
    return true;
  }

  function initForms() {
    var forms = document.querySelectorAll('form[action="' + LEADR_ENDPOINT + '"]');

    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        // Honeypot: silently drop bot submissions.
        var trap = form.querySelector('input[name="_gotcha"]');
        if (trap && trap.value) {
          event.preventDefault();
          return;
        }

        if (!validate(form)) {
          event.preventDefault();
          return;
        }

        if (!window.fetch || !window.FormData) return; // fall back to a plain POST

        event.preventDefault();
        hideStatus(form);

        var button = form.querySelector('button[type="submit"]');
        var label = button ? button.textContent : '';
        if (button) {
          button.disabled = true;
          button.textContent = 'Sending…';
        }

        var payload = {};
        var data = new FormData(form);
        data.forEach(function (value, key) {
          if (key === '_gotcha') return;
          payload[key] = typeof value === 'string' ? value : String(value);
        });
        payload._page = window.location.href;

        fetch(LEADR_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (response) {
            return response.json().catch(function () {
              return { ok: response.ok };
            });
          })
          .then(function (result) {
            if (result && result.ok) {
              form.reset();
              setPageFields();
              showStatus(
                form,
                'success',
                'Thanks, your message was sent. ',
                "We'll get back to you shortly to confirm your cleaning."
              );
            } else {
              throw new Error('Submission rejected');
            }
          })
          .catch(function () {
            showStatus(
              form,
              'error',
              "Sorry, that didn't send. ",
              'Please try again or call us on (281) 454-1558.'
            );
          })
          .then(function () {
            if (button) {
              button.disabled = false;
              button.textContent = label;
            }
          });
      });
    });
  }

  function init() {
    setYear();
    setPageFields();
    initNav();
    initHeader();
    initReveal();
    initForms();
    handleSubmittedParam();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
