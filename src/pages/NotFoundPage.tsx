import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { updatePageSeo } from '../utils/seo';

export const NotFoundPage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  // Lock body scroll while 404 page is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    updatePageSeo({
      title: '404 – Page not found | Shristi Estate',
      description: "This page isn't available right now. Sink a few shots while you wait.",
      noindex: true
    });

    const updateStatus = () => {
      if (navigator.onLine === false) {
        setIsOnline(false);
        setOnlineStatus("You're offline. Play while you wait, we'll tell you when you're back.");
      } else {
        setIsOnline(true);
        setOnlineStatus("The page you're looking for doesn't exist or has moved.");
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      setOnlineStatus("You're back online. Hit “Try again” to reload.");
    };

    window.addEventListener('offline', updateStatus);
    window.addEventListener('online', handleOnline);
    updateStatus();

    return () => {
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ---------- Shristi Estate logo mark (vector, offline-safe) ----------
    const NAVY = '#1e3350', GRAY = '#727982';
    const LOGO = [
      { d: 'M495 240L571 287V570H495Z', f: NAVY },
      { d: 'M349 570V401L417 361V316L495 248', s: NAVY, w: 16 },
      { d: 'M400 384L440 372V570H400Z', f: NAVY },
      { d: 'M440 372L466 384V570H440Z', f: GRAY },
      { d: 'M553 392H571V570H553Z', f: GRAY },
      { d: 'M586 338L608 350V570H586Z', f: NAVY },
      { d: 'M625 362L683 390V570H625Z', f: GRAY }
    ];
    const LOGO_CX = 512.5, LOGO_BOTTOM = 572, LOGO_H = 334;
    const logoPaths = LOGO.map(p => ({ path: new Path2D(p.d), f: p.f, s: p.s, w: p.w }));

    // ---------- canvas setup ----------
    const W = 640, H = 300, GROUND = 262;
    let dpr = 1;
    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    resize();
    window.addEventListener('resize', resize);

    // ---------- constants ----------
    const G = 0.35, ANGLE = 58 * Math.PI / 180, COS = Math.cos(ANGLE), SIN = Math.sin(ANGLE);
    const R = 9;                       // ball radius
    const RIM_W = 46, RIM_Y = GROUND - 125;
    const SPAWN = { x: 92, y: 192 };
    const GAME_TIME = 60;

    // ---------- state ----------
    let state = 'idle';              // idle | running | over
    let last = 0, overAt = 0, frame = 0;
    let score = 0, timeLeft = GAME_TIME, hi = 0;
    try { hi = +(localStorage.getItem('404bball-hi') || 0) || 0; } catch (e) {}

    const hoop = { x: 470, tx: 470, shake: 0 };
    let ball: any;
    let charging = false, power = 0, powerDir = 1, sq = 0;
    let floaters: { x: number; y: number; t: string; life: number }[] = [];

    function newBall() {
      ball = {
        x: SPAWN.x, y: SPAWN.y, vx: 0, vy: 0, rot: 0, ready: true,
        touched: false, scored: false, respawn: null as number | null
      };
    }
    newBall();

    function resetGame() {
      score = 0; timeLeft = GAME_TIME; floaters = [];
      hoop.x = hoop.tx = 470; hoop.shake = 0;
      charging = false; power = 0; sq = 0;
      newBall();
    }

    // ---------- input ----------
    function press() {
      if (state === 'idle') { resetGame(); state = 'running'; last = performance.now(); return; }
      if (state === 'over') {
        if (performance.now() - overAt > 500) { resetGame(); state = 'running'; last = performance.now(); }
        return;
      }
      if (ball.ready && !charging) { charging = true; power = 0; powerDir = 1; }
    }

    function release() {
      if (!charging) return;
      charging = false;
      const v = 7 + 10 * power;
      ball.vx = v * COS; ball.vy = -v * SIN;
      ball.ready = false;
      sq = -0.12;                    // stretch on release
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!e.repeat) press();
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        release();
      }
    }
    function handlePointerDown(e: PointerEvent) {
      e.preventDefault();
      try { canvas?.setPointerCapture(e.pointerId); } catch (err) {}
      press();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);

    // ---------- helpers ----------
    function rand(a: number, b: number) { return a + Math.random() * (b - a); }
    function pad(n: number) { return ('00' + Math.floor(n)).slice(-2); }

    // ---------- physics ----------
    function stepBall(dt: number) {
      const prevY = ball.y;
      ball.vy += G * dt;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      ball.rot += ball.vx * 0.06 * dt;

      // backboard
      const bbx = hoop.x + RIM_W / 2 + 8;
      if (ball.vx > 0 && ball.x + R > bbx && ball.x - R < bbx + 6 &&
          ball.y > RIM_Y - 70 && ball.y < RIM_Y + 8) {
        ball.x = bbx - R; ball.vx = -ball.vx * 0.55; ball.touched = true;
      }

      // rim end points
      [hoop.x - RIM_W / 2, hoop.x + RIM_W / 2].forEach(function (px) {
        const dx = ball.x - px, dy = ball.y - RIM_Y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < R + 3 && dist > 0) {
          const nx = dx / dist, ny = dy / dist;
          ball.x = px + nx * (R + 3); ball.y = RIM_Y + ny * (R + 3);
          const vn = ball.vx * nx + ball.vy * ny;
          if (vn < 0) { ball.vx -= 1.6 * vn * nx; ball.vy -= 1.6 * vn * ny; }
          ball.touched = true;
        }
      });

      // scoring: crossing the rim plane downward, inside the rim
      if (!ball.scored && prevY < RIM_Y && ball.y >= RIM_Y && ball.vy > 0 &&
          Math.abs(ball.x - hoop.x) < RIM_W / 2 - 3) {
        ball.scored = true;
        const pts = ball.touched ? 2 : 3;
        score += pts;
        hoop.shake = 1;
        floaters.push({ x: hoop.x, y: RIM_Y - 30, t: ball.touched ? '+2' : '+3 SWISH!', life: 60 });
        if (ball.respawn === null) ball.respawn = 55;
        hoop.tx = rand(400, 565);
        while (Math.abs(hoop.tx - hoop.x) < 50) hoop.tx = rand(400, 565);
      }

      // ground
      if (ball.y + R > GROUND) {
        ball.y = GROUND - R;
        ball.vy *= -0.55; ball.vx *= 0.7;
        if (Math.abs(ball.vy) < 1.2) ball.vy = 0;
        if (ball.respawn === null) ball.respawn = 40;
      }
      // off screen
      if ((ball.x > W + 30 || ball.x < -30) && ball.respawn === null) ball.respawn = 10;
    }

    function update(dt: number) {
      timeLeft -= dt / 60;
      if (timeLeft <= 0) {
        timeLeft = 0; state = 'over'; overAt = performance.now(); charging = false;
        if (score > hi) { hi = score; try { localStorage.setItem('404bball-hi', String(hi)); } catch (e) {} }
        return;
      }

      if (charging) {
        power += powerDir * 0.014 * dt;
        if (power >= 1) { power = 1; powerDir = -1; }
        if (power <= 0) { power = 0; powerDir = 1; }
      }
      sq += ((charging ? 0.14 * power : 0) - sq) * Math.min(0.25 * dt, 1);

      hoop.x += (hoop.tx - hoop.x) * Math.min(0.1 * dt, 1);
      hoop.shake *= Math.pow(0.92, dt);

      if (!ball.ready) {
        const steps = Math.max(1, Math.ceil(dt)), sd = dt / steps;
        for (let i = 0; i < steps; i++) stepBall(sd);
        if (ball.respawn !== null) {
          ball.respawn -= dt;
          if (ball.respawn <= 0) newBall();
        }
      }

      floaters.forEach(f => { f.life -= dt; f.y -= 0.5 * dt; });
      floaters = floaters.filter(f => f.life > 0);
    }

    // ---------- drawing ----------
    function drawLogo(cx: number, bottom: number, h: number, sx: number, sy: number) {
      if (!ctx) return;
      const isDarkActive = isDarkRef.current;
      const s = h / LOGO_H;
      ctx.save();
      ctx.translate(cx, bottom);
      ctx.scale(s * sx, s * sy);
      ctx.translate(-LOGO_CX, -LOGO_BOTTOM);
      logoPaths.forEach(p => {
        if (p.s) {
          ctx.strokeStyle = isDarkActive ? '#38bdf8' : p.s;
          ctx.lineWidth = p.w || 1;
          ctx.lineJoin = 'miter';
          ctx.stroke(p.path);
        } else {
          ctx.fillStyle = isDarkActive
            ? (p.f === NAVY ? '#38bdf8' : '#94a3b8')
            : (p.f || '#1e3350');
          ctx.fill(p.path);
        }
      });
      ctx.restore();
    }

    function drawBall(x: number, y: number, rot: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(rot);
      ctx.fillStyle = '#f97316';
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#9a3412'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-R, 0); ctx.lineTo(R, 0); ctx.moveTo(0, -R); ctx.lineTo(0, R); ctx.stroke();
      ctx.beginPath(); ctx.arc(-R * 1.15, 0, R * 0.85, -0.9, 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(R * 1.15, 0, R * 0.85, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke();
      ctx.restore();
    }

    function drawTrajectory() {
      if (!ctx) return;
      const isDarkActive = isDarkRef.current;
      const v = 7 + 10 * power;
      let x = SPAWN.x, y = SPAWN.y, vx = v * COS, vy = -v * SIN;
      ctx.fillStyle = isDarkActive ? '#38bdf8' : '#1e3350';
      for (let i = 0; i < 160; i++) {
        vy += G; x += vx; y += vy;
        if (y > GROUND || x > W) break;
        if (i % 4 === 0) { ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }

    function drawHoop() {
      if (!ctx) return;
      const isDarkActive = isDarkRef.current;
      const hx = hoop.x, bbx = hx + RIM_W / 2 + 8;
      // pole + backboard
      ctx.fillStyle = isDarkActive ? '#334155' : '#94a3b8';
      ctx.fillRect(bbx + 14, RIM_Y - 10, 6, GROUND - RIM_Y + 10);
      ctx.fillRect(bbx + 2, RIM_Y - 4, 14, 4);
      ctx.fillStyle = isDarkActive ? '#475569' : '#cbd5e1';
      ctx.fillRect(bbx, RIM_Y - 70, 6, 78);
      ctx.fillStyle = isDarkActive ? '#38bdf8' : '#1e3350';
      ctx.fillRect(bbx, RIM_Y - 70, 6, 6);
    }

    function drawRimAndNet() {
      if (!ctx) return;
      const isDarkActive = isDarkRef.current;
      const hx = hoop.x, l = hx - RIM_W / 2, r = hx + RIM_W / 2;
      const sh = Math.sin(frame * 0.9) * hoop.shake * 4;
      // net
      ctx.strokeStyle = isDarkActive ? '#94a3b8' : '#94a3b8'; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(l + 2, RIM_Y); ctx.lineTo(l + 11 + sh, RIM_Y + 28);
      ctx.moveTo(r - 2, RIM_Y); ctx.lineTo(r - 11 + sh, RIM_Y + 28);
      ctx.moveTo(hx - 8, RIM_Y); ctx.lineTo(hx - 3 + sh, RIM_Y + 28);
      ctx.moveTo(hx + 8, RIM_Y); ctx.lineTo(hx + 3 + sh, RIM_Y + 28);
      ctx.moveTo(l + 6, RIM_Y + 10); ctx.lineTo(r - 6, RIM_Y + 10);
      ctx.moveTo(l + 9 + sh * 0.5, RIM_Y + 20); ctx.lineTo(r - 9 + sh * 0.5, RIM_Y + 20);
      ctx.moveTo(l + 11 + sh, RIM_Y + 28); ctx.lineTo(r - 11 + sh, RIM_Y + 28);
      ctx.stroke();
      // rim
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(l, RIM_Y); ctx.lineTo(r, RIM_Y); ctx.stroke();
      ctx.lineCap = 'butt';
    }

    function draw() {
      if (!ctx) return;
      const isDarkActive = isDarkRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // faint 404 backdrop
      ctx.textAlign = 'center';
      ctx.fillStyle = isDarkActive ? 'rgba(255,255,255,0.05)' : 'rgba(30,51,80,0.07)';
      ctx.font = '800 130px system-ui, sans-serif';
      ctx.fillText('404', W / 2, 170);

      // Floor matching theme
      ctx.fillStyle = isDarkActive ? '#0f172a' : '#e2e8f0';
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = isDarkActive ? '#1e293b' : '#cbd5e1';
      ctx.fillRect(0, GROUND, W, 2);

      drawHoop();
      if (charging) drawTrajectory();

      // player (logo)
      const sx = 1 + sq * 0.6, sy = 1 - sq;
      drawLogo(56, GROUND, 82, sx, sy);

      // ball
      drawBall(ball.x, ball.ready && charging ? ball.y + sq * 20 : ball.y, ball.rot);

      drawRimAndNet();

      // power bar
      if (charging) {
        ctx.fillStyle = isDarkActive ? '#1e293b' : '#cbd5e1';
        ctx.fillRect(16, GROUND + 16, 170, 10);
        ctx.fillStyle = power > 0.4 && power < 0.78 ? '#10b981' : (isDarkActive ? '#38bdf8' : '#1e3350');
        ctx.fillRect(16, GROUND + 16, 170 * power, 10);
        ctx.fillStyle = isDarkActive ? '#94a3b8' : '#64748b';
        ctx.font = '600 11px system-ui, sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('POWER', 16, GROUND + 13);
      }

      // HUD text - high contrast in both modes!
      ctx.font = '700 16px ui-monospace, Menlo, Consolas, monospace';
      ctx.fillStyle = isDarkActive ? '#f8fafc' : '#1e3350'; ctx.textAlign = 'left';
      ctx.fillText('SCORE ' + ('000' + score).slice(-3), 14, 26);
      ctx.textAlign = 'center';
      ctx.fillStyle = timeLeft < 10 && state === 'running' ? '#ef4444' : (isDarkActive ? '#f8fafc' : '#1e3350');
      ctx.fillText('0:' + pad(Math.ceil(timeLeft)), W / 2, 26);
      ctx.textAlign = 'right'; ctx.fillStyle = isDarkActive ? '#94a3b8' : '#64748b';
      ctx.fillText('HI ' + ('000' + hi).slice(-3), W - 14, 26);

      // floating score text
      ctx.textAlign = 'center';
      floaters.forEach(f => {
        ctx.globalAlpha = Math.min(1, f.life / 30);
        ctx.fillStyle = '#10b981'; ctx.font = '800 20px system-ui, sans-serif';
        ctx.fillText(f.t, f.x, f.y);
      });
      ctx.globalAlpha = 1;

      // overlays
      if (state === 'idle' || state === 'over') {
        ctx.fillStyle = isDarkActive ? 'rgba(7, 12, 30, 0.94)' : 'rgba(248, 250, 252, 0.94)';
        ctx.fillRect(0, 60, W, 110);
        ctx.textAlign = 'center';
        if (state === 'idle') {
          ctx.fillStyle = isDarkActive ? '#f8fafc' : '#1e3350'; ctx.font = '800 24px system-ui, sans-serif';
          ctx.fillText('Shristi Estate Hoops', W / 2, 102);
          ctx.fillStyle = isDarkActive ? '#94a3b8' : '#64748b'; ctx.font = '500 14px system-ui, sans-serif';
          ctx.fillText('Press Space or tap to start  ·  60 seconds', W / 2, 128);
          ctx.fillText('Hold to charge, release to shoot', W / 2, 148);
        } else {
          ctx.fillStyle = isDarkActive ? '#f8fafc' : '#1e3350'; ctx.font = '800 24px system-ui, sans-serif';
          ctx.fillText("TIME'S UP  ·  Score " + score, W / 2, 102);
          ctx.fillStyle = isDarkActive ? '#94a3b8' : '#64748b'; ctx.font = '500 14px system-ui, sans-serif';
          ctx.fillText(score >= hi && score > 0 ? 'New high score!' : 'Best: ' + hi, W / 2, 128);
          ctx.fillText('Press Space or tap to play again', W / 2, 148);
        }
      }
    }

    // ---------- loop ----------
    let animId: number;
    function loop(now: number) {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now; frame += dt;
      if (state === 'running') update(dt);
      draw();
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(t => { last = t; loop(t); });

    const handleVisibility = () => { last = performance.now(); };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Use createPortal to mount directly to document.body, escaping all container stacking contexts
  return createPortal(
    <div
      id="shristi-404-root"
      className="fixed inset-0 z-[999999] w-screen h-screen overflow-y-auto bg-slate-50 dark:bg-[#070C1E] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 select-none"
      style={{ isolation: 'isolate' }}
    >
      <div className="w-full max-w-3xl flex flex-col items-center justify-center text-center my-auto">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2.5 bg-white dark:bg-[#0B132B] rounded-xl px-4 py-1.5 mb-2.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <svg viewBox="336 234 353 342" aria-hidden="true" className="h-[30px] sm:h-[34px] w-auto">
            <path d="M495 240L571 287V570H495Z" fill="#1e3350" />
            <path d="M349 570V401L417 361V316L495 248" fill="none" stroke="#1e3350" strokeWidth="16" strokeLinejoin="miter" />
            <path d="M400 384L440 372V570H400Z" fill="#1e3350" />
            <path d="M440 372L466 384V570H440Z" fill="#727982" />
            <path d="M553 392H571V570H553Z" fill="#727982" />
            <path d="M586 338L608 350V570H586Z" fill="#1e3350" />
            <path d="M625 362L683 390V570H625Z" fill="#727982" />
          </svg>
          <div className="font-extrabold text-base sm:text-lg tracking-tight text-[#1e3350] dark:text-white">
            Shristi <span className="font-medium text-[#727982] dark:text-slate-400">Estate</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-1 text-slate-900 dark:text-white">
          404 – Page not found
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-1">
          This page isn't available right now. Sink a few shots while you wait.
        </p>
        <p
          role="status"
          aria-live="polite"
          className={`text-[11px] sm:text-xs font-medium min-h-[1.2em] mb-2 ${isOnline ? 'text-slate-500 dark:text-slate-400' : 'text-amber-600 dark:text-amber-400'}`}
        >
          {onlineStatus}
        </p>

        {/* Main Game Stage - Centered */}
        <div className="w-full flex flex-col items-center justify-center my-1">
          <canvas
            ref={canvasRef}
            tabIndex={0}
            role="img"
            aria-label="Basketball mini game. Hold space or press and hold the game to charge a shot, release to shoot."
            className="block w-full h-auto aspect-[640/300] max-h-[46vh] sm:max-h-[50vh] touch-none cursor-pointer outline-none select-none mx-auto"
          />
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
            Hold <b className="font-semibold text-slate-800 dark:text-slate-200">Space</b> (or press and hold the game) to charge, release to shoot. Swish = 3 pts, rim/backboard = 2 pts.
          </p>
        </div>

        {/* Action Buttons - Centered */}
        <div className="w-full flex flex-wrap gap-2.5 sm:gap-3 justify-center items-center mt-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl bg-[#1e3350] dark:bg-brand-500 hover:bg-[#162740] dark:hover:bg-brand-600 text-white shadow-md transition-transform active:translate-y-px cursor-pointer"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-transform active:translate-y-px cursor-pointer"
          >
            Go home
          </button>
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B132B] text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-transform active:translate-y-px cursor-pointer"
          >
            Explore Properties
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotFoundPage;
