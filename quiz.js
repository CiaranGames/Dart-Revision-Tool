let QUIZ = [];
const STORAGE_KEY = 'dart-quiz-v2';


// pData.q[i] = { streak, due, seen, cor } — streak: consecutive correct sessions; due: next-due timestamp (ms)
let pData;

function loadPData() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : { q:{} }; }
  catch(e) { return { q:{} }; }
}

function savePData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pData)); } catch(e) {}
}

function qd(i) {
  if (!pData.q[i]) pData.q[i] = { streak:0, due:0, seen:0, cor:0 };
  return pData.q[i];
}

const MASTERY = 3;
const SR_DAYS = [0, 1, 3, 7, 14, 30]; // day interval indexed by streak

function srMs(streak) {
  return (SR_DAYS[Math.min(streak, SR_DAYS.length-1)] || 0) * 864e5;
}

let queue          = [];
let qPos           = 0;
let retryPool      = [];
let passNum        = 0;    // 0 = first pass, 1+ = retry rounds
let sessionAnswers = {};   // qi → {selected, correct, confidence}
let pendingSelection = [];
let sessionDone    = false;
let reviewing      = false;
let reviewList     = [];
let reviewPos      = 0;
let mode           = null; // 'practice' | 'test' | null

function isMulti(q) { return q.correct.length > 1; }

