/* =========================
   script.js — LA CHONA FINAL
   ✔ SPA
   ✔ Carta (libro real)
   ✔ Carrusel
   ✔ Reloj / Estado
   ✔ Móvil gama baja
========================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     FADE IN
  ========================= */
  document.body.classList.add('show');

  /* =========================
     SPA — SECCIONES
  ========================= */
  const links = document.querySelectorAll('nav a[data-target]');
  const sections = document.querySelectorAll('.page-section');
  const defaultSection = 'inicio';

  function showSection(id, push = true) {

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

    controlarLibro(id);

    /* 🔥 INIT CARTA (TIMING CORRECTO) */
    if (id === 'carta') {
      requestAnimationFrame(() => {
        requestAnimationFrame(initLibro);
      });
    }
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showSection(link.dataset.target, true);
    });
  });

  const currentHash = location.hash.replace('#', '') || defaultSection;
  showSection(currentHash, false);

  window.addEventListener('hashchange', () => {
    showSection(location.hash.replace('#', '') || defaultSection, false);
  });

  /* =========================
     CONTROL VISUAL DEL LIBRO
  ========================= */
  const menuBook = document.querySelector('.menu-book');
  const bookContainer = document.querySelector('.book');

  function controlarLibro(seccion) {
    if (!menuBook || !bookContainer) return;

    if (seccion === 'carta' || seccion === 'eventos') {
      menuBook.classList.add('animar');
    } else {
      menuBook.classList.remove('animar');
      bookContainer.classList.remove('zoom');
    }
  }

  /* =========================
     📖 LIBRO / CARTA — FIX DEFINITIVO
  ========================= */

  let pageIndex = 0;
  let locked = false;

  function initLibro() {

    const book = document.querySelector('.book');
    const pages = [...document.querySelectorAll('.page')];
    const nextBtn = document.querySelector('.nav.next');
    const prevBtn = document.querySelector('.nav.prev');

    if (!book || pages.length === 0) return;

    /* RESET TOTAL */
    pageIndex = 0;
    locked = false;

    pages.forEach(p => {
      p.style.transform = '';
      p.classList.remove('turning');
    });

    function updatePages() {
      pages.forEach((page, i) => {
        const depth = (pages.length - i) * 0.15;
        page.classList.remove('turning');

        if (i < pageIndex) {
          page.style.transform = `rotateY(-180deg) translateZ(${depth}px)`;
        } else {
          page.style.transform = `rotateY(0deg) translateZ(${depth}px)`;
        }
      });

      /* 🔥 SOMBRA SOLO EN LA ACTIVA */
      if (pages[pageIndex]) {
        pages[pageIndex].classList.add('turning');
      }
    }

    updatePages();

    /* 🔁 CLONAR BOTONES (EVITA EVENTOS DUPLICADOS) */
    if (nextBtn) {
      const n = nextBtn.cloneNode(true);
      nextBtn.replaceWith(n);
    }

    if (prevBtn) {
      const p = prevBtn.cloneNode(true);
      prevBtn.replaceWith(p);
    }

    const next = document.querySelector('.nav.next');
    const prev = document.querySelector('.nav.prev');

    /* ▶️ SIGUIENTE */
    next?.addEventListener('click', () => {
      if (locked || pageIndex >= pages.length - 1) return;
      locked = true;
      pageIndex++;
      updatePages();
      setTimeout(() => locked = false, 900);
    });

    /* ◀️ ANTERIOR */
    prev?.addEventListener('click', () => {
      if (locked || pageIndex <= 0) return;
      locked = true;
      pageIndex--;
      updatePages();
      setTimeout(() => locked = false, 900);
    });

    /* 👉 SWIPE */
    let startX = 0;

    book.ontouchstart = e => {
      startX = e.touches[0].clientX;
    };

    book.ontouchend = e => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) next?.click();
      if (endX - startX > 50) prev?.click();
    };

    /* 🔍 ZOOM */
    book.onclick = () => {
      if (book.closest('.page-section.active')) {
        book.classList.toggle('zoom');
      }
    };
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

      slides.forEach((slide, i) => {
        const c = slide.offsetLeft + slide.clientWidth / 2;
        const d = Math.abs(center - c);
        if (d < min) {
          min = d;
          closest = i;
        }
        slide.classList.remove('active');
      });

      slides[closest]?.classList.add('active');
      index = closest;
      dots.forEach(d => d.classList.remove('active'));
      dots[index]?.classList.add('active');
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      const slide = slides[index];
      const left = slide.offsetLeft - (carousel.clientWidth - slide.clientWidth) / 2;
      carousel.scrollTo({ left, behavior: 'smooth' });
      setTimeout(updateActive, 250);
    }

    prevBtn?.addEventListener('click', () => goTo(index - 1));
    nextBtn?.addEventListener('click', () => goTo(index + 1));

    carousel.addEventListener('scroll', () => {
      clearTimeout(window._scrollTimer);
      window._scrollTimer = setTimeout(updateActive, 100);
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
    reloj.textContent =
      `${String(ahora.getHours()).padStart(2, '0')}:` +
      `${String(ahora.getMinutes()).padStart(2, '0')}:` +
      `${String(ahora.getSeconds()).padStart(2, '0')}`;
  }

  function actualizarEstado() {
    const estado = document.getElementById("estado");
    if (!estado) return;

    const ahora = new Date();
    const hoy = ahora.getDay();
    const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();

    /* Viernes 19:00–23:00 (ajústalo si quieres) */
    const abierto = hoy === 5 && ahoraMin >= 1140 && ahoraMin <= 1380;

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
     © FOOTER AÑO
  ========================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
