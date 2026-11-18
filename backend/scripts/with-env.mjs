// Cross-platform "VAR=value command" runner:  node scripts/with-env.mjs A=1 B=2 -- npm run x
import { spawn } from 'node:child_process';

const sep = process.argv.indexOf('--');
const env = { ...process.env };
for (const pair of process.argv.slice(2, sep)) {
  const i = pair.indexOf('=');
  env[pair.slice(0, i)] = pair.slice(i + 1);
}
const [cmd, ...args] = process.argv.slice(sep + 1);
const child = spawn(cmd, args, { stdio: 'inherit', env, shell: true });
child.on('exit', (code) => process.exit(code ?? 1));
