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

 // ===== Drag fluido + salvataggio posizione (localStorage) =====
(() => {
    const stickers = document.querySelectorAll('[data-drag]');
    if (!stickers.length) return;
  
    // helpers di storage in percentuale (così regge i resize)
    const loadPos = (key) => {
      try { return JSON.parse(localStorage.getItem(`sticker:${key}`)); }
      catch { return null; }
    };
    const savePos = (key, xPct, yPct) => {
      localStorage.setItem(`sticker:${key}`, JSON.stringify({ xPct, yPct }));
    };
  
    // applica offset in px via CSS vars
    const applyTransform = (el, tx, ty) => {
      el.style.setProperty('--tx', tx + 'px');
      el.style.setProperty('--ty', ty + 'px');
    };
  
    stickers.forEach((el) => {
      const key = el.dataset.key || el.className || Math.random().toString(36).slice(2);
      let dragging = false;
      let startX = 0, startY = 0, startTx = 0, startTy = 0;
      let tx = 0, ty = 0; // offset corrente in px
      let rafId = null;
  
      // 1) ripristina posizione salvata (se esiste)
      const saved = loadPos(key);
      if (saved) {
        tx = (saved.xPct / 100) * window.innerWidth;
        ty = (saved.yPct / 100) * window.innerHeight;
        applyTransform(el, tx, ty);
      }
  
      const update = () => { applyTransform(el, tx, ty); rafId = null; };
  
      const onPointerDown = (e) => {
        // previeni selezione testo/scroll su touch
        e.preventDefault();
        el.classList.add('dragging');
        dragging = true;
  
        // puntatore
        const p = e.touches ? e.touches[0] : e;
        startX = p.clientX;
        startY = p.clientY;
        startTx = tx;
        startTy = ty;
  
        // Pointer Events (se disponibili) per maggiore fluidità
        if (el.setPointerCapture && e.pointerId !== undefined) {
          el.setPointerCapture(e.pointerId);
        }
      };
  
      const onPointerMove = (e) => {
        if (!dragging) return;
        const p = e.touches ? e.touches[0] : e;
        const dx = p.clientX - startX;
        const dy = p.clientY - startY;
        tx = startTx + dx;
        ty = startTy + dy;
  
        if (!rafId) rafId = requestAnimationFrame(update);
      };
  
      const onPointerUp = (e) => {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('dragging');
  
        // salva in percentuale della viewport
        const xPct = (tx / window.innerWidth) * 100;
        const yPct = (ty / window.innerHeight) * 100;
        savePos(key, xPct, yPct);
  
        if (el.releasePointerCapture && e?.pointerId !== undefined) {
          try { el.releasePointerCapture(e.pointerId); } catch {}
        }
      };
  
      // mouse
      el.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
  
      // touch
      el.addEventListener('touchstart', onPointerDown, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
  
      // 2) adatta le posizioni salvate quando cambia la finestra
      window.addEventListener('resize', () => {
        const saved = loadPos(key);
        if (!saved) return;
        tx = (saved.xPct / 100) * window.innerWidth;
        ty = (saved.yPct / 100) * window.innerHeight;
        applyTransform(el, tx, ty);
      });
    });
  
    console.log('Sticker drag + save abilitato');
  })();

// ===== Anteprima immagini menu =====
document.querySelectorAll(".menu-card").forEach(card => {
    const img = card.dataset.img;
    if(img){
      card.style.setProperty("--preview-img", `url(${img})`);
    }
  });

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

// ===== Sticker About: drag + save (chiavi stabili) =====
(() => {
  if (!document.body.classList.contains('page-about')) return;

  const els = document.querySelectorAll('[data-drag-about]');
  if (!els.length) return;

  const load = k => { try { return JSON.parse(localStorage.getItem('about-sticker:'+k)); } catch { return null; } };
  const save = (k, xPct, yPct) => localStorage.setItem('about-sticker:'+k, JSON.stringify({xPct,yPct}));
  const apply = (el, x, y) => { el.style.setProperty('--tx', x+'px'); el.style.setProperty('--ty', y+'px'); };

  els.forEach((el, i) => {
    // se manca data-key, ne assegno uno deterministico e PERSISTENTE
    if (!el.dataset.key) {
      el.dataset.key = `about-auto-${i}`;
    }
    const key = el.dataset.key;

    // posizionamento iniziale: salvato -> altrimenti dai data-start-*
    const saved = load(key);
    let tx, ty;
    if (saved) {
      tx = (saved.xPct/100) * window.innerWidth;
      ty = (saved.yPct/100) * window.innerHeight;
    } else {
      const sx = parseFloat(el.dataset.startX || '10');
      const sy = parseFloat(el.dataset.startY || '10');
      tx = (sx/100) * window.innerWidth;
      ty = (sy/100) * window.innerHeight;
    }
    apply(el, tx, ty);

    let dragging = false, startX=0, startY=0, startTx=tx, startTy=ty;

    const down = e => {
      dragging = true;
      el.classList.add('dragging');
      startX = e.clientX; startY = e.clientY;
      startTx = tx;       startTy = ty;
      el.setPointerCapture?.(e.pointerId);
    };
    const move = e => {
      if (!dragging) return;
      tx = startTx + (e.clientX - startX);
      ty = startTy + (e.clientY - startY);
      apply(el, tx, ty);
    };
    const up = e => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('dragging');
      // salvo in percentuale della viewport
      save(key, (tx/window.innerWidth)*100, (ty/window.innerHeight)*100);
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    // ricalcola al resize mantenendo la posizione salvata
    window.addEventListener('resize', () => {
      const s = load(key); if (!s) return;
      tx = (s.xPct/100) * window.innerWidth;
      ty = (s.yPct/100) * window.innerHeight;
      apply(el, tx, ty);
    });
  });

  console.log('Sticker About – chiavi stabili + salvataggio OK');
})();

// ===== Album slider (drag + prev/next + tilt 3D) – SOLO About =====
(() => {
  if (!document.body.classList.contains('page-about')) return;

  const scroller = document.querySelector('#album-scroller');
  if (!scroller) return;

  // 1) drag-to-scroll
  let isDown = false, startX = 0, startScroll = 0;
  const down = (e) => { isDown = true; startX = e.clientX || e.touches?.[0]?.clientX || 0; startScroll = scroller.scrollLeft; };
  const move = (e) => {
    if (!isDown) return;
    const x = e.clientX || e.touches?.[0]?.clientX || 0;
    scroller.scrollLeft = startScroll - (x - startX);
  };
  const up = () => { isDown = false; };

  scroller.addEventListener('mousedown', down);
  scroller.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
  scroller.addEventListener('touchstart', down, { passive: true });
  scroller.addEventListener('touchmove', move,   { passive: true });
  scroller.addEventListener('touchend',  up);

  // 2) prev/next buttons
  const prevBtn = document.querySelector('.album-nav.prev');
  const nextBtn = document.querySelector('.album-nav.next');
  const step = () => scroller.querySelector('.album-card')?.offsetWidth || 200;

  prevBtn?.addEventListener('click', () => scroller.scrollBy({ left: -step() - 16, behavior: 'smooth' }));
  nextBtn?.addEventListener('click', () => scroller.scrollBy({ left:  step() + 16, behavior: 'smooth' }));

  // 3) tilt 3D + glow che segue il mouse
  scroller.querySelectorAll('.album-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;   // 0..100
      const my = ((e.clientY - r.top)  / r.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');

      const rx = ((e.clientY - r.top) / r.height - .5) * -10; // tilt X
      const ry = ((e.clientX - r.left)/ r.width  - .5) *  10; // tilt Y
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = 'none'; });
  });

  console.log('Album slider About attivo');
})();