/* ============================================================
   PORTFOLIO — ABY HERDIANSYAH
   js/main.js  —  semua logic, terpisah dari HTML
   ============================================================ */

'use strict';

// ============================================================
// 1. CANVAS ANIMATED BACKGROUND
// ============================================================
(function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], dark = true;
    let mouse = { x: null, y: null };

    const isMobile = () => window.innerWidth < 768;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x  = Math.random() * canvas.width;
            this.y  = Math.random() * canvas.height;
            this.size = Math.random() * 2.2 + 0.4;
            this.vx = (Math.random() - 0.5) * (isMobile() ? 0.35 : 0.55);
            this.vy = (Math.random() - 0.5) * (isMobile() ? 0.35 : 0.55);
            this.op = Math.random() * 0.55 + 0.1;
            this.c  = Math.random() > 0.5 ? '99,102,241' : '16,185,129';
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (mouse.x !== null) {
                const dx = mouse.x - this.x, dy = mouse.y - this.y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 110) { this.x -= dx * 0.025; this.y -= dy * 0.025; }
            }
            if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.op;
            ctx.fillStyle   = `rgba(${this.c},1)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function init() {
        particles = [];
        const max = isMobile() ? 60 : 150;
        const n   = Math.min(Math.floor(window.innerWidth / (isMobile() ? 12 : 7)), max);
        for (let i = 0; i < n; i++) particles.push(new Particle());
    }

    function connect() {
        const limit = isMobile() ? 80 : 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < limit) {
                    ctx.save();
                    ctx.globalAlpha = (1 - d / limit) * 0.22;
                    ctx.strokeStyle = dark ? 'rgba(99,102,241,.9)' : 'rgba(79,70,229,.5)';
                    ctx.lineWidth   = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        connect();
        requestAnimationFrame(loop);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); init(); }, 200);
    });
    window.addEventListener('mousemove',  e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', ()  => { mouse.x = null; mouse.y = null; });
    window._setCanvasDark = v => { dark = v; };

    resize(); init(); loop();
})();


// ============================================================
// 2. CURSOR GLOW
// ============================================================
(function initCursorGlow() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;
    let gx = 0, gy = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    (function animGlow() {
        gx += (tx - gx) * 0.09;
        gy += (ty - gy) * 0.09;
        glow.style.transform = `translate(${gx - 200}px,${gy - 200}px)`;
        requestAnimationFrame(animGlow);
    })();
})();


// ============================================================
// 3. TYPEWRITER EFFECT
// ============================================================
(function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const strs = ['Aby Herdiansyah', 'Full-Stack Developer', 'IoT Engineer', 'Data Enthusiast'];
    let si = 0, ci = 0, deleting = false;

    function type() {
        const s = strs[si];
        if (!deleting) {
            el.textContent = s.substring(0, ci + 1);
            ci++;
            if (ci === s.length) { deleting = true; setTimeout(type, 2000); return; }
            setTimeout(type, 80);
        } else {
            el.textContent = s.substring(0, ci - 1);
            ci--;
            if (ci === 0) { deleting = false; si = (si + 1) % strs.length; setTimeout(type, 400); return; }
            setTimeout(type, 45);
        }
    }
    setTimeout(type, 700);
})();


// ============================================================
// 4. THEME TOGGLE
// ============================================================
(function initTheme() {
    const btn  = document.getElementById('theme-btn');
    const icon = document.getElementById('theme-icon');
    if (!btn || !icon) return;
    let isDark = (localStorage.getItem('theme') || 'dark') === 'dark';

    function applyTheme(dark) {
        isDark = dark;
        document.documentElement.className = dark ? 'dark' : 'light';
        icon.className = dark ? 'fas fa-moon' : 'fas fa-sun';
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        if (window._setCanvasDark) window._setCanvasDark(dark);
    }

    btn.addEventListener('click', () => applyTheme(!isDark));
    applyTheme(isDark);
})();


// ============================================================
// 5. NAVBAR — scroll style + active link
// ============================================================
(function initNavbar() {
    const navbar   = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id], footer[id]');
    const links    = document.querySelectorAll('.nav-link');
    if (!navbar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
            let current = '';
            sections.forEach(s => {
                if (window.scrollY >= s.offsetTop - 130) current = s.getAttribute('id');
            });
            links.forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === '#' + current);
            });
            ticking = false;
        });
    });
})();


// ============================================================
// 6. HAMBURGER MENU
// ============================================================
(function initHamburger() {
    const ham      = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (!ham || !navLinks) return;

    ham.addEventListener('click', () => {
        ham.classList.toggle('open');
        navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a =>
        a.addEventListener('click', () => {
            ham.classList.remove('open');
            navLinks.classList.remove('open');
        })
    );
})();


// ============================================================
// 7. SKILL BAR ANIMATION
// ============================================================
(function initSkillBars() {
    const list = document.querySelector('.skill-bar-list');
    if (!list) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.skill-bar-fill').forEach((b, i) => {
                    // stagger tiap bar 80ms
                    setTimeout(() => {
                        b.style.width = b.getAttribute('data-width') + '%';
                    }, i * 80);
                });
            } else {
                // reset saat keluar viewport — animasi ulang waktu scroll balik
                e.target.querySelectorAll('.skill-bar-fill').forEach(b => {
                    b.style.width = '0%';
                });
            }
        });
    }, { threshold: 0.25 });

    obs.observe(list);
})();


// ============================================================
// 8. SECTION TITLE — split per kata, slide up stagger
// ============================================================
(function initTitleSplit() {
    document.querySelectorAll('.section-title').forEach(title => {
        // Simpan HTML asli utuh (ada <span class="accent">)
        // Iterasi childNodes untuk wrap tiap "kata" tanpa rusak tag
        const nodes = Array.from(title.childNodes);
        title.innerHTML = '';

        nodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                // Pisah teks jadi kata-kata
                node.textContent.split(/(\s+)/).forEach(part => {
                    if (/^\s+$/.test(part)) {
                        title.insertAdjacentHTML('beforeend', part);
                    } else if (part.length) {
                        const w = document.createElement('span');
                        w.className = 'word';
                        w.innerHTML = `<span>${part}</span>`;
                        title.appendChild(w);
                    }
                });
            } else {
                // Tag lain (misal <span class="accent">) — wrap sebagai satu kata
                const w = document.createElement('span');
                w.className = 'word';
                const inner = document.createElement('span');
                inner.innerHTML = node.outerHTML;
                w.appendChild(inner);
                title.appendChild(w);
            }
        });
    });
})();


// ============================================================
// 9. COUNTER ANIMATION — untuk stat numbers
// ============================================================
function animateCounter(el) {
    const target  = parseFloat(el.dataset.counter);
    const suffix  = el.dataset.suffix || '';
    const isFloat = String(target).includes('.');
    const duration = 1800; // ms
    const start   = performance.now();

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = easeOutExpo(progress);
        const current  = target * eased;
        el.textContent = (isFloat ? current.toFixed(2) : Math.floor(current)) + suffix;
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

(function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                animateCounter(e.target);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => obs.observe(el));
})();


// ============================================================
// 10. STAGGER CHILDREN — data-stagger otomatis per anak
// ============================================================
(function initStagger() {
    const containers = document.querySelectorAll('[data-stagger]');
    if (!containers.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            const children = Array.from(e.target.children)
                .filter(c => !c.classList.contains('stat-divider'));

            if (e.isIntersecting) {
                children.forEach((child, i) => {
                    setTimeout(() => {
                        child.style.transitionDelay = '0ms';
                        child.style.opacity    = '1';
                        child.style.transform  = 'none';
                        child.style.filter     = 'blur(0px)';
                    }, i * 90);
                });
                e.target.classList.add('is-staggered');
            } else {
                // reset — animasi ulang saat scroll balik
                e.target.classList.remove('is-staggered');
                children.forEach(child => {
                    child.style.opacity   = '';
                    child.style.transform = '';
                    child.style.filter    = '';
                });
            }
        });
    }, { threshold: 0.15 });

    containers.forEach(el => obs.observe(el));
})();


// ============================================================
// 11. SCROLL REVEAL  — fade/slide/zoom/flip/drop
// ============================================================
(function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const delay = +(e.target.dataset.delay || 0);
                setTimeout(() => {
                    e.target.classList.add('is-visible');
                }, delay);
            } else {
                // hapus class saat keluar viewport — transisi ulang saat scroll balik
                e.target.classList.remove('is-visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    els.forEach(el => obs.observe(el));
})();


// ============================================================
// 12. HERO PARALLAX RINGAN  (desktop only)
// ============================================================
(function initHeroParallax() {
    if (window.matchMedia('(max-width: 1024px)').matches) return;
    const visual = document.getElementById('hero-visual');
    if (!visual) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            if (y < window.innerHeight) {
                visual.style.transform = `translateY(${y * 0.12}px)`;
            }
            ticking = false;
        });
    });
})();


// ============================================================
// 13. PROJECT CARD — tilt 3D on hover (desktop only)
// ============================================================
(function initCardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.project-card:not(.project-wip)').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width  / 2;
            const cy = rect.top  + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width  / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            card.style.transform = `translateY(-8px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
            card.style.transition = 'transform 0.1s ease';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
        });
    });
})();


// ============================================================
// 14. FOOTER YEAR
// ============================================================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();