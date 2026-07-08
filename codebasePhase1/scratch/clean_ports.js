const { execSync } = require('child_process');

const ports = [3000, 3001, 4000];

console.log('[Clean Ports] Checking for active processes on ports 3000, 3001, 4000...');

ports.forEach((port) => {
  try {
    const stdout = execSync(`lsof -t -i :${port}`).toString().trim();
    if (stdout) {
      const pids = stdout.split('\n').join(' ');
      console.log(`[Clean Ports] Killing processes on port ${port}: PIDs ${pids}`);
      execSync(`kill -9 ${pids} 2>/dev/null || true`);
    }
  } catch (err) {
    // Port is free
  }
});

console.log('[Clean Ports] Ports are ready.');
