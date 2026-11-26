(() => {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // scroll reveal
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.sec, .card, .jobs > li').forEach(el => { el.classList.add('reveal'); io.observe(el); });

    // background: wireframe plane in perspective, displaced by a slow rolling wave
    const canvas = document.getElementById('wave');
    const ctx = canvas.getContext('2d');
    const COLS = 56, ROWS = 36, X = 14, NEAR = 1.4, FAR = 22;
    let w, h, t = 0, sway = 0, swayTo = 0;

    const size = () => {
        const d = devicePixelRatio || 1;
        w = innerWidth; h = innerHeight;
        canvas.width = w * d; canvas.height = h * d;
        ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    addEventListener('resize', size);
    addEventListener('pointermove', e => { swayTo = (e.clientX / innerWidth - .5) * 1.2; });
    const dim = () => canvas.classList.toggle('dim', scrollY > innerHeight * .5);
    addEventListener('scroll', dim, { passive: true });

    const height = (x, z) =>
        2.4 * Math.sin(x * .2 + t) * Math.cos(z * .15 - t * .5) +
        .6 * Math.sin((x - z) * .35 + t * 1.2);

    const draw = () => {
        ctx.clearRect(0, 0, w, h);
        const F = Math.min(w, h * 1.4) * .9, horizon = h * .42, cam = 3.6, cx = w / 2;
        // project every grid vertex once
        const P = [];
        for (let r = 0; r <= ROWS; r++) {
            const z = NEAR + (FAR - NEAR) * Math.pow(r / ROWS, 1.6);
            const row = [];
            for (let c = 0; c <= COLS; c++) {
                const x = -X + 2 * X * c / COLS + sway;
                row.push([cx + (x - sway) / z * F, horizon + (cam - height(x, z)) / z * F]);
            }
            P.push(row);
        }
        ctx.lineWidth = 1;
        for (let r = 0; r <= ROWS; r++) {
            const a = .5 * Math.pow(1 - r / ROWS, 1.4); // fade into the distance
            ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
            ctx.beginPath();
            const row = P[r];
            ctx.moveTo(row[0][0], row[0][1]);
            for (let c = 1; c <= COLS; c++) ctx.lineTo(row[c][0], row[c][1]);
            // depth lines from this row to the next, same fade band
            if (r < ROWS) for (let c = 0; c <= COLS; c++) {
                ctx.moveTo(row[c][0], row[c][1]); ctx.lineTo(P[r + 1][c][0], P[r + 1][c][1]);
            }
            ctx.stroke();
        }
    };

    size(); dim();
    if (still) { draw(); addEventListener('resize', draw); }
    else (function loop() {
        t += .004; sway += (swayTo - sway) * .03;
        draw(); requestAnimationFrame(loop);
    })();

    console.log('%c hi. say hello: patrick@neobotics.org ', 'color:#000;background:#fff;padding:2px 4px;');
})();
