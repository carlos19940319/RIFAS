/* =====================================================
   script.js — LA CHONA FINAL DEFINITIVO
   ✔ SPA estable
   ✔ Carta tipo libro (SIN parpadeo)
   ✔ Una sola hoja
   ✔ Reset limpio al salir
   ✔ Swipe móvil
   ✔ Reloj / Estado
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     FADE IN GENERAL
  ===================================================== */
  document.body.classList.add('show');

  /* =====================================================
     SPA — SECCIONES
  ===================================================== */
  const links = document.querySelectorAll('nav a[data-target]');
  const sections = document.querySelectorAll('.page-section');
  const defaultSection = 'inicio';

  function showSection(id, push = true) {

    const active = document.querySelector('.page-section.active');

    /* 🔄 Reset libro al salir de carta */
    if (active?.id === 'carta' && id !== 'carta') {
      resetLibro();
      window._libroInit = false;
    }

    sections.forEach(sec => {
      sec.classList.remove('active');
      sec.style.display = 'none';
    });

    links.forEach(link => link.classList.remove('active'));

    const section = document.getElementById(id);
    const link = document.querySelector(`nav a[data-target="${id}"]`);

    if (section) {
      section.style.display = 'block';
      requestAnimationFrame(() => section.classList.add('active'));
    }

    if (link) link.classList.add('active');
    if (push) history.replaceState(null, '', `#${id}`);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    /* 📖 Inicializar libro SOLO al entrar a carta */
    if (id === 'carta' && !window._libroInit) {
      requestAnimationFrame(initLibro);
      window._libroInit = true;
    }
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showSection(link.dataset.target);
    });
  });

  showSection(location.hash.replace('#', '') || defaultSection, false);

  window.addEventListener('hashchange', () => {
    showSection(location.hash.replace('#', '') || defaultSection, false);
  });

  /* =====================================================
     📖 LIBRO / CARTA — UNA SOLA HOJA
  ===================================================== */

  let pageIndex = 0;
  let locked = false;
  let firstTurn = true;

  function initLibro() {

    const book = document.querySelector('.book');
    const pages = [...document.querySelectorAll('.book .page')];
    const nextBtn = document.querySelector('.nav.next');
    const prevBtn = document.querySelector('.nav.prev');

    if (!book || !pages.length) return;

    /* =========================
       ESTADO INICIAL
    ========================= */
    pages.forEach((page, i) => {
      page.classList.remove('turning');
      page.style.transform = 'translateZ(0) rotateY(0deg)';
      page.style.zIndex = pages.length - i;
      page.style.willChange = 'transform';

      const img = page.querySelector('img');
      if (img) {
        img.loading = 'eager';
        img.decoding = 'sync';
        img.style.transform = 'translateZ(0)';
      }
    });

    /* =========================
       ACTUALIZAR PÁGINAS
    ========================= */
    function updatePages() {

      pages.forEach((page, i) => {

        page.classList.remove('turning');

        /* páginas pasadas */
        if (i < pageIndex) {
          page.style.zIndex = i;
          page.style.transform = 'translateZ(0) rotateY(-180deg)';
        }

        /* página activa */
        else if (i === pageIndex) {

          page.style.zIndex = pages.length + 5;
          page.classList.add('turning');

          if (firstTurn) {
            page.style.transitionDuration = '0.6s';
            firstTurn = false;
          } else {
            page.style.transitionDuration = '1s';
          }

          page.style.transform = 'translateZ(0) rotateY(0deg)';
        }

        /* páginas futuras */
        else {
          page.style.zIndex = pages.length - i;
          page.style.transform = 'translateZ(0) rotateY(0deg)';
        }
      });
    }

    /* =========================
       BOTONES
    ========================= */
    nextBtn.onclick = () => {
      if (locked || pageIndex >= pages.length - 1) return;
      locked = true;
      pageIndex++;
      updatePages();
      setTimeout(() => locked = false, 900);
    };

    prevBtn.onclick = () => {
      if (locked || pageIndex <= 0) return;
      locked = true;
      pageIndex--;
      updatePages();
      setTimeout(() => locked = false, 900);
    };

    /* =========================
       SWIPE MÓVIL
    ========================= */
    let startX = 0;

    book.ontouchstart = e => {
      startX = e.touches[0].clientX;
    };

    book.ontouchend = e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (diff > 60) nextBtn.click();
      if (diff < -60) prevBtn.click();
    };
  }

  /* =========================
     RESET LIBRO
  ========================= */
  function resetLibro() {

    const pages = document.querySelectorAll('.book .page');
    if (!pages.length) return;

    pageIndex = 0;
    locked = false;
    firstTurn = true;

    pages.forEach((page, i) => {
      page.classList.remove('turning');
      page.style.transitionDuration = '0s';
      page.style.transform = 'rotateY(0deg)';
      page.style.zIndex = pages.length - i;
    });

    requestAnimationFrame(() => {
      pages.forEach(page => page.style.transitionDuration = '');
    });
  }

  /* =====================================================
     ⏰ RELOJ / ESTADO
  ===================================================== */
  function actualizarReloj() {
    const reloj = document.getElementById('reloj');
    if (!reloj) return;
    const a = new Date();
    reloj.textContent =
      `${String(a.getHours()).padStart(2,'0')}:` +
      `${String(a.getMinutes()).padStart(2,'0')}:` +
      `${String(a.getSeconds()).padStart(2,'0')}`;
  }

  function actualizarEstado() {
    const estado = document.getElementById('estado');
    if (!estado) return;

    const a = new Date();
    const dia = a.getDay();
    const min = a.getHours() * 60 + a.getMinutes();

    const abierto = dia !== 0 && min >= (8*60+45) && min < (17*60);
    estado.textContent = abierto ? '🟢 Abierto' : '🔴 Cerrado';
    estado.style.color = abierto ? 'green' : 'red';
  }

  setInterval(() => {
    actualizarReloj();
    actualizarEstado();
  }, 1000);

  actualizarReloj();
  actualizarEstado();

  /* =====================================================
     © FOOTER
  ===================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