function arrayEqual(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort(), sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function shuffle(arr) {
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function letterToIndex(l) { return l.toUpperCase().charCodeAt(0) - 65; }

function normalizeQuestion(q, i, explanations) {
  const exp = explanations[i] || {};
  return {
    question: q.question,
    choices: q.choices,
    correct: (q.correct_choices || []).map(letterToIndex),
    explanation: exp.explanation || '',
    example: exp.example || '',
  };
}

function startSession() {
  const now = Date.now();
  const all = QUIZ.map((_,i) => i);
  const overdue = shuffle(all.filter(i => now >= qd(i).due));
  const notDue  = all.filter(i => now < qd(i).due).sort((a,b) => qd(a).due - qd(b).due);
  queue = [...overdue, ...notDue];
  qPos = 0; retryPool = []; passNum = 0;
  sessionAnswers = {}; pendingSelection = [];
  sessionDone = false; reviewing = false;
}

function currentQI() { return queue[qPos]; }

function submit(confidence) {
  const qi = currentQI();
  const correct = arrayEqual(pendingSelection, QUIZ[qi].correct);
  sessionAnswers[qi] = { selected: [...pendingSelection], correct, confidence };
  if (mode === 'practice' && !correct) retryPool.push(qi);
  pendingSelection = [];
  if (mode === 'test') advance();
  else render();
}

function advance() {
  qPos++;
  if (qPos >= queue.length) {
    if (retryPool.length > 0) {
      // Certain-but-wrong questions go first in retry rounds
      passNum++;
      const certWrong = retryPool.filter(i => sessionAnswers[i]?.confidence === 'certain');
      const rest      = retryPool.filter(i => sessionAnswers[i]?.confidence !== 'certain');
      queue = [...shuffle(certWrong), ...shuffle(rest)];
      retryPool = [];
      qPos = 0;
      queue.forEach(qi => { delete sessionAnswers[qi]; });
    } else {
      endSession();
      return;
    }
  }
  pendingSelection = [];
  render();
}

function endSession() {
  sessionDone = true;
  const now = Date.now();
  QUIZ.forEach((_, i) => {
    const ans = sessionAnswers[i];
    if (!ans) return;
    const d = qd(i);
    d.seen++;
    if (ans.correct) { d.cor++; d.streak++; }
    else              { d.streak = 0; }
    d.due = now + srMs(d.streak);
  });
  savePData();
  render();
}

function render() {
  renderStrip();
  renderMeta();
  if (!QUIZ.length) return;
  const main = document.getElementById('main');
  if (!mode)                     { renderModeSelect(main); return; }
  if (sessionDone && !reviewing) renderSummary(main);
  else if (reviewing)            renderReview(main);
  else                           renderQuestion(main);
  highlightCode();
}

function renderModeSelect(main) {
  main.innerHTML = `<div class="card mode-select-card">
    <div class="mode-select-title">Choose your mode</div>
    <div class="mode-options">
      <div class="mode-card" id="pick-practice">
        <div class="mode-card-name">Practice</div>
        <div class="mode-card-tag">Spaced repetition</div>
        <div class="mode-card-desc">See feedback and the correct answer after each question. Rate your confidence to schedule reviews.</div>
      </div>
      <div class="mode-card mode-test" id="pick-test">
        <div class="mode-card-name">Test</div>
        <div class="mode-card-tag">Exam conditions</div>
        <div class="mode-card-desc">No feedback until you finish. See your score and review all answers at the end.</div>
      </div>
    </div>
  </div>`;
  main.querySelector('#pick-practice').onclick = () => { mode = 'practice'; startSession(); render(); };
  main.querySelector('#pick-test').onclick     = () => { mode = 'test';     startSession(); render(); };
}

function renderStrip() {
  const strip = document.getElementById('strip');
  strip.innerHTML = '';

  if (mode === 'test') {
    queue.forEach((qi, pos) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (sessionDone) {
        const ans = sessionAnswers[qi];
        if (ans) cell.classList.add(ans.correct ? 'correct' : 'wrong');
      } else if (pos === qPos) {
        cell.classList.add('current');
      }
      cell.title = `Q${pos + 1}`;
      strip.appendChild(cell);
    });
    return;
  }

  const curQI = queue.length && !sessionDone ? currentQI() : -1;
  QUIZ.forEach((_, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const ans = sessionAnswers[i];
    const d   = qd(i);
    if (ans) {
      cell.classList.add(ans.correct ? 'correct' : 'wrong');
    } else if (d.streak >= MASTERY) {
      cell.classList.add('mastered');
    } else if (d.streak > 0) {
      cell.classList.add('partial');
    }
    if (i === curQI) cell.classList.add('current');
    cell.title = `Q${i+1} · streak ${d.streak}`;
    strip.appendChild(cell);
  });
}

function renderMeta() {
  const mastered       = QUIZ.filter((_, i) => qd(i).streak >= MASTERY).length;
  const sessionVals    = Object.values(sessionAnswers);
  const sessionCorrect = sessionVals.filter(a => a.correct).length;
  const sessionTotal   = sessionVals.length;
  const phaseTag       = passNum > 0 ? ` · RETRY ${passNum}` : '';
  const modePill       = mode ? `<span class="mode-pill ${mode}">${mode}</span>` : '';
  let sessionLine;
  if (!sessionTotal) {
    sessionLine = mode ? 'NEW SESSION' : 'SELECT A MODE';
  } else if (mode === 'test' && !sessionDone) {
    sessionLine = `<b>${sessionTotal}</b> / ${queue.length} ANSWERED`;
  } else {
    sessionLine = `<b>${sessionCorrect}</b> / ${sessionTotal} SESSION${phaseTag}`;
  }
  document.getElementById('meta').innerHTML =
    `<b>${mastered}</b> / ${QUIZ.length} MASTERED${modePill}<br>${sessionLine}`;
}

function renderQuestion(main) {
  const qi   = currentQI();
  const q    = QUIZ[qi];
  const ans  = sessionAnswers[qi];
  const multi = isMulti(q);
  const d    = qd(qi);

  let choicesHtml = '';
  q.choices.forEach((c, idx) => {
    const letter = String.fromCharCode(65 + idx);
    let cls = 'choice';
    if (ans) {
      cls += ' locked';
      if (q.correct.includes(idx))                                cls += ' correct-answer';
      if (ans.selected.includes(idx) && !q.correct.includes(idx)) cls += ' wrong-answer';
    } else if (pendingSelection.includes(idx)) {
      cls += ' selected';
    }
    choicesHtml += `<div class="${cls}" data-idx="${idx}">
      <div class="letter">${letter}</div>
      <div class="text">${formatText(c)}</div>
    </div>`;
  });

  let feedbackHtml = '';
  if (ans && mode === 'practice') {
    const correctLetters  = q.correct.map(c => String.fromCharCode(65 + c)).join(', ');
    const selectedLetters = ans.selected.map(c => String.fromCharCode(65 + c)).join(', ') || '—';
    const certWrong = !ans.correct && ans.confidence === 'certain';
    const exHtml = q.example
      ? `<div class="example-block"><div class="example-label">Example</div><pre><code class="language-dart">${escapeHtml(q.example)}</code></pre></div>`
      : '';
    const verdictHtml = ans.correct
      ? `<div class="verdict">Correct.</div>`
      : `<div class="verdict">Not quite.</div>
         <div class="answer-compare">
           <span class="ans-yours">You chose: <b>${selectedLetters}</b></span>
           <span class="ans-correct">Correct: <b>${correctLetters}</b></span>
         </div>`;
    feedbackHtml = `<div class="feedback show ${ans.correct ? 'right' : 'wrong'}">
      ${certWrong ? '<div class="certain-wrong">You were certain — pay close attention to this one.</div>' : ''}
      ${verdictHtml}
      <div class="explain">${formatText(q.explanation)}</div>
      ${exHtml}
    </div>`;
  }

  const hint = multi ? 'Select all that apply' : 'Select an answer';
  let controlsHtml = '';
  if (ans && mode === 'practice') {
    const isLast = qPos === queue.length - 1 && retryPool.length === 0;
    controlsHtml = `<div class="controls"><button id="next-btn">${isLast ? 'Finish →' : 'Next →'}</button></div>`;
  } else if (mode === 'test') {
    const isLast = qPos === queue.length - 1;
    controlsHtml = pendingSelection.length > 0
      ? `<div class="controls"><button id="test-next-btn">${isLast ? 'Finish →' : 'Next →'}</button></div>`
      : `<div class="controls"><button disabled>${hint}</button></div>`;
  } else if (pendingSelection.length > 0) {
    controlsHtml = `<div class="confidence-bar">
      <span class="conf-label">How confident?</span>
      <button class="conf-btn" data-conf="unsure">Not sure</button>
      <button class="conf-btn" data-conf="sure">Pretty sure</button>
      <button class="conf-btn conf-certain" data-conf="certain">Certain</button>
    </div>`;
  } else {
    controlsHtml = `<div class="controls"><button disabled>${hint}</button></div>`;
  }

  const streakBadge = d.streak > 0
    ? `<span class="streak-pill ${d.streak >= MASTERY ? 'mastered-pill' : ''}">★ ${d.streak >= MASTERY ? 'Mastered' : `${d.streak}/${MASTERY}`}</span>`
    : '';
  const badge = multi
    ? `<span class="badge multi">SELECT ALL</span>`
    : `<span class="badge">SINGLE ANSWER</span>`;
  const retryBanner = passNum > 0
    ? `<div class="retry-banner">Retry round ${passNum} — questions you missed</div>`
    : '';

  main.innerHTML = `<div class="card">
    ${retryBanner}
    <div class="qnum">
      <span>Question ${qPos + 1} of ${queue.length}</span>
      <div style="display:flex;gap:8px;align-items:center">${streakBadge}${badge}</div>
    </div>
    <div class="question-text">${formatText(q.question)}</div>
    <div class="choices">${choicesHtml}</div>
    ${feedbackHtml}
    ${controlsHtml}
  </div>`;

  if (!ans || mode === 'test') {
    main.querySelectorAll('.choice:not(.locked)').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.dataset.idx);
        if (multi) {
          if (pendingSelection.includes(idx)) pendingSelection = pendingSelection.filter(x => x !== idx);
          else pendingSelection.push(idx);
        } else {
          pendingSelection = [idx];
        }
        render();
      };
    });
    const testBtn = main.querySelector('#test-next-btn');
    if (testBtn) testBtn.onclick = () => submit(null);
    main.querySelectorAll('.conf-btn').forEach(btn => {
      btn.onclick = () => submit(btn.dataset.conf);
    });
  }
  const nextBtn = main.querySelector('#next-btn');
  if (nextBtn) nextBtn.onclick = advance;
}

