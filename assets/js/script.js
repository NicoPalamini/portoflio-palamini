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