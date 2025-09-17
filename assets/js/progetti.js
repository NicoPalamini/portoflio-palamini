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

