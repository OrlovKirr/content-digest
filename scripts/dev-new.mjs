// Run the new-stack pair (ADR 004): web/ (Vite, :5174) + api/ (FastAPI, :8788)
// together with no dependencies. Vite proxies /api → :8788. Either process
// exiting tears down the other. The legacy app/+server/ launcher is dev.mjs.
import { spawn } from 'node:child_process';

const targets = [
  ['web', 'npm', ['--prefix', 'web', 'run', 'dev'], undefined],
  ['api', './.venv/bin/python', ['-m', 'uvicorn', 'index:app', '--port', '8788', '--reload'], 'api'],
];

const children = targets.map(([name, cmd, args, cwd]) => {
  const child = spawn(cmd, args, { stdio: 'inherit', cwd });
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
