/*
  Refactored architecture for the project
  Style & UI unchanged
*/


/* ================= ANGLE RELATIONS (CORE MODEL) ================= */

/* ================= ADAPTIVE STATS ================= */
const RelationStats = {};

function recordResult(key, success) {
  if (!RelationStats[key]) RelationStats[key] = { ok: 0, fail: 0 };
  success ? RelationStats[key].ok++ : RelationStats[key].fail++;
}

function weightedPick(keys) {
  const pool = [];
  keys.forEach(k => {
    const s = RelationStats[k];
    const weight = s ? Math.max(1, s.fail - s.ok + 1) : 1;
    for (let i = 0; i < weight; i++) pool.push(k);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

function calculateGrade(correct, total) {
  const percent = correct / total;




  const scale = [
    [0.95, 'A+', 12],
    [0.90, 'A', 11],
    [0.85, 'A-', 10],
    [0.80, 'B+', 9],
    [0.75, 'B', 8],
    [0.70, 'B-', 7],
    [0.65, 'C+', 6],
    [0.55, 'C', 5],
    [0.45, 'C-', 4],
    [0.35, 'D', 3],
    [0.20, 'E', 2],
    [0.0, 'F', 1]
  ];

  function roundForStudent(percent) {
    // Якщо відсоток близький до межі наступного рівня — округлюємо вгору
    const thresholds = scale.map(entry => entry[0]);; // межі рівнів: 4, 6, 9, 12


    for (let threshold of thresholds) {
      if (percent >= threshold - 0.01 && percent < threshold) {
        return threshold; // наприклад, 44.9% → 45%
      }
    }

    return percent;
  }
  const roundedPencent = roundForStudent(percent) || 0;


  return ((scale.find(([p]) => roundedPencent >= p).slice(1)));
}

const AngleRelations = {
  vertical: {
    title: 'Вертикальні кути',
    text: 'Два кути називаються вертикальними, якщо вони утворені при перетині двох прямих і лежать навпроти один одного. Вертикальні кути рівні.',
    rule: 'equal',
    pairs: [['c1', 'c4'], ['c2', 'c3'], ['c5', 'c8'], ['c6', 'c7']]
  },
  adjacent: {
    title: 'Суміжні кути',
    text: 'Два кути називаються суміжними, якщо вони мають спільну сторону, а дві інші сторони є продовженням одна одної. Сума суміжних кутів дорівнює 180°.',

    rule: 'sum180',
    pairs: [['c1', 'c2'], ['c2', 'c4'], ['c3', 'c4'], ['c1', 'c3'], ['c5', 'c6'], ['c6', 'c8'], ['c7', 'c8'], ['c5', 'c7']]
  },
  innerAlt: {
    title: 'Внутрішні різносторонні кути',
    text: 'Кути, що лежать між двома прямими по різні боки січної.',
    spoiler: 'Якщо дві прямі паралельні, внутрішні різносторонні кути рівні.',
    rule: 'equal',
    requiresParallel: true,
    pairs: [['c3', 'c6'], ['c4', 'c5']]
  },
  outerAlt: {
    title: 'Зовнішні різносторонні кути',
    text: 'Кути, що лежать поза двома прямими по різні боки січної.',
    spoiler: 'Якщо дві прямі паралельні, зовнішні різносторонні кути рівні.',
    rule: 'equal',
    requiresParallel: true,
    pairs: [['c1', 'c8'], ['c2', 'c7']]
  },
  innerSame: {
    title: 'Внутрішні односторонні кути',
    text: 'Кути, що лежать між двома прямими по один бік січної.',
    spoiler: 'Якщо дві прямі паралельні, сума внутрішніх односторонніх кутів дорівнює 180°.',
    rule: 'sum180',
    requiresParallel: true,
    pairs: [['c3', 'c5'], ['c4', 'c6']]
  },
  outerSame: {
    title: 'Зовнішні односторонні кути',
    text: 'Кути, що лежать поза двома прямими по один бік січної.',
    spoiler: 'Якщо дві прямі паралельні, сума зовнішніх односторонніх кутів дорівнює 180°.',
    rule: 'sum180',
    requiresParallel: true,
    pairs: [['c1', 'c7'], ['c2', 'c8']]
  },
  corresponding: {
    title: 'Відповідні кути',
    text: 'Кути, що займають однакове взаємне положення при перетині двох прямих січною.',
    spoiler: 'Якщо дві прямі паралельні, відповідні кути рівні.',
    rule: 'equal',
    requiresParallel: true,
    pairs: [['c1', 'c5'], ['c2', 'c6'], ['c3', 'c7'], ['c4', 'c8']]
  }
}

function generateAngleOptions(correct,
  count = 4) {
  const opposite = 180 - correct;
  const set = new Set();

  if (correct == opposite) {
    set.add(correct);
    while (set.size < count) {
      const v = (Math.floor(Math.random() * 17) + 1) * 10; // 10–170
      if (v !== correct) set.add(v);
    }

  } else {
    set.add(correct);
    set.add(opposite);
    while (set.size < count) {
      const v = (Math.floor(Math.random() * 17) + 1) * 10; // 10–170
      if ((v !== correct) && (v !== opposite)) set.add(v);
    }


  }

  return [...set].sort(() => Math.random() - 0.5);
}

function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/* ================= SVG SCENE API ================= */
const VaultSVG = {
  _labels: [],

  el: null,

  html: `
     <svg id="vault-svg" viewBox="0 0 300 300" width="100%" height="100%">
<!--two lines-->
  <line name="a" x1="40" y1="76" x2="260" y2="89" class="vault-line"/>
  <line name="b" x1="40" y1="225" x2="260" y2="214" class="vault-line"/>
<!--transversal-->
  <line name="c" x1="60" y1="20" x2="240" y2="280" class="vault-line" vault-transversal="true"/>
<!--angle points-->
  <g class="angles">
    <circle name="c1" cx="73" cy="65" r="7" class="angle-dot"/>
    <circle name="c2" cx="113" cy="65" r="7" class="angle-dot"/>
    <circle name="c3" cx="93" cy="95" r="7" class="angle-dot"/>
    <circle name="c4" cx="133" cy="95" r="7" class="angle-dot"/>
    <circle name="c5" cx="170" cy="204" r="7" class="angle-dot"/>
    <circle name="c6" cx="210" cy="204" r="7" class="angle-dot"/>
    <circle name="c7" cx="190" cy="234" r="7" class="angle-dot"/>
    <circle name="c8" cx="230" cy="234" r="7" class="angle-dot"/>
  </g>
</svg>
    `,
  find() {
    
    const activeScreen = document.querySelector('.screen.active');

    const needsInit =
      !this.el ||
      !document.contains(this.el) ||
      !activeScreen ||
      !activeScreen.contains(this.el) ||
      !this._dotMap ||           // 🔑 КЛЮЧОВО
      !this._dots ||
      !this._linesLive;
    if (!needsInit) return;

    this.el = activeScreen?.querySelector('#vault-svg') || null;
    if (!this.el) return;
    // === кеш DOM ===
    this._dots = [...this.el.querySelectorAll('.angle-dot')];
    this._linesLive = [...this.el.querySelectorAll('.vault-line')];

    this._dotMap = Object.fromEntries(
      this._dots.map(d => [d.getAttribute('name'), d])
    );
    // backup ліній (один раз)
    if (!this._linesBackup) {
      this._linesBackup = this._linesLive.map(l => ({
        y1: l.getAttribute('y1'),
        y2: l.getAttribute('y2')
      }));
    }
  }
  ,

  init() {
    if (this.el) return;

    const wrap = document.createElement('div');
    wrap.innerHTML = this.html;

    this.el = wrap.firstElementChild;
  },





  mount(host) {
    this.find();
    if (!this.el) this.init();
    if (host && !host.contains(this.el)) {
      host.appendChild(this.el);
    }
  },

  unmount() {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
    this._dots = [];
    this._dotMap = null;
  },

  reset() {
    this.clear();
    this.clearLabels();
    this.restoreLines?.();
  },

  clear() {
    this.find();
    if (!this.el) return;

    this._dots.forEach(c => c.classList.remove('active'));
    this.clearLabels();
  },

  activatePair(a, b) {
    this.find();
    this.clear();
    console.log(this);
    
    this._dotMap[a]?.classList.add('active');
    this._dotMap[b]?.classList.add('active');
  },


  makeParallel() {
    this.find();
    if (!this._linesLive) return;

    const [a, b] = this._linesLive;
    if (!a || !b) return;

    a.setAttribute('y1', '82');
    a.setAttribute('y2', '82');
    b.setAttribute('y1', '220');
    b.setAttribute('y2', '220');
  },

  restoreLines() {
    if (!this._linesLive || !this._linesBackup) return;

    this._linesLive.forEach((l, i) => {
      l.setAttribute('y1', this._linesBackup[i].y1);
      l.setAttribute('y2', this._linesBackup[i].y2);
    });
  },



  showAngleLabel(id, text, color = 'green') {
    const dot = this.el.querySelector(`circle[name="${id}"]`);
    if (!dot) return;


    const ns = 'http://www.w3.org/2000/svg';
    const label = document.createElementNS(ns, 'text');

    label.setAttribute("class", "angle-text " + color);
    label.setAttribute('x', parseFloat(dot.getAttribute('cx')) + 15);
    label.setAttribute('y', parseFloat(dot.getAttribute('cy')) - 5);

    label.textContent = text;


    this.el.appendChild(label);
    this._labels.push(label);
  },


  clearLabels() {
    this._labels.forEach(l => l.remove());
    this._labels = [];
  }
};
/* ================= NAVIGATION ================= */

document.querySelector('.nav-btn.home')
  .addEventListener('click', () => {
    if (!ScenarioManager.current) return;

    goBack();
  });

document.querySelector('.nav-btn.end')
  .addEventListener('click', () => {
    const sc = ScenarioManager.current;
    if (sc && typeof sc.finish === 'function') sc.finish();
  });

function goBack() {
  //ScenarioManager.current.exit?.();
  startMode("start");
}

/* ================= SCENARIO BASE ================= */
class Scenario {

  canFinish = false;   // чи активна кнопка END
  canHome = false;      // чи активна кнопка HOME

  // всі ресурси сценарію
  _handlers = [];
  _intervals = [];

  // метод для реєстрації обробників подій
  addHandler(target, type, handler) {
    target.addEventListener(type, handler);
    this._handlers.push({ target, type, handler });
  }

  // метод для реєстрації таймерів
  addInterval(id) {
    this._intervals.push(id);
    return id;
  }

  enter() {
    this.startedAt = Date.now();
    SoundManager.play('switch');

  }

  exit() {
    // видаляємо всі DOM-обробники
    this._handlers.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler);
    });
    this._handlers = [];

    // очищаємо всі таймери
    this._intervals.forEach(id => clearInterval(id));
    this._intervals = [];

    // очищаємо SVG
    if (VaultSVG) {
      VaultSVG.clear();
      VaultSVG.clearLabels?.();
      VaultSVG.restoreLines?.();
      VaultSVG.reset();
      VaultSVG.unmount();
    }
    Object.keys(this).forEach(k => delete this[k]);

  }



  update() {
    const block = document.querySelector('.screen.active .right-block');
    if (block) block.outerHTML = this.render();
  }

  next() {
    this.index++;

    if (this.index >= this.total) {
      return this.finish();
    }

    this.generate();
    this.update();
    this.handlers();
  }

}

