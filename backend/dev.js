const { execSync } = require('child_process');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3001;

// Kill whatever is on the port
try {
  const result = execSync(`netstat -aon | findstr :${PORT}`, { shell: 'cmd.exe' }).toString();
  const pids = [...new Set(
    result.split('\n')
      .map(line => line.trim().split(/\s+/).pop())
      .filter(pid => pid && /^\d+$/.test(pid) && pid !== '0')
  )];
  pids.forEach(pid => {
    try { execSync(`taskkill /F /PID ${pid}`, { shell: 'cmd.exe', stdio: 'ignore' }); } catch {}
  });
  if (pids.length) console.log(`  ✔  Freed port ${PORT} (killed PID ${pids.join(', ')})`);
} catch {
  // Nothing was on the port — that's fine
}

// Start nodemon
const child = spawn('npx', ['nodemon', 'server.js'], { shell: true, stdio: 'inherit' });
child.on('exit', code => process.exit(code ?? 0));
