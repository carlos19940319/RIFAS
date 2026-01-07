/* =====================================================
   script.js — LA CHONA FINAL DEFINITIVO (CORREGIDO)
   ✔ SPA estable
   ✔ Carta tipo libro (SIN parpadeo)
   ✔ Una sola hoja
   ✔ Reset limpio al salir
   ✔ Swipe móvil
   ✔ Carrusel funcional
   ✔ Reloj / Estado
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     FADE IN GENERAL
  ===================================================== */
  document.body.classList.add('show');

  /* =====================================================
     VARIABLES GLOBALES CONTROLADAS
  ===================================================== */
  let libroInit = false;
  let pageIndex = 0;
  let locked = false;
  let firstTurn = true;

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
      libroInit = false;
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
    if (id === 'carta' && !libroInit) {
      requestAnimationFrame(initLibro);
      libroInit = true;
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
  function initLibro() {

    const book = document.querySelector('.book');
    const pages = [...document.querySelectorAll('.book .page')];
    const nextBtn = document.querySelector('.nav.next');
    const prevBtn = document.querySelector('.nav.prev');

    if (!book || !pages.length || !nextBtn || !prevBtn) return;

    /* ---------- ESTADO INICIAL ---------- */
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

    function updatePages() {
      pages.forEach((page, i) => {

        page.classList.remove('turning');

        if (i < pageIndex) {
          page.style.zIndex = i;
          page.style.transform = 'translateZ(0) rotateY(-180deg)';
        }
        else if (i === pageIndex) {
          page.style.zIndex = pages.length + 5;
          page.classList.add('turning');
          page.style.transitionDuration = firstTurn ? '0.6s' : '1s';
          firstTurn = false;
          page.style.transform = 'translateZ(0) rotateY(0deg)';
        }
        else {
          page.style.zIndex = pages.length - i;
          page.style.transform = 'translateZ(0) rotateY(0deg)';
        }
      });
    }

    /* ---------- BOTONES ---------- */
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

    /* ---------- SWIPE ---------- */
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
      pages.forEach(p => p.style.transitionDuration = '');
    });
  }

  /* =====================================================
   🎠 CARRUSELES — SOPORTE PARA VARIOS (CORRECTO)
===================================================== */
document.querySelectorAll('.carousel-wrap').forEach(wrap => {

  const carousel = wrap.querySelector('.carousel');
  const btnLeft  = wrap.querySelector('.btn.left');
  const btnRight = wrap.querySelector('.btn.right');

  if (!carousel || !btnLeft || !btnRight) return;

  const scrollAmount = () => carousel.clientWidth * 0.9;

  btnRight.addEventListener('click', () => {
    carousel.scrollBy({
      left: scrollAmount(),
      behavior: 'smooth'
    });
  });

  btnLeft.addEventListener('click', () => {
    carousel.scrollBy({
      left: -scrollAmount(),
      behavior: 'smooth'
    });
  });

});

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


const modal = document.getElementById("modalCotiza");
const cerrar = document.getElementById("cerrarCotiza");
const enviar = document.getElementById("enviarWhats");
const tituloEvento = document.getElementById("tituloEvento");
const listaProductos = document.getElementById("listaProductos");
const resumenLista = document.getElementById("resumenLista");

let carrito = {};
let eventoActual = "";

document.querySelectorAll(".btn-cotiza").forEach(btn=>{
  btn.addEventListener("click", e=>{
    e.preventDefault();

    eventoActual = btn.dataset.evento;
    tituloEvento.textContent = eventoActual;
    carrito = {};
    listaProductos.innerHTML = "";
    resumenLista.innerHTML = "";

    JSON.parse(btn.dataset.productos).forEach(p=>{
      carrito[p] = 0;
      listaProductos.innerHTML += `
        <div class="producto">
          <span>${p}</span>
          <div class="controles">
            <button class="menos" data-p="${p}">−</button>
            <span id="c-${p}">0</span>
            <button class="mas" data-p="${p}">+</button>
          </div>
        </div>`;
    });

    modal.classList.add("activo");
  });
});

document.addEventListener("click", e=>{
  if(e.target.classList.contains("mas")) carrito[e.target.dataset.p]++;
  if(e.target.classList.contains("menos") && carrito[e.target.dataset.p] > 0)
    carrito[e.target.dataset.p]--;

  resumenLista.innerHTML="";
  for(let p in carrito){
    document.getElementById(`c-${p}`).textContent = carrito[p];
    if(carrito[p]>0) resumenLista.innerHTML += `<li>• ${p} — ${carrito[p]}</li>`;
  }
});

enviar.addEventListener("click", ()=>{
  let msg = `Hola, quiero cotizar el evento:%0A${eventoActual}%0A%0A`;
  let ok=false;
  for(let p in carrito){
    if(carrito[p]>0){ ok=true; msg+=`• ${p} — ${carrito[p]}%0A`; }
  }
  if(!ok){ alert("Agrega productos"); return; }
  window.open(`https://wa.me/5217223943462?text=${msg}`,"_blank");
});

cerrar.addEventListener("click",()=>modal.classList.remove("activo"));


