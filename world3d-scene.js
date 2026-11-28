/* CHẠM CỬA VIỆT — Sa bàn 3D Cửa Việt: thế giới 3D phía sau toàn trang.
 *
 * - Mọi hình khối được dựng bằng mã, không tải mô hình ngoài. Vị trí và tỉ lệ mang tính minh họa.
 * - Camera bay quanh sa bàn theo từng phần của trang khi cuộn; nắng đi từ buổi sáng
 *   (mặt trời mọc phía biển) tới hoàng hôn (mặt trời lặn phía đất liền).
 * - Ở phần "Bản đồ ký ức", sa bàn nằm gọn trong khung bản đồ. Nhãn của 5 cột mốc là nút HTML
 *   mang data-action="open-point", nên mở đúng nội dung Chạm y như bản đồ 2D.
 * - Tệp này do world3d.js nạp khi cần; three.js được lưu sẵn trong vendor/three (không dùng CDN).
 */
import * as THREE from './vendor/three/three.module.min.js';

/* ------------------------------------------------------------------ Tiện ích */
const PI = Math.PI;
const FOV = 30;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const wrapAngle = a => { a %= 2 * PI; if (a > PI) a -= 2 * PI; if (a < -PI) a += 2 * PI; return a; };
const two = n => String(n).padStart(2, '0');
const idle = () => new Promise(resolve => ('requestIdleCallback' in window
  ? requestIdleCallback(() => resolve(), { timeout: 120 })
  : setTimeout(resolve, 16)));

function makeRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(i, j) {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, z) {
  const i = Math.floor(x), j = Math.floor(z), fx = x - i, fz = z - j;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = hash2(i, j), b = hash2(i + 1, j), c = hash2(i, j + 1), d = hash2(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, z) => vnoise(x, z) * 0.55 + vnoise(x * 2.03 + 7.1, z * 2.03 - 3.3) * 0.3
  + vnoise(x * 4.1 - 2.2, z * 4.1 + 9.4) * 0.15;

/* Gắn một màu cho mọi đỉnh của hình (để gộp nhiều hình thành một lần vẽ) */
function paint(geometry, color) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  if (g !== geometry) geometry.dispose();
  const c = new THREE.Color(color), n = g.attributes.position.count, arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}
function merge(list) {
  let count = 0;
  for (const g of list) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3);
    col.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count;
    g.dispose();
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  m.setAttribute('color', new THREE.BufferAttribute(col, 3));
  m.computeVertexNormals();
  return m;
}
/* Hình từ danh sách tam giác [x,y,z,...] và một màu */
function triangles(points, color) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return paint(g, color);
}
function densify(points, step) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, z0] = points[i], [x1, z1] = points[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / step));
    for (let k = 0; k < n; k++) out.push([lerp(x0, x1, k / n), lerp(z0, z1, k / n)]);
  }
  out.push(points[points.length - 1]);
  return out;
}
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------------------ Địa hình (minh họa) */
// Trục x: Tây → Đông (biển ở phía Đông). Trục z: Bắc → Nam. Mặt nước ở y = 0.
const HALF_W = 13, HALF_D = 9, BASE_Y = -1.05;
const coastX = z => 5 + 0.45 * Math.sin(z * 0.42 + 0.6) + 0.22 * Math.sin(z * 1.13 + 1.7);
const riverZ = x => { const s = smooth(-1, 5, x); return 1.1 * Math.sin((x + 13) * 0.23 + 0.4) * (1 - s) + 0.3 * s; };
const riverHalf = x => 0.5 * (1.5 + 0.3 * Math.sin(x * 0.45) + 1.7 * smooth(-3, 5.5, x));
const MOUTH_X = coastX(0.3);
const SPIT = { x: MOUTH_X - 0.35, z: riverZ(MOUTH_X) - 0.95, rx: 0.7, rz: 0.95, top: 0.15 };  // doi cát bờ Bắc
const ISLET = { x: 2.35, z: riverZ(2.35) + 0.42, rx: 0.8, rz: 0.27, top: 0.09 };           // cồn cát giữa cửa sông
const MON = { x: 0.85, z: -3.35 };   // đài tưởng niệm (minh họa)
const BRIDGE_X = -4.2;                // cầu Cửa Việt (minh họa)
const bump = (x, z, b) => b.top - 0.55 * (((x - b.x) / b.rx) ** 2 + ((z - b.z) / b.rz) ** 2);

function heightAt(x, z) {
  const cx = coastX(z), toCoast = cx - x;
  let land = 0.3 + 0.17 * fbm(x * 0.3 + 3.7, z * 0.3 - 1.2);
  const dune = smooth(0.7, 1.7, toCoast) * (1 - smooth(2.6, 4.4, toCoast));
  land += dune * (0.12 + 0.16 * vnoise(x * 1.15 + 4.1, z * 1.15 - 0.7));
  land = lerp(0.07, land, smooth(-0.1, 1.5, toCoast));
  let h = toCoast >= 0 ? land : lerp(land, -0.66, smooth(0, 3.4, -toCoast));
  const mask = 1 - smooth(cx + 0.2, cx + 1.8, x);          // sông tan vào biển ngoài cửa
  if (mask > 0) {
    const rz = riverZ(x), rh = riverHalf(x), d = Math.abs(z - rz);
    const bed = -0.44 + 0.16 * Math.min(1, (d / rh) ** 2);
    const bank = smooth(rh * 0.72, rh * 1.2 + 0.3, d);
    h = lerp(h, lerp(Math.min(bed, h), h, bank), mask);
  }
  return Math.max(h, bump(x, z, SPIT), bump(x, z, ISLET));
}

const col = hex => new THREE.Color(hex);
const PAL = {
  sand: col('#f3e2b8'), dune: col('#e9d8a6'), wetSand: col('#e0c790'),
  shoal: col('#e2d2a3'), seabed: col('#a3c0b7'),
  forest: col('#d3cd9d'), grass1: col('#bfd197'), grass2: col('#a7c389'),
  field1: col('#cfdc93'), field2: col('#b6d07e'), field3: col('#dadfa2'), fieldWet: col('#abd1a3'),
};
const WATER = { shallow: col('#a9e7de'), mid: col('#61c4d0'), deep: col('#3090b2'), river: col('#70c2b9'), foam: col('#ffffff') };

function landColor(x, z, h, out) {
  if (h < 0.015) return out.copy(PAL.shoal).lerp(PAL.seabed, smooth(-0.02, -0.5, h));
  if (h < 0.1) return out.copy(PAL.wetSand);
  const toCoast = coastX(z) - x, rz = riverZ(x), rh = riverHalf(x), d = Math.abs(z - rz);
  const n = vnoise(x * 0.9 + 11, z * 0.9 - 4);
  if (toCoast < 1.55 || bump(x, z, SPIT) > -0.02 || bump(x, z, ISLET) > -0.02 || (x > -1.5 && d < rh * 1.2 + 0.4)) {
    return out.copy(PAL.sand).lerp(PAL.dune, n * 0.6);
  }
  if (toCoast < 4.1) return out.copy(PAL.forest).lerp(PAL.dune, n * 0.4);
  const south = z > rz + rh + 0.9, north = z < rz - rh - 0.9;
  const southFields = south && x < -1.2 && !(x > -5.6 && x < -3.0);
  const northFields = north && x < -6.5 && z > -8.3 && !(z > -3.9 && z < -1.6);
  if (southFields || northFields) {                       // ruộng lúa: ô chữ nhật đổi màu
    const k = hash2(Math.floor((x + 40) / 0.95), Math.floor((z + 40) / 0.62));
    return out.copy(k < 0.34 ? PAL.field1 : k < 0.68 ? PAL.field2 : k < 0.86 ? PAL.field3 : PAL.fieldWet);
  }
  return out.copy(PAL.grass1).lerp(PAL.grass2, n);
}

/* ------------------------------------------------------------------ Đường (minh họa) */
const ROADS = [
  [[-4.45, -9.2], [-4.3, -7.0], [-4.05, -5.0], [-4.15, -3.2], 'bridge-north'],
  ['bridge-south', [-4.1, 3.6], [-3.9, 5.6], [-4.3, 9.2]],
  [[-4.08, -4.7], [-2.0, -4.9], [0.2, -4.55], [1.25, -4.1], [2.3, -3.05], [2.95, -2.45]],
  [[1.25, -4.1], [2.5, -5.05], [3.3, -5.75]],
  [[-4.15, -3.2], [-7.0, -2.6], [-10.0, -2.75], [-13.2, -2.45]],
  [[-4.08, 4.3], [-1.8, 4.6], [0.6, 4.25], [2.2, 3.6], [3.15, 4.55]],
];

