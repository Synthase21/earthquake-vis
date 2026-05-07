const romanLevels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

const historicalCases = [
  {
    level: 7,
    title: '历史对照：2010年海地大地震',
    text:
      '震级：M 7.0 | 震中烈度：VII - VIII\n' +
      '次生灾害：无大规模海啸，但由于建筑极度缺乏抗震标准，导致近 10 万栋建筑瞬间粉碎性坍塌。\n' +
      '数据洞察：在此烈度下，建筑材料，尤其是砖石结构的脆弱性，是伤亡的主要原因。'
  },
  {
    level: 9,
    title: '历史对照：1995年日本阪神大地震',
    text:
      '震级：M 6.9 | 震中烈度：IX\n' +
      '次生灾害：剧烈晃动引发大面积土壤液化与城市火灾，供水管网断裂导致火势蔓延。\n' +
      '数据洞察：高烈度下的次生火灾摧毁了超过 7,000 栋全木制传统房屋。'
  },
  {
    level: 11,
    title: '历史对照：2008年汶川大地震',
    text:
      '震级：M 8.0 | 极震区烈度：XI\n' +
      '次生灾害：山体大规模崩塌，引发超过 15,000 处滑坡与泥石流，形成多个堰塞湖。\n' +
      '数据洞察：地形复杂的山区在遭遇 XI 级烈度时，地质次生灾害造成的破坏甚至超越地震波本身。'
  },
  {
    level: 12,
    title: '历史对照：1960年智利大地震',
    text:
      '震级：M 9.5，人类观测史最大 | 震中烈度：XII\n' +
      '次生灾害：引发横跨太平洋的超级海啸，浪高超 25 米，海啸波及夏威夷与日本。\n' +
      '数据洞察：极限烈度不仅改变地貌，更通过海洋向全球输送破坏力。'
  }
]

let typeTimer = null
let currentCaseKey = ''

export function initCh2() {
  const root = document.querySelector('#ch2-intensity-viz')

  if (!root) {
    console.error('找不到 #ch2-intensity-viz')
    return
  }

  root.innerHTML = `
    <div class="ch2-module">
      <div class="ch2-intro">
        <p>
          媒体报道往往聚焦于<strong>震级 Magnitude</strong>，也就是地震释放的总能量。
          但真正决定人类生命财产安全的，是地表的破坏程度——<strong>烈度 Intensity</strong>。
          同一次地震，距离震中越远、地质越好、建筑越坚固，烈度就越低。
        </p>

        <p>
          本章将烈度划分为标准的 <strong>I 至 XII 级</strong>，参考麦加利地震烈度表 MMI。
          请拖动滑块，观察不同建筑在不同烈度下的表现。
        </p>
      </div>

      <div class="ch2-layout">
        <div class="ch2-simulation">
          <div class="building-row">
            ${createBuildingSvg('brick', '砖混 / 土木结构', '无抗震设计')}
            ${createBuildingSvg('frame', '钢筋混凝土框架', '标准抗震')}
            ${createBuildingSvg('isolated', '基础隔震结构', '高级抗震')}
          </div>

          <div class="mmi-control">
            <div class="mmi-header">
              <span>当前烈度 MMI</span>
              <strong id="mmi-current">I</strong>
            </div>

            <input id="mmi-slider" type="range" min="1" max="12" step="1" value="1">

            <div class="mmi-ticks">
              ${romanLevels.map(level => `<span>${level}</span>`).join('')}
            </div>
          </div>
        </div>

        <aside class="history-card">
          <p class="history-label">历史灾害数据映射</p>
          <h3 id="history-title">等待输入</h3>
          <p id="history-body">滑动滑块以查看对应烈度的物理表现与历史记录。</p>
        </aside>
      </div>
    </div>
  `

  const slider = document.querySelector('#mmi-slider')
  const current = document.querySelector('#mmi-current')

  function update() {
    const level = Number(slider.value)
    current.textContent = romanLevels[level - 1]

    updateBuildings(level)
    updateHistory(level)
  }

  slider.addEventListener('input', update)
  update()
}

