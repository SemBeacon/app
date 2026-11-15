// Builds resources/video/sembeacon-ios-announcement.mp4 from the WebKit recordings in
// resources/video/raw (tests/video/record.spec.ts) and the artwork of ../website.
// Usage: FFMPEG=/path/to/ffmpeg node scripts/video/build.mjs   (ffmpeg needs libx264)
import { chromium } from '@playwright/test';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = resolve(ROOT, '..', 'website', 'src', 'site', 'images');
const RAW = join(ROOT, 'resources', 'video', 'raw');
const WORK = join(ROOT, 'resources', 'video', 'work');
const OUT = join(ROOT, 'resources', 'video', 'sembeacon-ios-announcement.mp4');
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
mkdirSync(WORK, { recursive: true });

// Palette from the website (src/site/_scss/_variables.scss, docs/logo.md)
const BRAND = '#363795';
const PAGE = '#3f499f';
const ACCENT = '#4e5bbe';
const img = (f) => `file://${join(SITE, f)}`;
const grid = img('bg-grid.png');

const FONT = `'ITC Avant Garde Gothic Std', 'Avant Garde', 'URW Gothic', 'Century Gothic', Helvetica, Arial, sans-serif`;
const base = `
@import url('https://fonts.cdnfonts.com/css/itc-avant-garde-gothic-std-book');
*{box-sizing:border-box;margin:0}
html,body{width:1920px;height:1080px;overflow:hidden;font-family:${FONT};color:#fff}
.bg{position:absolute;inset:0;background:url(${grid}),radial-gradient(1200px 800px at 25% 20%,${PAGE},${BRAND} 70%)}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
h1{font-size:92px;font-weight:700;letter-spacing:-1px;line-height:1.1}
h2{font-size:64px;font-weight:700;line-height:1.15}
p{font-size:34px;line-height:1.4;opacity:.9}
.pill{display:inline-block;margin-top:44px;padding:16px 40px;border-radius:999px;background:#fff;color:${BRAND};font-size:32px;font-weight:700}
.cap{position:absolute;display:flex;flex-direction:column;justify-content:center}
.cap .k{font-size:26px;letter-spacing:4px;text-transform:uppercase;color:#c9cffa;margin-bottom:18px}
.cap h2{margin-bottom:22px}
`;

const pages = {
    bg: `<div class="bg"></div>`,
    intro: `<div class="bg"></div><div class="center"><img src="${img('logo_alpha.svg')}" width="1200"></div>`,
    announce: `<div class="bg"></div><div class="center">
        <h1>SemBeacon is now on iOS</h1>
        <p style="margin-top:28px">Scan, inspect and understand semantic BLE beacons<br>on your iPhone and iPad.</p></div>`,
    outro: `<div class="bg"></div><div class="center">
        <img src="${img('logo_square_alpha.svg')}" width="220">
        <h1 style="margin-top:36px">Download SemBeacon for iOS</h1>
        <p style="margin-top:18px">Available on the App Store &nbsp;·&nbsp; also on Android</p>
        <span class="pill">sembeacon.org</span></div>`,
};

// Device geometry (video position, size, bezel) in the 1920x1080 canvas
const DEV = {
    iphone: { x: 330, y: 80, w: 406, h: 880, bezel: 20, radius: 58, src: [430, 932] },
    ipad: { x: 1000, y: 70, w: 700, h: 934, bezel: 22, radius: 34, src: [1024, 1366] },
};
const frame = (d) =>
    `<div style="position:absolute;left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;
     border-radius:${d.radius}px;box-shadow:0 0 0 ${d.bezel}px #0c0d26,0 0 0 ${d.bezel + 3}px ${ACCENT},0 40px 90px rgba(0,0,0,.45)"></div>`;
pages['frame-iphone'] = frame(DEV.iphone);
pages['frame-ipad'] = frame(DEV.ipad);