/* ================= START SCENARIO ================= */

class StartScenario extends Scenario {
  render() {
    return `
      

       <div class="right-block">
        <div class="question">Вивчення назв та властивостей кутів при перетині двох прямих січною.</div>
        <div class="answers">
          <div class="answer" onclick="startMode('theory')">Теорія</div>
          <div class="answer" onclick="startMode('trainer')">Тренажер</div>
          <div class="answer" onclick="startMode('tasks')" >Задачі</div>
          <div class="answer" onclick="startMode('exam')" >Іспит</div>
        </div>
      </div>
    `;
  }
  exit() {
    super.exit();

  }

}


/* ================= THEORY SCENARIO ================= */
class TheoryScenario extends Scenario {
  canHome = true;

  constructor() {
    super();
    this.order = [
      'vertical',
      'adjacent',
      'innerAlt',
      'outerAlt',
      'innerSame',
      'outerSame',
      'corresponding'
    ];
    this.index = 0;
  }


  next() {
    this.index = (this.index + 1) % this.order.length;
    this.update();
  }

  prev() {
    this.index = (this.index - 1 + this.order.length) % this.order.length;
    this.update();
  }


  render() {
    const key = this.order[this.index];
    const g = AngleRelations[key];

    const variants = g.pairs.map((p, i) => `
      <div class="answer"
        onmouseenter="VaultSVG.activatePair('${p[0]}','${p[1]}')"
        onmouseleave="VaultSVG.clear()">
        Варіант ${i + 1}
      </div>
    `).join('');

    return `  
      <div class="right-block">
        <div class="question">${g.title}</div>

        <p>${g.text || ''}</p>

        <div class="answers">
          ${variants}
        </div>

        ${g.spoiler ? `
          <details>
            <summary>Якщо дві прямі паралельні</summary>
            <p>${g.spoiler}</p>
          </details>
        ` : ''}

        <div style="display:flex; justify-content: space-evenly;">
          <button class="action-btn" onclick="ScenarioManager.current.prev()">Назад</button>
          <button class="action-btn" onclick="ScenarioManager.current.next()">Далі</button>
        </div>
      </div>
    `;
  }

}


