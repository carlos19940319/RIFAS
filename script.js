/* =========================
   script.js — CÓDIGO COMPLETO CORREGIDO
========================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     FADE IN INICIAL
  ========================= */
  document.body.classList.add('show');

  /* =========================
     SPA — SECCIONES
  ========================= */
  const links = document.querySelectorAll('nav a[data-target]');
  const sections = document.querySelectorAll('.page-section');
  const defaultSection = 'inicio';

  function showSection(id, push = true) {

    // 🔒 Ocultar todas las secciones
    sections.forEach(sec => {
      sec.classList.remove('active');
      sec.style.display = 'none';
    });

    // 🔘 Desactivar links
    links.forEach(link => link.classList.remove('active'));

    // ✅ Mostrar sección activa
    const section = document.getElementById(id);
    const link = document.querySelector(`nav a[data-target="${id}"]`);

    if (section) {
      section.style.display = 'block';
      requestAnimationFrame(() => section.classList.add('active'));
    }

    if (link) link.classList.add('active');

    if (push) history.replaceState(null, '', `#${id}`);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 🔥 Controlar libro según sección
    controlarLibro(id);
  }

  // Click en navegación
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showSection(link.dataset.target, true);
    });
  });

  // Carga inicial
  const currentHash = location.hash.replace('#', '') || defaultSection;
  showSection(currentHash, false);

  // Cambio de hash
  window.addEventListener('hashchange', () => {
    showSection(location.hash.replace('#', '') || defaultSection, false);
  });

  /* =========================
     CONTROL DEL LIBRO (CLAVE)
  ========================= */
  const menuBook = document.querySelector('.menu-book');
  const book = document.querySelector('.book');

  function controlarLibro(seccionActiva) {
    if (!menuBook || !book) return;

    if (seccionActiva === 'carta' || seccionActiva === 'eventos') {
      menuBook.classList.add('animar');
    } else {
      menuBook.classList.remove('animar');
      book.classList.remove('zoom');
    }
  }

  /* =========================
     TARJETAS
  ========================= */
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('click', e => {
      e.stopPropagation();
      cards.forEach(c => {
        if (c !== card) c.classList.remove('selected');
      });
      card.classList.toggle('selected');
    });
  });

  document.addEventListener('click', e => {
    cards.forEach(card => {
      if (!card.contains(e.target)) card.classList.remove('selected');
    });
  });

  /* =========================
     RELOJ Y ESTADO
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

  let ultimoEstado = "";

  function actualizarEstado() {
    const estado = document.getElementById("estado");
    if (!estado) return;
    const ahora = new Date();
    const hoy = ahora.getDay();
    let abierto = false;

    if ([5].includes(hoy)) {
      const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
      if (ahoraMin >= 19 * 60 && ahoraMin <= 23 * 60) abierto = true;
    }

    if (abierto) {
      estado.textContent = "🟢 Abierto";
      estado.style.color = "green";
      estado.style.boxShadow = "0 0 8px green";
      if (ultimoEstado !== "abierto") {
        estado.classList.add("open-anim");
        setTimeout(() => estado.classList.remove("open-anim"), 500);
      }
      ultimoEstado = "abierto";
    } else {
      estado.textContent = "🔴 Cerrado";
      estado.style.color = "red";
      estado.style.boxShadow = "0 0 8px red";
      ultimoEstado = "cerrado";
    }
  }

  function resaltarDia() {
    const dias = document.querySelectorAll("#dias li");
    const hoy = new Date().getDay();
    dias.forEach(li => {
      const arr = li.dataset.dia.split(",").map(Number);
      if (arr.includes(hoy)) li.classList.add("dia-actual");
    });
    actualizarEstado();
  }

  setInterval(() => {
    actualizarReloj();
    actualizarEstado();
  }, 1000);

  window.addEventListener('load', () => {
    actualizarReloj();
    resaltarDia();
  });

  /* =========================
     CARRUSEL
  ========================= */
  (function () {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const slides = [...carousel.querySelectorAll('.slide')];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsWrap = document.getElementById('dots');
    let current = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.onclick = () => goTo(i);
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.children];

    function updateActive() {
      const center = carousel.scrollLeft + carousel.clientWidth / 2;
      let closest = 0, min = Infinity;
      slides.forEach((s, i) => {
        const c = s.offsetLeft + s.clientWidth / 2;
        const d = Math.abs(center - c);
        if (d < min) {
          min = d;
          closest = i;
        }
        s.classList.remove('active');
      });
      slides[closest]?.classList.add('active');
      current = closest;
      dots.forEach(d => d.classList.remove('active'));
      dots[current]?.classList.add('active');
    }

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      const s = slides[current];
      const left = s.offsetLeft - (carousel.clientWidth - s.clientWidth) / 2;
      carousel.scrollTo({ left, behavior: 'smooth' });
      setTimeout(updateActive, 250);
    }

    prevBtn.onclick = () => goTo(current - 1);
    nextBtn.onclick = () => goTo(current + 1);

    carousel.addEventListener('scroll', () => {
      clearTimeout(window._st);
      window._st = setTimeout(updateActive, 100);
    });

    window.addEventListener('load', () => goTo(0));
  })();

  /* =========================
     AÑO FOOTER
  ========================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================
     ZOOM SUAVE (SOLO SI ESTÁ VISIBLE)
  ========================= */
  book?.addEventListener('click', () => {
    if (book.closest('.page-section.active')) {
      book.classList.toggle('zoom');
    }
  });

});

