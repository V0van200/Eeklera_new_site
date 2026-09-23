/* Classic script: compatible with file://; no dependencies or requests. */
(function () {
  'use strict';
  var header = document.querySelector('[data-site-header]');
  if (!header) return;
  var toggle = header.querySelector('[data-menu-toggle]');
  var nav = header.querySelector('[data-site-nav]');
  if (!toggle || !nav || !nav.id) return;
  var mobile = window.matchMedia('(max-width: 760px)');
  toggle.setAttribute('aria-controls', nav.id);
  function setOpen(open, restoreFocus) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (open) nav.setAttribute('data-open', '');
    else nav.removeAttribute('data-open');
    if (restoreFocus) toggle.focus();
  }
  setOpen(false, false);
  header.setAttribute('data-menu-ready', '');
  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true', false);
  });
  header.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false, true);
    }
  });
  nav.addEventListener('click', function (event) {
    if (mobile.matches && event.target.closest('a')) setOpen(false, true);
  });
  document.addEventListener('click', function (event) {
    if (mobile.matches && !header.contains(event.target)) setOpen(false, false);
  });
  function onResize() {
    var focused = document.activeElement;
    var focusWillHide = mobile.matches ? nav.contains(focused) : focused === toggle;
    setOpen(false, false);
    if (focusWillHide) {
      if (mobile.matches) toggle.focus();
      else { var firstLink = nav.querySelector('a'); if (firstLink) firstLink.focus(); }
    }
  }
  if (mobile.addEventListener) mobile.addEventListener('change', onResize);
  else mobile.addListener(onResize);
}());