/* ================= TRAINER SCENARIO new ================= */
class TrainerScenario extends Scenario {
  canHome = true;
  canFinish = true;
  constructor() {
    super();

    this.total = 15; this.index = 0;
    this.correct = 0; this.wrong = 0; this.skipped = 0;
    this.task = null;
  }

  /* ---------- TASK GENERATION ---------- */

  generate() {
    const keys = Object.keys(AngleRelations);
    const key = weightedPick(keys);
    const rel = AngleRelations[key];
    const pair = rel.pairs[Math.floor(Math.random() * rel.pairs.length)];

    const options = keys
      .filter(k => k !== key)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .concat(key)
      .sort(() => Math.random() - 0.5);

    this.task = { key, pair, options };
  }

  /* ---------- LIFECYCLE ---------- */

  enter() {
    super.enter();

    this.generate();
    this.bind();
  }

  handlers() {

    VaultSVG.activatePair(...this.task.pair);
  }



  render() {
    return `
      <div class="right-block">
        <div class="question">
          Завдання ${this.index + 1} з ${this.total}. Які це кути?
        </div>

        <div class="answers">
          ${this.task.options.map(k => `
            <div class="answer" data-answer="${k}">
              ${AngleRelations[k].title}
            </div>
          `).join('')}
        </div>

        <button class="action-btn skip-btn" data-skip>
          Пропустити
        </button>
      </div>
    `;
  }

