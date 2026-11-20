// Vice City Cover Studio — the entrypoint (Node 22, standard library only).
// It hands the app in: copies app/ and screenshots/ from beside this file to
// /output (or MAKEFUN_OUTPUT_DIR outside the grader) and writes
// /output/dossier.json with the vendored make.fun library, so the judge can
// read the app's source and screenshots. Serve the app locally first with
// `node serve.ts`, then open http://localhost:8080.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(output, { recursive: true });
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });
const shots = join(output, 'screenshots');
mkdirSync(shots, { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), shots, { recursive: true });
}

// The scorer's caps: text_max_bytes shapes the dossier's bytes; the rest
// refuse an entry the scorer would refuse (over 4 screenshots or one over
// 256 KiB; over 993 files in app/ or 48 MiB of app files in all).
writeFileSync(
  join(output, 'dossier.json'),
  buildDossier(output, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// One line on stdout so a local run shows what it handed in.
console.log(`wrote ${output}/dossier.json`);
