const { fork } = require('child_process');
const path = require('path');

const server = fork(path.join(__dirname, 'server.js'));
const keepalive = fork(path.join(__dirname, 'keepalive.js'));

server.on('exit', (code) => {
  console.error(`server exited with code ${code}`);
  process.exit(code ?? 1);
});

keepalive.on('exit', (code) => {
  console.log(`keepalive exited with code ${code}`);
});