  /* ---------- EVENTS ---------- */

  bind() {

    this.addHandler(document, 'click', this._handler = (e) => {

      if (e.target.closest('[data-skip]')) {
        this.skipped++;
        return this.next();
      }

      const btn = e.target.closest('[data-answer]');
      if (!btn) return;

      const answer = btn.dataset.answer;

      if (answer === this.task.key) {
        SoundManager.play('correct');
        recordResult(this.task.key, true);
        this.correct++;
      } else {
        recordResult(this.task.key, false);
        this.wrong++;
      }

      this.next();
    })
  }

  /* ---------- FLOW ---------- */


  finish() {
    const duration = Math.round((Date.now() - this.startedAt) / 1000);
    const isFull = (this.total > this.index) ? ' (неповне виконання)' : '';
    ScenarioManager.start(new ResultScenario({
      mode: `Задачі${isFull} `,
      total: this.index,
      correct: this.correct,
      wrong: this.wrong,
      skipped: this.skipped,
      duration: formatSeconds(duration)
    }));


    this.exit(); // прибираємо всі хвости
  }
}


/* ================= TASK SCENARIO new  ================= */
class TaskScenario extends Scenario {
  canHome = true;
  canFinish = true;
  constructor() {
    super();

    this.total = 15; this.index = 0;

    this.correct = 0; this.wrong = 0; this.skipped = 0;

    this.task = null;
  }

  /* ---------- TASK GENERATION ---------- */

  generate() {
    const candidates = Object.entries(AngleRelations)
      .filter(([_, r]) => r.requiresParallel);

    const keys = candidates.map(([k]) => k);
    const key = weightedPick(keys);
    const rel = AngleRelations[key];

    const pair = rel.pairs[Math.floor(Math.random() * rel.pairs.length)];
    const known = pair[Math.floor(Math.random() * 2)];
    const unknown = pair.find(p => p !== known);

    const value = (Math.floor(Math.random() * 13) + 2) * 10;
    const correct = rel.rule === 'equal' ? value : 180 - value;

    const options = generateAngleOptions(correct);

    this.task = {
      key, rel,
      known, unknown,
      value, correct,
      options
    };
  }

  /* ---------- LIFECYCLE ---------- */

  enter() {
    super.enter();

    this.generate();
    this.bind();
  }



  /* ---------- SVG ---------- */

