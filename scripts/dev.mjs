// Run the web (Vite) and api (Hono) dev servers together with no dependencies.
// Either process exiting tears down the other.
import { spawn } from 'node:child_process';

const targets = [
  ['web', ['--prefix', 'app', 'run', 'dev']],
  ['api', ['--prefix', 'server', 'run', 'dev']],
];

const children = targets.map(([name, args]) => {
  const child = spawn('npm', args, { stdio: 'inherit' });
  child.on('exit', (code) => {
    console.log(`[${name}] exited (${code ?? 'signal'})`);
    shutdown();
  });
  return child;
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
