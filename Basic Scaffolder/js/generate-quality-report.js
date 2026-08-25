#!/usr/bin/env node
// Genera un informe HTML a partir del JSON (o carpeta de JSON) que produce bcquality-reviewer.agent.md
// Uso archivo suelto: node generate-quality-report.js .bcquality-output/Rental-Codeunit.al.json informe.html
// Uso lote (carpeta):  node generate-quality-report.js .bcquality-output/ informe-src.html

const fs = require('fs');
const path = require('path');

const [, , inputPath, outputPath] = process.argv;

if (!inputPath) {
  console.error('Uso: node generate-quality-report.js <entrada.json | carpeta> [salida.html]');
  process.exit(1);
}

const CONFIDENCE = {
  high: { label: 'confianza alta', bg: '#fcebeb', fg: '#791f1f' },
  medium: { label: 'confianza media', bg: '#faeeda', fg: '#633806' },
  low: { label: 'confianza baja', bg: '#f1efe8', fg: '#444441' },
};

const DOMAIN_ICON = {
  performance: '&#9889;', security: '&#128274;', ux: '&#127912;', telemetry: '&#128202;',
  'data-modeling': '&#128193;', 'error-handling': '&#9888;', events: '&#128225;',
  interfaces: '&#128268;', privacy: '&#128272;', query: '&#128269;', style: '&#9997;',
  testing: '&#9989;', upgrade: '&#11014;', 'web-services': '&#127760;', appsource: '&#128230;',
};

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function findJsonFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findJsonFiles(full));
    } else if (entry.name.endsWith('.json') && entry.name !== '_index.json') {
      results.push(full);
    }
  }
  return results;
}

function findingCard(f) {
  const conf = CONFIDENCE[f.confidence] || CONFIDENCE.low;
  const hasRef = (f.references || []).length > 0;
  const icon = DOMAIN_ICON[f.domain] || '&#128203;';
  return `
    <div class="finding">
      <div class="finding-head">
        <span class="finding-domain">${icon} ${esc(f.domain || 'sin dominio')}</span>
        ${hasRef
          ? `<span class="badge" style="background:${conf.bg};color:${conf.fg}">${conf.label}</span>`
          : `<span class="badge badge-agent">criterio del agente &middot; sin referencia</span>`}
      </div>
      <p class="finding-summary">${esc(f.summary || '')}</p>
      ${hasRef ? `<div class="finding-refs">${f.references.map((r) => `<code>${esc(r)}</code>`).join('')}</div>` : ''}
    </div>`;
}

function domainSections(findings) {
  const byDomain = {};
  for (const f of findings) {
    const d = f.domain || 'sin-dominio';
    (byDomain[d] = byDomain[d] || []).push(f);
  }
  for (const d of Object.keys(byDomain)) {
    byDomain[d].sort((a, b) => (b.references || []).length - (a.references || []).length);
  }
  return Object.entries(byDomain).map(([domain, items]) => `
    <section class="domain-section">
      <h3>${DOMAIN_ICON[domain] || '&#128203;'} ${esc(domain)} <span class="count">${items.length}</span></h3>
      ${items.map(findingCard).join('')}
    </section>`).join('');
}

function suppressedSection(suppressed) {
  if (!suppressed.length) return '';
  return `
    <section class="domain-section suppressed-section">
      <h3>&#128465; suprimidos por precedencia de capa <span class="count">${suppressed.length}</span></h3>
      ${suppressed.map((s) => `
        <div class="finding finding-muted">
          <div class="finding-refs"><code>${esc(s.path)}</code></div>
          <p class="finding-summary muted">${esc(s.reason || '')}</p>
        </div>`).join('')}
    </section>`;
}

function fileSection(data, anchorId) {
  const findings = Array.isArray(data.findings) ? data.findings : [];
  const cited = findings.filter((f) => (f.references || []).length > 0);
  const fromAgent = findings.filter((f) => f['from-sub-skill'] === 'agent' || (f.references || []).length === 0);
  const suppressed = Array.isArray(data.suppressed) ? data.suppressed : [];
  const outcomeLabel = { completed: 'Revisión completa', 'not-applicable': 'No aplicable', partial: 'Revisión parcial' }[data.outcome] || data.outcome;

  return `
  <div class="header" id="${anchorId}">
    <div class="header-top">
      <div>
        <h1>${esc(data.file || 'Revisión BCQuality')}</h1>
        <p class="subtitle">Revisión BCQuality &middot; capas: microsoft, community, custom</p>
      </div>
      <span class="outcome-pill">${esc(outcomeLabel)}</span>
    </div>
    <div class="stats">
      <div class="stat"><span class="num">${findings.length}</span><span class="label">hallazgos</span></div>
      <div class="stat"><span class="num">${cited.length}</span><span class="label">con cita</span></div>
      <div class="stat"><span class="num">${fromAgent.length}</span><span class="label">del agente</span></div>
      <div class="stat"><span class="num">${suppressed.length}</span><span class="label">suprimidos</span></div>
    </div>
  </div>
  ${domainSections(findings) || '<p style="color:var(--text-secondary)">Sin hallazgos.</p>'}
  ${suppressedSection(suppressed)}`;
}

const isDir = fs.statSync(inputPath).isDirectory();
let bodyHtml = '';
let overviewHtml = '';
let outFile = outputPath;