  handlers() {
    VaultSVG.clear();
    VaultSVG.clearLabels();
    VaultSVG.makeParallel();

    VaultSVG.activatePair(this.task.known, this.task.unknown);
    VaultSVG.showAngleLabel(this.task.known, `${this.task.value}°`, 'known');
    VaultSVG.showAngleLabel(this.task.unknown, '?', 'unknown');
  }


  render() {
    return `
      <div class="right-block">
        <div class="question">
          Задача ${this.index + 1} з ${this.total}
        </div>

        <p>Прямі <b>a</b> та <b>b</b> — паралельні.</p>

        <div class="answers">
          ${this.task.options.map(v => `
            <div class="answer" data-value="${v}">
              ${v}°
            </div>
          `).join('')}
        </div>

        <button class="action-btn skip-btn" data-skip>
          Пропустити
        </button>
      </div>
    `;
  }

  /* ---------- EVENTS ---------- */

  bind() {

    this.addHandler(document, 'click', this._handler = (e) => {

      if (e.target.closest('[data-skip]')) {
        this.skipped++;
        return this.next();
      }

      const btn = e.target.closest('[data-value]');
      if (!btn) return;

      const chosen = Number(btn.dataset.value);

      if (chosen === this.task.correct) {
        SoundManager.play('correct');
        recordResult(this.task.key, true);
        this.correct++;
      } else {
        recordResult(this.task.key, false);
        this.wrong++;
      }

      this.next();
    });
  }

  /* ---------- FLOW ---------- */


  finish() {

    const duration = Math.round((Date.now() - this.startedAt) / 1000);
    const isFull = (this.total > this.index) ? ' (неповне виконання)' : '';
    ScenarioManager.start(new ResultScenario({
      mode: `Задачі${isFull} `,
      total: this.index,
      correct: this.correct,
      wrong: this.wrong,
      skipped: this.skipped,
      duration: formatSeconds(duration)
    }));



    this.exit();
  }
}


/* ================= EXAM SCENARIO new ================= */
class ExamScenario extends Scenario {
  canHome = true;
  canFinish = true;
  constructor() {
    super();

    this.totalTime = 5 * 60;
    this.timeLeft = this.totalTime;
    this.timer = null;

    this.index = 0;
    this.total = 40;

    this.correct = 0;
    this.wrong = 0;
    this.skipped = 0;

    this.task = null;
  }

  /* ---------- LIFECYCLE ---------- */

  enter() {
    super.enter();

    this.startTimer();
    this.bind();
    this.next();
  }



  /* ---------- TIMER ---------- */

