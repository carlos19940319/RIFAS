/* =====================================================
   script.js — LA CHONA FINAL DEFINITIVO
   ✔ SPA estable
   ✔ Carta tipo libro (SIN parpadeo)
   ✔ Portada rígida
   ✔ Giro distinto izquierda / derecha
   ✔ Reset al salir de carta
   ✔ Carrusel optimizado
   ✔ Reloj / Estado
   ✔ Móvil fluido
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

    /* 🔄 Reset del libro al salir de carta */
    const activeSection = document.querySelector('.page-section.active');
    if (activeSection?.id === 'carta' && id !== 'carta') {
      resetLibro();
      window._libroInit = false;
    }

    sections.forEach(section => {
      section.classList.remove('active');
      section.style.display = 'none';
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
     📖 LIBRO / CARTA — FINAL PRO
  ===================================================== */
  let pageIndex = 0;
  let lastIndex = 0;
  let locked = false;

  function initLibro() {

    const book = document.querySelector('.book');
    const pages = [...document.querySelectorAll('.book .page')];
    const nextBtn = document.querySelector('.nav.next');
    const prevBtn = document.querySelector('.nav.prev');

    if (!book || !pages.length) return;

    /* Estado inicial del libro */
    pages.forEach((page, i) => {
      page.classList.remove('turning', 'cover');
      page.style.transitionDuration = '1s';
      page.style.transform = 'rotateY(0deg)';
      page.style.zIndex = pages.length - i;
    });

    /* 📕 Portada rígida */
    pages[0]?.classList.add('cover');


    /* ---------- ACTUALIZAR PÁGINAS ---------- */
    function updatePages() {
      pages.forEach((page, i) => {

        page.classList.remove('turning');

        /* Páginas ya pasadas */
        if (i < pageIndex) {
          page.style.zIndex = i;
          page.style.transitionDuration = '1s';
          page.style.transform =
            pageIndex > lastIndex
              ? 'rotateY(-180deg)'   // avanzar
              : 'rotateY(180deg)';   // regresar
        }

        /* Página activa (anti-flash real) */
        else if (i === pageIndex) {

          const forward = pageIndex > lastIndex;

          page.style.zIndex = pages.length + 2;
          page.style.transitionDuration = (i === 0) ? '1.4s' : '1s';

          page.style.transitionProperty = 'none';
          page.style.transform = forward
            ? 'rotateY(-180deg)'
            : 'rotateY(180deg)';

          page.getBoundingClientRect(); // fuerza render

          page.style.transitionProperty = '';
          page.classList.add('turning');
          page.style.transform = 'rotateY(0deg)';
        }

        /* Páginas futuras */
        else {
          page.style.zIndex = pages.length - i;
          page.style.transitionDuration = '1s';
          page.style.transform = 'rotateY(0deg)';
        }
      });

      lastIndex = pageIndex;
    }


    /* ---------- NAVEGACIÓN ---------- */
    nextBtn?.addEventListener('click', () => {
      if (locked || pageIndex >= pages.length - 1) return;
      locked = true;
      pageIndex++;
      updatePages();
      setTimeout(() => locked = false, 650);
    });

    prevBtn?.addEventListener('click', () => {
      if (locked || pageIndex <= 0) return;
      locked = true;
      pageIndex--;
      updatePages();
      setTimeout(() => locked = false, 650);
    });


    /* ---------- SWIPE MÓVIL ---------- */
    let startX = 0;

    book.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    book.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 60) nextBtn?.click();
      if (endX - startX > 60) prevBtn?.click();
    }, { passive: true });
  }


  /* =====================================================
     🔄 RESET LIBRO (PORTADA)
  ===================================================== */
  function resetLibro() {
    const pages = document.querySelectorAll('.book .page');
    if (!pages.length) return;

    pageIndex = 0;
    lastIndex = 0;
    locked = false;

    pages.forEach((page, i) => {
      page.classList.remove('turning');
      page.style.transitionDuration = '1s';
      page.style.transform = 'rotateY(0deg)';
      page.style.zIndex = pages.length - i;
    });
  }


  /* =====================================================
     ⏰ RELOJ / ESTADO — HORARIO OFICIAL
     Lunes a sábado: 8:45 a.m. – 5:00 p.m.
     Domingo: cerrado
  ===================================================== */
  function actualizarReloj() {
    const reloj = document.getElementById('reloj');
    if (!reloj) return;

    const ahora = new Date();
    reloj.textContent =
      `${String(ahora.getHours()).padStart(2,'0')}:` +
      `${String(ahora.getMinutes()).padStart(2,'0')}:` +
      `${String(ahora.getSeconds()).padStart(2,'0')}`;
  }

  function actualizarEstado() {
    const estado = document.getElementById('estado');
    if (!estado) return;

    const ahora = new Date();
    const dia = ahora.getDay();
    const minutos = ahora.getHours() * 60 + ahora.getMinutes();

    const apertura = 8 * 60 + 45;
    const cierre = 17 * 60;

    const abierto = dia !== 0 && minutos >= apertura && minutos < cierre;

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