/* =========================================================
   LANDING 02 — NOIR · interações (GSAP + ScrollTrigger)
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => window.innerWidth > 860;

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('is-loading');

  /* ---------- Quebra títulos em linhas (para o efeito de máscara) ---------- */
  const splitLines = (el) => {
    const html = el.innerHTML.trim();
    const parts = html.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p) => `<span class="lr-line"><span>${p.trim()}</span></span>`).join('');
    return $$('.lr-line > span', el);
  };
  $$('.lines-reveal').forEach(splitLines);

  /* ---------- Preloader ---------- */
  const loader = $('#loader');
  const count = $('#loaderCount');
  const bar = $('#loaderBar');
  const heroImg = $('#heroImg');

  const introHero = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    loader.classList.add('is-done');

    const tl = gsap.timeline({ delay: 0.4, defaults: { ease: 'expo.out' } });
    tl.to(heroImg, { opacity: 1, scale: 1, duration: 2.4, ease: 'power2.out' }, 0)
      .to('.hero__eyebrow', { opacity: 1, duration: 1 }, 0.4)
      .to('.hero__title .line > span', { y: 0, duration: 1.4, stagger: 0.12 }, 0.5)
      .to('.hero__meta', { opacity: 1, duration: 1 }, 1.1)
      .to('.hero .btn-line', { opacity: 1, duration: 1 }, 1.3);
  };

  if (reduced) {
    count.textContent = '100';
    bar.style.width = '100%';
    introHero();
  } else {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: 100, duration: 1.8, ease: 'power2.inOut',
      onUpdate: () => { count.textContent = Math.round(obj.v); bar.style.width = `${obj.v}%`; },
      onComplete: introHero,
    });
  }

  /* ---------- Cursor ---------- */
  const cursor = $('#cursor');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    window.addEventListener('mousemove', (e) => { pos.x = e.clientX; pos.y = e.clientY; });
    gsap.ticker.add(() => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%,-50%)`;
    });
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-hover]');
      cursor.classList.toggle('is-hover', !!t && t.dataset.hover !== 'view');
      cursor.classList.toggle('is-view', !!t && t.dataset.hover === 'view');
    });
  }

  /* ---------- Nav mobile: burger + fundo ao rolar ---------- */
  const nav = $('#nav');
  const menu = $('#menu');
  const burger = $('#burger');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('.menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (isDesktop()) setMenu(false); });
  const navScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  navScroll();
  window.addEventListener('scroll', navScroll, { passive: true });

  /* ---------- Parallax do hero ao rolar ---------- */
  if (!reduced) {
    gsap.to('.hero__content', {
      y: 120, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to(heroImg, {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- Reveal genérico ---------- */
  $$('[data-reveal]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => el.classList.add('is-in') });
  });
  $$('.lines-reveal').forEach((el) => {
    gsap.to($$('.lr-line > span', el), {
      y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  /* ---------- Galeria horizontal (pinned) ---------- */
  const track = $('#hgalTrack');
  const progress = $('#hgalProgress');
  let hgalST;
  const buildHgal = () => {
    if (hgalST) { hgalST.kill(); gsap.set(track, { x: 0 }); }
    if (!isDesktop() || reduced) return;
    const dist = track.scrollWidth - window.innerWidth + 96;
    hgalST = gsap.to(track, {
      x: -dist, ease: 'none',
      scrollTrigger: {
        trigger: '.hgal', start: 'top top', end: () => `+=${dist}`,
        pin: '.hgal__pin', scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => (progress.style.width = `${self.progress * 100}%`),
      },
    }).scrollTrigger;
  };
  buildHgal();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildHgal(); ScrollTrigger.refresh(); }, 200); });

  /* ---------- Tour por ambientes ---------- */
  const tourItems = $$('.tour__item');
  const tourImgs = $$('.tour__stage img');
  const tourLabel = $('#tourLabel');
  let tourIdx = 0;
  let tourTimer;

  const setTour = (i) => {
    tourIdx = i;
    tourItems.forEach((it, k) => it.classList.toggle('is-active', k === i));
    tourImgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    tourLabel.textContent = $('h3', tourItems[i]).textContent;
    // reinicia a barra de progresso
    const barEl = $('.tour__bar i', tourItems[i]);
    barEl.style.animation = 'none';
    void barEl.offsetWidth;
    barEl.style.animation = '';
  };
  const startTour = () => {
    clearInterval(tourTimer);
    tourTimer = setInterval(() => setTour((tourIdx + 1) % tourItems.length), 5000);
  };
  tourItems.forEach((it) => {
    const go = () => { setTour(Number(it.dataset.index)); startTour(); };
    it.addEventListener('click', go);
    it.addEventListener('mouseenter', () => { if (isDesktop()) go(); });
  });
  ScrollTrigger.create({
    trigger: '.tour', start: 'top 60%', end: 'bottom 40%',
    onEnter: startTour, onEnterBack: startTour,
    onLeave: () => clearInterval(tourTimer), onLeaveBack: () => clearInterval(tourTimer),
  });

  /* ---------- Accordion ---------- */
  $$('.acc__item').forEach((item) => {
    $('.acc__head', item).addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      $$('.acc__item').forEach((i) => i.classList.remove('is-open'));
      if (!open) item.classList.add('is-open');
    });
  });

  /* ---------- Parallax CTA final ---------- */
  if (!reduced) {
    gsap.fromTo('#finalImg', { yPercent: -10 }, {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  /* ---------- Sticky bar (aparece depois do hero, some no CTA final) ---------- */
  const sticky = $('#stickybar');
  ScrollTrigger.create({
    trigger: '.hero', start: 'bottom 80%',
    onEnter: () => sticky.classList.add('is-visible'),
    onLeaveBack: () => sticky.classList.remove('is-visible'),
  });
  ScrollTrigger.create({
    trigger: '.final', start: 'top 70%',
    onEnter: () => sticky.classList.remove('is-visible'),
    onLeaveBack: () => sticky.classList.add('is-visible'),
  });

  /* ---------- Contador animado nas specs ---------- */
  $$('.spec b').forEach((el) => {
    const n = Number(el.textContent);
    if (Number.isNaN(n)) return;
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) }),
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