function createBuildingSvg(type, title, subtitle) {
  return `
    <article class="ch2-house-card ${type}" data-type="${type}">
      <div class="house-svg-wrap">
        <svg viewBox="0 0 220 190" class="ch2-house-svg">
          <g class="fault-lines">
            <line x1="20" y1="162" x2="90" y2="148"></line>
            <line x1="100" y1="168" x2="205" y2="144"></line>
          </g>

          <g class="isolator-layer">
            <rect x="65" y="142" width="24" height="14" rx="7"></rect>
            <rect x="98" y="142" width="24" height="14" rx="7"></rect>
            <rect x="131" y="142" width="24" height="14" rx="7"></rect>
          </g>

          <g class="building-core">
            <polygon class="roof" points="45,76 110,30 175,76"></polygon>
            <rect class="wall" x="58" y="76" width="104" height="70" rx="6"></rect>

            <rect class="window" x="72" y="91" width="22" height="20" rx="3"></rect>
            <rect class="window" x="126" y="91" width="22" height="20" rx="3"></rect>
            <rect class="door" x="98" y="112" width="24" height="34" rx="2"></rect>

            <polyline class="crack crack-a" points="98,78 90,96 104,113 95,139"></polyline>
            <polyline class="crack crack-b" points="132,80 145,101 136,126"></polyline>
          </g>

          <g class="rubble">
            <rect x="48" y="153" width="26" height="9" rx="2"></rect>
            <rect x="86" y="158" width="32" height="8" rx="2"></rect>
            <rect x="132" y="154" width="30" height="10" rx="2"></rect>
          </g>

          <line class="ground" x1="28" y1="160" x2="192" y2="160"></line>
        </svg>
      </div>

      <h3>${title}</h3>
      <p>${subtitle}</p>
      <p class="structure-status">状态：稳定</p>
    </article>
  `
}

function updateBuildings(level) {
  const cards = document.querySelectorAll('.ch2-house-card')

  cards.forEach(card => {
    const type = card.dataset.type
    const status = card.querySelector('.structure-status')

    card.classList.remove(
      'shake-light',
      'shake-medium',
      'shake-heavy',
      'cracked',
      'collapsed',
      'tilted',
      'isolating',
      'faulted'
    )

    if (level <= 4) {
      card.classList.add('shake-light')
      status.textContent = '状态：轻微摇晃'
    }

    if (type === 'brick') {
      if (level >= 5 && level <= 7) {
        card.classList.add('shake-heavy', 'cracked')
        status.textContent = '状态：裂缝出现，结构受损'
      }

      if (level >= 8) {
        card.classList.add('collapsed', 'cracked')
        status.textContent = '状态：坍塌风险极高'
      }
    }

    if (type === 'frame') {
      if (level >= 5 && level <= 7) {
        card.classList.add('shake-medium')
        status.textContent = '状态：中度晃动'
      }

      if (level >= 8 && level <= 10) {
        card.classList.add('shake-heavy', 'cracked')
        status.textContent = '状态：主体开裂，结构受损'
      }

      if (level >= 11) {
        card.classList.add('tilted', 'cracked')
        status.textContent = '状态：倾斜，局部垮塌'
      }
    }

    if (type === 'isolated') {
      if (level >= 5) {
        card.classList.add('isolating')
        status.textContent = '状态：隔震层吸收水平位移'
      }

      if (level >= 11) {
        card.classList.add('isolating', 'faulted')
        status.textContent = '状态：主体完整，地表断裂'
      }
    }
  })
}

function updateHistory(level) {
  const title = document.querySelector('#history-title')
  const body = document.querySelector('#history-body')

  const matchedCase = historicalCases
    .filter(item => level >= item.level)
    .at(-1)

  if (!matchedCase) {
    const defaultKey = 'default'

    if (currentCaseKey === defaultKey) return
    currentCaseKey = defaultKey

    title.textContent = '烈度 I - VI'
    typeText(body, '人体可感受到摇晃，悬挂物摆动，部分物品移动。多数建筑尚未进入严重破坏阶段。请继续向右拖动，查看历史灾害对照。')
    return
  }

  const caseKey = String(matchedCase.level)

  if (currentCaseKey === caseKey) return
  currentCaseKey = caseKey

  title.textContent = matchedCase.title
  typeText(body, matchedCase.text)
}

function typeText(element, text) {
  clearInterval(typeTimer)

  element.textContent = ''
  let index = 0

  typeTimer = setInterval(() => {
    element.textContent += text[index]
    index += 1

    if (index >= text.length) {
      clearInterval(typeTimer)
    }
  }, 16)
}
