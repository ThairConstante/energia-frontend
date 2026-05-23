/* ==========================================
   IoT Admin System — Shared JavaScript
   ========================================== */

// ── Config ────────────────────────────────
const API_BASE = 'https://energia-backend-1tk8.onrender.com'; // Tu API FastAPI local
const REFRESH_INTERVAL = 10000; // 10 seconds

// ── Mock Data Generator ───────────────────
// Simulates API responses until a real API is connected
const MockAPI = {
  energia() {
    const base = { voltaje: 118 + Math.random() * 6, corriente: 2.1 + Math.random() * 1.4 };
    const potencia = (base.voltaje * base.corriente).toFixed(2);
    return {
      voltaje:  parseFloat(base.voltaje.toFixed(2)),
      corriente: parseFloat(base.corriente.toFixed(3)),
      potencia: parseFloat(potencia),
      energia:  parseFloat((parseFloat(potencia) * 0.00028 + Math.random() * 0.002).toFixed(4)),
      timestamp: new Date().toISOString()
    };
  },
  temperatura() {
    return {
      temperatura: parseFloat((22 + Math.random() * 10).toFixed(1)),
      humedad:     parseFloat((45 + Math.random() * 30).toFixed(1)),
      timestamp:   new Date().toISOString()
    };
  },
  dispositivos() {
    return {
      ventilador: Math.random() > 0.4 ? 'ON' : 'OFF',
      bombillo:   Math.random() > 0.3 ? 'ON' : 'OFF',
      timestamp:  new Date().toISOString()
    };
  },
  historiaEnergia(n = 20) {
    const rows = [];
    for (let i = n; i >= 0; i--) {
      const d = new Date(Date.now() - i * 60000);
      const v = 118 + Math.random() * 6;
      const c = 2.1 + Math.random() * 1.4;
      const p = v * c;
      rows.push({
        fecha: d.toLocaleString('es-CO'),
        voltaje: v.toFixed(2),
        corriente: c.toFixed(3),
        potencia: p.toFixed(2),
        energia: (p * 0.00028).toFixed(4)
      });
    }
    return rows;
  },
  historiaTemperatura(n = 20) {
    const rows = [];
    for (let i = n; i >= 0; i--) {
      const d = new Date(Date.now() - i * 60000);
      rows.push({
        fecha: d.toLocaleString('es-CO'),
        temperatura: (22 + Math.random() * 10).toFixed(1),
        humedad: (45 + Math.random() * 30).toFixed(1),
        ventilador: Math.random() > 0.4 ? 'ON' : 'OFF',
        bombillo:   Math.random() > 0.3 ? 'ON' : 'OFF',
      });
    }
    return rows;
  }
};

