  let current = 'start';

  function switchScreen(next) {
    if (next === current) return;
  
    const curEl = document.getElementById(current);     const nextEl = document.getElementById(next);
  
    // підготувати next: завжди праворуч (КЛАСАМИ, без inline)
    nextEl.classList.remove('exit-left', 'active');     nextEl.classList.add('pre-right');
  
    // force reflow
    nextEl.offsetHeight;
  
    // поточний їде вліво
    curEl.classList.remove('active');     curEl.classList.add('exit-left');
  
    // новий заїжджає справа
    nextEl.classList.remove('pre-right');     nextEl.classList.add('active');
  
      // SVG завжди ОДИН: перед переміщенням забираємо з будь-якого host
    const svg = document.getElementById('vault-svg');
    if (!svg) return;
  
    // тимчасово переносимо в BODY
    document.body.appendChild(svg);
  
    const host = nextEl.querySelector('#svg-host');
    if (!nextEl.querySelector('#svg-host >#vault-svg')) {
      if (host ) host.appendChild(svg);
    }
  updateNavButtons(nextEl);
    current = next;
}
  function updateNavButtons(el) {
  const btnHome = document.querySelector('.nav-btn.home');
  const btnEnd  = document.querySelector('.nav-btn.end');
  activeScreenId = el.id;
  // HOME
  if (activeScreenId === 'start') {
    btnHome.classList.add('disabled');
  } else {
    btnHome.classList.remove('disabled');
  }

  // END
  if (activeScreenId === 'start' || activeScreenId === 'result') {
    btnEnd.classList.add('disabled');
  } else {
    btnEnd.classList.remove('disabled');
  }
    
    
    if (activeScreenId === "mode"){
      
      if (el.getAttribute("mode-name")==="theory"){
        
        btnEnd.classList.add('disabled');
        } else {
        btnEnd.classList.remove('disabled');
      }
    }
    
}


  function getAngles() {
  return document.querySelectorAll('#vault-svg .angle-dot');
}

function clearAngles() {
  getAngles().forEach(c => c.classList.remove('active'));
}

const angleGroups = {
  vertical: {
    title: 'Вертикальні кути',
    text: 'Вертикальні кути — це кути, які лежать навпроти один одного при перетині двох прямих. Такі кути завжди рівні.',
    pairs: [['c1','c4'],['c2','c3'],['c5','c8'],['c6','c7']]
  },
  adjacent: {
    title: 'Суміжні кути',
    text: 'Суміжні кути мають спільну сторону, а дві інші сторони утворюють пряму лінію. Сума суміжних кутів дорівнює 180°.',
    pairs: [['c1','c2'],['c2','c4'],['c3','c4'],['c1','c3'],['c5','c6'],['c6','c8'],['c7','c8'],['c5','c7']]
  },
  innerSame: {
    title: 'Внутрішні односторонні кути',
    text: 'Внутрішні односторонні кути лежать між двома прямими по один бік від січної (пунктирна лінія).',
    spoiler: 'Якщо дві прямі паралельні, то сума внутрішніх односторонніх кутів дорівнює 180°.',
    pairs: [['c3','c5'],['c4','c6']]
  },
  outerSame: {
    title: 'Зовнішні односторонні кути',
    text: 'Зовнішні односторонні кути лежать поза двома прямими по один бік від січної (пунктирна лінія).',
    spoiler: 'Якщо дві прямі паралельні, то сума зовнішніх односторонніх кутів дорівнює 180°.',
    pairs: [['c1','c7'],['c2','c8']]
  },
  innerAlt: {
    title: 'Внутрішні різносторонні кути',
    text: 'Внутрішні різносторонні кути лежать між двома прямими по різні боки від січної (пунктирна лінія).',
    spoiler: 'Якщо дві прямі паралельні, то внутрішні різносторонні кути рівні.',
    pairs: [['c3','c6'],['c4','c5']]
  },
  outerAlt: {
    title: 'Зовнішні різносторонні кути',
    text: 'Зовнішні різносторонні кути лежать поза двома прямими по різні боки від січної (пунктирна лінія).',
    spoiler: 'Якщо дві прямі паралельні, то зовнішні різносторонні кути рівні.',
    pairs: [['c1','c8'],['c2','c7']]
  },
  corresponding: {
    title: 'Відповідні кути',
    text: 'Відповідні кути займають однакове положення відносно січної (пунктирна лінія) та двох прямих.',
    spoiler: 'Якщо дві прямі паралельні, то відповідні кути рівні.',
    pairs: [['c1','c5'],['c2','c6'],['c3','c7'],['c4','c8']]
  }
};

const theoryOrder = ['vertical','adjacent','innerSame','outerSame','innerAlt','outerAlt','corresponding'];
let theoryIndex = 0;

function renderTheory() {
  clearAngles();
  const key = theoryOrder[theoryIndex];
  const g = angleGroups[key];

  const buttons = g.pairs.map((p,i)=>
    `<div class="answer" onmouseenter="activatePair('${p[0]}','${p[1]}')" onmouseleave="clearAngles()">Варіант ${i+1}</div>`
  ).join('');

  const spoiler = g.spoiler ? `<details><summary>Якщо дві прямі паралельні</summary><p>${g.spoiler}</p></details>` : '';

  return `
    <div class="right-block">
      <div class="question">${g.title}</div>
      <p>${g.text}</p>
      <div class="answers">${buttons}</div>
      ${spoiler}
      <div style="display:flex;flex-direction:row;  justify-content: space-evenly;">
        <button class="action-btn prev" onclick="nextTheory()">Назад</button>
        <button class="action-btn nxt" onclick="nextTheory()">Далі</button>
      </div>
    </div>`;
}

function activatePair(a,b) {
  clearAngles();  
  const ca = document.querySelector(`#vault-svg circle[name="${a}"]`);
  const cb = document.querySelector(`#vault-svg circle[name="${b}"]`);

  if (ca) ca.classList.add('active');
  if (cb) cb.classList.add('active');
}

function nextTheory() {
  theoryIndex++;
  if (theoryIndex >= theoryOrder.length) theoryIndex = 0;
  document.querySelector('#mode .right-block').outerHTML = renderTheory();
}

function startMode(mode) {
  const modeEl = document.getElementById('mode');
  const leftHTML = document.querySelector('#start .left-block').outerHTML;
  let rightHTML = '';
  modeEl.setAttribute("mode-name",mode);
  if (mode === 'theory') {
    theoryIndex = 0;
    rightHTML = renderTheory(); }



  if (mode === 'trainer') {
    rightHTML = `<div class="right-block"><div class="question">Тренажер</div><p>Режим у розробці.</p><button class="action-btn" onclick="goBack()">До меню</button></div>`;
  }

  if (mode === 'tasks') {
    rightHTML = `<div class="right-block"><div class="question">Задачі</div><p>Режим у розробці.</p><button class="action-btn" onclick="goBack()">До меню</button></div>`;
  }

  modeEl.innerHTML = leftHTML + rightHTML;
  switchScreen('mode');
}

  function goBack() {
    if (current !== 'start') switchScreen('start');
  }

  function goNext() {
    if (current === 'mode') switchScreen('result');
  }
