/* =====================================================
   script.js — LA CHONA FINAL DEFINITIVO
   ✔ SPA estable
   ✔ Libro carta SIN parpadeo
   ✔ Animación rápida e interrumpible
   ✔ Botones bloqueados en extremos
   ✔ Swipe móvil
   ✔ Reset limpio
   ✔ Carrusel funcional
   ✔ Reloj / Estado
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  document.body.classList.add('show');



  /* =====================================================
     VARIABLES GLOBALES
  ===================================================== */
  let libroInit = false;
  let pageIndex = 0;
  let firstTurn = true;

  /* =====================================================
     SPA — SECCIONES
  ===================================================== */
  const links = document.querySelectorAll('nav a[data-target]');
  const sections = document.querySelectorAll('.page-section');
  const defaultSection = 'inicio';

  function showSection(id, push = true) {

    const active = document.querySelector('.page-section.active');

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
      📖 LIBRO / CARTA — RÁPIDO + SIN PARPADEO
  ===================================================== */
  function initLibro() {
    // Buscamos todos los contenedores de libro
    const containers = document.querySelectorAll('.menu-book');

    containers.forEach(container => {
      const book = container.querySelector('.book');
      const pages = [...container.querySelectorAll('.page')];
      const nextBtn = container.querySelector('.nav.next');
      const prevBtn = container.querySelector('.nav.prev');
      

      if (!book || !pages.length || !nextBtn || !prevBtn) return;

      // Variable local para cada libro
      let localPageIndex = 0;

      function updateNavButtons(){
        if (localPageIndex === 0) {
          prevBtn.classList.add('disabled');
        } else {
          prevBtn.classList.remove('disabled');
        }

        if (localPageIndex === pages.length - 1) {
          nextBtn.classList.add('disabled');
        } else {
          nextBtn.classList.remove('disabled');
        }
      }

      pages.forEach((page, i) => {
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


updatePages();


      function updatePages() {
        pages.forEach((page, i) => {
          if (i < localPageIndex) {
            page.style.zIndex = i;
            page.style.transform = 'rotateY(-260deg)';
          }
          else if (i === localPageIndex) {
            page.style.zIndex = pages.length + 5;
            page.style.transitionDuration = firstTurn ? '0.45s' : '0.55s';
            page.style.transform = 'rotateY(0deg)';
          }
          else {
            page.style.zIndex = pages.length - i;
            page.style.transform = 'rotateY(0deg)';
          }
        });
        updateNavButtons();
      }

      nextBtn.onclick = () => {
        if (localPageIndex >= pages.length - 1) return;
        const currentPage = pages[localPageIndex];
        currentPage.style.transition = 'none';
        currentPage.offsetHeight;
        currentPage.style.transition = '';
        currentPage.style.transform = 'rotateY(-180deg)';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            localPageIndex++;
            firstTurn = false;
            updatePages();
          });
        });
      };

      prevBtn.onclick = () => {
        if (localPageIndex <= 0) return;
        const page = pages[localPageIndex - 1];
        page.style.transition = 'none';
        page.offsetHeight;
        page.style.transition = '';
        page.style.transform = 'rotateY(0deg)';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            localPageIndex--;
            updatePages();
          });
        });
      };

      let startX = 0;
      book.ontouchstart = e => { startX = e.touches[0].clientX; };
      book.ontouchend = e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (diff > 60) nextBtn.click();
        if (diff < -60) prevBtn.click();
      };

      updateNavButtons();
    });
  }

  function resetLibro() {
    const allPages = document.querySelectorAll('.book .page');
    allPages.forEach((page) => {
      page.style.transition = 'none';
      page.style.transform = 'rotateY(0deg)';
    });

    requestAnimationFrame(() => {
      allPages.forEach(p => p.style.transition = '');
    });
    firstTurn = true;
  }

  /* =====================================================
     🎠 CARRUSELES
  ===================================================== */
  document.querySelectorAll('.carousel-wrap').forEach(wrap => {

    const carousel = wrap.querySelector('.carousel');
    const btnLeft  = wrap.querySelector('.btn.left');
    const btnRight = wrap.querySelector('.btn.right');

    if (!carousel || !btnLeft || !btnRight) return;

    const scrollAmount = () => carousel.clientWidth * 0.9;

    btnRight.onclick = () =>
      carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });

    btnLeft.onclick  = () =>
      carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });

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

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();



    /* =====================================================
     🍔 MENÚ HAMBURGUESA
  ===================================================== */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.header-unificado nav');
  const linksMenu = document.querySelectorAll('.header-unificado nav a');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });

    // cerrar al tocar opción
    linksMenu.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
      });
    });
  }

});


/* =====================================================
   MODAL COTIZACIÓN (SIN CAMBIOS)
===================================================== */

const modal = document.getElementById("modalCotiza");
const cerrar = document.getElementById("cerrarCotiza");
const enviar = document.getElementById("enviarWhats");
const tituloEvento = document.getElementById("tituloEvento");
const listaProductos = document.getElementById("listaProductos");
const resumenLista = document.getElementById("resumenLista");

let carrito = {};
let eventoActual = "";

document.querySelectorAll(".btn-cotiza").forEach(btn=>{
  btn.onclick = e => {
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
  };
});

document.addEventListener("click", e=>{
  if(e.target.classList.contains("mas")) carrito[e.target.dataset.p]++;
  if(e.target.classList.contains("menos") && carrito[e.target.dataset.p] > 0)
    carrito[e.target.dataset.p]--;

  resumenLista.innerHTML="";
  for(let p in carrito){
    document.getElementById(`c-${p}`).textContent = carrito[p];
    if(carrito[p]>0)
      resumenLista.innerHTML += `<li>• ${p} — ${carrito[p]}</li>`;
  }
});

enviar.onclick = () => {
  let msg = `Hola, quiero cotizar el evento:%0A${eventoActual}%0A%0A`;
  let ok=false;
  for(let p in carrito){
    if(carrito[p]>0){ ok=true; msg+=`• ${p} — ${carrito[p]}%0A`; }
  }
  if(!ok){ alert("Agrega productos"); return; }
  window.open(`https://wa.me/5217223943462?text=${msg}`,"_blank");
};

cerrar.onclick = () => modal.classList.remove("activo");


