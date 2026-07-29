/* Motor dos Exercícios Tabletop · Ciclo do Negócio de Cibersegurança
   Data-driven: cada página define const EX = {...} e inclui este ficheiro.
   Adaptado dos exercícios do NCSC Exercise in a Box (UK Crown Copyright). */
(function () {
  'use strict';
  const ESCALA = ['Nada confiantes', 'Pouco confiantes', 'Algo confiantes', 'Bastante confiantes', 'Totalmente confiantes'];
  const CHAVE = 'tt_' + EX.id;
  const FECHO = [
    'O que aprendemos ao correr este exercício?',
    'O que mudou na forma como entendemos (e prevenimos) esta ameaça?',
    'O que vamos mudar ou implementar na organização — e quem fica responsável?'
  ];

  let S = { passo: 0, resp: {}, notas: {}, fecho: {} };
  try { const g = JSON.parse(localStorage.getItem(CHAVE)); if (g && typeof g === 'object') S = Object.assign(S, g); } catch (e) {}
  const guardar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(S)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = id => document.getElementById(id);

  // passos: 0 = capa · 1..N = injects · N+1 = relatório
  const N = EX.injects.length;

  function barra() {
    const pct = Math.round(S.passo / (N + 1) * 100);
    let passos = '';
    for (let i = 0; i <= N + 1; i++) {
      const rot = i === 0 ? 'Briefing' : (i <= N ? 'Inject ' + i : 'Relatório');
      passos += `<span class="tt-passo ${i === S.passo ? 'ativo' : ''} ${i < S.passo ? 'feito' : ''}" data-p="${i}">${rot}</span>`;
    }
    return `<div class="tt-passos">${passos}</div><div class="tt-barra"><i style="width:${pct}%"></i></div>`;
  }

  function renderCapa() {
    return `
    <div class="tt-cartao">
      <p class="tt-origem">🇬🇧 Adaptado do exercício <em>${esc(EX.origem)}</em> do NCSC «Exercise in a Box» (UK Crown Copyright) — tradução livre e cenário fictício EnerVale. ${EX.tempo} · discussão em grupo, sem respostas certas.</p>
      <h2>O cenário</h2>
      <p>${EX.cenario}</p>
      <h2>Objetivos</h2>
      <ul>${EX.objetivos.map(o => `<li>${o}</li>`).join('')}</ul>
      <h2>Quem deve estar à mesa</h2>
      <ul>${EX.papeis.map(p => `<li><b>${esc(p.p)}</b> — ${p.d}</li>`).join('')}</ul>
      <h2>As regras do jogo (princípios NCSC)</h2>
      <ul>
        <li>Ambiente <b>sem culpa</b>: isto não é um teste a pessoas nem a departamentos — um «mau» resultado é apenas uma ação de melhoria.</li>
        <li>Não há agendas escondidas nem perguntas com rasteira; o cenário é fictício, mas a ameaça é realista.</li>
        <li>O <b>escriba</b> regista as decisões e as notas (há um campo em cada inject — e tudo se exporta no fim).</li>
        <li>Valida depois as assunções feitas durante o exercício («temos a certeza de que o backup é offline?»).</li>
      </ul>
      ${EX.fundo && EX.fundo.length ? `<h2>Contexto útil (2 minutos antes de começar)</h2>${EX.fundo.map(f => `<details class="tt-fundo"><summary>${esc(f.t)}</summary><p>${f.d}</p></details>`).join('')}` : ''}
      <div class="tt-nav"><span></span><button class="botao" id="ttAvancar">Começar → Inject 1</button></div>
    </div>`;
  }

  function renderInject(i) {
    const inj = EX.injects[i - 1];
    const pontos = inj.pontos.map((p, k) => `
      <div class="tt-ponto">
        <p><b>💬 ${k + 1}.</b> ${p.q}</p>
        ${p.sub && p.sub.length ? `<details class="tt-sub"><summary>Para aprofundar a conversa</summary><ul>${p.sub.map(s => `<li>${s}</li>`).join('')}</ul></details>` : ''}
      </div>`).join('');
    const obs = inj.obs.map((o, k) => {
      const chave = (i - 1) + '-' + k;
      const val = S.resp[chave];
      return `<div class="tt-obs">
        <p>«${o.t}»</p>
        <div class="tt-escala" data-obs="${chave}">
          ${ESCALA.map((rot, n) => `<button type="button" class="tt-nota ${val === n + 1 ? 'sel' : ''}" data-n="${n + 1}" title="${rot}">${n + 1}</button>`).join('')}
          <span class="tt-rotulo">${val ? val + ' · ' + ESCALA[val - 1] : 'por classificar'}</span>
        </div>
      </div>`;
    }).join('');
    return `
    <div class="tt-cartao">
      <h2>${esc(inj.t)}</h2>
      <div class="tt-narrativa">${inj.nar}</div>
      ${inj.guia ? `<details class="tt-guia"><summary>🧭 Nota para quem facilita</summary><p>${inj.guia}</p></details>` : ''}
      <h3>Pontos de discussão</h3>
      ${pontos}
      ${inj.regua ? `<div class="tt-regua">${inj.regua}</div>` : ''}
      <h3>No fim da conversa: quão confiantes estamos?</h3>
      <p class="tt-mini">Discutam cada afirmação e classifiquem-na em grupo — 1 (nada confiantes) a 5 (totalmente confiantes). É esta régua que constrói o relatório final.</p>
      ${obs}
      <label class="tt-lbl" for="ttNotas">📝 Notas do escriba (decisões, divergências, assunções a validar)</label>
      <textarea id="ttNotas" rows="3" placeholder="ex.: assumimos que o contacto de emergência está atualizado — confirmar com as compras">${esc(S.notas[i - 1] || '')}</textarea>
      <div class="tt-nav">
        <button class="botao sec" id="ttRecuar">← Anterior</button>
        <button class="botao" id="ttAvancar">${i < N ? 'Inject ' + (i + 1) + ' →' : 'Fechar e ver o relatório →'}</button>
      </div>
    </div>`;
  }

  function medias() {
    return EX.injects.map((inj, i) => {
      const ns = inj.obs.map((_, k) => S.resp[i + '-' + k]).filter(Boolean);
      return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null;
    });
  }

  function renderRelatorio() {
    const ms = medias();
    const respondidas = Object.keys(S.resp).length;
    const total = EX.injects.reduce((a, inj) => a + inj.obs.length, 0);
    const globais = ms.filter(m => m !== null);
    const media = globais.length ? (globais.reduce((a, b) => a + b, 0) / globais.length) : null;
    let fraco = -1; let menor = 9;
    ms.forEach((m, i) => { if (m !== null && m < menor) { menor = m; fraco = i; } });

    const linhas = EX.injects.map((inj, i) => {
      const m = ms[i];
      const cor = m === null ? '#ccc' : m < 2.5 ? 'var(--erro)' : m < 3.75 ? 'var(--amarelo)' : 'var(--ok)';
      return `<div class="tt-res"><span class="tt-res-rot">${esc(inj.t.split('·')[1] ? inj.t.split('·')[1].trim() : inj.t)}</span>
        <div class="tt-res-barra"><i style="width:${m ? m / 5 * 100 : 0}%; background:${cor}"></i></div>
        <b>${m ? m.toFixed(1) : '—'}</b></div>`;
    }).join('');

    const recs = [];
    EX.injects.forEach((inj, i) => inj.obs.forEach((o, k) => {
      const n = S.resp[i + '-' + k];
      if (n && n <= 3 && o.rec) recs.push({ n, o });
    }));
    recs.sort((a, b) => a.n - b.n);
    const recHtml = recs.length
      ? recs.map(r => `<li><span class="tt-pill n${r.n}">${r.n}</span> <b>«${r.o.t}»</b><br>${r.o.rec}${r.o.link ? ` → <a href="${r.o.link}"><b>${esc(r.o.linkTxt || 'instrumento')}</b></a>` : ''}</li>`).join('')
      : '<li>Sem áreas fracas assinaladas (nota ≤ 3). Ou o programa está maduro — ou a conversa foi simpática de mais. O NCSC recomenda repetir o exercício depois de implementar as melhorias. 😉</li>';

    return `
    <div class="tt-cartao">
      <h2>📋 Relatório do exercício</h2>
      <p class="tt-mini">${respondidas}/${total} afirmações classificadas${media ? ` · confiança global <b>${media.toFixed(1)}/5</b>` : ''}${fraco >= 0 ? ` · elo mais fraco: <b>${esc(EX.injects[fraco].t)}</b>` : ''}</p>
      ${linhas}
      <h3>Recomendações — onde a confiança foi ≤ 3</h3>
      <p class="tt-mini">Método NCSC: atribui cada recomendação a quem pode executá-la, discute o risco de não a fazer, implementa — e volta a correr o exercício para medir a diferença.</p>
      <ul class="tt-recs">${recHtml}</ul>
      <h3>Fecho da discussão (o escriba regista)</h3>
      ${FECHO.map((q, k) => `<label class="tt-lbl">${q}</label><textarea data-fecho="${k}" rows="2">${esc(S.fecho[k] || '')}</textarea>`).join('')}
      <div class="tt-nav no-print">
        <button class="botao sec" id="ttRecuar">← Voltar</button>
        <span>
          <button class="botao sec" id="ttCsv">⬇️ Exportar registo (CSV)</button>
          <button class="botao sec" onclick="window.print()">🖨️ Imprimir</button>
          <button class="botao sec" id="ttReset">↺ Recomeçar</button>
        </span>
      </div>
      ${EX.fechoNota ? `<div class="tt-regua" style="margin-top:14px">${EX.fechoNota}</div>` : ''}
    </div>`;
  }

  function csv() {
    const L = [['Exercício', EX.titulo], ['Data', new Date().toLocaleString('pt-PT')], []];
    L.push(['Inject', 'Afirmação', 'Confiança (1-5)', 'Legenda']);
    EX.injects.forEach((inj, i) => inj.obs.forEach((o, k) => {
      const n = S.resp[i + '-' + k];
      L.push([inj.t, o.t, n || '', n ? ESCALA[n - 1] : 'por classificar']);
    }));
    L.push([]); L.push(['Inject', 'Notas do escriba']);
    EX.injects.forEach((inj, i) => { if (S.notas[i]) L.push([inj.t, S.notas[i]]); });
    L.push([]); L.push(['Fecho', 'Resposta']);
    FECHO.forEach((q, k) => { if (S.fecho[k]) L.push([q, S.fecho[k]]); });
    const txt = '﻿' + L.map(l => l.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    a.download = 'Tabletop_' + EX.id + '_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click(); URL.revokeObjectURL(a.href);
  }

  function render() {
    const alvo = $('tt');
    alvo.innerHTML = barra() + (S.passo === 0 ? renderCapa() : S.passo <= N ? renderInject(S.passo) : renderRelatorio());
    window.scrollTo({ top: 0, behavior: 'smooth' });

    alvo.querySelectorAll('.tt-passo').forEach(p => p.addEventListener('click', () => { S.passo = +p.dataset.p; guardar(); render(); }));
    const av = $('ttAvancar'); if (av) av.addEventListener('click', () => { S.passo++; guardar(); render(); });
    const re = $('ttRecuar'); if (re) re.addEventListener('click', () => { S.passo--; guardar(); render(); });

    alvo.querySelectorAll('.tt-escala').forEach(e => e.querySelectorAll('.tt-nota').forEach(b =>
      b.addEventListener('click', () => { S.resp[e.dataset.obs] = +b.dataset.n; guardar(); render(); })));

    const nt = $('ttNotas'); if (nt) nt.addEventListener('input', () => { S.notas[S.passo - 1] = nt.value; guardar(); });
    alvo.querySelectorAll('[data-fecho]').forEach(t => t.addEventListener('input', () => { S.fecho[t.dataset.fecho] = t.value; guardar(); }));
    const cv = $('ttCsv'); if (cv) cv.addEventListener('click', csv);
    const rs = $('ttReset'); if (rs) rs.addEventListener('click', () => {
      if (confirm('Apagar as classificações e notas deste exercício neste browser?')) { S = { passo: 0, resp: {}, notas: {}, fecho: {} }; guardar(); render(); }
    });
  }
  document.addEventListener('DOMContentLoaded', render);
})();
