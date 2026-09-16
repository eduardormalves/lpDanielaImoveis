/* =========================================================
   LANDING 01 — ELEGANCE · interações
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Header: estado ao rolar + menu mobile ---------- */
  const header = $('#header');
  const logo = $('.header__logo img');
  const onScroll = () => {
    const scrolled = window.scrollY > 40 || header.classList.contains('is-open');
    header.classList.toggle('is-scrolled', scrolled);
    logo.src = scrolled ? logo.dataset.dark : logo.dataset.light;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    header.classList.toggle('is-open', open);
    $('#burger').setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    onScroll();
  };
  $('#burger').addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  $$('.header__nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 860) setMenu(false); });

  /* ---------- Hero slideshow ---------- */
  const slides = $$('.hero__slide');
  let cur = 0;
  setInterval(() => {
    slides[cur].classList.remove('is-active');
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add('is-active');
  }, 6500);

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const delay = Number(e.target.dataset.delay || 0);
        setTimeout(() => e.target.classList.add('is-visible'), delay);
        revealIO.unobserve(e.target);
      });
    },
    { threshold: 0.12 }
  );
  $$('.reveal').forEach((el) => revealIO.observe(el));

  /* ---------- Contadores ---------- */
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const dur = 1400;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); } }),
    { threshold: 0.6 }
  );
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- Parallax leve nas imagens "sobre" ---------- */
  const parallaxEls = $$('[data-parallax]');
  const parallax = () => {
    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translateY(${center * Number(el.dataset.parallax) * -1}px)`;
    });
  };
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => requestAnimationFrame(parallax), { passive: true });
    parallax();
  }

  /* ---------- Galeria: filtros ---------- */
  const items = $$('.gallery__item');
  $$('.gallery__filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.gallery__filter').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      items.forEach((it, i) => {
        const show = f === 'todos' || it.dataset.cat === f;
        it.classList.toggle('is-hidden', !show);
        if (show) {
          it.classList.remove('is-visible');
          setTimeout(() => it.classList.add('is-visible'), 40 + i * 25);
        }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const fotos = window.__FOTOS__ || [];
  const lb = $('#lightbox');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCaption');
  const lbCount = $('#lbCounter');
  let lbIndex = 0;
  let visibleIdx = [];

  const openLb = (idx) => {
    visibleIdx = items.filter((it) => !it.classList.contains('is-hidden')).map((it) => Number(it.dataset.index));
    lbIndex = visibleIdx.indexOf(idx);
    renderLb();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const renderLb = () => {
    const f = fotos[visibleIdx[lbIndex]];
    lbImg.style.opacity = 0;
    setTimeout(() => {
      lbImg.src = f.src;
      lbImg.alt = f.alt;
      lbCap.textContent = f.titulo;
      lbCount.textContent = `${lbIndex + 1} / ${visibleIdx.length}`;
      lbImg.onload = () => (lbImg.style.opacity = 1);
    }, 120);
  };
  const stepLb = (d) => { lbIndex = (lbIndex + d + visibleIdx.length) % visibleIdx.length; renderLb(); };

  items.forEach((it) => it.addEventListener('click', () => openLb(Number(it.dataset.index))));
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => stepLb(-1));
  $('#lbNext').addEventListener('click', () => stepLb(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') stepLb(-1);
    if (e.key === 'ArrowRight') stepLb(1);
  });
  // swipe no mobile
  let touchX = 0;
  lb.addEventListener('touchstart', (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
  });
  lbImg.style.transition = 'opacity .25s, transform .4s';

  /* ---------- Formulário → WhatsApp ---------- */
  $('#leadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const nome = form.nome.value.trim();
    if (!nome) {
      form.nome.classList.add('is-error');
      form.nome.focus();
      setTimeout(() => form.nome.classList.remove('is-error'), 600);
      return;
    }
    const tel = form.telefone.value.trim();
    const msg = form.mensagem.value.trim();
    const texto = `${msg}\n\nNome: ${nome}${tel ? `\nTelefone: ${tel}` : ''}`;
    window.open(`https://wa.me/${window.__WA__}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  });

  /* ---------- Máscara simples de telefone ---------- */
  const tel = $('input[name="telefone"]');
  tel.addEventListener('input', () => {
    let v = tel.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    tel.value = v;
  });
})();
