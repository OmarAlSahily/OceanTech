/* Ocean Technology — interactions
   - Blue wave page transition between pages
   - Sticky header shadow, mobile menu
   - Reveal-on-scroll
*/
(function () {
  var root = document.documentElement;
  var WAVE_KEY = 'ot-wave';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(set, value) {
    try {
      if (set) { sessionStorage.setItem(WAVE_KEY, value); }
      else { sessionStorage.removeItem(WAVE_KEY); }
    } catch (e) { /* storage unavailable: transition still works one-way */ }
  }

  /* ---------- Arriving: wave washes away ---------- */
  function washAway() {
    if (!root.classList.contains('wave-arriving')) return;
    store(false);
    var overlay = document.querySelector('.wave-transition');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add('wave-out');
      });
    });
    var done = function () { root.classList.remove('wave-arriving', 'wave-out'); };
    if (overlay) overlay.addEventListener('animationend', done, { once: true });
    setTimeout(done, 1600); // safety net
  }

  /* ---------- Leaving: wave rises, then navigate ---------- */
  function normalizePath(p) { return p.replace(/index\.html$/, '').replace(/\/+$/, '/') || '/'; }

  function isPageLink(a, e) {
    if (!a || e.defaultPrevented || e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download') || a.dataset.noWave !== undefined) return false;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return false;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return false; }
    if (url.origin !== location.origin) return false;
    // Same page with only a hash change → let the browser smooth-scroll
    if (normalizePath(url.pathname) === normalizePath(location.pathname) && url.search === location.search) return false;
    return url;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    var url = isPageLink(a, e);
    if (!url) return;
    if (reduceMotion) return; // plain navigation
    e.preventDefault();
    closeMenu();
    var overlay = document.querySelector('.wave-transition');
    var go = function () { store(true, '1'); location.href = url.href; };
    root.classList.remove('wave-arriving', 'wave-out');
    root.classList.add('wave-leaving');
    var fired = false;
    var once = function () { if (fired) return; fired = true; go(); };
    if (overlay) overlay.addEventListener('animationend', once, { once: true });
    setTimeout(once, 950);
  });

  // Back/forward cache: make sure the overlay is not left covering the page
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      root.classList.remove('wave-leaving', 'wave-out');
      if (root.classList.contains('wave-arriving')) washAway();
    }
  });

  /* ---------- Header ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = document.querySelector('.menu-toggle');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ---------- Reveal on scroll ---------- */
  function setupReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Partner filter (partners page) ---------- */
  var filterBtns = document.querySelectorAll('.filter[data-filter]');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      document.querySelectorAll('.partner-card[data-cat]').forEach(function (card) {
        var cats = card.getAttribute('data-cat').split(' ');
        card.classList.toggle('is-hidden', f !== 'all' && cats.indexOf(f) === -1);
      });
    });
  });

  /* ---------- Contact form → opens the visitor's email app (static hosting) ---------- */
  var form = document.querySelector('form[data-mailto]');
  if (form) {
    // Preselect the topic from links like contact.html?topic=mssp
    var topicKey = new URLSearchParams(location.search).get('topic');
    if (topicKey) {
      var opt = form.querySelector('option[data-key="' + topicKey.replace(/[^a-z-]/gi, '') + '"]');
      if (opt) opt.selected = true;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var subject = (d.get('topic') || 'Enquiry') + ' — ' + (d.get('name') || '');
      var body = [
        'Name: ' + (d.get('name') || ''),
        'Company: ' + (d.get('company') || ''),
        'Email: ' + (d.get('email') || ''),
        'Phone: ' + (d.get('phone') || ''),
        '',
        d.get('message') || ''
      ].join('\n');
      location.href = 'mailto:' + form.getAttribute('data-mailto') +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- News: open the story a link points to (news.html#story) ---------- */
  function openStoryFromHash() {
    if (!location.hash) return;
    var target = document.getElementById(location.hash.slice(1));
    var details = target && target.classList.contains('news-item') && target.querySelector('details');
    if (details) {
      details.open = true;
      requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
    }
  }
  openStoryFromHash();
  window.addEventListener('hashchange', openStoryFromHash);

  /* ---------- "Under a cyber attack?" dialog (MSSP page) ---------- */
  var irDialog = document.getElementById('under-attack');
  if (irDialog) {
    var openIr = function () {
      if (typeof irDialog.showModal === 'function') { if (!irDialog.open) irDialog.showModal(); }
      else { location.href = 'tel:+218213342285'; }
    };
    document.querySelectorAll('[data-ir-open]').forEach(function (b) { b.addEventListener('click', openIr); });
    irDialog.addEventListener('click', function (e) {
      // close on the × button or a click on the backdrop (outside the box)
      if (e.target === irDialog || (e.target.closest && e.target.closest('[data-ir-close]'))) irDialog.close();
    });
    if (location.hash === '#under-attack') openIr();   // shareable link: mssp.html#under-attack
  }

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  onScroll();
  setupReveal();
  // Reveal the new page once it has loaded (or after a short cap, so slow fonts never hold it)
  var washed = false;
  var washOnce = function () { if (washed) return; washed = true; washAway(); };
  if (document.readyState === 'complete') washOnce();
  else { window.addEventListener('load', washOnce); setTimeout(washOnce, 700); }
})();
