(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- спуск: прогресс прокрутки первого экрана --- */
  var descent = document.querySelector('.descent');
  var sayA = document.querySelector('.say--a');
  var sayB = document.querySelector('.say--b');
  if (descent && !reduce) {
    root.classList.add('motion');
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = descent.getBoundingClientRect();
      var span = r.height - window.innerHeight + 64;
      var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      descent.style.setProperty('--p', p.toFixed(4));
      sayA.classList.toggle('is-off', p > 0.26);
      sayB.classList.toggle('is-off', p < 0.5);
      sayB.setAttribute('aria-hidden', p < 0.5 ? 'true' : 'false');
      var btn = sayB.querySelector('.btn');
      if (btn) btn.tabIndex = p < 0.5 ? -1 : 0;
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* --- открыто сейчас (по московскому времени, график с карточки: 7:30-22:30 ежедневно) --- */
  var OPEN = 7 * 60 + 30, CLOSE = 22 * 60 + 30;
  function moscowMinutes() {
    try {
      var s = new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', hour12: false });
      var a = s.split(':');
      return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
    } catch (e) { return null; }
  }
  var m = moscowMinutes();
  if (m !== null) {
    var open = m >= OPEN && m < CLOSE;
    var t1 = document.getElementById('openNow');
    var t2 = document.getElementById('openNow2');
    if (t1) t1.textContent = open ? 'Сейчас открыто до 22:30' : 'Сейчас закрыто, откроемся в 7:30';
    if (t2) t2.textContent = open ? 'Сейчас открыто.' : 'Сейчас закрыто, откроемся в 7:30.';
  }

  /* --- запись: собираем текст для WhatsApp, ничего никуда не отправляем --- */
  var chips = document.querySelectorAll('.chip');
  var car = document.getElementById('car');
  var wa = document.getElementById('wa');
  var base = 'https://wa.me/79015055550';
  function compose() {
    var what = [], when = '';
    document.querySelectorAll('.chip[data-v][aria-pressed="true"]').forEach(function (c) { what.push(c.getAttribute('data-v')); });
    var w = document.querySelector('.chip[data-w][aria-pressed="true"]');
    if (w) when = w.getAttribute('data-w');
    var parts = ['Здравствуйте! Хочу записаться в ICar24'];
    if (what.length) parts[0] += ': ' + what.join(', ');
    parts[0] += '.';
    if (when) parts.push('Удобно ' + when + '.');
    if (car && car.value.trim()) parts.push('Машина: ' + car.value.trim() + '.');
    wa.href = base + '?text=' + encodeURIComponent(parts.join(' '));
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var on = c.getAttribute('aria-pressed') === 'true';
      if (c.classList.contains('chip--one')) {
        document.querySelectorAll('.chip--one').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      }
      c.setAttribute('aria-pressed', on && !c.classList.contains('chip--one') ? 'false' : (on ? 'false' : 'true'));
      compose();
    });
  });
  if (car) car.addEventListener('input', compose);
  compose();
})();