/* =========================
   📖 LIBRO / CARTA (ANTI-PARPADEO)
========================= */

const pages = [...document.querySelectorAll('.page')];
let current = 0;
let locked = false;

function updatePages() {
  pages.forEach((page, i) => {
    const depth = (pages.length - i) * 0.15;
    page.style.transform =
      i < current
        ? `rotateY(-180deg) translateZ(${depth}px)`
        : `rotateY(0deg) translateZ(${depth}px)`;
  });
}

updatePages();

/* BOTONES */
document.querySelector('.next')?.addEventListener('click', () => {
  if (locked || current >= pages.length - 1) return;
  locked = true;
  current++;
  updatePages();
  setTimeout(() => locked = false, 700);
});

document.querySelector('.prev')?.addEventListener('click', () => {
  if (locked || current <= 0) return;
  locked = true;
  current--;
  updatePages();
  setTimeout(() => locked = false, 700);
});

/* SWIPE */
let startX = 0;
const bookSwipe = document.querySelector('.book');

bookSwipe?.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

bookSwipe?.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) document.querySelector('.next')?.click();
  if (endX - startX > 50) document.querySelector('.prev')?.click();
});
<script>
const abrir = document.getElementById("abrirCotizador");
const modal = document.getElementById("modalCotiza");
const cerrar = document.getElementById("cerrarCotiza");
const form = document.getElementById("formCotiza");

abrir.addEventListener("click", e => {
  e.preventDefault();
  modal.classList.add("activo");
});

cerrar.addEventListener("click", () => {
  modal.classList.remove("activo");
});

form.addEventListener("submit", e => {
  e.preventDefault();

  const productos = [...form.querySelectorAll("input:checked")]
    .map(p => `• ${p.value}`)
    .join("%0A");

  if(!productos){
    alert("Selecciona al menos un platillo");
    return;
  }

  const nota = document.getElementById("notaExtra").value;

  const mensaje =
`Hola 👋
Quiero hacer un pedido en *La Chona* 🌮

Mi pedido es:
${productos}
${nota ? "%0A📝 Detalles: " + nota : ""}`;

  window.open(
    "https://wa.me/5217223943462?text=" + mensaje,
    "_blank"
  );

  modal.classList.remove("activo");
  form.reset();
});
</script>