/* ------------------------------------------------------------------ Cảnh quay theo từng phần trang */
// az: góc nhìn quanh sa bàn (0 = nhìn từ phía Nam, dương = từ phía Đông/biển).
// el: độ cao góc nhìn. span: số đơn vị sa bàn trải ngang màn hình. fit: sa bàn chiếm tỉ lệ màn hình.
// anchor: vị trí điểm nhìn trên màn hình. tod: giờ trong ngày (0 sáng → 1 hoàng hôn). veil: lớp mờ cho chữ dễ đọc.
const SHOTS = [
  // Đầu trang: sa bàn đã nằm sẵn trong khung bản đồ (phía dưới), nhìn từ trên cao và xoay lệch;
  // cuộn xuống thì sa bàn xoay dần về góc nhìn chuẩn đúng lúc khung bản đồ hiện ra.
  { sel: '#home', inMap: true, target: [0.4, -0.15, 0.1], az: -0.75, el: 1.25, fit: 0.9, tod: 0, veil: 0 },
  { sel: '#memory-map', map: true, markers: 1, target: [0.4, -0.15, 0.1], az: 0, el: 0.9, fit: 0.97, tod: 0.06, veil: 0, show: 1 },
  { sel: '#points', target: [2.2, 0, 0], az: -0.78, el: 0.56, span: 23, mSpan: 15, anchor: [0.5, 0.58], tod: 0.14, veil: 0.46 },
  { sel: '#stories', target: [2.4, 0.1, -0.9], az: 0.48, el: 0.62, span: 16, mSpan: 10, anchor: [0.5, 0.5], tod: 0.26, veil: 0.38 },
  { sel: '#gallery', target: [3.6, 0, 0], az: 1.2, el: 0.52, span: 21, mSpan: 13, anchor: [0.5, 0.56], tod: 0.38, veil: 0.46 },
  { sel: '.creation', target: [-0.4, 0.2, -3.4], az: -0.42, el: 0.72, span: 17, mSpan: 11, anchor: [0.5, 0.5], tod: 0.48, veil: 0.38 },
  { sel: '#community-board', target: [3.8, 0.2, -3.4], az: 0.95, el: 0.52, span: 17, mSpan: 11, anchor: [0.5, 0.5], tod: 0.58, veil: 0.38 },
  { sel: '#passport', target: [0.3, -0.2, 0], az: 0.2, el: 1.05, fit: 0.86, mFit: 1.25, anchor: [0.5, 0.5], tod: 0.68, veil: 0.32 },
  { sel: '#about', target: [-3.8, 0.4, 0.7], az: -0.95, el: 0.44, span: 14, mSpan: 9, anchor: [0.5, 0.5], tod: 0.8, veil: 0.38 },
  { sel: '.closing', stage: '.w3d-stage', target: [0.6, -0.3, 0.2], az: 0.55, el: 0.5, fit: 0.96, tod: 1, veil: 0, show: 1 },
];
const CAM_KEYS = ['tx', 'ty', 'tz', 'az', 'el', 'dist', 'ax', 'ay', 'tod', 'veil', 'markers', 'show'];
const CAM_EPS = { tx: 0.002, ty: 0.002, tz: 0.002, az: 0.0006, el: 0.0006, dist: 0.004, ax: 0.35, ay: 0.35, tod: 0.001, veil: 0.002, markers: 0.003, show: 0.01 };
const ISLAND_BOX = [-13.6, 13.6, -1.55, 0.95, -9.6, 9.6];
const HEAD_Y = 1.32;   // độ cao đầu cột mốc Chạm

function pickQuality() {
  const dpr = window.devicePixelRatio || 1;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 820;
  const mobile = coarse || small;
  const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
  const low = mem <= 2 || cores <= 3;
  return {
    mobile, low,
    dpr: Math.min(dpr, mobile ? 1.5 : 1.75) * (low ? 0.8 : 1),
    antialias: dpr < 1.5,
    shadows: !low,
    shadowSize: mobile || low ? 1024 : 2048,
    terrainSeg: mobile ? [112, 78] : [156, 108],
    waterSeg: mobile ? [72, 50] : [108, 74],
    trees: low ? 200 : mobile ? 270 : 430,
    houses: low ? 70 : mobile ? 95 : 135,
    clouds: mobile ? 5 : 8,
    ambient: !low,
    ambientFps: mobile ? 30 : 40,
  };
}

