// NERIVA — piezas compartidas (portada y relojes): fondo animado, luz del mouse,
// inclinación de tarjetas, avisos y panel del carrito.
(function () {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    // ── Fondo: estrellas que se mueven lento ──────────
    const fx = document.querySelector('.fx');
    if (fx && !calm) {
        const cv = document.createElement('canvas');
        fx.appendChild(cv);
        const ctx = cv.getContext('2d');
        let w, h, stars, last = 0;
        const size = () => {
            const dpr = Math.min(devicePixelRatio || 1, 2);
            w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
            const n = Math.round(Math.min(110, innerWidth / 9));
            stars = Array.from({ length: n }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                z: .3 + Math.random() * .7, r: (.5 + Math.random() * 1.1) * dpr,
            }));
        };
        size();
        addEventListener('resize', size);
        const tick = t => {
            requestAnimationFrame(tick);
            if (document.hidden || t - last < 33) return;
            last = t;
            ctx.clearRect(0, 0, w, h);
            const sy = scrollY * .25;
            for (const s of stars) {
                s.y -= s.z * .35; if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }
                const y = ((s.y - sy * s.z) % h + h) % h;
                ctx.globalAlpha = s.z * (.55 + .45 * Math.sin(t / 900 + s.x));
                ctx.fillStyle = s.z > .8 ? '#37f3ff' : '#cdd6ff';
                ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.3); ctx.fill();
            }
        };
        requestAnimationFrame(tick);
    }

    // ── Luz que sigue al mouse + tarjetas que se inclinan ──
    if (fine && !calm) {
        const glow = document.createElement('div');
        glow.className = 'glow';
        document.body.appendChild(glow);
        addEventListener('pointermove', e => {
            glow.style.opacity = 1;
            glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            const card = e.target.closest && e.target.closest('.card');
            if (card) {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
                card.style.setProperty('--mx', px * 100 + '%');
                card.style.setProperty('--my', py * 100 + '%');
                card.style.setProperty('--ry', (px - .5) * 7 + 'deg');
                card.style.setProperty('--rx', (.5 - py) * 7 + 'deg');
            }
        }, { passive: true });
        document.addEventListener('pointerout', e => {
            const card = e.target.closest && e.target.closest('.card');
            if (card && !card.contains(e.relatedTarget)) { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); }
        });
    }

    // ── Aparecer al bajar ─────────────────────────────
    const io = 'IntersectionObserver' in window
        ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' })
        : null;
    const watchRise = root => (root || document).querySelectorAll('.rise:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));
    watchRise();

    // ── Avisos ────────────────────────────────────────
    function toast(msg) {
        const wrap = document.getElementById('toastWrap');
        if (!wrap) return;
        while (wrap.children.length > 1) wrap.firstChild.remove();
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        wrap.appendChild(t);
        setTimeout(() => t.remove(), 2700);
    }

    // ── Panel del carrito ─────────────────────────────
    function openDrawer() {
        document.getElementById('cartDrawer').classList.add('on');
        document.getElementById('cartOverlay').classList.add('on');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
        document.getElementById('cartDrawer').classList.remove('on');
        document.getElementById('cartOverlay').classList.remove('on');
        if (!document.querySelector('.modal.on')) document.body.style.overflow = '';
    }
    function bumpCart() {
        const b = document.getElementById('navCartBtn');
        if (!b) return;
        b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    }

    const WA = '5491128330853';
    window.NERIVA = {
        WA, calm, fine, toast, openDrawer, closeDrawer, bumpCart, watchRise,
        waLink: msg => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,
        money: n => '$' + Math.round(n).toLocaleString('es-AR'),
        ref: () => { try { return sessionStorage.getItem('neriva_ref_por'); } catch (e) { return null; } },
    };

    // código de referido (?ref=)
    const ref = new URLSearchParams(location.search).get('ref');
    if (ref) { try { sessionStorage.setItem('neriva_ref_por', ref.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 16)); } catch (e) {} }
})();