if (isDir) {
  const files = findJsonFiles(inputPath).sort();
  if (!files.length) {
    console.error('No se han encontrado JSON en ' + inputPath);
    process.exit(1);
  }
  const allData = files.map((f) => ({ data: JSON.parse(fs.readFileSync(f, 'utf8')), src: f }));

  const totalFindings = allData.reduce((n, { data }) => n + (data.findings || []).length, 0);
  const totalHigh = allData.reduce((n, { data }) => n + (data.findings || []).filter((f) => f.confidence === 'high').length, 0);
  const totalCited = allData.reduce((n, { data }) => n + (data.findings || []).filter((f) => (f.references || []).length > 0).length, 0);
  const filesWithFindings = allData.filter(({ data }) => (data.findings || []).length > 0).length;

  overviewHtml = `
  <div class="header">
    <div class="header-top">
      <div>
        <h1>Revisión BCQuality &mdash; src/</h1>
        <p class="subtitle">${allData.length} archivos revisados</p>
      </div>
      <span class="outcome-pill">${filesWithFindings} con hallazgos</span>
    </div>
    <div class="stats">
      <div class="stat"><span class="num">${totalFindings}</span><span class="label">hallazgos totales</span></div>
      <div class="stat"><span class="num">${totalHigh}</span><span class="label">confianza alta</span></div>
      <div class="stat"><span class="num">${totalCited}</span><span class="label">con cita</span></div>
      <div class="stat"><span class="num">${allData.length - filesWithFindings}</span><span class="label">limpios</span></div>
    </div>
  </div>
  <div class="file-index">
    ${allData.map(({ data }, i) => `
      <a href="#file-${i}" class="file-index-item">
        <span>${esc(data.file || '')}</span>
        <span class="file-index-count">${(data.findings || []).length}</span>
      </a>`).join('')}
  </div>`;

  bodyHtml = allData.map(({ data }, i) => fileSection(data, `file-${i}`)).join('<div class="file-divider"></div>');
  outFile = outputPath || path.join(inputPath, '_informe-src.html');
} else {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  bodyHtml = fileSection(data, 'file-0');
  outFile = outputPath || inputPath.replace(/\.json$/, '') + '.html';
}

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Informe BCQuality</title>
<style>
  :root {
    --surface-0: #f6f5f1; --surface-1: #ffffff; --border: #e5e3db;
    --text-primary: #1c1c1a; --text-secondary: #5f5e5a; --text-muted: #888780; --accent: #0c447c;
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:2.5rem 1.5rem; background:var(--surface-0); font-family:-apple-system,"Segoe UI",Helvetica,Arial,sans-serif; color:var(--text-primary); line-height:1.6; }
  .wrap { max-width:760px; margin:0 auto; }
  .header { background:var(--surface-1); border:1px solid var(--border); border-radius:14px; padding:1.5rem 1.75rem; margin-bottom:1rem; }
  .header-top { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; }
  .header h1 { font-size:19px; font-weight:600; margin:0 0 4px; word-break:break-word; }
  .header .subtitle { font-size:13px; color:var(--text-secondary); margin:0; }
  .outcome-pill { font-size:12px; font-weight:600; padding:5px 12px; border-radius:999px; background:#eaf3de; color:#27500a; white-space:nowrap; }
  .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-top:1.25rem; }
  .stat { background:var(--surface-0); border-radius:10px; padding:0.7rem 0.85rem; }
  .stat .num { font-size:22px; font-weight:600; display:block; }
  .stat .label { font-size:12px; color:var(--text-secondary); }
  .file-index { background:var(--surface-1); border:1px solid var(--border); border-radius:14px; padding:0.5rem; margin-bottom:1.5rem; }
  .file-index-item { display:flex; justify-content:space-between; align-items:center; padding:0.55rem 0.85rem; border-radius:8px; text-decoration:none; color:var(--text-primary); font-size:13px; }
  .file-index-item:hover { background:var(--surface-0); }
  .file-index-count { font-size:11px; font-weight:600; color:var(--text-secondary); background:var(--surface-0); border:1px solid var(--border); border-radius:999px; padding:1px 8px; }
  .file-divider { height:1.5rem; }
  .domain-section { margin-bottom:1.5rem; }
  .domain-section h3 { font-size:14px; font-weight:600; text-transform:lowercase; margin:0 0 0.6rem; display:flex; align-items:center; gap:6px; }
  .domain-section .count { font-size:11px; font-weight:600; color:var(--text-secondary); background:var(--surface-1); border:1px solid var(--border); border-radius:999px; padding:1px 8px; margin-left:2px; }
  .finding { background:var(--surface-1); border:1px solid var(--border); border-radius:10px; padding:0.85rem 1rem; margin-bottom:8px; }
  .finding-head { display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; }
  .finding-domain { font-size:12px; font-weight:600; color:var(--text-secondary); }
  .badge { font-size:11px; font-weight:600; padding:3px 9px; border-radius:6px; white-space:nowrap; }
  .badge-agent { background:var(--surface-0); color:var(--text-secondary); }
  .finding-summary { font-size:14px; margin:8px 0 6px; }
  .finding-summary.muted { color:var(--text-secondary); font-style:italic; }
  .finding-refs { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
  .finding-refs code { font-size:11.5px; background:var(--surface-0); border:1px solid var(--border); border-radius:5px; padding:2px 7px; color:var(--accent); font-family:"SFMono-Regular",Consolas,monospace; }
  .finding-muted { opacity:0.85; }
  .suppressed-section h3 { color:var(--text-secondary); }
  .footer { text-align:center; font-size:12px; color:var(--text-muted); margin-top:2rem; }
</style>
</head>
<body>
<div class="wrap">
  ${overviewHtml}
  ${bodyHtml}
  <p class="footer">Generado a partir de la salida de bcquality-reviewer &middot; microsoft/BCQuality</p>
</div>
</body>
</html>`;

fs.writeFileSync(outFile, html, 'utf8');
console.log(`Informe generado: ${outFile}`);
