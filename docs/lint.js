// GRL Workshop Linter — orchestration + UI
// Loads N3.js, runs rules, renders findings into the page.

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const H = () => window.GRLLinter.helpers;

  // ---------- N3 parsing ----------
  function parseTurtle(text) {
    return new Promise((resolve, reject) => {
      const store  = new N3.Store();
      const parser = new N3.Parser();
      parser.parse(text, (err, quad) => {
        if (err)   return reject(err);
        if (quad)  store.addQuad(quad);
        else       resolve(store);
      });
    });
  }

  // ---------- Run all rules ----------
  function runRules(store) {
    const meta = {
      ontologyIri:     H().detectOntologyIri(store),
      domainNamespace: H().detectDomainNamespace(store),
    };
    const t0 = performance.now();
    const findings = [];
    for (const rule of window.GRLLinter.rules) {
      try {
        const violations = rule.check(store, meta) || [];
        if (violations.length) {
          findings.push({ rule, violations });
        }
      } catch (e) {
        console.error(`Rule ${rule.id} failed:`, e);
        findings.push({ rule, violations: [{ subject: '', message: 'Rule errored: ' + e.message }] });
      }
    }
    const elapsed = Math.round(performance.now() - t0);
    return { findings, meta, elapsed, ruleCount: window.GRLLinter.rules.length };
  }

  // ---------- Render ----------
  const els = {
    drop:        $('#dropzone'),
    fileInput:   $('#file-input'),
    paste:       $('#paste-area'),
    scanBtn:     $('#scan-btn'),
    cardInput:   $('#input-card'),
    cardScan:    $('#scan-card'),
    cardResult:  $('#result-card'),
    resetBtn:    $('#reset-btn'),
    summary:     $('#summary'),
    scanMeta:    $('#scan-meta'),
    findings:    $('#findings'),
  };

  function show(card) {
    [els.cardInput, els.cardScan, els.cardResult].forEach(c => c.classList.add('hide'));
    card.classList.remove('hide');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function renderResults(report, sourceLabel) {
    const totalViolations = report.findings.reduce((n, f) => n + f.violations.length, 0);
    const bySev = { error: 0, warning: 0, info: 0 };
    report.findings.forEach(f => { bySev[f.rule.severity] = (bySev[f.rule.severity] || 0) + f.violations.length; });

    els.summary.innerHTML = `
      <div class="stat"><div class="k">Source</div><div class="v" style="font-size:18px">${escapeHtml(sourceLabel)}</div></div>
      <div class="stat"><div class="k">Rules run</div><div class="v">${report.ruleCount}</div><div class="delta">${report.elapsed} ms</div></div>
      <div class="stat"><div class="k">Findings</div><div class="v">${totalViolations}</div><div class="delta">${report.findings.length} rule(s) fired</div></div>
      <div class="stat"><div class="k">Severity</div><div class="v" style="font-size:18px">${bySev.warning} ⚠ &nbsp; ${bySev.info} ⓘ</div></div>
    `;

    const ns = report.meta.domainNamespace || '(unknown)';
    const ont = report.meta.ontologyIri || '(none declared)';
    els.scanMeta.innerHTML = `
      <span><b>Detected ontology IRI:</b> ${escapeHtml(ont)}</span>
      <span class="sep">•</span>
      <span><b>Filtering to namespace:</b> ${escapeHtml(ns)}</span>
    `;

    if (report.findings.length === 0) {
      els.findings.innerHTML = `
        <div class="no-findings">
          <div class="ic">✓</div>
          <h3>No findings.</h3>
          <p>The seven workshop rules all passed against this ontology. Nice.</p>
        </div>
      `;
    } else {
      const VISIBLE = 6;
      els.findings.innerHTML = report.findings.map(f => {
        const list = f.violations.map((v, i) => {
          const cls = i >= VISIBLE ? 'iri extra' : 'iri';
          return `<div class="${cls}">${escapeHtml(v.subject || v.message)}</div>`;
        }).join('');
        const hidden = Math.max(0, f.violations.length - VISIBLE);
        const toggle = hidden > 0
          ? `<button type="button" class="more-toggle" data-hidden="${hidden}">+ ${hidden} more</button>`
          : '';
        const ridClass = f.rule.category === 'structural' ? 'rule-id struct' : 'rule-id';
        return `
          <div class="finding">
            <div class="finding-head">
              <span class="severity-dot ${f.rule.severity}"></span>
              <span class="${ridClass}">${escapeHtml(f.rule.id)}</span>
              <span class="rule-name">${escapeHtml(f.rule.name)}</span>
              <span class="rule-count">${f.violations.length} affected</span>
            </div>
            <p class="finding-desc">${escapeHtml(f.rule.blurb)}</p>
            <div class="finding-list">${list}${toggle}</div>
          </div>
        `;
      }).join('');

      // Wire up the expand/collapse toggle on each finding's IRI list
      els.findings.querySelectorAll('.more-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const list = btn.parentElement;
          const expanded = list.classList.toggle('expanded');
          btn.textContent = expanded
            ? '− show fewer'
            : `+ ${btn.dataset.hidden} more`;
        });
      });
    }

    show(els.cardResult);
  }

  function renderError(msg) {
    els.findings.innerHTML = `
      <div class="error-card">
        <h3>Couldn't parse the ontology</h3>
        <pre>${escapeHtml(msg)}</pre>
      </div>
    `;
    els.summary.innerHTML = '';
    els.scanMeta.innerHTML = '';
    show(els.cardResult);
  }

  async function scan(text, label) {
    show(els.cardScan);
    await new Promise(r => setTimeout(r, 250));   // give the spinner a beat
    try {
      const store = await parseTurtle(text);
      const report = runRules(store);
      renderResults(report, label);
    } catch (e) {
      renderError(e.message || String(e));
    }
  }

  // ---------- Wire up UI ----------
  function setup() {
    els.fileInput.addEventListener('change', e => {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => scan(reader.result, f.name);
      reader.readAsText(f);
    });

    els.drop.addEventListener('click', () => els.fileInput.click());

    els.drop.addEventListener('dragover',  e => { e.preventDefault(); els.drop.classList.add('over');    });
    els.drop.addEventListener('dragleave', e => { e.preventDefault(); els.drop.classList.remove('over'); });
    els.drop.addEventListener('drop',      e => {
      e.preventDefault(); els.drop.classList.remove('over');
      const f = e.dataTransfer.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => scan(reader.result, f.name);
      reader.readAsText(f);
    });

    els.scanBtn.addEventListener('click', () => {
      const text = els.paste.value.trim();
      if (!text) return;
      scan(text, 'pasted Turtle');
    });

    els.paste.addEventListener('input', () => {
      els.scanBtn.disabled = !els.paste.value.trim();
    });

    els.resetBtn.addEventListener('click', () => {
      els.paste.value = '';
      els.fileInput.value = '';
      show(els.cardInput);
    });
  }

  document.addEventListener('DOMContentLoaded', setup);
})();
