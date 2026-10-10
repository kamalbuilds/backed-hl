// bundle abi/evidence/config/snapshot from ../../app into public/data.json (one fetch on page load)
import fs from 'node:fs';
const A = new URL('../../../app/', import.meta.url);
const d = {}; for (const k of ['abi', 'evidence', 'config', 'snapshot']) { const f = new URL(k + '.json', A); if (fs.existsSync(f)) d[k] = JSON.parse(fs.readFileSync(f, 'utf8')); }
fs.writeFileSync(new URL('../public/data.json', import.meta.url), JSON.stringify(d)); console.log('data.json', Object.keys(d).join(','), d.snapshot ? new Date(d.snapshot.at).toISOString() : '');
