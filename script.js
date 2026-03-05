/* ══ PARTICLES ══ */
(function () {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let pts = [];
    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    function mkPt() {
        return {
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            r: Math.random() * 2 + 0.5, op: Math.random() * 0.5 + 0.1,
            speed: Math.random() * 0.3 + 0.05, drift: (Math.random() - 0.5) * 0.3,
            phase: Math.random() * Math.PI * 2
        };
    }
    for (let i = 0; i < 80; i++) pts.push(mkPt());
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pts.forEach(p => {
            p.phase += 0.02;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201,168,76,${p.op * (0.7 + 0.3 * Math.sin(p.phase))})`;
            ctx.fill();
            p.y -= p.speed; p.x += p.drift;
            if (p.y < -5 || p.x < -5 || p.x > canvas.width + 5) { Object.assign(p, mkPt()); p.y = canvas.height + 5; }
        });
        requestAnimationFrame(draw);
    }
    draw();
})();

/* ══ CONFETTI ══ */
function shootConfetti() {
    const colors = ['#C9A84C', '#F0D080', '#F7E9B8', '#fff', '#8B6914', '#E5C55A'];
    for (let i = 0; i < 70; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.cssText = `left:${Math.random() * 100}vw;background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${Math.random() * 2 + 2}s;animation-delay:${Math.random()}s;
      transform:rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4500);
    }
}
window.addEventListener('load', () => setTimeout(shootConfetti, 1600));

/* ══ PANELS ══
   FIX: track active panel; clicking same button closes it */
let activePanel = null;
function togglePanel(id) {
    // close all first
    document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
    if (activePanel === id) { activePanel = null; return; }
    activePanel = id;
    const panel = document.getElementById('panel-' + id);
    panel.classList.add('active');
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

/* ══ COUNTDOWN ══ */
function tick() {
    const now = new Date();
    // FIX: use a real known birthday date — defaulting to next March 4
    let bday = new Date(now.getFullYear(), 2, 4);
    if (now >= bday) bday = new Date(now.getFullYear() + 1, 2, 4);
    const diff = bday - now;
    const pad = n => String(Math.floor(n)).padStart(2, '0');
    document.getElementById('cd-d').textContent = pad(diff / 86400000);
    document.getElementById('cd-h').textContent = pad((diff % 86400000) / 3600000);
    document.getElementById('cd-m').textContent = pad((diff % 3600000) / 60000);
    document.getElementById('cd-s').textContent = pad((diff % 60000) / 1000);
}
tick(); setInterval(tick, 1000);

/* ══ SCROLL REVEAL ══ */
const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => { if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 120); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ══ COURTESY PHOTO UPLOAD ══ */
function previewCourtesyPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        document.getElementById('courtesyPreview').src = ev.target.result;
        document.getElementById('photoUploadBox').classList.add('has-image');
    };
    reader.readAsDataURL(file);
}
function removeCourtesyPhoto(e) {
    // FIX: prevent event bubbling to the file input underneath
    e.preventDefault(); e.stopPropagation();
    document.getElementById('courtesyPreview').src = '';
    document.getElementById('photoUploadBox').classList.remove('has-image');
    document.getElementById('courtesyImageInput').value = '';
}

/* ══ AMBIENT MUSIC ══ */
let audioCtx = null, gainNode = null, muted = false;
function startAmbient() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.connect(audioCtx.destination);
        [220, 277.18, 329.63, 440].forEach((freq, i) => {
            const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
            osc.type = 'sine'; osc.frequency.value = freq;
            g.gain.setValueAtTime(0.008 / (i + 1), audioCtx.currentTime);
            osc.connect(g); g.connect(gainNode); osc.start();
        });
    } catch (err) { }
}
function toggleMute() {
    if (!audioCtx) { startAmbient(); muted = false; }
    else { muted = !muted; gainNode.gain.setTargetAtTime(muted ? 0 : 0.04, audioCtx.currentTime, 0.3); }
    document.getElementById('muteBtn').textContent = muted ? '♪ UNMUTE' : '♪ MUTE';
}