// ── API Fetcher ───────────────────────────
async function fetchData(endpoint) {
  if (!API_BASE) return null; // No API configured — use mock data
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

// ── Energia: usa /energia/last (ultima lectura real) ──────────
let _lastEnergia = null;

async function getEnergia() {
  const data = await fetchData('/energia/last');
  if (data) {
    _lastEnergia = {
      voltaje:   parseFloat(data.voltaje)   || 0,
      corriente: parseFloat(data.corriente) || 0,
      potencia:  parseFloat(data.potencia)  || 0,
      energia:   parseFloat(data.energia)   || 0,
      timestamp: data.timestamp || new Date().toISOString(),
    };
    return _lastEnergia;
  }
  // Mantiene último valor conocido, no genera datos aleatorios
  if (_lastEnergia) return _lastEnergia;
  return { voltaje: 0, corriente: 0, potencia: 0, energia: 0, timestamp: new Date().toISOString() };
}

// ── Historia: usa /energia/list (todos los registros) ─────────
async function getEnergiaHistory() {
  const data = await fetchData('/energia/list');
  if (Array.isArray(data) && data.length > 0) {
    return data.map(r => ({
      fecha:       r.fecha ? new Date(r.fecha).toLocaleString('es-CO') : '—',
      voltaje:   parseFloat(r.voltaje).toFixed(2),
      corriente: parseFloat(r.corriente).toFixed(3),
      potencia:  parseFloat(r.potencia).toFixed(2),
      energia:   parseFloat(r.energia).toFixed(4),
    }));
  }
  return MockAPI.historiaEnergia(24); // fallback
}

// ── Temperatura: /temperatura/last ────────────────────────────
let _lastTemperatura = null;

async function getTemperatura() {
  const data = await fetchData('/temperatura/last');
  if (data) {
    _lastTemperatura = {
      temperatura: parseFloat(data.temperatura) || 0,
      humedad:     parseFloat(data.humedad)     || 0,
      timestamp:   data.timestamp || new Date().toISOString(),
    };
    return _lastTemperatura;
  }
  // Mantiene último valor conocido, no genera datos aleatorios
  if (_lastTemperatura) return _lastTemperatura;
  return { temperatura: 0, humedad: 0, timestamp: new Date().toISOString() };
}

// ── Historia temperatura: /temperatura/list ────────────────────
async function getTemperaturaHistory() {
  const data = await fetchData('/temperatura/list');
  if (Array.isArray(data) && data.length > 0) {
    return data.map(r => ({
      fecha:       r.fecha ? new Date(r.fecha).toLocaleString('es-CO') : '—',
      temperatura: parseFloat(r.temperatura).toFixed(1),
      humedad:     parseFloat(r.humedad).toFixed(1),
    }));
  }
  return MockAPI.historiaTemperatura(24);
}

// ── Dispositivos: /relay/list ──────────────────────────────────
// Devuelve array de { relay_name: 'luces'|'ventilador', estatus: 0|1 }
// Guarda el último estado conocido para no parpadear si la API falla
let _lastDispositivos = null;

async function getDispositivos() {
  const data = await fetchData('/relay/list');
  if (Array.isArray(data) && data.length > 0) {
    // API devuelve: { Relay_Name, status (boolean), Relay_Id }
    const find  = (name) => data.find(r => r.Relay_Name?.toLowerCase() === name.toLowerCase());
    const toStr = (r)    => (r && r.status === true) ? 'ON' : 'OFF';
    _lastDispositivos = {
      ventilador: toStr(find('ventilador')),
      bombillo:   toStr(find('luces')),
      timestamp:  new Date().toISOString(),
    };
    return _lastDispositivos;
  }
  // Si la API falla, devuelve el último estado conocido (no mock aleatorio)
  if (_lastDispositivos) return _lastDispositivos;
  // Solo la primera vez sin datos reales, estado apagado por defecto
  return { ventilador: 'OFF', bombillo: 'OFF', timestamp: new Date().toISOString() };
}

// ── DateTime ──────────────────────────────
function updateDateTime() {
  const now = new Date();
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (dateEl) dateEl.textContent = now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Number Animation ──────────────────────
function animateCounter(el, target, decimals = 2, duration = 600) {
  if (!el) return;
  const start = parseFloat(el.textContent) || 0;
  const diff  = target - start;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val  = start + diff * ease;
    el.textContent = val.toFixed(decimals);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Sidebar Toggle ────────────────────────
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.querySelector('.hamburger');
  if (!sidebar || !hamburger) return;

  hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ── Refresh Button ────────────────────────
function initRefreshBtn(onRefresh) {
  const btn = document.getElementById('refresh-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.classList.add('spinning');
    onRefresh().finally(() => {
      setTimeout(() => btn.classList.remove('spinning'), 600);
    });
  });
}

// ── Chart Defaults ────────────────────────
function getChartDefaults(color) {
  return {
    borderColor: color,
    backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.08)'),
    borderWidth: 2,
    tension: 0.4,
    fill: true,
    pointRadius: 3,
    pointBackgroundColor: color,
    pointBorderColor: 'transparent',
    pointHoverRadius: 5,
  };
}

const CHART_COLORS = {
  cyan:   '#00d9ff',
  green:  '#00ff94',
  amber:  '#ffb800',
  purple: '#7b61ff',
  red:    '#ff3d71',
};

function makeChartConfig(label, color, maxPoints = 20) {
  return {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label,
        data: [],
        ...getChartDefaults(color),
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0d1f3c',
          borderColor: 'rgba(0,217,255,0.2)',
          borderWidth: 1,
          titleColor: '#7a9cc0',
          bodyColor: color,
          padding: 10,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,217,255,0.04)', drawBorder: false },
          ticks: { color: '#3d5978', font: { family: "'Space Mono'", size: 10 }, maxTicksLimit: 6, maxRotation: 0 }
        },
        y: {
          grid: { color: 'rgba(0,217,255,0.06)', drawBorder: false },
          ticks: { color: '#3d5978', font: { family: "'Space Mono'", size: 10 } },
          border: { display: false }
        }
      },
      animation: { duration: 400 },
      _maxPoints: maxPoints
    }
  };
}

function pushToChart(chart, label, value) {
  const maxPts = chart.options._maxPoints || 20;
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(value);
  if (chart.data.labels.length > maxPts) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update('none');
}

// ── Table Helpers ─────────────────────────
function deviceBadge(state) {
  const on = state === 'ON';
  return `<span class="${on ? 'badge-on' : 'badge-off'}">
    <i class="fas fa-circle" style="font-size:6px"></i>${state}
  </span>`;
}

// ── Export ────────────────────────────────
function exportTableToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = [...table.querySelectorAll('tr')];
  const csv  = rows.map(r =>
    [...r.querySelectorAll('th,td')].map(c => `"${c.innerText.trim()}"`).join(',')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ── Init ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  updateDateTime();
  setInterval(updateDateTime, 1000);
});