  startTimer() {

    this.timer = this.addInterval(setInterval(() => {
      this.timeLeft--;

      const el = document.getElementById('exam-timer');
      if (el) {
        const m = Math.floor(this.timeLeft / 60);
        const s = this.timeLeft % 60;
        el.textContent =
          `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.finish();
      }
    }, 1000));

  }

  /* ---------- FLOW ---------- */

  next() {
    if (this.index >= this.total) return this.finish();
    this.index++;

    const type = weightedPick(['theory', 'practice', 'property']);

    if (type === 'theory') this.task = this.makeTheory();
    if (type === 'practice') this.task = this.makePractice();
    if (type === 'property') this.task = this.makeProperty();
    
    this.update();
    
    this.index !== 1 ? this.handlers() : {};
  }

  /* ---------- TASK GENERATION ---------- */

  makeTheory() {
    const keys = Object.keys(AngleRelations);
    const correct = weightedPick(keys);

    const options = keys
      .filter(k => k !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .concat(correct)
      .sort(() => Math.random() - 0.5);

    return {
      type: 'theory',
      correct,
      options,
      pair: AngleRelations[correct].pairs[0]
    };
  }

  makePractice() {
    const relKeys = Object.keys(AngleRelations)
      .filter(k => AngleRelations[k].requiresParallel);

    const key = weightedPick(relKeys);
    const rel = AngleRelations[key];

    const pair = rel.pairs[Math.floor(Math.random() * rel.pairs.length)];
    const known = pair[0];
    const unknown = pair[1];

    const value = (Math.floor(Math.random() * 13) + 2) * 10;
    const correct = rel.rule === 'equal' ? value : 180 - value;

    return {
      type: 'practice',
      key,
      known,
      unknown,
      value,
      correct,
      options: generateAngleOptions(correct)
    };
  }

  makeProperty() {
    const keys = Object.keys(AngleRelations);
    const key = weightedPick(keys);
    const rel = AngleRelations[key];

    const optionsMap = {
      aEqual: 'Завжди рівні',
      pEqual: 'Рівні тільки при паралельних',
      pSum: 'У сумі 180° при паралельних',
      aSum: 'Завжди у сумі 180°',
      other: 'Немає правильної'
    };

    let correctKey = 'other';

    if (key === 'vertical') correctKey = 'aEqual';
    if (['corresponding', 'innerAlt', 'outerAlt'].includes(key)) correctKey = 'pEqual';
    if (['innerSame', 'outerSame'].includes(key)) correctKey = 'pSum';
    if (key === 'adjacent') correctKey = 'aSum';

    return {
      type: 'property',
      title: rel.title,
      correct: optionsMap[correctKey],
      options: Object.values(optionsMap).sort(() => Math.random() - 0.5)
    };
  }

  /* ---------- SVG ---------- */

  handlers() {
    VaultSVG.clear();
    VaultSVG.clearLabels?.();
    VaultSVG.restoreLines?.();

    if (this.task.type === 'theory') {
      VaultSVG.activatePair(...this.task.pair);
    }

    if (this.task.type === 'practice') {
      VaultSVG.makeParallel();
      VaultSVG.activatePair(this.task.known, this.task.unknown);
      VaultSVG.showAngleLabel?.(this.task.known, `${this.task.value}°`, 'known');
      VaultSVG.showAngleLabel?.(this.task.unknown, '?', 'unknown');
    }
  }

  /* ---------- UI ---------- */



  render() {
    let body = '';

    if (this.task.type === 'theory') {
      body = `
        <div class="question">Завдання ${this.index}. Як називаються ці кути?</div>
        <div class="answers">
          ${this.task.options.map(k => `
            <div class="answer" data-answer="${k}">
              ${AngleRelations[k].title}
            </div>`).join('')}
        </div>`;
    }

    if (this.task.type === 'practice') {
      body = `
        <div class="question">Завдання ${this.index}. Знайди значення кута</div>
        <div class="answers">
          ${this.task.options.map(v => `
            <div class="answer" data-answer="${v}">${v}°</div>`).join('')}
        </div>`;
    }

    if (this.task.type === 'property') {
      body = `
        <div class="question">
          Завдання ${this.index}. Властивість: <b>${this.task.title}</b>
        </div>
        <div class="answers">
          ${this.task.options.map(o => `
            <div class="answer" data-answer="${o}">${o}</div>`).join('')}
        </div>`;
    }

    return `
      <div class="right-block">
        <div class="exam-timer">
          ⏱ Час: <span id="exam-timer">${formatSeconds(this.timeLeft)}</span>
        </div>
        ${body}
        <button class="action-btn" data-skip>Пропустити</button>
      </div>`;
  }

  /* ---------- ANSWERS ---------- */

  bind() {
    this.addHandler(document, 'click', this._handler = (e) => {
      console.log(e.target);

      if (e.target.closest('[data-skip]')) {
        this.skipped++;
        return this.next();
      }

      if (!e.target.dataset.answer) return;

      if (String(e.target.dataset.answer) === String(this.task.correct)) {
        SoundManager.play('correct');
        this.correct++;
      } else {
        this.wrong++;
      }

      this.next();
    });
  }
  exit() {
    super.exit();

  }

  finish() {

    const duration = Math.round((Date.now() - this.startedAt) / 1000);
    const isFull = (this.total > this.index) ? ' (неповне виконання)' : '';
    ScenarioManager.start(new ResultScenario({
      mode: `Іспит${isFull} `,
      total: this.index,
      correct: this.correct,
      wrong: this.wrong,
      skipped: this.skipped,
      duration: formatSeconds(duration)
    }));

    this.exit();
  }
}


/* ================= RESULT SCENARIO ================= */
class ResultScenario extends Scenario {
  canHome = true;
  constructor(data) {
    super();
    this.data = data;
  }

  /* ---------- FLOW ---------- */
  exit() {
    super.exit();
  }

  render() {
    const {
      mode, total, correct, skipped, wrong, duration
    } = this.data;
    const GradeCaptions = {
      A: 'Відмінне володіння темою',
      B: 'Добрий рівень розуміння',
      C: 'Є що повторити',
      D: 'Потрібно закріпити матеріал',
      E: 'Рекомендуємо повторити теорію',
      F: 'Рекомендуємо почати з теорії'
    };
    function normalizeGradeLetter(letter) {
      return letter[0]; // 'A-' → 'A'
    }


    //const wrong = total - correct - skipped;
    const [letter, score12] = calculateGrade(correct, total);
    const baseLetter = normalizeGradeLetter(letter);
    const caption = GradeCaptions[baseLetter];





    return `
    
      <div class="right-block">
        <div class="question">Підсумок: ${mode}</div>
        <p>Час проходження: <b>${duration}</b></p>

        <div class="results-grid">
          <div>Всього</div>
          <div>Правильно</div>
          <div>Неправильно</div>
          <div>Пропущено</div>

          <div>${total}</div>
          <div>${correct}</div>
          <div>${wrong}</div>
          <div>${skipped}</div>
        </div>


        <div class="grade-badge">
  <div class="badge-starburst">
    <div class="badge-letter">${letter}</div>
    <div class="badge-score">${score12} / 12</div>
  </div>
  <div class="badge-caption">${caption}</div>
</div>


        <button class="action-btn" onclick="goBack()">До меню</button>
      </div>
    `;
  }
}


/* ================= PUBLIC API ================= */
function startMode(mode) {
  if (mode === 'start') ScenarioManager.start(new StartScenario());
  if (mode === 'trainer') ScenarioManager.start(new TrainerScenario());
  if (mode === 'tasks') ScenarioManager.start(new TaskScenario());
  if (mode === 'theory') ScenarioManager.start(new TheoryScenario());
  if (mode === 'exam') ScenarioManager.start(new ExamScenario());
}

/* ================= SCENARIO MANAGER ================= */

const ScenarioManager = {
  current: null,
  start(scenario) {

    if (this.current) {
      this.current.exit?.();
    }
    this.current = scenario;

    if (scenario.index == 0) scenario.enter();

    ScreenManager.switchTo(
      scenario.render(),
      () => {
        scenario.handlers?.(); // ⬅ SVG тут уже 100% завершена анімація зміни режимів БЕЗПЕЧНО
      }
    );

    this.updateNavButtons();
  },

  updateNavButtons() {
    const home = document.querySelector('.nav-btn.home');
    const end = document.querySelector('.nav-btn.end');

    if (!this.current) {
      home.classList.add('disabled');
      end.classList.add('disabled');
      return;
    }

    home.classList.toggle('disabled', !this.current.canHome);
    end.classList.toggle('disabled', !this.current.canFinish);
  }



};

/* ================= SCREEN MANAGER ================= */
const ScreenManager = {
  duration: 400, // повинно співпадати з CSS

  getActive() { return document.querySelector('.screen.active') },

  getBuffer() { return document.querySelector('.screen.pre-right') },

  switchTo(html, onDone) {
    const current = this.getActive();
    const next = this.getBuffer();

    if (!current || !next) {
      console.error('ScreenManager: screen containers not found');
      return;
    }

    // 1. наповнюємо буфер
    next.innerHTML = `<div class="left-block">        <div class="blueprint">         <div id="svg-host"> ${VaultSVG.html}</div>            </div> </div>` + html;

    // 2. запускаємо анімацію
    current.classList.add('exit-left');
    next.classList.remove('pre-right');
    next.classList.add('active');

    // 3. фіналізація після анімації
    setTimeout(() => {
      current.className = 'screen pre-right';
      current.innerHTML = '';
      next.className = 'screen active';


      onDone();

    }, this.duration);
  }
};

/* ================= SOUND MANAGER ================= */
const SoundManager = {
  enabled: true,

  sounds: {
    hover: new Audio('sounds/hover.wav'),
    click: new Audio('sounds/click.wav'),
    correct: new Audio('sounds/correct.wav'),
    switch: new Audio('sounds/switch.wav')
  },

  play(name) {
    if (!this.enabled) return;
    const s = this.sounds[name];
    if (!s) return;

    s.currentTime = 0;
    s.volume = 0.14;
    s.play();
  }
};

document.addEventListener('mouseover', e => {
  if (
    e.target.closest('.action-btn') ||
    e.target.closest('.answer')
  ) {
    SoundManager.play('hover');
  }
});
document.addEventListener('click', e => {
  if (
    e.target.closest('.action-btn') ||
    e.target.closest('.answer') ||
    e.target.closest('.nav-btn')
  ) {
    SoundManager.play('click');
  }
});

startMode("start");
