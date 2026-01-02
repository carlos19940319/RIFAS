/* =========================
   script.js — LA CHONA FINAL DEFINITIVO
   ✔ SPA estable
   ✔ Carta tipo libro SIN parpadeo
   ✔ Portada rígida
   ✔ Giro real izquierda / derecha
   ✔ Reset al salir de carta
   ✔ Carrusel optimizado
   ✔ Reloj / Estado
   ✔ Móvil fluido
========================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     FADE IN GENERAL
  ========================= */
  document.body.classList.add('show');

  /* =========================
     SPA — SECCIONES
  ========================= */
  const links = document.querySelectorAll('nav a[data-target]');
  const sections = document.querySelectorAll('.page-section');
  const defaultSection = 'inicio';

  function showSection(id, push = true) {

    /* 🔄 RESET LIBRO AL SALIR DE CARTA */
    const activeSection = document.querySelector('.page-section.active');
    if (activeSection?.id === 'carta' && id !== 'carta') {
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
      initLibro();
      window._libroInit = true;
    }
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showSection(link.dataset.target, true);
    });
  });

  showSection(location.hash.replace('#', '') || defaultSection, false);

  window.addEventListener('hashchange', () => {
    showSection(location.hash.replace('#', '') || defaultSection, false);
  });

  /* =========================
     📖 LIBRO / CARTA — PRO REAL
  ========================= */
  let pageIndex = 0;
  let lastIndex = 0;
  let locked = false;
  let pages = [];

  function initLibro() {

    const book = document.querySelector('.book');
    pages = [...document.querySelectorAll('.book .page')];
    const nextBtn = document.querySelector('.nav.next');
    const prevBtn = document.querySelector('.nav.prev');

    if (!book || !pages.length) return;

    /* Estado inicial limpio */
    pages.forEach((p, i) => {
      p.style.transform = 'rotateY(0deg)';
      p.style.zIndex = pages.length - i;
      p.classList.remove('turning', 'cover');
    });

    /* 📕 Portada rígida */
    pages[0]?.classList.add('cover');

    function updatePages() {

      pages.forEach((page, i) => {

        page.classList.remove('turning');

        /* =========================
           PÁGINAS YA PASADAS
        ========================= */
        if (i < pageIndex) {
          page.style.zIndex = i;
          page.style.transform = 'rotateY(-180deg)';
        }

        /* =========================
           PÁGINA ACTIVA (GIRO REAL)
        ========================= */
        else if (i === pageIndex) {

          const forward = pageIndex > lastIndex;
          page.style.zIndex = pages.length + 2;
          page.style.transitionDuration = (i === 0) ? '1.4s' : '1s';

          /* 🔒 nace girada (NUNCA plana) */
          page.style.transition = 'none';
          page.style.transform = forward
            ? 'rotateY(-180deg)'
            : 'rotateY(180deg)';

          page.getBoundingClientRect(); // fuerza render

          /* 🎞️ animación real */
          page.style.transition = '';
          page.classList.add('turning');
          page.style.transform = 'rotateY(0deg)';
        }

        /* =========================
           PÁGINAS FUTURAS
        ========================= */
        else {
          page.style.zIndex = pages.length - i;
          page.style.transform = 'rotateY(0deg)';
        }
      });

      lastIndex = pageIndex;
    }

    nextBtn.onclick = () => {
      if (locked || pageIndex >= pages.length - 1) return;
      locked = true;
      pageIndex++;
      updatePages();
      setTimeout(() => locked = false, 650);
    };

    prevBtn.onclick = () => {
      if (locked || pageIndex <= 0) return;
      locked = true;
      pageIndex--;
      updatePages();
      setTimeout(() => locked = false, 650);
    };

    /* 📱 Swipe móvil */
    let startX = 0;

    book.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive:true });

    book.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 60) nextBtn.click();
      if (endX - startX > 60) prevBtn.click();
    }, { passive:true });
  }

  /* 🔄 RESET LIBRO (PORTADA) */
  function resetLibro() {
    pageIndex = 0;
    lastIndex = 0;
    locked = false;

    pages.forEach((page, i) => {
      page.classList.remove('turning');
      page.style.transform = 'rotateY(0deg)';
      page.style.zIndex = pages.length - i;
    });
  }

  /* =========================
     🎞️ CARRUSEL EVENTOS
  ========================= */
  (function () {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const slides = [...carousel.querySelectorAll('.slide')];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsWrap = document.getElementById('dots');
    let index = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.children];

    function updateActive() {
      const center = carousel.scrollLeft + carousel.clientWidth / 2;
      let closest = 0, min = Infinity;

      slides.forEach((s, i) => {
        const c = s.offsetLeft + s.clientWidth / 2;
        const d = Math.abs(center - c);
        if (d < min) { min = d; closest = i; }
        s.classList.remove('active');
      });

      slides[closest]?.classList.add('active');
      index = closest;
      dots.forEach(d => d.classList.remove('active'));
      dots[index]?.classList.add('active');
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      const s = slides[index];
      carousel.scrollTo({
        left: s.offsetLeft - (carousel.clientWidth - s.clientWidth) / 2,
        behavior: 'smooth'
      });
      setTimeout(updateActive, 200);
    }

    prevBtn?.addEventListener('click', () => goTo(index - 1));
    nextBtn?.addEventListener('click', () => goTo(index + 1));

    carousel.addEventListener('scroll', () => {
      clearTimeout(window._st);
      window._st = setTimeout(updateActive, 120);
    });

    window.addEventListener('load', () => goTo(0));
  })();

  /* =========================
     ⏰ RELOJ / ESTADO
     Lunes a sábado: 8:45 a.m. – 5:00 p.m.
  ========================= */
  function actualizarReloj() {
    const reloj = document.getElementById("reloj");
    if (!reloj) return;

    const a = new Date();
    reloj.textContent =
      `${String(a.getHours()).padStart(2,'0')}:` +
      `${String(a.getMinutes()).padStart(2,'0')}:` +
      `${String(a.getSeconds()).padStart(2,'0')}`;
  }

  function actualizarEstado() {
    const estado = document.getElementById("estado");
    if (!estado) return;

    const a = new Date();
    const m = a.getHours() * 60 + a.getMinutes();
    const abierto = a.getDay() !== 0 && m >= 525 && m < 1020;

    estado.textContent = abierto ? "🟢 Abierto" : "🔴 Cerrado";
    estado.style.color = abierto ? "green" : "red";
  }

  setInterval(() => {
    actualizarReloj();
    actualizarEstado();
  }, 1000);

  actualizarReloj();
  actualizarEstado();

  /* =========================
     © FOOTER
  ========================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});