function renderSummary(main) {
  const sessionVals    = Object.values(sessionAnswers);
  const sessionCorrect = sessionVals.filter(a => a.correct).length;
  const sessionTotal   = sessionVals.length;
  const mastered       = QUIZ.filter((_, i) => qd(i).streak >= MASTERY).length;
  const certWrongCount = sessionVals.filter(a => !a.correct && a.confidence === 'certain').length;
  const scoreLabel     = mode === 'test' ? 'Final score' : 'First-pass score';

  main.innerHTML = `<div class="card summary">
    <div class="score">${sessionCorrect}<span class="denom">/${sessionTotal}</span></div>
    <div class="label">${scoreLabel}</div>
    <div class="summary-stats">
      <div class="stat">
        <span class="stat-n">${mastered}</span><span class="stat-d">/${QUIZ.length}</span>
        <span class="stat-l">Mastered</span>
      </div>
      ${mode === 'practice' && certWrongCount ? `<div class="stat stat-warn">
        <span class="stat-n">${certWrongCount}</span><span class="stat-d"></span>
        <span class="stat-l">Certain but wrong</span>
      </div>` : ''}
    </div>
    <div class="actions">
      <button id="review-btn">${mode === 'test' ? 'See answers →' : 'Review session'}</button>
      <button class="secondary" id="new-session">New session</button>
      <button class="ghost" id="reset-all">Reset everything</button>
    </div>
  </div>`;

  main.querySelector('#review-btn').onclick = () => {
    reviewList = Object.keys(sessionAnswers).map(Number).sort((a, b) => a - b);
    reviewPos  = 0;
    reviewing  = true;
    render();
  };
  main.querySelector('#new-session').onclick = () => { mode = null; render(); };
  main.querySelector('#reset-all').onclick = () => {
    if (confirm('Clear all progress and start over?')) {
      pData = { q:{} }; savePData(); mode = null; render();
    }
  };
}