const caps = {
    iphone: [
        [
            'Scanner',
            'Scan every beacon around you',
            'iBeacon, AltBeacon, Eddystone and SemBeacon, ranked by signal strength.',
            1,
            8.5,
        ],
        [
            'Linked data',
            'Open a SemBeacon',
            'Namespace, instance and resource URI at a glance. The linked data description is resolved for you.',
            9,
            18.5,
        ],
        [
            'Navigation',
            'Everything one tap away',
            'Scanner, map and more in the side menu.',
            19.5,
            23,
        ],
    ],
    ipad: [
        [
            'iPad',
            'Made for the big screen',
            'A split-pane layout keeps the menu next to your beacons.',
            1,
            8.5,
        ],
        [
            'Inspect',
            'Every detail of every beacon',
            'Open a beacon to see its identifiers and semantic description.',
            9,
            18.5,
        ],
        ['One app', 'iPhone and iPad', 'The same SemBeacon app, in light and dark mode.', 19.5, 23],
    ],
};
const capHtml = (dev, [k, t, s]) => {
    const left = dev === 'iphone' ? 900 : 120;
    return `<div class="cap" style="left:${left}px;top:240px;width:800px;height:600px">
        <div class="k">${k}</div><h2>${t}</h2><p>${s}</p></div>`;
};
caps.iphone.forEach((c, i) => (pages[`cap-iphone-${i}`] = capHtml('iphone', c)));
caps.ipad.forEach((c, i) => (pages[`cap-ipad-${i}`] = capHtml('ipad', c)));

// Real-device scene: screenshots taken on physical devices (website/images/ios-app)
const shot = (f, w, h, r) =>
    `<img src="${img('ios-app/' + f)}" style="width:${w}px;height:${h}px;border-radius:${r}px;box-shadow:0 0 0 12px #0c0d26,0 0 0 14px ${ACCENT},0 30px 70px rgba(0,0,0,.45);object-fit:cover">`;
pages.real = `<div class="bg"></div>
    <div style="position:absolute;left:120px;top:230px;width:640px">
      <div class="cap" style="position:static"><div class="k">Tested on real devices</div>
      <h2>Running on physical iPhones and iPads</h2>
      <p>Real Bluetooth scanning, verified on hardware.</p></div></div>
    <div style="position:absolute;left:830px;top:160px">${shot('Screenshot 2025-08-28 at 17.18.26.png', 330, 587, 38)}</div>
    <div style="position:absolute;left:1230px;top:160px">${shot('Screenshot 2025-08-28 at 17.18.41.png', 330, 587, 38)}</div>
    <div style="position:absolute;left:830px;top:800px">${shot('Screenshot 2025-08-28 at 18.32.03.png', 730, 255, 20)}</div>`;
// (iPad shot is cropped to a banner so the three devices fit the frame)

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const [name, html] of Object.entries(pages)) {
    const file = join(WORK, `${name}.html`);
    writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${base}</style>${html}`);
    await page.goto(`file://${file}`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
        path: join(WORK, `${name}.png`),
        omitBackground: !/^(bg|intro|announce|outro|real)$/.test(name),
    });
}
await browser.close();

const ff = (args) => execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
const FADE = (d) =>
    `fade=t=in:st=0:d=0.5:color=${BRAND},fade=t=out:st=${d - 0.5}:d=0.5:color=${BRAND}`;
const enc = ['-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p'];

const still = (name, d) =>
    ff([
        '-framerate',
        '30',
        '-loop',
        '1',
        '-t',
        String(d),
        '-i',
        join(WORK, `${name}.png`),
        '-vf',
        FADE(d),
        ...enc,
        join(WORK, `s-${name}.mp4`),
    ]);
still('intro', 5);
still('announce', 5);
still('real', 9);
still('outro', 8);

/**
 * Slow CI runners stretch the Maestro walkthrough from ~24 s to minutes. Keep only the moments
 * where the screen changes (plus short holds), drop the idle waiting, and fit the result into
 * `target` seconds. Returns the path of a constant 30 fps clip.
 */
