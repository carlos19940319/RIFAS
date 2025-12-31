/* =========================
   script.js — VERSIÓN FINAL ESTABLE
   ✔ SPA
   ✔ Carta (libro)
   ✔ Carrusel
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
     CONTROL DEL LIBRO
  ========================= */
  const menuBook = document.querySelector('.menu-book');
  const book = document.querySelector('.book');

  function controlarLibro(seccion) {
    if (!menuBook || !book) return;

    if (seccion === 'carta' || seccion === 'eventos') {
      menuBook.classList.add('animar');
    } else {
      menuBook.classList.remove('animar');
      book.classList.remove('zoom');
    }
  }

  /* =========================
     CARTA / LIBRO (PÁGINAS)
  ========================= */
  const pages = [...document.querySelectorAll('.page')];
  let pageIndex = 0;
  let locked = false;

  function updatePages() {
    pages.forEach((page, i) => {
      const depth = (pages.length - i) * 0.15;
      page.style.transform =
        i < pageIndex
          ? `rotateY(-180deg) translateZ(${depth}px)`
          : `rotateY(0deg) translateZ(${depth}px)`;
    });
  }

  if (pages.length) updatePages();

  document.querySelector('.nav.next')?.addEventListener('click', () => {
    if (locked || pageIndex >= pages.length - 1) return;
    locked = true;
    pageIndex++;
    updatePages();
    setTimeout(() => locked = false, 700);
  });

  document.querySelector('.nav.prev')?.addEventListener('click', () => {
    if (locked || pageIndex <= 0) return;
    locked = true;
    pageIndex--;
    updatePages();
    setTimeout(() => locked = false, 700);
  });

  /* SWIPE LIBRO */
  let startX = 0;

  book?.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  });

  book?.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) document.querySelector('.nav.next')?.click();
    if (endX - startX > 50) document.querySelector('.nav.prev')?.click();
  });

  /* ZOOM */
  book?.addEventListener('click', () => {
    if (book.closest('.page-section.active')) {
      book.classList.toggle('zoom');
    }
  });

  /* =========================
     CARRUSEL EVENTOS
  ========================= */
  (function () {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const slides = [...carousel.querySelectorAll('.slide')];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsWrap = document.getElementById('dots');

    let slideIndex = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.children];

    function updateActive() {
      const center = carousel.scrollLeft + carousel.clientWidth / 2;
      let closest = 0;
      let min = Infinity;

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
      slideIndex = closest;
      dots.forEach(d => d.classList.remove('active'));
      dots[slideIndex]?.classList.add('active');
    }

    function goTo(i) {
      slideIndex = (i + slides.length) % slides.length;
      const slide = slides[slideIndex];
      const left = slide.offsetLeft - (carousel.clientWidth - slide.clientWidth) / 2;
      carousel.scrollTo({ left, behavior: 'smooth' });
      setTimeout(updateActive, 250);
    }

    prevBtn?.addEventListener('click', () => goTo(slideIndex - 1));
    nextBtn?.addEventListener('click', () => goTo(slideIndex + 1));

    carousel.addEventListener('scroll', () => {
      clearTimeout(window._scrollTimer);
      window._scrollTimer = setTimeout(updateActive, 100);
    });

    window.addEventListener('load', () => goTo(0));
  })();

  /* =========================
     RELOJ / ESTADO
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
     FOOTER AÑO
  ========================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});