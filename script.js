/* =========================
   script.js — LA CHONA FINAL ESTABLE
   ✔ SPA
   ✔ Carta tipo libro real
   ✔ Carrusel
   ✔ Reloj / Estado
   ✔ Móvil estable
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

    /* 🔥 INICIALIZAR CARTA SOLO EN "carta" */
    if (id === 'carta') {
      requestAnimationFrame(() => {
        resetLibro();
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

  showSection(location.hash.replace('#', '') || defaultSection, false);

  window.addEventListener('hashchange', () => {
    showSection(location.hash.replace('#', '') || defaultSection, false);
  });

  /* =========================
     📖 LIBRO / CARTA — DEFINITIVO
  ========================= */
  let pageIndex = 0;
  let locked = false;

  function resetLibro() {
    const pages = document.querySelectorAll('.book .page');
    pageIndex = 0;
    locked = false;

    pages.forEach((p, i) => {
      p.style.transform = 'rotateY(0deg)';
      p.style.zIndex = pages.length - i;
      p.classList.remove('turning');
    });
  }

  function initLibro() {

    const book = document.querySelector('.book');
    const pages = [...document.querySelectorAll('.book .page')];
    const nextBtn = document.querySelector('.nav.next');
    const prevBtn = document.querySelector('.nav.prev');

    if (!book || pages.length === 0) return;

    function updatePages() {
      pages.forEach((page, i) => {
        if (i < pageIndex) {
          page.style.transform = 'rotateY(-180deg)';
          page.style.zIndex = i;
          page.classList.remove('turning');
        } 
else if (i === pageIndex) {
  page.style.transform = 'rotateY(0deg)';
  page.classList.add('turning');

  /* 🔒 retrasamos el z-index para evitar repaint */
  requestAnimationFrame(() => {
    page.style.zIndex = pages.length + 5;
  });
}

else {
          page.style.transform = 'rotateY(0deg)';
          page.style.zIndex = pages.length - i;
          page.classList.remove('turning');
        }
      });
    }

    updatePages();

    /* 🔁 limpiar listeners previos */
    nextBtn?.replaceWith(nextBtn.cloneNode(true));
    prevBtn?.replaceWith(prevBtn.cloneNode(true));

    const next = document.querySelector('.nav.next');
    const prev = document.querySelector('.nav.prev');

    next?.addEventListener('click', () => {
      if (locked || pageIndex >= pages.length - 1) return;
      locked = true;
      pageIndex++;
      updatePages();
      setTimeout(() => locked = false, 700);
    });

    prev?.addEventListener('click', () => {
      if (locked || pageIndex <= 0) return;
      locked = true;
      pageIndex--;
      updatePages();
      setTimeout(() => locked = false, 700);
    });

    /* 📱 Swipe móvil */
    let startX = 0;

    book.ontouchstart = e => {
      startX = e.touches[0].clientX;
    };

    book.ontouchend = e => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 60) next?.click();
      if (endX - startX > 60) prev?.click();
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
      setTimeout(updateActive, 250);
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
    const minutos = a.getHours() * 60 + a.getMinutes();
    const abierto = a.getDay() === 5 && minutos >= 1140 && minutos <= 1380;
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