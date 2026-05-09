const romanLevels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

function damageFromMMI(level) {
  const value = 100 / (1 + Math.exp(-0.9 * (level - 7)))
  return Math.max(0, Math.min(100, value))
}

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

      <div class="ch2-layout">
        <div class="ch2-simulation">
          <div class="ch2-building-row">
            ${createBuildingSvg('brick', '砖混 / 土木结构', '无抗震设计')}
            ${createBuildingSvg('frame', '钢筋混凝土框架', '标准抗震')}
            ${createBuildingSvg('isolated', '基础隔震结构', '高级抗震')}
          </div>

          <div class="ch2-mmi-control">
            <div class="ch2-mmi-header">
              <span>当前烈度 MMI</span>
              <strong id="ch2-mmi-current">I</strong>
            </div>

            <input id="ch2-mmi-slider" type="range" min="1" max="12" step="1" value="1">

            <div class="ch2-mmi-ticks">
              ${romanLevels.map(level => `<span>${level}</span>`).join('')}
            </div>
          </div>
        </div>

        <aside class="ch2-history-card">
          <div class="ch2-damage-card">
            <div class="ch2-damage-card-head">
              <span>烈度损伤函数</span>
              <strong id="ch2-damage-current">0.0</strong>
            </div>

            <svg id="ch2-damage-curve" viewBox="0 0 360 170" aria-label="烈度损伤函数图"></svg>

            <p class="ch2-damage-caption">
              横轴为 MMI 烈度，纵轴为估算损伤值。
            </p>
          </div>

          <h3 id="ch2-history-title">历史对照：等待输入</h3>
          <p id="ch2-history-body">滑动滑块以查看对应烈度的物理表现与历史记录。</p>

        </aside>
      </div>
    </div>
  `

  const slider = document.querySelector('#ch2-mmi-slider')
  const current = document.querySelector('#ch2-mmi-current')

  function update() {
    const level = Number(slider.value)
    current.textContent = romanLevels[level - 1]

    updateBuildings(level)
    updateHistory(level)
    updateDamageCurve(level)
  }

  slider.addEventListener('input', update)
  update()
}

function createBuildingSvg(type, title, subtitle) {
  return `
    <article class="ch2-house-card ch2-type-${type}" data-type="${type}">
      <div class="ch2-house-svg-wrap">
        <svg viewBox="0 0 220 190" class="ch2-house-svg">
          <g class="ch2-fault-lines">
            <line x1="20" y1="162" x2="90" y2="148"></line>
            <line x1="100" y1="168" x2="205" y2="144"></line>
          </g>

          <g class="ch2-isolator-layer">
            <rect x="65" y="142" width="24" height="14" rx="7"></rect>
            <rect x="98" y="142" width="24" height="14" rx="7"></rect>
            <rect x="131" y="142" width="24" height="14" rx="7"></rect>
          </g>

          <g class="ch2-building-core">
            <polygon class="ch2-roof" points="45,76 110,30 175,76"></polygon>
            <rect class="ch2-wall" x="58" y="76" width="104" height="70" rx="6"></rect>

            <rect class="ch2-window" x="72" y="91" width="22" height="20" rx="3"></rect>
            <rect class="ch2-window" x="126" y="91" width="22" height="20" rx="3"></rect>
            <rect class="ch2-door" x="98" y="112" width="24" height="34" rx="2"></rect>

            <polyline class="ch2-crack ch2-crack-a" points="98,78 90,96 104,113 95,139"></polyline>
            <polyline class="ch2-crack ch2-crack-b" points="132,80 145,101 136,126"></polyline>
          </g>

          <g class="ch2-rubble">
            <rect x="48" y="153" width="26" height="9" rx="2"></rect>
            <rect x="86" y="158" width="32" height="8" rx="2"></rect>
            <rect x="132" y="154" width="30" height="10" rx="2"></rect>
          </g>

          <line class="ch2-ground" x1="28" y1="160" x2="192" y2="160"></line>
        </svg>
      </div>

      <h3>${title}</h3>
      <p>${subtitle}</p>
      <p class="ch2-structure-status">状态：稳定</p>
    </article>
  `
}

function updateBuildings(level) {
  const cards = document.querySelectorAll('.ch2-house-card')

  cards.forEach(card => {
    const type = card.dataset.type
    const status = card.querySelector('.ch2-structure-status')

    card.classList.remove(
      'ch2-shake-light',
      'ch2-shake-medium',
      'ch2-shake-heavy',
      'ch2-cracked',
      'ch2-collapsed',
      'ch2-tilted',
      'ch2-isolating',
      'ch2-faulted'
    )

    if (level <= 4) {
      card.classList.add('ch2-shake-light')
      status.textContent = '状态：轻微摇晃'
    }

    if (type === 'brick') {
      if (level >= 5 && level <= 7) {
        card.classList.add('ch2-shake-heavy', 'ch2-cracked')
        status.textContent = '状态：裂缝出现，结构受损'
      }

      if (level >= 8) {
        card.classList.add('ch2-collapsed', 'ch2-cracked')
        status.textContent = '状态：坍塌风险极高'
      }
    }

    if (type === 'frame') {
      if (level >= 5 && level <= 7) {
        card.classList.add('ch2-shake-medium')
        status.textContent = '状态：中度晃动'
      }

      if (level >= 8 && level <= 10) {
        card.classList.add('ch2-shake-heavy', 'ch2-cracked')
        status.textContent = '状态：主体开裂，结构受损'
      }

      if (level >= 11) {
        card.classList.add('ch2-tilted', 'ch2-cracked')
        status.textContent = '状态：倾斜，局部垮塌'
      }
    }

    if (type === 'isolated') {
      if (level >= 5) {
        card.classList.add('ch2-isolating')
        status.textContent = '状态：隔震层吸收水平位移'
      }

      if (level >= 11) {
        card.classList.add('ch2-isolating', 'ch2-faulted')
        status.textContent = '状态：主体完整，地表断裂'
      }
    }
  })
}

function updateHistory(level) {
  const title = document.querySelector('#ch2-history-title')
  const body = document.querySelector('#ch2-history-body')

  const matchedCase = historicalCases
    .filter(item => level >= item.level)
    .at(-1)

  if (!matchedCase) {
    const defaultKey = 'default'

    if (currentCaseKey === defaultKey) return
    currentCaseKey = defaultKey

    title.textContent = '历史对照：烈度 I - VI'
    typeText(body, '人体可感受到摇晃，悬挂物摆动，部分物品移动。多数建筑尚未进入严重破坏阶段。请继续向右拖动，查看历史灾害对照。')
    return
  }

  const caseKey = String(matchedCase.level)

  if (currentCaseKey === caseKey) return
  currentCaseKey = caseKey

  title.textContent = matchedCase.title
  typeText(body, matchedCase.text)
}

function updateDamageCurve(level) {
  const svg = document.querySelector('#ch2-damage-curve')
  const damageCurrent = document.querySelector('#ch2-damage-current')

  if (!svg) return

  const width = 360
  const height = 170
  const margin = {
    top: 16,
    right: 16,
    bottom: 34,
    left: 42
  }

  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const xScale = value => margin.left + ((value - 1) / 11) * innerW
  const yScale = value => margin.top + innerH - (value / 100) * innerH

  const damage = damageFromMMI(level)

  if (damageCurrent) {
    damageCurrent.textContent = damage.toFixed(1)
  }

  let curvePath = ''

  for (let x = 1; x <= 12.001; x += 0.08) {
    const px = xScale(x)
    const py = yScale(damageFromMMI(x))
    curvePath += `${x <= 1.001 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)} `
  }

  const pointX = xScale(level)
  const pointY = yScale(damage)

  const yTicks = [0, 25, 50, 75, 100]

  const yGrid = yTicks.map(tick => {
    const y = yScale(tick)

    return `
      <line class="ch2-damage-grid" x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}"></line>
      <text class="ch2-damage-tick-label" x="${margin.left - 8}" y="${y + 4}" text-anchor="end">${tick}</text>
    `
  }).join('')

  const xLabels = romanLevels.map((label, index) => {
    const x = xScale(index + 1)

    return `
      <text class="ch2-damage-tick-label" x="${x}" y="${height - 12}" text-anchor="middle">${label}</text>
    `
  }).join('')

  const labelX = Math.min(pointX + 8, width - 76)
  const labelY = Math.max(pointY - 10, 18)

  svg.innerHTML = `
    ${yGrid}

    <line class="ch2-damage-axis" x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}"></line>
    <line class="ch2-damage-axis" x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}"></line>

    <path class="ch2-damage-curve-path" d="${curvePath}"></path>

    <line class="ch2-damage-guide" x1="${pointX}" y1="${pointY}" x2="${pointX}" y2="${height - margin.bottom}"></line>
    <line class="ch2-damage-guide" x1="${margin.left}" y1="${pointY}" x2="${pointX}" y2="${pointY}"></line>

    <circle class="ch2-damage-point" cx="${pointX}" cy="${pointY}" r="5.5"></circle>

    <text class="ch2-damage-point-label" x="${labelX}" y="${labelY}">
      ${romanLevels[level - 1]} / ${damage.toFixed(1)}
    </text>

    ${xLabels}

    <text class="ch2-damage-axis-title" x="14" y="${margin.top + innerH / 2}" text-anchor="middle"
      transform="rotate(-90 14 ${margin.top + innerH / 2})">
      损伤值
    </text>

    <text class="ch2-damage-axis-title" x="${margin.left + innerW / 2}" y="${height - 2}" text-anchor="middle">
      MMI
    </text>
  `
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