function renderReview(main) {
  if (reviewPos < 0 || reviewPos >= reviewList.length) {
    reviewing = false; render(); return;
  }
  const qi  = reviewList[reviewPos];
  const q   = QUIZ[qi];
  const ans = sessionAnswers[qi];

  let choicesHtml = '';
  q.choices.forEach((c, idx) => {
    let cls = 'choice locked';
    if (q.correct.includes(idx))                                cls += ' correct-answer';
    if (ans.selected.includes(idx) && !q.correct.includes(idx)) cls += ' wrong-answer';
    choicesHtml += `<div class="${cls}">
      <div class="letter">${String.fromCharCode(65 + idx)}</div>
      <div class="text">${formatText(c)}</div>
    </div>`;
  });

  const correctLetters  = q.correct.map(c => String.fromCharCode(65 + c)).join(', ');
  const selectedLetters = ans.selected.map(c => String.fromCharCode(65 + c)).join(', ') || '—';
  const exHtml = q.example
    ? `<div class="example-block"><div class="example-label">Example</div><pre><code class="language-dart">${escapeHtml(q.example)}</code></pre></div>`
    : '';
  const revVerdictHtml = ans.correct
    ? `<div class="verdict">Correct.</div>`
    : `<div class="verdict">Not quite.</div>
       <div class="answer-compare">
         <span class="ans-yours">You chose: <b>${selectedLetters}</b></span>
         <span class="ans-correct">Correct: <b>${correctLetters}</b></span>
       </div>`;

  main.innerHTML = `<div class="card">
    <div class="qnum">
      <span>Review ${reviewPos + 1} of ${reviewList.length}</span>
      <span class="badge ${ans.correct ? '' : 'multi'}">${ans.correct ? 'CORRECT' : 'WRONG'}</span>
    </div>
    <div class="question-text">${formatText(q.question)}</div>
    <div class="choices">${choicesHtml}</div>
    <div class="feedback show ${ans.correct ? 'right' : 'wrong'}">
      ${revVerdictHtml}
      <div class="explain">${formatText(q.explanation)}</div>
      ${exHtml}
    </div>
    <div class="controls">
      <button class="secondary" id="rev-prev" ${reviewPos === 0 ? 'disabled' : ''}>← Prev</button>
      <button id="rev-next">${reviewPos === reviewList.length - 1 ? 'Done' : 'Next →'}</button>
    </div>
  </div>`;

  main.querySelector('#rev-prev').onclick = () => { reviewPos--; render(); };
  main.querySelector('#rev-next').onclick = () => {
    if (reviewPos === reviewList.length - 1) { reviewing = false; render(); }
    else { reviewPos++; render(); }
  };
}

function formatText(text) {
  if (!text) return '';
  const parts = text.split(/(```\w*\n[\s\S]*?```)/g);
  return parts.map(part => {
    const fence = part.match(/^```(\w*)\n([\s\S]*?)```$/);
    if (fence) {
      const lang = fence[1];
      const code = fence[2].replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').trimEnd();
      const cls = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${cls}>${code}</code></pre>`;
    }
    let out = part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    out = out.replace(/\n/g, '<br>');
    return out;
  }).join('');
}

function highlightCode() {
  if (typeof hljs === 'undefined') return;
  document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
}

function escapeHtml(text) {
  return (text || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (reviewing) {
    if (e.key === 'ArrowLeft')  { const b = document.getElementById('rev-prev'); if (b && !b.disabled) b.click(); }
    if (e.key === 'ArrowRight' || e.key === 'Enter') { const b = document.getElementById('rev-next'); if (b) b.click(); }
    return;
  }

  if (sessionDone) return;

  const qi  = currentQI();
  const q   = QUIZ[qi];
  const ans = sessionAnswers[qi];

  if (e.key === 'Enter') {
    const nb = document.getElementById('next-btn') || document.getElementById('test-next-btn');
    if (nb && !nb.disabled) { nb.click(); return; }
  }

  if (/^[1-9]$/.test(e.key) && !ans) {
    const idx = parseInt(e.key) - 1;
    if (q && idx < q.choices.length) {
      const el = document.querySelector(`.choice[data-idx="${idx}"]`);
      if (el) el.click();
    }
  }
});

pData = loadPData();
Promise.all([
  fetch('public_quiz_data.json').then(r => r.json()),
  fetch('explanations.json').then(r => r.json()),
]).then(([questions, explanations]) => {
  QUIZ = questions.map((q, i) => normalizeQuestion(q, i, explanations));
  render();
});
