const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const TRANSCRIPTS_DIR = path.join(__dirname, 'transcripts');
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
    console.error(`  ✖  Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Keep-alive: ping self every 14 min to prevent Render spin-down
if (process.env.RENDER_URL) {
  const https = require('https');
  const PING_URL = process.env.RENDER_URL;
  setInterval(() => {
    https.get(PING_URL, (res) => {
      console.log(`[keep-alive] ${new Date().toISOString()} — ${res.statusCode}`);
    }).on('error', (e) => console.error(`[keep-alive] failed: ${e.message}`));
  }, 14 * 60 * 1000);
  console.log(`  🔁  Keep-alive active → ${PING_URL}`);
}