/* ================================================================== Dựng thế giới */
export async function createWorld(opts = {}) {
  const Q = pickQuality();
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const rand = makeRandom(1973);
  const state = { enabled: false, disposed: false };

  /* --- Lớp canvas cố định phía sau trang --- */
  const host = document.createElement('div');
  host.id = 'world3d';
  host.setAttribute('aria-hidden', 'true');
  const duskLayer = document.createElement('div');
  duskLayer.className = 'w3d-dusk';
  const veilLayer = document.createElement('div');
  veilLayer.className = 'w3d-veil';
  const renderer = new THREE.WebGLRenderer({ antialias: Q.antialias, alpha: true, stencil: false, powerPreference: 'default' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Q.dpr);
  renderer.shadowMap.enabled = Q.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const canvas = renderer.domElement;
  canvas.className = 'w3d-canvas';
  host.append(duskLayer, canvas, veilLayer);
  document.body.prepend(host);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400);
  const uniforms = { uTime: { value: 0 } };
  const island = new THREE.Group();
  scene.add(island);

  /* --- Ánh sáng --- */
  const hemi = new THREE.HemisphereLight(0xe3f3ff, 0xe8dcc0, 1.45);
  const sun = new THREE.DirectionalLight(0xfff3e2, 2.7);
  sun.castShadow = Q.shadows;
  if (Q.shadows) {
    sun.shadow.mapSize.set(Q.shadowSize, Q.shadowSize);
    const sc = sun.shadow.camera;
    sc.left = -17; sc.right = 17; sc.top = 17; sc.bottom = -17; sc.near = 1; sc.far = 90;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.03;
  }
  scene.add(hemi, sun, sun.target);
  const lampMat = new THREE.MeshLambertMaterial({ color: '#fff1cf', emissive: '#ffd27a', emissiveIntensity: 0 });

  /* ------------------------------------------------ Bệ sa bàn */
  function roundedRect(w, d, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  function slab(w, d, r, depth, color, y) {
    const g = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
      depth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 10,
    });
    g.rotateX(-PI / 2);
    g.translate(0, y, 0);
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color }));
    m.receiveShadow = true;
    return m;
  }
  function buildPlinth() {
    island.add(slab(2 * HALF_W + 1.0, 2 * HALF_D + 1.0, 0.85, 0.3, '#f6f1e6', BASE_Y - 0.34));
    island.add(slab(2 * HALF_W + 0.7, 2 * HALF_D + 0.7, 0.75, 0.22, '#2b6c72', BASE_Y - 0.64));
    // Biển tên bằng đồng ở mặt trước bệ
    const plaque = canvasTexture(1024, 64, (ctx, w, h) => {
      ctx.fillStyle = '#1f5a60'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ecd8ab';
      ctx.font = '600 30px "Be Vietnam Pro", system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SA BÀN MINH HỌA  ·  CỬA VIỆT, QUẢNG TRỊ', w / 2, h / 2 + 1);
    });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.4), new THREE.MeshBasicMaterial({ map: plaque }));
    plate.position.set(0, BASE_Y - 0.19, HALF_D + 0.55);
    island.add(plate);
    // Bóng mềm dưới bệ
    const shade = canvasTexture(256, 256, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.55, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2 * HALF_W + 9, 2 * HALF_D + 9),
      new THREE.MeshBasicMaterial({ map: shade, color: '#1c4a58', transparent: true, depthWrite: false, opacity: 0.55 }));
    shadow.rotation.x = -PI / 2;
    shadow.position.y = BASE_Y - 0.95;
    island.add(shadow);
  }

  /* ------------------------------------------------ Mặt đất */
  function buildTerrain() {
    const [nx, nz] = Q.terrainSeg;
    const g = new THREE.PlaneGeometry(2 * HALF_W, 2 * HALF_D, nx, nz);
    g.rotateX(-PI / 2);
    const p = g.attributes.position, colors = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = heightAt(x, z);
      p.setY(i, h);
      landColor(x, z, h, c);
      const k = 0.95 + 0.08 * hash2(Math.round(x * 6), Math.round(z * 6));
      colors[i * 3] = c.r * k; colors[i * 3 + 1] = c.g * k; colors[i * 3 + 2] = c.b * k;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    m.receiveShadow = true;
    island.add(m);
  }

  /* ------------------------------------------------ Thành sa bàn: các lớp đất và khối nước */
  function buildSkirt() {
    const [nx, nz] = Q.terrainSeg;
    const earthPos = [], earthCol = [], waterPos = [];
    const levels = [-0.22, -0.56, BASE_Y];
    const topSoil = col('#d8bf8f'), wetTop = col('#cdb98c'), band1 = col('#b8956b'), band2 = col('#93735a');
    const edges = [
      [nx, i => [-HALF_W + (2 * HALF_W * i) / nx, -HALF_D]],
      [nx, i => [-HALF_W + (2 * HALF_W * i) / nx, HALF_D]],
      [nz, i => [-HALF_W, -HALF_D + (2 * HALF_D * i) / nz]],
      [nz, i => [HALF_W, -HALF_D + (2 * HALF_D * i) / nz]],
    ];
    const quad = (arr, a, b, ya1, yb1, ya2, yb2) => arr.push(
      a[0], ya1, a[1], b[0], yb1, b[1], b[0], yb2, b[1],
      a[0], ya1, a[1], b[0], yb2, b[1], a[0], ya2, a[1]);
    for (const [n, at] of edges) {
      for (let i = 0; i < n; i++) {
        const a = at(i), b = at(i + 1), ha = heightAt(a[0], a[1]), hb = heightAt(b[0], b[1]);
        let topA = ha, topB = hb;
        for (let k = 0; k < 3; k++) {
          const lv = levels[k];
          const ya = Math.max(topA, lv), yb = Math.max(topB, lv);
          quad(earthPos, a, b, ya, yb, lv, lv);
          const c = k === 0 ? ((ha + hb) / 2 > 0.02 ? topSoil : wetTop) : k === 1 ? band1 : band2;
          for (let v = 0; v < 6; v++) earthCol.push(c.r, c.g, c.b);
          topA = Math.min(topA, lv); topB = Math.min(topB, lv);
        }
        if (ha < 0 || hb < 0) quad(waterPos, a, b, 0, 0, Math.min(ha, 0), Math.min(hb, 0));
      }
    }
    const earth = new THREE.BufferGeometry();
    earth.setAttribute('position', new THREE.Float32BufferAttribute(earthPos, 3));
    earth.setAttribute('color', new THREE.Float32BufferAttribute(earthCol, 3));
    earth.computeVertexNormals();
    island.add(new THREE.Mesh(earth, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide })));
    const wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.Float32BufferAttribute(waterPos, 3));
    wg.computeVertexNormals();
    const wm = new THREE.Mesh(wg, new THREE.MeshPhongMaterial({
      color: '#4fb6c9', transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false, shininess: 60,
    }));
    wm.renderOrder = 3;
    island.add(wm);
  }

  /* ------------------------------------------------ Mặt nước: sông và biển có sóng */
  function buildWater() {
    const [nx, nz] = Q.waterSeg;
    const g = new THREE.PlaneGeometry(2 * HALF_W, 2 * HALF_D, nx, nz);
    g.rotateX(-PI / 2);
    const p = g.attributes.position, n = p.count;
    const colors = new Float32Array(n * 4), sea = new Float32Array(n), depthOf = new Float32Array(n), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const x = p.getX(i), z = p.getZ(i), depth = -heightAt(x, z);
      depthOf[i] = depth;
      const s = smooth(-0.6, 2.2, x - coastX(z));
      sea[i] = s;
      c.copy(WATER.shallow).lerp(WATER.mid, smooth(0.04, 0.3, depth)).lerp(WATER.deep, smooth(0.3, 0.72, depth));
      c.lerp(WATER.river, (1 - s) * 0.35);
      c.lerp(WATER.foam, (1 - smooth(0, 0.05, depth)) * 0.6);
      colors[i * 4] = c.r; colors[i * 4 + 1] = c.g; colors[i * 4 + 2] = c.b;
      colors[i * 4 + 3] = depth < -0.02 ? 0 : lerp(0.52, 0.9, smooth(0, 0.5, depth));
    }
    const index = g.index.array, keep = [];
    for (let t = 0; t < index.length; t += 3) {
      const a = index[t], b = index[t + 1], d = index[t + 2];
      if (Math.max(depthOf[a], depthOf[b], depthOf[d]) > -0.06) keep.push(a, b, d);
    }
    g.setIndex(keep);
    g.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    g.setAttribute('aSea', new THREE.BufferAttribute(sea, 1));
    const mat = new THREE.MeshPhongMaterial({
      vertexColors: true, flatShading: true, transparent: true, shininess: 70, specular: 0xffffff, depthWrite: false,
    });
    mat.onBeforeCompile = shader => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.vertexShader = 'uniform float uTime;\nattribute float aSea;\n' + shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float wv = sin(position.x * 1.9 + uTime * 1.4) * 0.5 + sin(position.z * 2.6 - uTime * 1.1) * 0.3
          + sin((position.x * 0.7 + position.z) * 4.3 + uTime * 2.3) * 0.2;
        transformed.y += wv * (0.012 + 0.05 * aSea);`);
    };
    mat.customProgramCacheKey = () => 'w3d-water';
    const m = new THREE.Mesh(g, mat);
    m.renderOrder = 2;
    m.receiveShadow = true;
    island.add(m);
  }

  /* ------------------------------------------------ Đường */
  const roadGrid = new Map();
  function roadInfo(x, z) {
    let best = Infinity, angle = 0;
    const ci = Math.floor(x), cj = Math.floor(z);
    for (let i = ci - 1; i <= ci + 1; i++) {
      for (let j = cj - 1; j <= cj + 1; j++) {
        const list = roadGrid.get(i * 1000 + j);
        if (!list) continue;
        for (let k = 0; k < list.length; k += 3) {
          const d = (list[k] - x) ** 2 + (list[k + 1] - z) ** 2;
          if (d < best) { best = d; angle = list[k + 2]; }
        }
      }
    }
    return { dist: Math.sqrt(best), angle };
  }
  const bridge = (() => {
    const rz = riverZ(BRIDGE_X), span = riverHalf(BRIDGE_X) + 0.25, ramp = 1.15;
    const deckY = z => Math.max(heightAt(BRIDGE_X, z) + 0.05, 0.6 - 0.5 * clamp((Math.abs(z - rz) - span) / ramp, 0, 1));
    return { rz, span, ramp, z0: rz - span - ramp, z1: rz + span + ramp, deckY };
  })();
  function buildRoads() {
    const pos = [], c = col('#ece6d9'), colors = [];
    for (const raw of ROADS) {
      const pts = raw.map(p => (p === 'bridge-north' ? [BRIDGE_X, bridge.z0 + 0.05] : p === 'bridge-south' ? [BRIDGE_X, bridge.z1 - 0.05] : p));
      const line = densify(pts, 0.15);
      let prevL = null, prevR = null;
      for (let i = 0; i < line.length; i++) {
        const [x, z] = line[i], [x0, z0] = line[Math.max(0, i - 1)], [x1, z1] = line[Math.min(line.length - 1, i + 1)];
        let dx = x1 - x0, dz = z1 - z0;
        const len = Math.hypot(dx, dz) || 1;
        dx /= len; dz /= len;
        const key = Math.floor(x) * 1000 + Math.floor(z);
        if (!roadGrid.has(key)) roadGrid.set(key, []);
        roadGrid.get(key).push(x, z, Math.atan2(-dz, dx));
        const ox = -dz * 0.11, oz = dx * 0.11;
        const y = Math.max(heightAt(x + ox, z + oz), heightAt(x - ox, z - oz), heightAt(x, z)) + 0.018;
        const L = [x + ox, y, z + oz], R = [x - ox, y, z - oz];
        if (prevL) {
          pos.push(...prevL, ...prevR, ...R, ...prevL, ...R, ...L);
          for (let k = 0; k < 6; k++) colors.push(c.r, c.g, c.b);
        }
        prevL = L; prevR = R;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide }));
    m.receiveShadow = true;
    island.add(m);
  }

  /* ------------------------------------------------ Cầu Cửa Việt (minh họa) */
  function buildBridge() {
    const parts = [], lamps = [];
    const steps = Math.ceil((bridge.z1 - bridge.z0) / 0.12);
    for (let i = 0; i < steps; i++) {
      const za = lerp(bridge.z0, bridge.z1, i / steps), zb = lerp(bridge.z0, bridge.z1, (i + 1) / steps);
      const ya = bridge.deckY(za), yb = bridge.deckY(zb), len = Math.hypot(zb - za, yb - ya), tilt = Math.atan2(yb - ya, zb - za);
      const mid = [(za + zb) / 2, (ya + yb) / 2];
      const deck = new THREE.BoxGeometry(0.38, 0.06, len + 0.01).rotateX(-tilt).translate(BRIDGE_X, mid[1] - 0.03, mid[0]);
      parts.push(paint(deck, '#eeeae1'));
      for (const side of [-0.18, 0.18]) {
        const rail = new THREE.BoxGeometry(0.025, 0.06, len + 0.01).rotateX(-tilt).translate(BRIDGE_X + side, mid[1] + 0.03, mid[0]);
        parts.push(paint(rail, '#5e9ea4'));
      }
    }
    for (let z = bridge.rz - bridge.span + 0.12; z < bridge.rz + bridge.span; z += 0.42) {
      const bottom = heightAt(BRIDGE_X, z) - 0.05, top = bridge.deckY(z) - 0.06;
      parts.push(paint(new THREE.CylinderGeometry(0.05, 0.06, top - bottom, 8).translate(BRIDGE_X, (top + bottom) / 2, z), '#cfc6b6'));
    }
    for (let z = bridge.rz - bridge.span; z <= bridge.rz + bridge.span + 0.01; z += 0.55) {
      for (const side of [-0.19, 0.19]) {
        const y = bridge.deckY(z);
        parts.push(paint(new THREE.CylinderGeometry(0.008, 0.01, 0.2, 5).translate(BRIDGE_X + side, y + 0.1, z), '#5b6c70'));
        lamps.push(new THREE.SphereGeometry(0.022, 8, 6).translate(BRIDGE_X + side, y + 0.21, z));
      }
    }
    const mesh = new THREE.Mesh(merge(parts), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    mesh.castShadow = true; mesh.receiveShadow = true;
    island.add(mesh);
    for (const g of lamps) island.add(new THREE.Mesh(g, lampMat));
  }

  /* ------------------------------------------------ Rừng phi lao ven biển */
  function treeGeometry() {
    const parts = [paint(new THREE.CylinderGeometry(0.014, 0.026, 0.46, 5).translate(0, 0.23, 0), '#7a5a44')];
    const tiers = [[0.15, 0.3, 0.36, '#4a7657'], [0.13, 0.3, 0.52, '#517d5c'], [0.1, 0.28, 0.68, '#5a8662'], [0.065, 0.24, 0.83, '#669167']];
    for (const [r, h, y, c] of tiers) parts.push(paint(new THREE.ConeGeometry(r, h, 7).translate(0, y, 0), c));
    return merge(parts);
  }
  function buildForest() {
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    mat.onBeforeCompile = shader => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float swayPhase = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.45;
          float swayAmt = max(position.y - 0.12, 0.0);
          transformed.x += sin(uTime * 1.5 + swayPhase) * 0.035 * swayAmt;
          transformed.z += cos(uTime * 1.2 + swayPhase) * 0.018 * swayAmt;
        #endif`);
    };
    mat.customProgramCacheKey = () => 'w3d-tree';
    const mesh = new THREE.InstancedMesh(treeGeometry(), mat, Q.trees);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(0, 0, 0, 'ZYX');
    const s = new THREE.Vector3(), p = new THREE.Vector3(), color = new THREE.Color();
    let count = 0, tries = 0;
    while (count < Q.trees && tries++ < Q.trees * 60) {
      const x = lerp(-HALF_W + 0.3, HALF_W - 0.3, rand()), z = lerp(-HALF_D + 0.3, HALF_D - 0.3, rand());
      const toCoast = coastX(z) - x, h = heightAt(x, z);
      if (h < 0.14) continue;
      if (Math.abs(z - riverZ(x)) < riverHalf(x) * 1.2 + 0.55) continue;
      const belt = toCoast > 1.25 && toCoast < 3.95;
      const grove = !belt && toCoast > 4 && vnoise(x * 0.55 + 20, z * 0.55 - 8) > 0.72 && rand() < 0.5;
      if (!belt && !grove) continue;
      if (x > 0.2 && x < 4.8 && z > -3.0 && z < 2.3) continue;   // khu cảng và cửa sông
      if (Math.hypot(x - MON.x, z - MON.z) < 0.85) continue;
      if (roadInfo(x, z).dist < 0.24) continue;
      const sc = 0.78 + rand() * 0.5;
      e.set((rand() - 0.5) * 0.08, rand() * PI * 2, 0.05 + rand() * 0.08, 'ZYX');   // nghiêng nhẹ theo gió biển
      q.setFromEuler(e);
      s.set(sc, sc * (0.9 + rand() * 0.35), sc);
      p.set(x, h - 0.02, z);
      mesh.setMatrixAt(count, m4.compose(p, q, s));
      const k = 0.86 + rand() * 0.22;
      mesh.setColorAt(count, color.setRGB(k, k * (0.97 + rand() * 0.06), k * (0.93 + rand() * 0.06)));
      count++;
    }
    mesh.count = count;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    island.add(mesh);
  }

  /* ------------------------------------------------ Làng hai bờ */
  function buildVillage() {
    const n = Q.houses;
    const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ flatShading: true }), n);
    const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(0.74, 1, 4).rotateY(PI / 4).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ flatShading: true }), n);
    const wallColors = ['#fbf7ee', '#f4ecda', '#f6e8c3', '#e2eef2', '#eef3e5'].map(col);
    const roofColors = ['#b9634a', '#c97d5c', '#a65b43', '#6f93a8', '#58858a', '#d39b5a', '#b9634a'].map(col);
    const zones = [
      [-3.7, 2.4, -7.9, -2.2, 0.42], [-3.7, 2.3, 2.0, 7.5, 0.36], [-5.8, -3.2, -8.7, -5.8, 0.08],
      [-5.8, -3.2, 5.8, 8.7, 0.07], [-10.5, -5.8, -3.7, -1.9, 0.07],
    ];
    const placed = new Map();
    const tooClose = (x, z) => {
      for (let i = Math.floor(x / 0.5) - 1; i <= Math.floor(x / 0.5) + 1; i++) {
        for (let j = Math.floor(z / 0.5) - 1; j <= Math.floor(z / 0.5) + 1; j++) {
          const list = placed.get(i * 1000 + j);
          if (list) for (let k = 0; k < list.length; k += 2) if ((list[k] - x) ** 2 + (list[k + 1] - z) ** 2 < 0.17) return true;
        }
      }
      return false;
    };
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), s = new THREE.Vector3(), p = new THREE.Vector3();
    let count = 0, tries = 0;
    while (count < n && tries++ < n * 80) {
      let r = rand(), zone = zones[0];
      for (const zz of zones) { if (r < zz[4]) { zone = zz; break; } r -= zz[4]; }
      const x = lerp(zone[0], zone[1], rand()), z = lerp(zone[2], zone[3], rand()), h = heightAt(x, z);
      if (h < 0.18 || coastX(z) - x < 4.05) continue;
      if (Math.abs(z - riverZ(x)) < riverHalf(x) * 1.2 + 0.5) continue;
      if (Math.hypot(x - MON.x, z - MON.z) < 1.0) continue;
      if (x > -1.7 && x < 4.8 && z > -2.7 && z < -0.6) continue;      // khu cảng
      const road = roadInfo(x, z);
      if (road.dist < 0.23 || (road.dist > 1.4 && rand() > 0.15)) continue;
      if (tooClose(x, z)) continue;
      const key = Math.floor(x / 0.5) * 1000 + Math.floor(z / 0.5);
      if (!placed.has(key)) placed.set(key, []);
      placed.get(key).push(x, z);
      const yaw = (road.dist < 1.4 ? road.angle : rand() * PI) + (rand() < 0.5 ? 0 : PI / 2) + (rand() - 0.5) * 0.15;
      const w = 0.24 + rand() * 0.12, d = 0.2 + rand() * 0.1, tall = rand() < 0.12;
      const hh = tall ? 0.32 + rand() * 0.08 : 0.15 + rand() * 0.1, rh = 0.12 + rand() * 0.06;
      q.setFromAxisAngle(up, yaw);
      walls.setMatrixAt(count, m4.compose(p.set(x, h - 0.03, z), q, s.set(w, hh, d)));
      roofs.setMatrixAt(count, m4.compose(p.set(x, h - 0.03 + hh, z), q, s.set(w, rh, d)));
      walls.setColorAt(count, wallColors[Math.floor(rand() * wallColors.length)]);
      roofs.setColorAt(count, roofColors[Math.floor(rand() * roofColors.length)]);
      count++;
    }
    walls.count = roofs.count = count;
    for (const m of [walls, roofs]) { m.castShadow = true; m.receiveShadow = true; island.add(m); }
  }

  /* ------------------------------------------------ Thuyền đánh cá */
  function boatGeometry(hullHex, stripeHex) {
    const L = 0.5, B = 0.15, deckY = 0.085, midY = 0.05, keelY = -0.035;
    const half = [[-L / 2, B * 0.42], [-L * 0.3, B * 0.5], [0, B * 0.5], [L * 0.22, B * 0.42], [L * 0.38, B * 0.24], [L / 2, 0]];
    const outline = [...half, ...half.slice(0, -1).reverse().map(([x, z]) => [x, -z])];
    const hull = [], stripe = [], deck = [], bottom = [];
    for (let i = 0; i < outline.length; i++) {
      const [x0, z0] = outline[i], [x1, z1] = outline[(i + 1) % outline.length];
      const d0 = [x0, deckY, z0], d1 = [x1, deckY, z1];
      const m0 = [x0 * 0.99, midY, z0 * 0.9], m1 = [x1 * 0.99, midY, z1 * 0.9];
      const k0 = [x0 * 0.9, keelY, z0 * 0.55], k1 = [x1 * 0.9, keelY, z1 * 0.55];
      stripe.push(...d0, ...d1, ...m1, ...d0, ...m1, ...m0);
      hull.push(...m0, ...m1, ...k1, ...m0, ...k1, ...k0);
      deck.push(0, deckY, 0, ...d1, ...d0);
      bottom.push(0, keelY, 0, ...k0, ...k1);
    }
    return merge([
      triangles(hull, hullHex), triangles(stripe, stripeHex), triangles(deck, '#c9a173'), triangles(bottom, '#24506e'),
      paint(new THREE.BoxGeometry(0.13, 0.09, 0.11).translate(-0.12, deckY + 0.045, 0), '#f7f4ec'),
      paint(new THREE.BoxGeometry(0.15, 0.016, 0.13).translate(-0.12, deckY + 0.098, 0), hullHex),
      paint(new THREE.CylinderGeometry(0.006, 0.006, 0.24, 5).translate(0.06, deckY + 0.12, 0), '#5a4636'),
      paint(new THREE.BoxGeometry(0.055, 0.034, 0.004).translate(0.088, deckY + 0.215, 0), '#d8342c'),
    ]);
  }
  const boatMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const boatGeos = [boatGeometry('#2f6ea5', '#c8453a'), boatGeometry('#2a7f86', '#e0b13f'), boatGeometry('#3c5f9e', '#f2efe6')];
  const moored = [];        // { mesh, index, x, z, yaw, phase }
  const sailing = [];       // { mesh, curve, speed, offset }

  function bankZNorth(x) {
    const rz = riverZ(x);
    for (let z = rz; z > rz - 4; z -= 0.02) if (heightAt(x, z) > 0.03) return z;
    return rz - riverHalf(x);
  }
  const port = {};
  function quayBox(xa, xb, depth, color, y = 0.07, height = 0.18) {
    const za = bankZNorth(xa) + 0.12, zb = bankZNorth(xb) + 0.12;
    const len = Math.hypot(xb - xa, zb - za), yaw = Math.atan2(-(zb - za), xb - xa);
    const g = new THREE.BoxGeometry(len, height, depth).rotateY(yaw).translate((xa + xb) / 2, y, (za + zb) / 2);
    return { geo: paint(g, color), xa, xb, za, zb, yaw, len };
  }
  function buildPort() {
    const parts = [];
    // Cảng cá: kè dọc bờ Bắc gần cửa sông, thuyền neo thành hàng
    const fish = quayBox(1.55, 4.25, 0.34, '#d9d4c8');
    parts.push(fish.geo);
    port.x = (fish.xa + fish.xb) / 2; port.z = (fish.za + fish.zb) / 2; port.yaw = fish.yaw;
    const meshes = boatGeos.map(g => new THREE.InstancedMesh(g, boatMat, 8));
    meshes.forEach(m => { m.count = 0; m.receiveShadow = true; island.add(m); });
    for (let i = 0; i < 12; i++) {
      const t = 0.06 + (i / 11) * 0.88;
      const qx = lerp(fish.xa, fish.xb, t), qz = lerp(fish.za, fish.zb, t);
      const x = qx + Math.sin(fish.yaw) * 0.43, z = qz + Math.cos(fish.yaw) * 0.43;   // phía lòng sông
      const mesh = meshes[i % 3];
      moored.push({ mesh, index: mesh.count++, x, z, yaw: fish.yaw - PI / 2 + (rand() - 0.5) * 0.12, phase: rand() * 6 });
    }
    // Chợ cá: mái xanh rộng cạnh kè
    const hx = 3.1, hz = bankZNorth(3.1) - 0.55, hy = heightAt(hx, hz);
    parts.push(paint(new THREE.BoxGeometry(0.95, 0.12, 0.42).rotateY(fish.yaw).translate(hx, hy + 0.06, hz), '#f2eee4'));
    parts.push(paint(new THREE.ConeGeometry(0.74, 1, 4).rotateY(PI / 4).scale(1.08, 0.2, 0.52).rotateY(fish.yaw).translate(hx, hy + 0.22, hz), '#5f93ad'));
    // Cảng hàng: kè, cần cẩu, công-te-nơ và tàu hàng
    const cargo = quayBox(-1.4, 0.6, 0.4, '#cfd2cf');
    parts.push(cargo.geo);
    for (const cx of [-0.95, -0.15]) {
      const cz = bankZNorth(cx) - 0.12, base = heightAt(cx, cz);
      parts.push(paint(new THREE.BoxGeometry(0.09, 0.82, 0.09).translate(cx, base + 0.41, cz), '#e2b244'));
      parts.push(paint(new THREE.BoxGeometry(0.06, 0.05, 0.8).translate(cx, base + 0.8, cz + 0.3), '#e2b244'));
      parts.push(paint(new THREE.BoxGeometry(0.14, 0.1, 0.12).translate(cx, base + 0.72, cz - 0.08), '#f3efe5'));
    }
    const boxColors = ['#b8634a', '#3f7fa6', '#5f8f6f', '#d8a64a', '#7a6aa0', '#3f7fa6'];
    for (let i = 0; i < 6; i++) {
      const cx = -1.25 + (i % 3) * 0.34, cz = bankZNorth(cx) - 0.5 - Math.floor(i / 3) * 0.17, base = heightAt(cx, cz);
      for (let k = 0; k < 1 + (i % 2); k++) parts.push(paint(new THREE.BoxGeometry(0.3, 0.13, 0.14).translate(cx, base + 0.065 + k * 0.13, cz), boxColors[(i + k) % boxColors.length]));
    }
    const sx = -0.4, sz = bankZNorth(-0.4) + 0.5;
    const ship = [
      paint(new THREE.BoxGeometry(1.5, 0.2, 0.34).translate(0, 0.02, 0), '#4f7f8f'),
      paint(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 3).rotateY(-PI / 6).scale(1.4, 1, 1).translate(0.87, 0.02, 0), '#4f7f8f'),   // mũi tàu
      paint(new THREE.BoxGeometry(1.5, 0.04, 0.35).translate(0, 0.13, 0), '#c8453a'),
      paint(new THREE.BoxGeometry(0.3, 0.26, 0.28).translate(-0.55, 0.28, 0), '#f5f2ea'),
      paint(new THREE.BoxGeometry(0.2, 0.08, 0.3).translate(-0.55, 0.45, 0), '#f5f2ea'),
      paint(new THREE.BoxGeometry(0.6, 0.12, 0.26).translate(0.15, 0.21, 0), '#d8a64a'),
    ];
    const shipGeo = merge(ship);
    shipGeo.rotateY(cargo.yaw);
    shipGeo.translate(sx, 0, sz);
    const shipMesh = new THREE.Mesh(shipGeo, boatMat);
    shipMesh.castShadow = true;
    island.add(shipMesh);
    const mesh = new THREE.Mesh(merge(parts), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    mesh.castShadow = true; mesh.receiveShadow = true;
    island.add(mesh);
  }
  function buildSailing() {
    const paths = [
      { pts: [[0.8, -0.8], [2.6, -0.8], [4.0, 0.25], [5.2, 1.05], [7.0, 1.4], [9.5, 0.2], [10.2, 2.8], [8.0, 3.6], [6.0, 2.2], [5.0, 1.0], [3.6, 0.9], [2.0, 0.95], [0.8, 0.6]], speed: 1 / 75 },
      { pts: [[7.5, -4.5], [11.0, -5.5], [11.5, -1.0], [8.5, -1.6]], speed: 1 / 95 },
      { pts: [[8.0, 4.8], [11.5, 6.5], [12.0, 3.0], [9.0, 2.8]], speed: 1 / 85 },
    ];
    const wakeGeo = new THREE.BufferGeometry();
    wakeGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.24, 0.005, 0, -0.75, 0.005, 0.16, -0.75, 0.005, -0.16], 3));
    const wakeMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide });
    paths.forEach((path, i) => {
      const curve = new THREE.CatmullRomCurve3(path.pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
      const mesh = new THREE.Mesh(boatGeos[i % 3], boatMat);
      mesh.add(new THREE.Mesh(wakeGeo, wakeMat));
      island.add(mesh);
      sailing.push({ mesh, curve, speed: path.speed, offset: i * 0.37 });
    });
  }

  /* ------------------------------------------------ Thúng chai trên bãi biển */
  function buildBaskets() {
    const count = Q.mobile ? 10 : 16;
    const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 9, 4, 0, PI * 2, PI / 2, PI / 2).scale(1, 0.6, 1),
      new THREE.MeshLambertMaterial({ color: '#3c5966', flatShading: true, side: THREE.DoubleSide }), count);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
    let placed = 0, tries = 0;
    while (placed < count && tries++ < 3000) {
      const z = rand() < 0.6 ? lerp(-8.2, -3.4, rand()) : lerp(3.0, 7.6, rand());
      const x = coastX(z) - lerp(0.15, 0.85, rand()), h = heightAt(x, z);
      if (h < 0.04 || h > 0.2) continue;
      const flip = rand() < 0.4;
      e.set(flip ? PI : 0, rand() * PI, 0);
      mesh.setMatrixAt(placed++, m4.compose(p.set(x, h + (flip ? 0.045 : 0.04), z), q.setFromEuler(e), s));
    }
    mesh.count = placed;
    mesh.castShadow = true;
    island.add(mesh);
  }

  /* ------------------------------------------------ Đài tưởng niệm (minh họa) */
  function buildMonument() {
    const h = heightAt(MON.x, MON.z);
    const g = merge([
      paint(new THREE.CylinderGeometry(0.62, 0.66, 0.08, 22).translate(0, h + 0.0, 0), '#ebe4d4'),
      paint(new THREE.BoxGeometry(0.56, 0.08, 0.56).translate(0, h + 0.08, 0), '#e0d8c7'),
      paint(new THREE.BoxGeometry(0.4, 0.08, 0.4).translate(0, h + 0.16, 0), '#e9e2d3'),
      paint(new THREE.CylinderGeometry(0.045, 0.1, 1.15, 4).rotateY(PI / 4).translate(0, h + 0.775, 0), '#f8f6f0'),
      paint(new THREE.BoxGeometry(0.42, 0.2, 0.06).rotateY(0.25).translate(-0.42, h + 0.12, 0.14), '#d6ccb9'),
      paint(new THREE.BoxGeometry(0.42, 0.2, 0.06).rotateY(-0.25).translate(0.42, h + 0.12, 0.14), '#d6ccb9'),
    ]);
    g.translate(MON.x, 0, MON.z);
    const mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    mesh.castShadow = true; mesh.receiveShadow = true;
    island.add(mesh);
    const star = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.036 : 0.088, a = PI / 2 + (i * PI) / 5;
      if (i) star.lineTo(Math.cos(a) * r, Math.sin(a) * r); else star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const starGeo = new THREE.ExtrudeGeometry(star, { depth: 0.02, bevelEnabled: false }).translate(MON.x, h + 1.44, MON.z - 0.01);
    island.add(new THREE.Mesh(starGeo, new THREE.MeshPhongMaterial({ color: '#e3b04b', emissive: '#e3a43a', emissiveIntensity: 0.35, shininess: 90 })));
  }

  /* ------------------------------------------------ Mây và hải âu */
  const clouds = [];
  const cloudMat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.42, flatShading: true, transparent: true, opacity: 0.92, depthWrite: false });
  function buildClouds() {
    const mat = cloudMat;
    for (let i = 0; i < Q.clouds; i++) {
      const puffs = 4 + Math.floor(rand() * 3), list = [];
      for (let k = 0; k < puffs; k++) {
        const r = 0.45 + rand() * 0.5;
        list.push(paint(new THREE.IcosahedronGeometry(r, 0).scale(1, 0.7, 1).translate((k - puffs / 2) * 0.55 + rand() * 0.2, rand() * 0.25, (rand() - 0.5) * 0.5), '#ffffff'));
      }
      const mesh = new THREE.Mesh(merge(list), mat);
      const ang = (i / Q.clouds) * PI * 2 + rand() * 0.5, rad = 16 + rand() * 5, y = 2.8 + rand() * 2.4;
      mesh.userData = { ang, rad, y, speed: 0.006 + rand() * 0.006 };
      clouds.push(mesh);
      scene.add(mesh);
    }
  }
  const birds = [];
  function buildBirds() {
    const wing = new THREE.BufferGeometry();
    wing.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.035, 0, 0, -0.035, 0.2, 0.02, -0.03], 3));
    wing.computeVertexNormals();
    const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide });
    const dark = new THREE.MeshBasicMaterial({ color: '#5d7480', side: THREE.DoubleSide });
    const count = Q.mobile ? 4 : 7;
    for (let i = 0; i < count; i++) {
      const bird = new THREE.Group(), left = new THREE.Mesh(wing, i % 3 ? mat : dark), right = new THREE.Mesh(wing, i % 3 ? mat : dark);
      right.scale.x = -1;
      bird.add(left, right);
      bird.userData = { left, right, cx: 3.5 + (rand() - 0.5) * 3, cz: (rand() - 0.5) * 4, r: 2 + rand() * 2.8, y: 1.9 + rand() * 1.4, speed: (0.18 + rand() * 0.12) * (rand() < 0.5 ? 1 : -1), phase: rand() * 6 };
      birds.push(bird);
      island.add(bird);
    }
  }

  /* ------------------------------------------------ Cột mốc 5 Chạm */
  const markers = [];
  const glowTex = canvasTexture(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.35, 'rgba(255,255,255,0.4)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  function readPoints() {
    const fallback = { 1: ['Cửa Việt – cửa biển của ký ức', '#a65b43'], 2: ['Dấu ấn lịch sử Cửa Việt', '#a65b43'], 3: ['Người kể chuyện Cửa Việt', '#55754c'], 4: ['Nhịp sống làng biển', '#55754c'], 5: ['Cửa Việt trong mắt người trẻ', '#287e87'] };
    const out = {};
    for (const id of [1, 2, 3, 4, 5]) {
      const pin = document.querySelector(`#map-pins .map-pin[data-id="${id}"]`);
      const title = pin?.querySelector('.stop-copy strong')?.textContent.trim() || fallback[id][0];
      const color = pin?.style.getPropertyValue('--pin-color').trim() || fallback[id][1];
      out[id] = { title, color };
    }
    return out;
  }
  const shortTitle = t => {
    const s = t.replace(/^Cửa Việt\s*[–-]\s*/u, '').replace(/\s+Cửa Việt$/u, '').replace(/^Cửa Việt\s+(?=trong\b)/u, '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  function buildMarkers() {
    const info = readPoints();
    const spots = {
      1: [SPIT.x + 0.05, SPIT.z + 0.62],                // mũi doi cát nơi sông gặp biển
      2: [MON.x + 0.62, MON.z + 0.25],                  // cạnh đài tưởng niệm
      3: [BRIDGE_X, bridge.rz],                         // giữa cầu, nối đôi bờ
      4: [port.x - 0.55, port.z - 0.05],                 // kè cảng cá
      5: [coastX(-6.2) - 0.8, -6.2],                    // bãi biển, rừng phi lao
    };
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, HEAD_Y - 0.08, 6).translate(0, (HEAD_Y - 0.08) / 2, 0);
    const poleMat = new THREE.MeshLambertMaterial({ color: '#ffffff' });
    const headGeo = new THREE.SphereGeometry(0.17, 24, 16);
    const ringGeo = new THREE.TorusGeometry(0.23, 0.02, 8, 40).rotateX(PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const pulseGeo = new THREE.RingGeometry(0.12, 0.2, 36).rotateX(-PI / 2);
    const hitGeo = new THREE.SphereGeometry(0.42, 8, 6);
    for (const id of [1, 2, 3, 4, 5]) {
      const [x, z] = spots[id];
      const y = id === 3 ? bridge.deckY(z) : Math.max(heightAt(x, z), id === 4 ? 0.17 : 0.05);
      const color = new THREE.Color(info[id].color);
      const group = new THREE.Group();
      group.position.set(x, y, z);
      const headMat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.18, shininess: 90 });
      const head = new THREE.Mesh(headGeo, headMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      const pulse = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false }));
      pulse.position.y = 0.03;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, depthWrite: false, opacity: 0.55 }));
      const hit = new THREE.Mesh(hitGeo, poleMat);
      hit.visible = false;
      hit.position.y = HEAD_Y - 0.1;
      group.add(new THREE.Mesh(poleGeo, poleMat), head, ring, pulse, glow, hit);
      island.add(group);
      const m = {
        id, x, y, z, group, head, ring, pulse, glow, hit, headMat, color, baseColor: color.clone(),
        title: info[id].title, short: shortTitle(info[id].title), scale: 1, hover: false, active: false, stamped: false, filtered: false,
        sx: 0, sy: 0, onScreen: false,
      };
      hit.userData.marker = m;
      markers.push(m);
    }
  }

  /* ------------------------------------------------ Dựng lần lượt, nhường máy giữa các bước */
  const builders = [buildPlinth, buildTerrain, buildSkirt, buildWater, buildRoads, buildBridge, buildForest,
    buildVillage, buildPort, buildSailing, buildBaskets, buildMonument, buildClouds, buildBirds, buildMarkers];
  try {
    if (document.fonts?.load) await document.fonts.load('600 30px "Be Vietnam Pro"').catch(() => {});
    for (const build of builders) { build(); await idle(); }
  } catch (error) {
    renderer.dispose();
    host.remove();
    throw error;
  }

  /* ================================================================ Giao diện: nhãn cột mốc, điều khiển */
  // "Sân khấu" trống ở phần kết (chỉ hiện khi bật 3D): sa bàn hoàng hôn nằm ở đây, không đè lên chữ
  const closingBox = document.querySelector('.closing .container') || document.querySelector('.closing');
  if (closingBox && !closingBox.querySelector('.w3d-stage')) {
    const stage = document.createElement('div');
    stage.className = 'w3d-stage';
    stage.setAttribute('aria-hidden', 'true');
    closingBox.prepend(stage);
  }
  const mapSection = document.getElementById('memory-map');
  const mapCard = document.querySelector('.map-canvas');
  const ui = document.createElement('div');
  ui.className = 'world3d-ui';
  ui.id = 'world3d-ui';
  for (const m of markers) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'world-chip';
    b.dataset.action = 'open-point';
    b.dataset.id = String(m.id);
    b.style.setProperty('--pin-color', `#${m.baseColor.getHexString()}`);
    b.setAttribute('aria-label', `Mở Chạm ${two(m.id)}: ${m.title}`);
    b.innerHTML = `<b aria-hidden="true">${two(m.id)}</b><span></span>`;
    b.querySelector('span').textContent = m.short;
    b.addEventListener('pointerenter', () => { m.hover = true; wake(); });
    b.addEventListener('pointerleave', () => { m.hover = false; wake(); });
    b.addEventListener('focus', () => { m.hover = true; wake(); });
    b.addEventListener('blur', () => { m.hover = false; wake(); });
    m.chip = b;
    ui.append(b);
  }
  (mapSection || document.body).append(ui);

  const touchLike = matchMedia('(pointer: coarse)').matches;
  let tools = null, hint = null;
  if (mapCard) {
    tools = document.createElement('div');
    tools.className = 'world-map-tools';
    tools.setAttribute('role', 'group');
    tools.setAttribute('aria-label', 'Điều khiển sa bàn 3D');
    const arrow = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    tools.innerHTML = `
      <button type="button" data-w3d="left" aria-label="Xoay sa bàn sang trái">${arrow('M4 12a8 8 0 1 0 2.3-5.6M4 4v4.5h4.5')}</button>
      <button type="button" data-w3d="right" aria-label="Xoay sa bàn sang phải">${arrow('M20 12a8 8 0 1 1-2.3-5.6M20 4v4.5h-4.5')}</button>
      <button type="button" data-w3d="reset" aria-label="Về góc nhìn ban đầu">${arrow('M4 11.5 12 5l8 6.5M6.5 10v9h11v-9')}</button>
      <button type="button" data-w3d="off" class="world-map-2d">Bản đồ 2D</button>`;
    hint = document.createElement('p');
    hint.className = 'world-map-hint';
    hint.textContent = touchLike ? 'Vuốt ngang để xoay sa bàn · chạm cột mốc để mở' : 'Kéo để xoay sa bàn · bấm cột mốc để mở Chạm';
    mapCard.append(tools, hint);
    tools.addEventListener('click', e => {
      const b = e.target.closest('[data-w3d]');
      if (!b) return;
      const act = b.dataset.w3d;
      if (act === 'left') view.userAz -= PI / 4;
      else if (act === 'right') view.userAz += PI / 4;
      else if (act === 'reset') { view.userAz = 0; view.userEl = 0; }
      else if (act === 'off') { opts.requestOff?.(); return; }
      markUsed();
      wake();
    });
  }
  function markUsed() { hint?.classList.add('is-used'); }

  /* ================================================================ Camera và cảnh quay */
  const view = { w: 1, h: 1, userAz: 0, userEl: 0, px: 0, py: 0 };
  const cur = {}, goal = {}, shotA = {}, shotB = {}, flyShot = {};
  let firstFrame = true, layoutDirty = true, activeShots = [], mapWeight = 0, showWeight = 0;
  const fly = { id: 0, weight: 0, goal: 0 };
  const fitCache = new Map(), fitCam = new THREE.PerspectiveCamera(FOV, 1, 0.1, 400), tmp = new THREE.Vector3();

  function resize(force) {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    if (!force && Math.abs(w - view.w) < 1 && Math.abs(h - view.h) < 120) return;
    view.w = w; view.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fitCam.aspect = w / h;
    fitCam.updateProjectionMatrix();
    fitCache.clear();
    layoutDirty = true;
    measureChips();
  }
  function layoutShots() {
    layoutDirty = false;
    const vh = innerHeight, sy = scrollY;
    activeShots = [];
    for (const s of SHOTS) {
      const el = document.querySelector(s.sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (!r.height) continue;
      const center = r.top + sy + r.height / 2 - vh / 2, hold = Math.max(0, (r.height - vh) / 2) * 0.9;
      activeShots.push({ ...s, a: center - hold, b: center + hold });
    }
    activeShots.sort((p, q) => p.a - q.a);
  }
  function hfov() { return 2 * Math.atan(Math.tan((FOV / 2) * PI / 180) * view.w / view.h); }
  function fitDistance(az, el, t, boxW, boxH) {
    const key = `${az.toFixed(2)}|${el.toFixed(2)}|${Math.round(boxW / 4)}|${Math.round(boxH / 4)}|${t.join(',')}`;
    const hit = fitCache.get(key);
    if (hit) return hit;
    let R = 40;
    for (let k = 0; k < 4; k++) {
      const ce = Math.cos(el);
      fitCam.position.set(t[0] + R * Math.sin(az) * ce, t[1] + R * Math.sin(el), t[2] + R * Math.cos(az) * ce);
      fitCam.lookAt(t[0], t[1], t[2]);
      fitCam.updateMatrixWorld();
      let mx = 0, my = 0;
      for (const x of [ISLAND_BOX[0], ISLAND_BOX[1]]) for (const y of [ISLAND_BOX[2], ISLAND_BOX[3]]) for (const z of [ISLAND_BOX[4], ISLAND_BOX[5]]) {
        tmp.set(x, y, z).project(fitCam);
        mx = Math.max(mx, Math.abs(tmp.x) * view.w / 2);
        my = Math.max(my, Math.abs(tmp.y) * view.h / 2);
      }
      R *= Math.max(mx / (boxW / 2), my / (boxH / 2));
    }
    if (fitCache.size > 300) fitCache.clear();
    fitCache.set(key, R);
    return R;
  }
  let mapRect = null;
  function evalShot(s, out) {
    const vw = view.w, vh = innerHeight, narrow = vw < 760;
    out.tod = s.tod;
    out.veil = narrow && s.veil > 0 ? Math.min(0.6, s.veil + 0.08) : s.veil;
    out.markers = s.markers || 0;
    out.show = s.show || 0;
    let az = s.az, el = s.el;
    const stageRect = s.stage ? document.querySelector(s.stage)?.getBoundingClientRect() : null;
    if (stageRect && stageRect.height > 10) {
      out.ax = stageRect.left + stageRect.width / 2;
      out.ay = stageRect.top + stageRect.height / 2;
      out.dist = fitDistance(az, el, s.target, stageRect.width * s.fit, stageRect.height * s.fit);
    } else if ((s.map || s.inMap) && mapRect) {
      const portrait = mapRect.width / mapRect.height < 0.95;
      az = s.az + (portrait ? -PI / 2 : 0) + (s.map ? view.userAz : 0);
      el = clamp(s.el + (s.map ? view.userEl : 0), 0.5, 1.35);
      out.ax = mapRect.left + mapRect.width / 2;
      out.ay = mapRect.top + mapRect.height / 2;
      out.dist = fitDistance(az, el, s.target, mapRect.width * s.fit, mapRect.height * s.fit);
    } else if (s.fit) {
      const a = narrow ? (s.mAnchor || [0.5, s.anchor[1]]) : s.anchor, f = narrow ? (s.mFit || s.fit) : s.fit;
      out.ax = a[0] * vw; out.ay = a[1] * vh;
      out.dist = fitDistance(az, el, s.target, vw * f, vh * f * (narrow ? 0.7 : 1.15));
    } else {
      const a = narrow ? [0.5, s.anchor[1]] : s.anchor;
      out.ax = a[0] * vw; out.ay = a[1] * vh;
      out.dist = (narrow ? s.mSpan || s.span : s.span) / (2 * Math.tan(hfov() / 2));
    }
    out.az = az; out.el = el;
    [out.tx, out.ty, out.tz] = s.target;
  }
  function mix(a, b, t, out) {
    for (const k of CAM_KEYS) out[k] = k === 'az' ? a.az + wrapAngle(b.az - a.az) * t : lerp(a[k], b[k], t);
  }
  function computeGoal() {
    if (layoutDirty) layoutShots();
    if (!activeShots.length) return;
    mapRect = mapCard ? mapCard.getBoundingClientRect() : null;
    const y = scrollY;
    let A = activeShots[0], B = A, t = 0;
    if (y > A.b) {
      A = B = activeShots[activeShots.length - 1];
      for (let i = 0; i < activeShots.length - 1; i++) {
        const s = activeShots[i], next = activeShots[i + 1];
        if (y <= s.b) { A = B = s; break; }                                     // đang ở phần s
        if (y < next.a) { A = s; B = next; t = smooth(0, 1, (y - s.b) / (next.a - s.b)); break; }  // đang chuyển cảnh
      }
    }
    evalShot(A, shotA);
    if (B !== A) { evalShot(B, shotB); mix(shotA, shotB, t, goal); } else Object.assign(goal, shotA);
    mapWeight = (A.map ? 1 - t : 0) + (B !== A && B.map ? t : 0);
    showWeight = goal.show;
    if (!Q.mobile && !reduceMotion.matches) {
      goal.az += view.px * 0.05;
      goal.el += view.py * 0.03;
    }
    if (fly.weight > 0.001) {
      const m = markers.find(mm => mm.id === fly.id);
      if (m) {
        Object.assign(flyShot, goal);
        flyShot.tx = m.x; flyShot.ty = m.y + 0.6; flyShot.tz = m.z;
        flyShot.el = 0.6; flyShot.dist = 5.5 / (2 * Math.tan(hfov() / 2));
        flyShot.ax = view.w / 2; flyShot.ay = innerHeight * 0.42; flyShot.veil = 0; flyShot.markers = 1;
        mix(goal, flyShot, smooth(0, 1, fly.weight), goal);
      }
    }
  }
  function approach(dt) {
    fly.weight += (fly.goal - fly.weight) * (1 - Math.exp(-dt * 3));
    if (firstFrame) { Object.assign(cur, goal); firstFrame = false; return true; }
    const k = 1 - Math.exp(-dt * (reduceMotion.matches ? 30 : 6));
    let moving = Math.abs(fly.goal - fly.weight) > 0.002;
    for (const key of CAM_KEYS) {
      const d = key === 'az' ? wrapAngle(goal.az - cur.az) : goal[key] - cur[key];
      if (Math.abs(d) > CAM_EPS[key]) moving = true;
      cur[key] += d * k;
    }
    return moving;
  }
  function applyCamera() {
    const ce = Math.cos(cur.el);
    camera.position.set(cur.tx + cur.dist * Math.sin(cur.az) * ce, cur.ty + cur.dist * Math.sin(cur.el), cur.tz + cur.dist * Math.cos(cur.az) * ce);
    camera.lookAt(cur.tx, cur.ty, cur.tz);
    camera.setViewOffset(view.w, view.h, view.w / 2 - cur.ax, view.h / 2 - cur.ay, view.w, view.h);
    camera.updateMatrixWorld();
  }

  /* ---------------- Giờ trong ngày */
  const SUN_DAY = col('#fff4e3'), SUN_DUSK = col('#ffb27c'), SKY_DAY = col('#e4f4ff'), SKY_DUSK = col('#ffd7c4');
  const GROUND_DAY = col('#eadfc4'), GROUND_DUSK = col('#d4b08f');
  let lastTod = -1, shadowDirty = true, lastShadow = 0, lastVeil = -1, lastDusk = -1;
  function applyTimeOfDay(tod) {
    if (Math.abs(tod - lastTod) < 0.002) return;
    lastTod = tod;
    const dusk = smooth(0.55, 1, tod);
    sun.color.copy(SUN_DAY).lerp(SUN_DUSK, dusk);
    sun.intensity = lerp(2.7, 2.45, dusk);
    hemi.color.copy(SKY_DAY).lerp(SKY_DUSK, dusk);
    hemi.groundColor.copy(GROUND_DAY).lerp(GROUND_DUSK, dusk);
    hemi.intensity = lerp(1.45, 1.42, dusk);
    const theta = lerp(0.3 * PI, 0.9 * PI, tod);
    sun.position.set(Math.cos(theta) * 30, Math.max(0.25, Math.sin(theta)) * 24 + 3, 14);
    lampMat.emissiveIntensity = smooth(0.7, 1, tod) * 1.6;
    shadowDirty = true;
    const d = Math.round(dusk * 0.85 * 1000) / 1000;
    if (d !== lastDusk) { lastDusk = d; host.style.setProperty('--w3d-dusk', String(d)); }
  }

  /* ---------------- Chuyển động */
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), v4 = new THREE.Vector3(), s4 = new THREE.Vector3(1, 1, 1);
  const tangent = new THREE.Vector3();
  function animate(t) {
    const mw = cur.markers ?? 1;
    for (const m of markers) {
      m.group.visible = mw > 0.02;
      m.group.scale.setScalar(Math.max(0.001, smooth(0, 1, mw)));
      const bob = Math.sin(t * 1.8 + m.id) * 0.04;
      m.head.position.y = m.ring.position.y = m.glow.position.y = HEAD_Y + bob;
      const k = (t * 0.55 + m.id * 0.21) % 1;
      m.pulse.scale.setScalar(1 + k * 2.4);
      m.pulse.material.opacity = (1 - k) * (m.filtered ? 0.1 : 0.5);
      const target = m.hover ? 1.32 : m.active ? 1.15 : 1;
      m.scale += (target - m.scale) * 0.25;
      m.head.scale.setScalar(m.scale);
      m.ring.scale.setScalar(m.scale);
      m.glow.scale.setScalar(1.15 * m.scale);
      m.glow.material.opacity = m.filtered ? 0.15 : m.hover ? 0.85 : 0.55;
      m.headMat.opacity = m.filtered ? 0.45 : 1;
    }
    const touched = new Set();
    for (const b of moored) {
      const roll = Math.sin(t * 1.3 + b.phase) * 0.06, y = Math.sin(t * 1.1 + b.phase) * 0.012;
      e4.set(roll, b.yaw, 0, 'YXZ');
      b.mesh.setMatrixAt(b.index, m4.compose(v4.set(b.x, y, b.z), q4.setFromEuler(e4), s4));
      touched.add(b.mesh);
    }
    for (const mesh of touched) mesh.instanceMatrix.needsUpdate = true;
    for (const s of sailing) {
      const u = (t * s.speed + s.offset) % 1;
      s.curve.getPointAt(u, v4);
      s.curve.getTangentAt(u, tangent);
      s.mesh.position.set(v4.x, Math.sin(t * 1.6 + s.offset * 9) * 0.012, v4.z);
      s.mesh.rotation.set(Math.sin(t * 1.2 + s.offset) * 0.05, Math.atan2(-tangent.z, tangent.x), 0, 'YXZ');
    }
    for (const b of birds) {
      const d = b.userData, a = t * d.speed + d.phase;
      b.position.set(d.cx + Math.cos(a) * d.r, d.y + Math.sin(t * 0.7 + d.phase) * 0.15, d.cz + Math.sin(a) * d.r);
      b.rotation.y = -a + (d.speed > 0 ? PI : 0);
      const flap = Math.sin(t * 9 + d.phase * 3) * 0.55;
      d.left.rotation.z = flap; d.right.rotation.z = -flap;
    }
    for (const c of clouds) {
      const d = c.userData, a = d.ang + t * d.speed;
      c.position.set(Math.cos(a) * d.rad, d.y, Math.sin(a) * d.rad * 0.75);
      c.rotation.y = -a;
    }
  }
  function hideCloudsNearView() {
    // Mây đi ngang giữa camera và sa bàn thì ẩn đi cho khỏi che
    const tx = cur.tx, ty = cur.ty, tz = cur.tz, cp = camera.position;
    const dx = tx - cp.x, dy = ty - cp.y, dz = tz - cp.z, len2 = dx * dx + dy * dy + dz * dz;
    for (const c of clouds) {
      const px = c.position.x - cp.x, py = c.position.y - cp.y, pz = c.position.z - cp.z;
      const t = clamp((px * dx + py * dy + pz * dz) / len2, 0, 1);
      const ex = px - dx * t, ey = py - dy * t, ez = pz - dz * t;
      c.visible = cloudMat.opacity > 0.02 && ex * ex + ey * ey + ez * ez > 9;
    }
  }

  /* ---------------- Nhãn cột mốc (nút HTML) bám theo vị trí 3D */
  function measureChips() {
    for (const m of markers) { m.cw = m.chip.offsetWidth || 120; m.ch = m.chip.offsetHeight || 32; }
  }
  function updateChips() {
    const show = state.enabled && mapWeight > 0.6 && fly.weight < 0.3 && mapRect &&
      mapRect.bottom > 60 && mapRect.top < innerHeight - 60;
    const placed = [];
    for (const m of markers) {
      tmp.set(m.x, m.y + m.head.position.y + 0.24, m.z).project(camera);
      m.sx = (tmp.x + 1) / 2 * view.w;
      m.sy = (1 - tmp.y) / 2 * view.h;
      m.onScreen = tmp.z < 1 && (!mapRect || (m.sx > mapRect.left - 20 && m.sx < mapRect.right + 20 && m.sy > mapRect.top - 10 && m.sy < mapRect.bottom + 10));
    }
    // Nhãn ở thấp xếp trước; nhãn nào đè lên nhãn đã xếp thì đẩy lên trên
    const order = [...markers].sort((a, b) => b.sy - a.sy);
    for (const m of order) {
      let y = m.sy;
      for (const p of placed) {
        if (Math.abs(p.x - m.sx) < (p.w + m.cw) / 2 + 6 && Math.abs(p.y - y) < m.ch + 4) y = p.y - m.ch - 4;
      }
      placed.push({ x: m.sx, y, w: m.cw });
      const visible = show && m.onScreen;
      if (m.chipShown !== visible) { m.chipShown = visible; m.chip.classList.toggle('is-shown', visible); }
      if (visible) {
        const tx = Math.round(m.sx * 10) / 10, ty = Math.round(y * 10) / 10;
        if (tx !== m.lastX || ty !== m.lastY) { m.lastX = tx; m.lastY = ty; m.chip.style.transform = `translate3d(${tx}px, ${ty}px, 0)`; }
      }
    }
  }
  function syncPins() {
    for (const m of markers) {
      const pin = document.querySelector(`#map-pins .map-pin[data-id="${m.id}"]`);
      m.active = !!pin?.classList.contains('active');
      m.filtered = !!pin?.classList.contains('filtered');
      m.stamped = !!pin?.classList.contains('stamped');
      m.headMat.color.copy(m.stamped ? col('#e3b04b') : m.baseColor);
      m.headMat.emissive.copy(m.headMat.color);
      if (m.headMat.transparent !== m.filtered) { m.headMat.transparent = m.filtered; m.headMat.needsUpdate = true; }
      m.chip.classList.toggle('is-active', m.active);
      m.chip.classList.toggle('is-filtered', m.filtered);
      m.chip.classList.toggle('is-stamped', m.stamped);
    }
    const open = document.querySelector('#experience-dialog[open]');
    const active = markers.find(m => m.active);
    fly.goal = open && active && !reduceMotion.matches ? 1 : 0;
    if (open && active) fly.id = active.id;
    modalOpen = !!document.querySelector('dialog[open]');
    wake();
  }

  /* ---------------- Tương tác trong khung bản đồ: kéo xoay, rê và bấm cột mốc */
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hitTargets = markers.map(m => m.hit);
  function pick(x, y) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(hitTargets, false)[0];
    return hit ? hit.object.userData.marker : null;
  }
  let drag = null, hovered = null;
  function setHover(m) {
    if (hovered === m) return;
    if (hovered) hovered.hover = false;
    hovered = m;
    if (m) m.hover = true;
    if (mapCard) mapCard.style.cursor = m ? 'pointer' : '';
    wake();
  }
  if (mapCard) {
    mapCard.addEventListener('pointerdown', e => {
      if (!state.enabled || e.button > 0 || e.target.closest('button, a')) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, az: view.userAz, el: view.userEl, moved: false, type: e.pointerType };
    });
    mapCard.addEventListener('pointermove', e => {
      if (!state.enabled) return;
      if (drag && e.pointerId === drag.id) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) > 7) {
          if (drag.type !== 'mouse' && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }   // vuốt dọc: để trang cuộn
          drag.moved = true;
          try { mapCard.setPointerCapture(e.pointerId); } catch { /* bỏ qua */ }
          markUsed();
        }
        if (drag.moved) {
          view.userAz = drag.az - dx * 0.0065;
          if (drag.type === 'mouse') view.userEl = clamp(drag.el + dy * 0.003, -0.35, 0.4);
          wake();
        }
      } else if (e.pointerType === 'mouse') {
        setHover(pick(e.clientX, e.clientY));
      }
    });
    let suppressClick = false;   // vừa kéo xoay xong thì không tính là bấm
    mapCard.addEventListener('pointerup', e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
      drag = null;
    });
    mapCard.addEventListener('pointercancel', () => { drag = null; });
    mapCard.addEventListener('pointerleave', () => { if (!drag) setHover(null); });
    mapCard.addEventListener('click', e => {
      if (!state.enabled || suppressClick || e.target.closest('button, a')) return;
      const m = pick(e.clientX, e.clientY);
      if (m) m.chip.click();
    });
  }

  /* ---------------- Vòng vẽ: chỉ vẽ khi camera đang di chuyển hoặc cảnh đang "sống" */
  let rafId = 0, last = 0, lastRender = 0, idleFrames = 0, time = 0, modalOpen = false, lastActivity = performance.now();
  let glassCalm = true, slowFrames = 0, frameCount = 0, degraded = 0;
  function ambientActive(now) {
    return Q.ambient && !reduceMotion.matches && !document.hidden && !modalOpen && showWeight > 0.5 && now - lastActivity < 25000;
  }
  function setGlassBusy(busy) {
    // Kính khúc xạ (liquid-glass-fx.js) phải tính lại mỗi khung hình khi nền chuyển động: tạm tắt như lúc cuộn
    if (busy === !glassCalm) return;
    glassCalm = !busy;
    if (busy) document.dispatchEvent(new Event('lg:scrollstart'));
    else if (!root.classList.contains('is-scrolling')) document.dispatchEvent(new Event('lg:scrollend'));
  }
  function wake() {
    if (!rafId && state.enabled && !document.hidden) {
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    }
  }
  function frame(now) {
    rafId = 0;
    if (!state.enabled) return;
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    computeGoal();
    if (!activeShots.length) return;
    const moving = approach(dt);
    const ambient = ambientActive(now);
    const interval = moving ? 0 : ambient ? 1000 / Q.ambientFps - 3 : Infinity;
    if (now - lastRender >= interval || firstRender) {
      if (ambient || moving) time += Math.min(0.1, (now - (lastRender || now)) / 1000);
      render(now);
      if (moving) watchSpeed(now);
    }
    setGlassBusy(ambient || moving);
    if (moving || ambient) { idleFrames = 0; rafId = requestAnimationFrame(frame); }
    else if (++idleFrames < 4) rafId = requestAnimationFrame(frame);
    else setGlassBusy(false);
  }
  let firstRender = true, prevRenderAt = 0;
  function render(now) {
    firstRender = false;
    uniforms.uTime.value = time;
    animate(time);
    applyCamera();
    cloudMat.opacity = 0.92 * (1 - smooth(0.2, 0.8, mapWeight));
    hideCloudsNearView();
    applyTimeOfDay(cur.tod);
    const v = Math.round(cur.veil * 1000) / 1000;
    if (v !== lastVeil) { lastVeil = v; host.style.setProperty('--w3d-veil', String(v)); }
    if (Q.shadows && shadowDirty && now - lastShadow > 200) { renderer.shadowMap.needsUpdate = true; shadowDirty = false; lastShadow = now; }
    renderer.render(scene, camera);
    updateChips();
    lastRender = now;
  }
  function watchSpeed(now) {
    // Máy chậm (dưới ~25 khung hình/giây khi cuộn): giảm độ phân giải, tắt bóng đổ
    const gap = now - prevRenderAt;
    prevRenderAt = now;
    if (gap > 0 && gap < 500) { frameCount++; if (gap > 40) slowFrames++; }
    if (frameCount >= 45) {
      if (slowFrames > 30 && degraded < 2) {
        degraded++;
        renderer.setPixelRatio(Math.max(0.6, renderer.getPixelRatio() * 0.72));
        renderer.setSize(view.w, view.h, false);
        if (degraded === 2 && Q.shadows) { Q.shadows = false; renderer.shadowMap.enabled = false; sun.castShadow = false; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); }
      }
      frameCount = 0; slowFrames = 0;
    }
  }

  /* ---------------- Sự kiện trang */
  const onScroll = () => { lastActivity = performance.now(); wake(); };
  const onPointer = e => {
    lastActivity = performance.now();
    if (e.pointerType === 'mouse') { view.px = (e.clientX / innerWidth - 0.5) * 2; view.py = (e.clientY / innerHeight - 0.5) * 2; }
    wake();
  };
  const onResize = () => { resize(false); layoutDirty = true; wake(); };
  const onVisibility = () => { if (!document.hidden) { lastActivity = performance.now(); wake(); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);
  const ro = new ResizeObserver(() => { layoutDirty = true; wake(); });
  ro.observe(document.body);
  const pinsHost = document.getElementById('map-pins');
  const mo = new MutationObserver(syncPins);
  if (pinsHost) mo.observe(pinsHost, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  for (const d of document.querySelectorAll('dialog')) mo.observe(d, { attributes: true, attributeFilter: ['open'] });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); opts.onFail?.(new Error('Mất ngữ cảnh WebGL')); });

  /* ---------------- Chuẩn bị bóng đổ và biên dịch shader trước khi hiện */
  resize(true);
  syncPins();
  computeGoal();
  Object.assign(cur, goal);
  firstFrame = false;
  applyCamera();
  applyTimeOfDay(cur.tod);
  if (Q.shadows) renderer.shadowMap.needsUpdate = true;
  try { await renderer.compileAsync(scene, camera); } catch { /* trình duyệt cũ: biên dịch khi vẽ */ }
  renderer.render(scene, camera);

  /* ================================================================ API cho world3d.js */
  return {
    enable() {
      if (state.disposed) return;
      state.enabled = true;
      root.classList.add('world-3d');
      layoutDirty = true;
      firstRender = true;
      resize(true);
      requestAnimationFrame(() => { measureChips(); wake(); });
      lastActivity = performance.now();
      wake();
    },
    disable() {
      state.enabled = false;
      root.classList.remove('world-3d');
      cancelAnimationFrame(rafId);
      rafId = 0;
      for (const m of markers) { m.chipShown = false; m.chip.classList.remove('is-shown'); }
      if (mapCard) mapCard.style.cursor = '';
      setGlassBusy(false);
    },
    get enabled() { return state.enabled; },
  };
}
