(function () {
  'use strict';
  var stage = document.querySelector('[data-stage]');
  var button = document.querySelector('[data-motion-toggle]');
  if (!stage || !button) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var buttonHome = button.parentNode;
  var off = null;
  try { var saved = localStorage.getItem('eeklera-effects'); if (saved === 'on' || saved === 'off') off = saved === 'off'; } catch (e) {}
  var frame = 0;
  var x = 0, y = 0;
  function reset() {
    cancelAnimationFrame(frame); frame = 0;
    ['--shift-x', '--shift-y', '--light-x', '--light-y'].forEach(function (key) { stage.style.removeProperty(key); });
  }
  function sync() {
    var destination = innerWidth > 1100 && pointer.matches ? document.body : buttonHome;
    if (button.parentNode !== destination) destination.appendChild(button);
    var disabled = off === null ? reduced.matches : off;
    document.body.setAttribute('data-effects', disabled ? 'off' : 'on');
    button.hidden = !pointer.matches;
    button.setAttribute('aria-pressed', String(disabled));
    button.textContent = disabled ? 'Включить эффекты' : 'Выключить эффекты';
    reset();
  }
  button.addEventListener('click', function () { off = document.body.getAttribute('data-effects') === 'on'; try { localStorage.setItem('eeklera-effects', off ? 'off' : 'on'); } catch (e) {} sync(); });
  stage.addEventListener('pointermove', function (event) {
    if (document.body.getAttribute('data-effects') !== 'on' || !pointer.matches) return;
    var box = stage.getBoundingClientRect();
    x = event.clientX / box.width - .5;
    y = (event.clientY - box.top) / box.height - .5;
    if (frame) return;
    frame = requestAnimationFrame(function () {
      stage.style.setProperty('--shift-x', (x * 7) + 'px');
      stage.style.setProperty('--shift-y', (y * 5) + 'px');
      stage.style.setProperty('--light-x', (x * 45) + 'px');
      stage.style.setProperty('--light-y', (y * 30) + 'px');
      frame = 0;
    });
  });
  stage.addEventListener('pointerleave', reset);
  document.addEventListener('visibilitychange', function () { if (document.hidden) reset(); });
  [reduced, pointer].forEach(function (query) {
    if (query.addEventListener) query.addEventListener('change', sync);
    else query.addListener(sync);
  });
  window.addEventListener('resize', sync, { passive: true });
  sync();
}());


