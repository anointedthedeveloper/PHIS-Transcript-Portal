const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const TRANSCRIPTS_DIR = path.join(__dirname, '..', 'transcripts');
const studentsMap = new Map();

function loadTranscripts() {
  const files = fs.readdirSync(TRANSCRIPTS_DIR).filter(f => f.endsWith('.json'));
  let loaded = 0, errors = 0;
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(TRANSCRIPTS_DIR, file), 'utf-8'));
      if (data.student_id) { studentsMap.set(data.student_id.trim(), data); loaded++; }
    } catch { errors++; }
  }
  console.log(`✔  Loaded ${loaded} transcripts (${errors} errors) from ${files.length} files`);
}

loadTranscripts();

function normalizeNum(n) { return String(parseInt(n, 10)); }
function idNumericSuffix(id) { const m = id.match(/(\d+)$/); return m ? normalizeNum(m[1]) : null; }

// Serve built frontend in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/search') || req.path.startsWith('/student')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Root — status page
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>PHIS Transcript API</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:40px 48px;max-width:560px;width:100%}
    .badge{display:inline-flex;align-items:center;gap:6px;background:#166534;color:#bbf7d0;font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;margin-bottom:24px}
    .dot{width:8px;height:8px;background:#4ade80;border-radius:50%;animation:pulse 1.5s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    h1{font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:4px}
    .sub{color:#94a3b8;font-size:14px;margin-bottom:28px}
    .stat{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#0f172a;border-radius:10px;margin-bottom:10px}
    .stat-label{color:#94a3b8;font-size:13px}
    .stat-value{color:#f1f5f9;font-weight:600;font-size:14px}
    .endpoints{margin-top:24px}
    .ep-title{color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
    .ep{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#0f172a;border-radius:8px;margin-bottom:8px;font-size:13px}
    .method{background:#1d4ed8;color:#bfdbfe;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;flex-shrink:0}
    .path{color:#7dd3fc;font-family:monospace}
    .desc{color:#64748b;font-size:12px;margin-left:auto}
    .footer{margin-top:28px;padding-top:20px;border-top:1px solid #1e293b;color:#475569;font-size:12px;text-align:center}
    a{color:#7dd3fc;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Server Online</div>
    <h1>PHIS Transcript API</h1>
    <p class="sub">Peter Harvard International Schools — Backend Service</p>

    <div class="stat">
      <span class="stat-label">📚 Transcripts Loaded</span>
      <span class="stat-value">${studentsMap.size.toLocaleString()}</span>
    </div>
    <div class="stat">
      <span class="stat-label">🌐 Port</span>
      <span class="stat-value">${process.env.PORT || 3001}</span>
    </div>
    <div class="stat">
      <span class="stat-label">⏱ Uptime</span>
      <span class="stat-value" id="uptime">calculating...</span>
    </div>

    <div class="endpoints">
      <div class="ep-title">Available Endpoints</div>
      <div class="ep">
        <span class="method">GET</span>
        <span class="path">/search?name=&amp;student_id=&amp;year=</span>
      </div>
      <div class="ep">
        <span class="method">GET</span>
        <span class="path">/student/:id</span>
      </div>
    </div>

    <div class="footer">
      Powered by <a href="https://anobyte.online" target="_blank">Anobyte</a>
      &nbsp;·&nbsp;
      Designed by <a href="https://github.com/anointedthedeveloper" target="_blank">anointedthedeveloper</a>
    </div>
  </div>
  <script>
    const start = Date.now();
    function fmt(s){
      if(s<60) return s+'s';
      if(s<3600) return Math.floor(s/60)+'m '+( s%60)+'s';
      return Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m';
    }
    setInterval(()=>{
      document.getElementById('uptime').textContent = fmt(Math.floor((Date.now()-start)/1000));
    },1000);
  </script>
</body>
</html>`);
});

// GET /search
app.get('/search', (req, res) => {
  const { name, student_id, year } = req.query;
  if (!name && !student_id && !year) return res.json([]);

  let results = [];

  if (student_id) {
    const sid = student_id.trim();
    for (const [key, val] of studentsMap) {
      if (key.toLowerCase() === sid.toLowerCase()) { results = [val]; break; }
    }
    if (results.length === 0 && /^\d+$/.test(sid)) {
      const target = normalizeNum(sid);
      for (const val of studentsMap.values()) {
        if (idNumericSuffix(val.student_id || '') === target) results.push(val);
      }
    }
  } else {
    results = Array.from(studentsMap.values());
    if (name) {
      const q = name.trim().toLowerCase();
      results = results.filter(s => s.full_name && s.full_name.toLowerCase().includes(q));
    }
    if (year) {
      const q = year.trim();
      results = results.filter(s => s.terms && s.terms.some(t => t.period && t.period.includes(q)));
    }
  }

  res.json(results.map(s => ({
    full_name: s.full_name,
    student_id: s.student_id,
    term_count: s.terms ? s.terms.length : 0,
    terms: s.terms ? s.terms.map(t => ({ term: t.term, period: t.period })) : []
  })));
});

// GET /student/:id
app.get('/student/:id', (req, res) => {
  const id = decodeURIComponent(req.params.id).trim();
  let student;
  for (const [key, val] of studentsMap) {
    if (key.toLowerCase() === id.toLowerCase()) { student = val; break; }
  }
  if (!student && /^\d+$/.test(id)) {
    const target = normalizeNum(id);
    for (const val of studentsMap.values()) {
      if (idNumericSuffix(val.student_id || '') === target) { student = val; break; }
    }
  }
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   PHIS Transcript Archive — API Server   ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  🌐  http://localhost:${PORT}`);
  console.log(`  📚  ${studentsMap.size} transcripts in memory`);
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('');
    console.error(`  ✖  Port ${PORT} is already in use.`);
    console.error(`  →  Kill the existing process or set a different PORT:`);
    console.error(`     PORT=3002 npm start`);
    console.error('');
    process.exit(1);
  } else {
    throw err;
  }
});
