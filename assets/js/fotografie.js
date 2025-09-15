// Script base portfolio
console.log("Portfolio caricato correttamente!");

(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    let rafId=null, targetX=50, targetY=40;
    const apply=()=>{ document.documentElement.style.setProperty('--mx',`${targetX}%`);
                      document.documentElement.style.setProperty('--my',`${targetY}%`); rafId=null; };
    const onPointer=e=>{
      const p=e.touches?e.touches[0]:e, w=innerWidth, h=innerHeight;
      targetX=Math.max(0,Math.min(100,(p.clientX/w)*100));
      targetY=Math.max(0,Math.min(100,(p.clientY/h)*100));
      if(!rafId) rafId=requestAnimationFrame(apply);
    };
    addEventListener('mousemove', onPointer,{passive:true});
    addEventListener('touchmove', onPointer,{passive:true});
  })();
  
// ===== Background interattivo (SOLO About) =====
(() => {
  // esci se NON sei nella pagina About
  if (!document.body.classList.contains('page-about')) return;

  const host = document.querySelector('.bg-interactive'); // l'elemento che ha il background
  if (!host) return;

  let t1x = 0.35, t1y = 0.30;   // target [0..1]
  let t2x = 0.75, t2y = 0.35;
  let p1x = t1x, p1y = t1y;     // current (easing)
  let p2x = t2x, p2y = t2y;

  const ease = 0.08;            // 0.05 più morbido • 0.15 più reattivo

  const apply = () => {
    p1x += (t1x - p1x) * ease;
    p1y += (t1y - p1y) * ease;
    p2x += (t2x - p2x) * ease;
    p2y += (t2y - p2y) * ease;

    // 👇 scrivi le variabili SOLO sull'elemento della pagina About, non su :root
    host.style.setProperty('--p1x', (p1x * 100) + '%');
    host.style.setProperty('--p1y', (p1y * 100) + '%');
    host.style.setProperty('--p2x', (p2x * 100) + '%');
    host.style.setProperty('--p2y', (p2y * 100) + '%');

    requestAnimationFrame(apply);
  };

  const onMove = (e) => {
    const rect = host.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    t1x = x * 0.6 + 0.2;
    t1y = y * 0.6 + 0.2;
    t2x = 1 - t1x * 0.9;
    t2y = 1 - t1y * 0.9;
  };

  host.addEventListener('mousemove', onMove);
  host.addEventListener('touchmove', (ev) => {
    const t = ev.touches?.[0]; if (!t) return;
    onMove({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: true });

  requestAnimationFrame(apply);
})();

// ===== Fotografie page script =====
(() => {
    // Dataset: sostituisci con le tue immagini
    const DATA = [
      {
        src: 'assets/photo/photo-1.webp',
        title: 'Titolo 1',
        desc:  'Descrizione della prima foto'
      },
      {
        src: 'assets/photo/photo-2.webp',
        title: 'Titolo 2',
        desc:  'Descrizione della seconda foto'
      },
      {
        src: 'assets/photo/photo-3.webp',
        title: 'Titolo 3',
        desc:  'Descrizione della terza foto'
      },
      {
        src: 'assets/photo/photo-4.webp',
        title: 'Titolo 4',
        desc:  'Descrizione della quarta foto'
      }
    ];
  
    const root = document.querySelector('.page-fotografie');
    if (!root) return;
  
    // DOM refs
    const track   = root.querySelector('.track');
    const capTit  = root.querySelector('.caption__title');
    const capDesc = root.querySelector('.caption__desc');
    const prevBtn = root.querySelector('.nav.prev');
    const nextBtn = root.querySelector('.nav.next');
    const thumbsC = root.querySelector('.thumbs');
  
    // Preload
    DATA.forEach(d => { const i = new Image(); i.src = d.src; });
  
    // Build slides
    let slides = [];
    track.innerHTML = '';
    DATA.forEach((d, i) => {
      const s = document.createElement('figure');
      s.className = 'slide';
      s.setAttribute('role','group');
      s.setAttribute('aria-label', `${i+1} di ${DATA.length}`);
      s.innerHTML = `<img src="${d.src}" alt="${d.title}">`;
      track.appendChild(s);
      slides.push(s);
    });
  
    // Build thumbs
    thumbsC.innerHTML = '';
    DATA.forEach((d, i) => {
      const t = document.createElement('button');
      t.className = 'thumb';
      t.innerHTML = `<img src="${d.src}" alt="Vai alla foto ${i+1}">`;
      t.addEventListener('click', () => go(i));
      thumbsC.appendChild(t);
    });
  
    const thumbs = Array.from(thumbsC.children);
  
    let index = 0;
    let auto  = null;
  
    function paint(){
      slides.forEach(s => s.className = 'slide'); // reset
      const l = (index - 1 + DATA.length) % DATA.length;
      const r = (index + 1) % DATA.length;
  
      slides[index].classList.add('slide--center');
      slides[l].classList.add('slide--left');
      slides[r].classList.add('slide--right');
  
      capTit.textContent  = DATA[index].title;
      capDesc.textContent = DATA[index].desc;
  
      thumbs.forEach((t,i)=> t.setAttribute('aria-current', i===index ? 'true':'false'));
    }
  
    function go(i){
      index = (i + DATA.length) % DATA.length;
      paint();
      restartAuto();
    }
    const next = () => go(index+1);
    const prev = () => go(index-1);
  
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
  
    // Tastiera
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    });
  
    // Autoplay + pausa su hover
    function startAuto(){ auto = setInterval(next, 6000); }
    function stopAuto(){ if (auto) clearInterval(auto); auto = null; }
    function restartAuto(){ stopAuto(); startAuto(); }
  
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);
  
    // Click sui lati per muovere (quando non c'è btn)
    slides.forEach(s => {
      s.addEventListener('click', (e) => {
        const rect = s.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width/2) prev(); else next();
      });
    });
  
    // Init
    paint();
    startAuto();
  })();

  document.addEventListener("DOMContentLoaded", () => {
    const stage = document.querySelector(".photo-stage");
    const cards = [...document.querySelectorAll(".photo-card")];
    const titleEl = document.querySelector(".photo-title");
    const descEl  = document.querySelector(".photo-desc");
    const prevBtn = document.querySelector(".photo-prev");
    const nextBtn = document.querySelector(".photo-next");
  
    const total = cards.length;          // 10
    const visible = 5;                   // mostriamo 5 intorno al centro
    const angleStep = 360 / total;       // angolo tra card
    let index = 0;                       // card centrale corrente
    let autoplayId = null;
  
    // posiziona le card lungo un cerchio 3D e applica opacità/tilt
    function render() {
      // angolo “frontale”: portiamo la card corrente davanti
      const rotation = -index * angleStep;
      stage.style.transform = `translateZ(-320px) rotateY(${rotation}deg)`;
      // NB: il translateZ qui è solo per creare profondità generale del palco
  
      cards.forEach((card, i) => {
        // calcoliamo la posizione relativa a 'index'
        const rel = ((i - index + total) % total);
        // distanza minima dal centro su 0..floor(total/2)
        const dist = Math.min(rel, total - rel);
  
        // visibilità: solo 5 (2 sx, centro, 2 dx)
        const isVisible = dist <= Math.floor(visible / 2);
        const isCenter  = dist === 0;
  
        // ciascuna card è ruotata sul cerchio: posizioniamo in 3D
        const cardAngle = i * angleStep;
        // raggio: quanto “spingiamo” in Z le card per stare sul cerchio
        const radius = 540; // prova 480..600 per variare
        card.style.transform =
          `translate(-50%, -50%) rotateY(${cardAngle}deg) translateZ(${radius}px) ${
             !isCenter ? `rotateZ(${(i%2? -6:6)}deg)` : ''
          }`;
  
        // stato visibilità + stile
        card.style.opacity = isVisible ? (isCenter ? 1 : 0.9) : 0;
        card.style.pointerEvents = isVisible ? "auto" : "none";
        card.classList.toggle("is-center", isCenter);
  
        // click su una card visibile: portala al centro
        if (!card._clickBound) {
          card.addEventListener("click", () => {
            // trova differenza minima (clockwise/counter)
            const relIdx = ((i - index + total) % total);
            const altRel = relIdx - total; // verso opposto
            const step = Math.abs(altRel) < relIdx ? altRel : relIdx;
            index = (index + step + total) % total;
            updateInfo();
            render();
            resetAutoplay();
          });
          card._clickBound = true;
        }
      });
    }
  
    function updateInfo() {
      const active = cards[index];
      titleEl.textContent = active.dataset.title || "";
      descEl.textContent  = active.dataset.desc  || "";
    }
  
    function next() {
      index = (index + 1) % total;
      updateInfo();
      render();
    }
    function prev() {
      index = (index - 1 + total) % total;
      updateInfo();
      render();
    }
  
    // autoplay (disattiva se non ti serve)
    function startAutoplay() {
      autoplayId = setInterval(next, 4000);
    }
    function resetAutoplay() {
      if (autoplayId) { clearInterval(autoplayId); startAutoplay(); }
    }
  
    nextBtn.addEventListener("click", () => { next(); resetAutoplay(); });
    prevBtn.addEventListener("click", () => { prev(); resetAutoplay(); });
  
    // init
    updateInfo();
    render();
    startAutoplay();
  });

  // Cambia qui la velocità (millisecondi)
const INTERVAL_MS = 4000;

(function initSlideshow(){
  const container = document.getElementById('slideshow');
  if(!container) return;

  const slides = Array.from(container.querySelectorAll('.slide'));
  if(slides.length === 0) return;

  let index = 0;

  const show = (i) => {
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
  };

  const next = () => {
    index = (index + 1) % slides.length;
    show(index);
  };

  show(index);
  setInterval(next, INTERVAL_MS);
})();