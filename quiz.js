let QUIZ = [];
const STORAGE_KEY = 'dart-quiz-v2';

// Explanations live here, not in the JSON, so the JSON can be freely replaced.
// Order must match public_quiz_data.json.
const EXPLANATIONS = [
  {
    explanation: "A traceback typically shows the file path where the error occurred, the line number, and the exception/error type. Language version isn't part of a traceback, and syntax errors are one type of exception, not a separate element.",
    example: "Unhandled exception:\nFormatException: Invalid radix-10 number (at character 1)\nhello\n^\n\n#0      int._throwFormatException (dart:core-patch/integers_patch.dart:131:5)\n#1      int._parseRadix (dart:core-patch/integers_patch.dart:142:16)\n#2      int.parse (dart:core-patch/integers_patch.dart:107:12)\n#3      main (file:///home/you/project/bin/app.dart:4:19)\n\n# File path: bin/app.dart\n# Line number: 4\n# Exception: FormatException"
  },
  {
    explanation: "'Stepping over' executes the current line in full and moves to the next line, without going inside any function calls. 'Stepping into' is what enters a function.",
    example: "void main() {\n  int a = 5;\n  int b = greet(a);  // <-- breakpoint here\n  print(b);\n}\n\nint greet(int x) {\n  print('hi');\n  return x * 2;\n}\n\n// 'Step over' on line 3: runs greet() to completion,\n//   stops on `print(b);` — you don't see inside greet.\n// 'Step into' on line 3: jumps INTO greet, stops on `print('hi');`"
  },
  {
    explanation: "Dart files don't *all* need a main function (only entry-point files do), and Dart uses ${} for interpolating expressions but allows bare $varName for simple variables — so 'no need for {}' is true for variables. Statement A confuses static typing with overflow checking.",
    example: ""
  },
  {
    explanation: "Interpreted languages need an interpreter at runtime (A), are generally slower than compiled (B), and are often used for scripting (D). They CAN be used cross-platform, and many interpreted languages (TypeScript, Python with hints) do allow specifying types.",
    example: "// Compiled (Dart):           // Interpreted (Python):\n// $ dart compile exe app.dart   $ python app.py\n// $ ./app.exe                   # interpreter reads + runs each line\n//\n// Compiled = translate once, run the binary.\n// Interpreted = need the interpreter every time you run."
  },
  {
    explanation: "Dart can compile to JavaScript or to native machine code, with no interpreter needed. The other statements are wrong: compiled build steps are slower than interpreted, compiled code runs via the OS but isn't 'directly executed' in the way described, and line-by-line translation is interpretation.",
    example: ""
  },
  {
    explanation: "Only `String name = 'Ayodeji';` is correct. `string` (lowercase) isn't a type, `Ayodeji` without quotes is treated as an identifier, the fourth omits the type/var keyword, and `==` is comparison not assignment.",
    example: "String name = 'Ayodeji';     // ✓ explicit type\nvar name = 'Ayodeji';        // ✓ inferred (with quotes!)\nfinal name = 'Ayodeji';      // ✓ inferred + can't reassign\n\nstring name = 'Ayodeji';     // ✗ 'string' lowercase isn't a type\nvar name = Ayodeji;          // ✗ no quotes — treated as identifier\nString name == 'Ayodeji';    // ✗ == is comparison, not assignment"
  },
  {
    explanation: "In Dart, `$$` produces a literal `$`, and `${price * amount}` evaluates to `7.0`. So the output is `Total: $7.0`.",
    example: ""
  },
  {
    explanation: "`a ~/= b` is integer division: 9 ~/ 2 = 4, so a = 4. Then b += a means b = 2 + 4 = 6. Finally a * b = 4 * 6 = 24.",
    example: ""
  },
  {
    explanation: "`greet` returns `double.parse(...)` → double (A ✓). `getANumber` returns `stdin.readLineSync()` which is `String?` (nullable), not plain String (B ✗). `checkEven` returns a bool comparison (C ✓). `printName` doesn't return anything — it's void (D ✗). `divideNumbers` uses `/` which always returns `double` in Dart, not int (E ✗). `sqrt` returns double (F ✓).",
    example: ""
  },
  {
    explanation: "`void` does mark non-returning functions (A ✓). While loops can iterate any number of times — known or unknown (B ✗). Null safety prevents accidental null variables (C ✓). Switch cases can fall through / be combined (D ✓). Curly braces around parameters define named parameters (E ✓).",
    example: "// Multiple cases at once in switch:\nswitch (day) {\n  case 'Sat':\n  case 'Sun':\n    print('Weekend!');\n    break;\n  default:\n    print('Weekday');\n}\n\n// Named parameters with {}:\nvoid greet({String name = 'friend', int age = 0}) {\n  print('Hi $name, age $age');\n}\ngreet(name: 'Aya', age: 30);"
  },
  {
    explanation: "`greet()` won't compile because `name` is a required positional parameter. `greet(3)` won't compile because 3 isn't a String?. `greet('')` prints \"Hello, !\" — empty string isn't null, so the ?? doesn't kick in. Only `greet(null)` and `greet(\"Aya\")` work as described.",
    example: ""
  },
  {
    explanation: "`List<String> arguments` in main lets you receive command-line arguments as a list of strings when running the Dart program from the terminal.",
    example: "// In your_program.dart:\nvoid main(List<String> arguments) {\n  print('You passed: $arguments');\n}\n\n// From the terminal:\n// $ dart run your_program.dart hello world 42\n// You passed: [hello, world, 42]"
  },
  {
    explanation: "Arrow functions can only contain a single expression. A is just one statement (`print(5)`) ✓. B is a single return expression ✓. C has two statements. D and E both declare a local variable before returning, which arrow syntax can't express.",
    example: ""
  },
  {
    explanation: "12 > 21 is false, and 12 < 21 is true, so we enter the else-if branch. Inside: x != 10 is true (12 ≠ 10) but y == 20 is false (y is 21), so the && is false. We hit the inner else and print 3.",
    example: ""
  },
  {
    explanation: "Iterations: a=10 → 8, 8 → 6, 6 → 4. Now 4 > 5 is false, loop exits. Final value: 4.",
    example: ""
  },
  {
    explanation: "We need to print 100, 80, 60, 40, 20 — descending by 20. F starts at 100, condition `i > 0`, decrements by 20: prints 100, 80, 60, 40, 20 then stops (0 fails `> 0`). E would also print 0 because of `>= 0`.",
    example: ""
  },
  {
    explanation: "B is correct: assigning `l[x] = '😍'` where x isn't an existing key creates a new entry. F is correct: Dart's Set preserves insertion order. List elements can be modified at runtime regardless of compile time. `List<Object>` accepts mixed types fine. `remove` only removes the first occurrence. Inserting at index 1 gives ['🐓', '🐒', '🐄', '🐖'].",
    example: "// Map: assigning a missing key creates an entry\nMap<int, String> l = {1: '😎', 2: '🤩'};\nl[5] = '😍';                    // l is now {1:'😎', 2:'🤩', 5:'😍'}\n\n// List with mixed types via Object — fine!\nList<Object> mixed = [1, 'two', 3.0];   // ✓ no error\n\n// remove() only removes the FIRST occurrence\nList<int> nums = [1, 2, 1, 3];\nnums.remove(1);                  // [2, 1, 3] — second 1 still there\n\n// insert at index 1 shifts the rest right\nList<String> animals = ['🐓', '🐄', '🐖'];\nanimals.insert(1, '🐒');         // ['🐓', '🐒', '🐄', '🐖']"
  },
  {
    explanation: "The first step is splitting on `_` to get the individual words, so you can then process each one (capitalise the first letter of each subsequent word and join them).",
    example: "String snake = 'apples_and_pears';\n\n// Step 1: split on '_'\nList<String> words = snake.split('_');   // ['apples', 'and', 'pears']\n\n// Step 2: capitalise each word after the first\nString camel = words.first +\n    words.skip(1).map((w) =>\n        w[0].toUpperCase() + w.substring(1)).join();\n// camel == 'applesAndPears'"
  },
  {
    explanation: "'Flutter' has indices F=0, l=1, u=2, t=3, t=4, e=5, r=6. `indexOf('t')` returns the FIRST match, which is index 3.",
    example: "String s = 'Flutter';\n//          F l u t t e r\n// index:   0 1 2 3 4 5 6\n\ns.indexOf('t');     // 3 — first match\ns.lastIndexOf('t'); // 4 — last match"
  },
  {
    explanation: "`startsWith`, `endsWith`, and `contains` all check for substrings within a String. `split` breaks a string apart, `join` is a List method, and `substring` extracts a portion by index — none of those locate a substring.",
    example: "String s = 'Hello, Flutter!';\n\ns.startsWith('Hello');    // true\ns.endsWith('!');          // true\ns.contains('Flut');       // true\n\ns.split(',');             // ['Hello', ' Flutter!']  — splits, doesn't locate\ns.substring(7, 14);       // 'Flutter'  — extracts by index, doesn't search"
  },
  {
    explanation: "E is the standard literal syntax. A uses an invalid List constructor, B works but isn't typed (no <String>), C uses Java-style array syntax which doesn't exist in Dart, D misuses List.filled (which takes a length and fill value).",
    example: ""
  },
  {
    explanation: "D is the only correct version. A modifies a local copy (`number` is a new variable). B uses `of` which isn't valid Dart syntax (it's `in`). C uses `<=` which goes one past the end and crashes with a range error.",
    example: ""
  },
  {
    explanation: "Modifying a Set (or List) while iterating over it with a for-in loop throws a ConcurrentModificationError on the next iteration. The first iteration starts fine, but `remove` triggers the error when the loop tries to advance.",
    example: ""
  },
  {
    explanation: "Dart Maps use `remove(key)` to delete an entry by its key. There's no `delete` method, and `remove` only takes one argument (the key).",
    example: "Map<String, int> scores = {'Dhivyah': 90, 'Álvaro': 85};\n\nscores.remove('Álvaro');     // ✓ removes by key\n// scores is now {'Dhivyah': 90}\n\n// scores.delete(...)         ✗ no such method on Map\n// scores.remove(0)           ✗ Maps don't use indices\n// scores.remove('Álvaro', 85) ✗ remove takes ONLY the key"
  },
  {
    explanation: "The condition checks for `'Egg'` (no s), but the map's key is `'Eggs'`. So `containsKey('Egg')` is false and the if-block never runs — nothing is printed.",
    example: ""
  },
  {
    explanation: "B ✓: superclasses are declared with `extends`. C ✓: a class can absolutely hold a List of another class as a field. D ✓: in Dart, `_` makes a member library-private, not class-private — within the same file/library it's accessible. A is wrong: Dart doesn't require `new`. E is wrong: getters/setters in Dart are accessed without parentheses but setters DO take a value parameter.",
    example: "// In Dart, _ makes a member library-private (file-private if it's its own file).\n// Within the SAME file, _password IS accessible from another class:\n\n// user.dart\nclass User {\n  String _password = 'secret';\n}\nclass Admin {\n  void leak(User u) => print(u._password);  // ✓ same library\n}\n\n// extends for inheritance:\nclass Player {}\nclass Goalkeeper extends Player {}\n\n// A class can hold a List of another class:\nclass Team {\n  List<Player> players = [];\n}"
  },
  {
    explanation: "A ✓: positional args provided, memory uses its default. C ✓: named arg `memory:` is correct. B ✗: can't pass memory positionally — it's a named param. D ✗: name and brand are positional, can't use `name:` syntax. E ✗: `phone` (lowercase) isn't a valid type name.",
    example: ""
  },
  {
    explanation: "`3 * 4 = 12.0` because Dart's `*` on doubles produces a double. The default `toString()` of a class without an override returns `Instance of 'Rectangle'`.",
    example: ""
  },
  {
    explanation: "A ✓: `deposit` is public. B ✓: the `balance` getter is public. E ✓: within the same library, `_balance` is accessible. C ✗: there's no setter for `balance`. D ✗: `_balance` is library-private and can't be accessed from main.dart since they're separate libraries.",
    example: "// lect18.dart  (one library)\nclass BankAccount {\n  String accountNumber;\n  double _balance = 0.0;        // library-private\n  BankAccount(this.accountNumber);\n  double get balance => _balance;  // PUBLIC getter\n}\n\n// main.dart  (different library)\nimport 'lect18.dart';\nvoid main() {\n  var a = BankAccount('123');\n  a.deposit(50);              // ✓ public method\n  print(a.balance);           // ✓ public getter\n  // print(a._balance);       ✗ private to lect18.dart\n  // a.balance = 100;         ✗ no setter defined\n}"
  },
  {
    explanation: "B ✓: all Dogs inherit from Animal AND have their own `bark`. C ✓: Dog defines its own toString that overrides the parent's. D ✓: `super(name)` calls the Animal constructor. A ✗: Dog inherits `name` from Animal — both have it. E ✗: Animal can be instantiated; nothing here makes it abstract.",
    example: ""
  }
];

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

function normalizeQuestion(q, i) {
  const exp = EXPLANATIONS[i] || {};
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
fetch('public_quiz_data.json')
  .then(r => r.json())
  .then(data => {
    QUIZ = data.map(normalizeQuestion);
    render();
  });
