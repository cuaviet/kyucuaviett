/* CHẠM CỬA VIỆT — Bật thế giới 3D (sa bàn Cửa Việt) phía sau toàn trang.
 *
 * Tệp nhỏ này chỉ:
 *  1. Kiểm tra máy có WebGL2 tăng tốc phần cứng không (three.js cần WebGL2).
 *  2. Tạo nút bật/tắt 3D (thanh trên cùng, menu điện thoại, khung bản đồ) và nhớ lựa chọn.
 *  3. Chỉ tải phần dựng cảnh (world3d-scene.js + three.js) khi người xem bắt đầu tương tác
 *     hoặc sau vài giây, để trang mở nhanh như bản 2D.
 * Máy không hỗ trợ, hoặc người xem tắt 3D: trang giữ nguyên bản 2D.
 * Khi trình chiếu có thể thêm ?3d=1 (luôn bật) hoặc ?3d=0 (luôn tắt) vào địa chỉ.
 */
const KEY = 'cham-cua-viet-3d';
const root = document.documentElement;
const params = new URLSearchParams(location.search);
const forced = params.get('3d');

function readPref() { try { return localStorage.getItem(KEY); } catch { return null; } }
function writePref(value) { try { localStorage.setItem(KEY, value); } catch { /* chế độ riêng tư */ } }

function hasWebGL2(allowSoftware) {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: !allowSoftware });
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

const supported = forced !== '0' && 'IntersectionObserver' in window && 'ResizeObserver' in window && hasWebGL2(forced === '1');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData === true;
const pref = readPref();
let wanted = forced === '1' ? true : forced === '0' ? false : pref ? pref === 'on' : !calm;

const toggles = [];
let world = null, loading = null;

const CUBE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 20 7.3v9.4L12 21.2l-8-4.5V7.3zM4 7.3l8 4.5 8-4.5M12 11.8v9.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';

function sync(busy = false) {
  root.classList.toggle('w3d-off', !wanted);
  for (const b of toggles) {
    b.setAttribute('aria-pressed', String(wanted));
    if (busy) b.setAttribute('aria-busy', 'true'); else b.removeAttribute('aria-busy');
    const label = b.querySelector('[data-w3d-label]');
    if (label && b.classList.contains('world-toggle-menu')) label.textContent = wanted ? 'Thế giới 3D: đang bật' : 'Thế giới 3D: đang tắt';
    b.title = wanted ? 'Tắt thế giới 3D' : 'Bật thế giới 3D';
  }
}

function load() {
  if (world) return Promise.resolve(world);
  if (!loading) {
    loading = import('./world3d-scene.js?v=1')
      .then(mod => mod.createWorld({
        requestOff: () => setEnabled(false, true),
        onFail: error => giveUp(error),
      }))
      .then(created => (world = created));
  }
  return loading;
}

function giveUp(error) {
  console.warn('Không bật được thế giới 3D, trang dùng bản 2D:', error?.message || error);
  world?.disable();
  world = null;
  wanted = false;
  root.classList.remove('world-3d', 'w3d-supported');
  root.classList.add('w3d-unsupported');
  for (const b of toggles) b.hidden = true;
  sync();
}

async function setEnabled(on, remember) {
  wanted = on;
  if (remember) writePref(on ? 'on' : 'off');
  if (!on) { world?.disable(); sync(); return; }
  sync(!world);
  try {
    const w = await load();
    if (wanted) w.enable();
    sync();
  } catch (error) {
    giveUp(error);
  }
}

function makeToggles() {
  // Nút 3D trên thanh trên cùng có sẵn trong index.html (giữ chỗ để thanh không bị xô lệch)
  const headerToggle = document.querySelector('.site-header .world-toggle');
  if (headerToggle) toggles.push(headerToggle);
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'world-toggle-menu';
    b.innerHTML = `${CUBE}<span data-w3d-label>Thế giới 3D</span>`;
    menu.append(b);
    toggles.push(b);
  }
  for (const b of toggles) b.addEventListener('click', () => setEnabled(!wanted, true));
  const card = document.querySelector('.map-canvas');
  if (card) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'world-map-switch';
    b.innerHTML = `${CUBE}<span>Xem sa bàn 3D</span>`;
    b.addEventListener('click', () => setEnabled(true, true));
    card.append(b);
  }
}

/* Chỉ tải phần 3D khi người xem bắt đầu tương tác (cuộn, chạm, rê chuột, bàn phím):
   lúc trang vừa mở, máy dành toàn bộ sức cho ảnh đầu trang và nội dung. */
function whenEngaged(start) {
  let done = false;
  const events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'pointermove', 'keydown'];
  const go = () => {
    if (done) return;
    done = true;
    for (const name of events) removeEventListener(name, go);
    start();
  };
  for (const name of events) addEventListener(name, go, { passive: true });
  if (scrollY > 40 || (location.hash && location.hash !== '#home')) go();
}

if (supported) {
  root.classList.add('w3d-supported');
  makeToggles();
  sync();
  if (wanted) {
    const begin = () => whenEngaged(() => setEnabled(true, false));
    if (document.readyState === 'complete') begin();
    else addEventListener('load', begin, { once: true });
  }
} else {
  root.classList.add('w3d-unsupported');
  const headerToggle = document.querySelector('.site-header .world-toggle');
  if (headerToggle) {
    headerToggle.disabled = true;
    headerToggle.title = 'Trình duyệt hoặc thiết bị này chưa hỗ trợ thế giới 3D';
  }
}
