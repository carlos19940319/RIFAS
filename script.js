/* =========================
   script.js — LA CHONA FINAL DEFINITIVO
   ✔ SPA estable
   ✔ Carta tipo libro (SIN parpadeo)
   ✔ Portada rígida
   ✔ Giro distinto izquierda / derecha
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

    /* 🔄 RESET DEL LIBRO AL SALIR DE CARTA */
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
      requestAnimationFrame(initLibro);
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
     📖 LIBRO / CARTA — FINAL PRO
  ========================= */
  let pageIndex = 0;
  let lastIndex = 0;
  let locked = false;

  function initLibro() {

    const book = document.querySelector('.book');
    const pages = [...document.querySelectorAll('.book .page')];
    const nextBtn = document.querySelector('.nav.next');
    const prevBtn = document.querySelector('.nav.prev');

    if (!book || pages.length === 0) return;

    /* Estado inicial */
    pages.forEach((p, i) => {
      p.style.transform = 'rotateY(0deg)';
      p.style.zIndex = pages.length - i;
      p.style.transitionDuration = '1s';
      p.classList.remove('turning', 'cover');
    });

    /* 📕 Portada rígida */
    pages[0]?.classList.add('cover');

    function updatePages() {
      pages.forEach((page, i) => {

        page.classList.remove('turning');

        /* páginas ya pasadas */
        if (i < pageIndex) {
          page.style.transform = 'rotateY(-180deg)';
          page.style.zIndex = i;
        }

        /* página activa */
        else if (i === pageIndex) {

          const forward = pageIndex > lastIndex;

          /* portada gira más pesada */
          page.style.transitionDuration = (i === 0) ? '1.4s' : '1s';
          page.style.zIndex = pages.length + 2;

          /* ocultamos frame plano */
          page.style.transform = forward
            ? 'rotateY(-180deg)'
            : 'rotateY(180deg)';

          page.offsetHeight; // 🔒 fuerza repaint

          page.style.transform = 'rotateY(0deg)';
          page.classList.add('turning');
        }

        /* páginas futuras */
        else {
          page.style.transform = 'rotateY(0deg)';
          page.style.zIndex = pages.length - i;
        }
      });

      lastIndex = pageIndex;
    }

    /* Limpiar listeners previos */
    nextBtn?.replaceWith(nextBtn.cloneNode(true));
    prevBtn?.replaceWith(prevBtn.cloneNode(true));

    const next = document.querySelector('.nav.next');
    const prev = document.querySelector('.nav.prev');

    next?.addEventListener('click', () => {
      if (locked || pageIndex >= pages.length - 1) return;
      locked = true;
      pageIndex++;
      updatePages();
      setTimeout(() => locked = false, 650);
    });

    prev?.addEventListener('click', () => {
      if (locked || pageIndex <= 0) return;
      locked = true;
      pageIndex--;
      updatePages();
      setTimeout(() => locked = false, 650);
    });

    /* 📱 Swipe móvil */
    let startX = 0;

    book.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    book.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 60) next?.click();
      if (endX - startX > 60) prev?.click();
    }, { passive: true });
  }

  /* 🔄 RESET LIBRO (PORTADA) */
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
========================= */
function actualizarReloj() {
  const reloj = document.getElementById("reloj");
  if (!reloj) return;

  const ahora = new Date();
  let horas = ahora.getHours();
  const minutos = ahora.getMinutes();
  const segundos = ahora.getSeconds();

  const ampm = horas >= 12 ? 'p.m.' : 'a.m.';
  horas = horas % 12 || 12; // convierte a formato 12h

  reloj.textContent =
    `${String(horas).padStart(2,'0')}:` +
    `${String(minutos).padStart(2,'0')}:` +
    `${String(segundos).padStart(2,'0')} ${ampm}`;
}

function actualizarEstado() {
  const estado = document.getElementById("estado");
  if (!estado) return;

  const ahora = new Date();
  const dia = ahora.getDay(); // 0 = domingo
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

  // Horario: Lun–Sáb 8:45 a.m. a 5:00 p.m.
  const horaApertura = 8 * 60 + 45; // 8:45
  const horaCierre = 17 * 60;       // 5:00 p.m.

  const abierto =
    dia !== 0 && // domingo cerrado
    minutosActuales >= horaApertura &&
    minutosActuales < horaCierre;

  estado.textContent = abierto ? "🟢 Abierto" : "🔴 Cerrado";
  estado.style.color = abierto ? "green" : "red";
}

setInterval(() => {
  actualizarReloj();
  actualizarEstado();
}, 1000);

// ejecución inicial
actualizarReloj();
actualizarEstado();
  /* =========================
     © FOOTER
  ========================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});