function compact(src, name, target, d) {
    const probe = spawnSync(
        FFMPEG,
        [
            '-hide_banner',
            '-i',
            src,
            '-vf',
            "scale=320:-1,select='gt(scene,0.004)',showinfo",
            '-an',
            '-f',
            'null',
            '-',
        ],
        { encoding: 'utf8' },
    );
    const times = [...probe.stderr.matchAll(/pts_time:([0-9.]+)/g)].map((m) => Number(m[1]));
    const clusters = [];
    for (const t of times) {
        const last = clusters.at(-1);
        if (last && t - last.end < 2.5) {
            last.end = t;
            last.n++;
        } else {
            clusters.push({ start: t, end: t, n: 1 });
        }
    }
    const active = clusters.filter((c) => c.n >= 2);
    if (active.length === 0) return src;
    const windows = [];
    active.forEach((c, i) => {
        const from = i === 0 ? Math.max(0, c.start - 2.5) : c.start - 0.8;
        const to = c.end + (i === active.length - 1 ? 2.5 : 1.0);
        const prev = windows.at(-1);
        if (prev && from <= prev[1]) prev[1] = to;
        else windows.push([from, to]);
    });
    const total = windows.reduce((sum, [a, b]) => sum + (b - a), 0);
    const speed = Math.max(total / target, 1);
    console.log(
        `${name}: ${windows.length} windows, ${total.toFixed(1)} s -> ${(total / speed).toFixed(1)} s (x${speed.toFixed(2)})`,
    );
    const parts = windows.map(
        ([a, b], i) => `[0:v]trim=start=${a}:end=${b},setpts=PTS-STARTPTS[v${i}]`,
    );
    const concat =
        windows.map((_, i) => `[v${i}]`).join('') +
        `concat=n=${windows.length}:v=1,setpts=PTS/${speed},fps=30,scale=${d.w}:${d.h}:flags=lanczos,tpad=stop_mode=clone:stop_duration=${SCENE},trim=end=${SCENE},setpts=PTS-STARTPTS[out]`;
    const out = join(WORK, `c-${name}.mp4`);
    ff(['-i', src, '-filter_complex', [...parts, concat].join(';'), '-map', '[out]', ...enc, out]);
    return out;
}

const SCENE = 23.5;
for (const dev of ['iphone', 'ipad']) {
    const d = DEV[dev];
    // Real iOS Simulator recording (scripts/ios-simulator-video.sh) wins over the WebKit fallback
    const sim = join(RAW, `${dev}.mp4`);
    const simulator = existsSync(sim);
    const clip = simulator ? compact(sim, dev, SCENE - 1, d) : sim;
    const inputs = [
        ...['-framerate', '30', '-loop', '1', '-t', String(SCENE), '-i', join(WORK, 'bg.png')],
        ...[
            '-ss',
            simulator ? '0' : '0.6',
            '-t',
            String(SCENE),
            '-i',
            simulator ? clip : join(RAW, `${dev}.webm`),
        ],
        ...[
            '-framerate',
            '30',
            '-loop',
            '1',
            '-t',
            String(SCENE),
            '-i',
            join(WORK, `frame-${dev}.png`),
        ],
    ];
    caps[dev].forEach((_, i) =>
        inputs.push(
            '-framerate',
            '30',
            '-loop',
            '1',
            '-t',
            String(SCENE),
            '-i',
            join(WORK, `cap-${dev}-${i}.png`),
        ),
    );
    let f = `[1:v]${simulator ? '' : `crop=${d.src[0]}:${d.src[1]}:0:0,`}scale=${d.w}:${d.h}:flags=lanczos,setsar=1[v];[0:v][v]overlay=${d.x}:${d.y}[a];[a][2:v]overlay=0:0[b0];`;
    caps[dev].forEach(([, , , a, b], i) => {
        f += `[${3 + i}:v]format=rgba,fade=t=in:st=${a}:d=0.5:alpha=1,fade=t=out:st=${b - 0.5}:d=0.5:alpha=1[c${i}];[b${i}][c${i}]overlay=0:0:eof_action=pass[b${i + 1}];`;
    });
    f += `[b${caps[dev].length}]${FADE(SCENE)}[out]`;
    ff([...inputs, '-filter_complex', f, '-map', '[out]', ...enc, join(WORK, `s-${dev}.mp4`)]);
}

const order = ['intro', 'announce', 'iphone', 'ipad', 'real', 'outro'];
writeFileSync(join(WORK, 'list.txt'), order.map((n) => `file 's-${n}.mp4'`).join('\n'));
// Soundtrack: python3 scripts/video/score.py resources/video/work/score.wav
ff([
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    join(WORK, 'list.txt'),
    '-i',
    join(WORK, 'score.wav'),
    '-map',
    '0:v',
    '-map',
    '1:a',
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    '-movflags',
    '+faststart',
    OUT,
]);
console.log('Wrote', OUT);
