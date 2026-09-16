/* =========================================================
   LANDING 03 — STORY · scrollytelling, simulador, swiper
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Barra de progresso + nav ---------- */
  const progress = $('#progress');
  const nav = $('#nav');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${(scrollY / max) * 100}%`;
    nav.classList.toggle('is-scrolled', scrollY > 20);
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
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
  addEventListener('resize', () => { if (innerWidth > 860) setMenu(false); });

  /* ---------- Hero: máscara + card + texto ---------- */
  if (!reduced) {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__mask', { clipPath: 'inset(0 0 0% 0 round 20px)', duration: 1.6 }, 0.1)
      .to('.hero__mask img', { scale: 1, duration: 2 }, 0.1)
      .to('.hero__text .fade-up', { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, onStart() { $$('.hero__text .fade-up').forEach((e) => e.classList.add('is-in')); } }, 0.3)
      .to('.hero__card', { opacity: 1, y: 0, duration: 1 }, 1.1);
  } else {
    $$('.hero__text .fade-up').forEach((e) => e.classList.add('is-in'));
  }

  /* ---------- Fade-up genérico ---------- */
  $$('.fade-up:not(.hero__text .fade-up)').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => el.classList.add('is-in') });
  });

  /* ---------- Scrollytelling ---------- */
  const steps = $$('.story__step');
  const imgs = $$('.story__img');
  const counter = $('#storyCur');
  const setStep = (i) => {
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    imgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    counter.textContent = String(i + 1).padStart(2, '0');
  };
  setStep(0);
  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step, start: 'top 55%', end: 'bottom 55%',
      onEnter: () => setStep(i), onEnterBack: () => setStep(i),
    });
  });

  /* ---------- Swiper ---------- */
  new Swiper('.gallery__swiper', {
    slidesPerView: 'auto',
    spaceBetween: 20,
    centeredSlides: false,
    grabCursor: true,
    speed: 700,
    loop: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '#gNext', prevEl: '#gPrev' },
    keyboard: { enabled: true },
    autoplay: reduced ? false : { delay: 3800, disableOnInteraction: true },
  });

  /* ---------- Simulador (Tabela Price) ---------- */
  const preco = window.__PRECO__;
  const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const entrada = $('#simEntrada');
  const prazo = $('#simPrazo');
  const taxa = $('#simTaxa');
  const parcelaEl = $('#simParcela');
  const financiadoEl = $('#simFinanciado');

  const simular = () => {
    const pct = Number(entrada.value);
    const n = Number(prazo.value);
    const ia = Number(taxa.value);
    const valorEntrada = preco * (pct / 100);
    const pv = preco - valorEntrada;
    const i = Math.pow(1 + ia / 100, 1 / 12) - 1; // taxa anual → mensal equivalente
    const pmt = (pv * i) / (1 - Math.pow(1 + i, -n));

    $('#simEntradaTxt').textContent = brl(valorEntrada);
    $('#simEntradaPct').textContent = `${pct}%`;
    $('#simPrazoTxt').textContent = `${n} meses (${Math.round(n / 12)} anos)`;
    $('#simTaxaTxt').textContent = `${ia.toFixed(2).replace('.', ',')}%`;
    financiadoEl.textContent = brl(pv);

    parcelaEl.textContent = brl(pmt);
    parcelaEl.classList.remove('is-bump');
    void parcelaEl.offsetWidth;
    parcelaEl.classList.add('is-bump');
  };
  [entrada, prazo, taxa].forEach((r) => r.addEventListener('input', simular));
  simular();

  /* ---------- FAQ: fecha os outros ao abrir ---------- */
  $$('.faq__item').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) $$('.faq__item').forEach((o) => { if (o !== d) o.open = false; });
    });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
