import * as d3 from 'd3'
import { feature, mesh } from 'topojson-client'

const FEEDS = {
  day: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
  month: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
}

const WORLD_TOPO = {
  land: 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json',
  countries: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'
}

const PLATE_BOUNDARIES =
  'https://raw.githubusercontent.com/fraxen/tectonicplates/refs/heads/master/GeoJSON/PB2002_boundaries.json'

const mapCfg = {
  width: 960,
  height: 480,
  margin: { top: 10, right: 10, bottom: 10, left: 10 }
}

const scatterCfg = {
  width: 760,
  height: 430,
  margin: { top: 35, right: 30, bottom: 60, left: 70 }
}

const countCfg = {
  width: 760,
  height: 430,
  margin: { top: 40, right: 25, bottom: 60, left: 70 }
}

const MAG_RADIUS = d3
  .scalePow()
  .exponent(2)
  .domain([0, 9])
  .range([1.5, 34])
  .clamp(true)

let root = null
let tooltip = null

let raw = []
let currentRange = 'week'
let selectedId = null
let selectedDay = null
let selectedHour = null
let isLoading = false
let lastError = ''

let worldReady = false
let worldError = ''
let projection = null
let geoPath = null

let mapSvg = null
let mapLayer = null
let mapBaseG = null
let mapPlateG = null
let mapPtsG = null
let mapLegendSvg = null

let scatterSvg = null
let scatterG = null
let scatterPlotG = null
let sxAxisG = null
let syAxisG = null
let legendSvg = null

let countSvg = null
let countG = null
let cxAxisG = null
let cyAxisG = null

export function initCh3() {
  root = document.querySelector('#ch3-global-data-viz')

  if (!root) {
    console.error('找不到 #ch3-global-data-viz')
    return
  }

  root.innerHTML = `
    <div class="ch3-a2-module">
      <div class="ch3-a2-narrative">
        <p>
          在上一章中，我们把视角放在建筑本身，观察烈度升高时，房屋结构是如何摇晃、开裂，甚至最终坍塌的。
          通过不同建筑在地震中的表现，我们更直观地感受了地震的破坏性，也回顾了历史上那些令人胆战心惊的地震灾害数据。
        </p>

        <p>
          但是，现实中的地震并不是孤立发生在某一栋建筑之下，也不是随机散落在地球表面。
          它们往往与板块运动、断层活动和地壳能量释放密切相关，并在全球范围内呈现出一定的空间分布与时间变化规律。
        </p>

        <p>
          所以，让我们把视角从“单栋建筑的破坏”继续拉远，转向全球尺度下的地震近况。
          通过下方的世界地图、震级散点图和地震数量柱状图，我们可以观察近期地震发生在哪里、何时发生、强度如何，以及不同时间段内地震数量如何波动。
        </p>
      </div>


      <div class="ch3-a2-toolbar">
        <div class="ch3-a2-toolbar-row">
          <label>
            时间范围：
            <select id="ch3-a2-range">
              <option value="day">过去 24 小时</option>
              <option value="week" selected>过去 7 天</option>
              <option value="month">过去 30 天</option>
            </select>
          </label>

          <label class="ch3-a2-mag-range">
            震级范围：
            <span id="ch3-a2-magRangeLabel">0.0 – 9.0</span>
            <span id="ch3-a2-magRange" class="ch3-a2-range-wrap">
              <input id="ch3-a2-magMin" type="range" min="0" max="9" step="0.1" value="0">
              <input id="ch3-a2-magMax" type="range" min="0" max="9" step="0.1" value="9">
            </span>
          </label>
        </div>

        <div class="ch3-a2-toolbar-actions">
          <button id="ch3-a2-refreshBtn" type="button">刷新数据</button>
          <button id="ch3-a2-clearFilterBtn" type="button">清空筛选</button>
          <button id="ch3-a2-clearSelect" type="button">取消选中</button>
          <button id="ch3-a2-resetZoom" type="button">重置地图缩放</button>
        </div>
      </div>

      <div id="ch3-a2-summary" class="ch3-a2-summary">正在准备数据…</div>

      <section class="ch3-a2-panel ch3-a2-map-panel">
        <div class="ch3-a2-panel-head">
          <div>
            <p class="ch3-a2-kicker">Map</p>
            <h3>全球地震带与板块边界</h3>
          </div>
          <span id="ch3-a2-mapStatus" class="ch3-a2-map-status"></span>
        </div>
        <div id="ch3-a2-map"></div>
        <div id="ch3-a2-mapLegend"></div>
      </section>

      <div class="ch3-a2-grid">
        <section class="ch3-a2-panel">
          <div class="ch3-a2-panel-head">
            <div>
              <p class="ch3-a2-kicker">Scatter</p>
              <h3>时间 × 震级散点图</h3>
            </div>
          </div>
          <div id="ch3-a2-scatter"></div>
          <div id="ch3-a2-legend"></div>
        </section>

        <section class="ch3-a2-panel">
          <div class="ch3-a2-panel-head">
            <div>
              <p class="ch3-a2-kicker">Bars</p>
              <h3 id="ch3-a2-countTitle">时间 × 地震数量柱状图</h3>
            </div>
            <span id="ch3-a2-countSelection" class="ch3-a2-count-selection">未筛选</span>
          </div>
          <p id="ch3-a2-countHint" class="ch3-a2-count-hint">
            点击柱子可按小时或日期筛选，再次点击取消。
          </p>
          <div id="ch3-a2-countBars"></div>
        </section>
      </div>

    </div>
  `


  d3.select('#ch3-a2-tooltip').remove()

  tooltip = d3
    .select('body')
    .append('div')
    .attr('id', 'ch3-a2-tooltip')
    .attr('class', 'ch3-a2-tooltip')
    .style('opacity', 0)


  setupMap()
  setupScatter()
  setupCountBars()
  bindEvents()

  syncMagRange()
  fetchAndRender()
}

function bindEvents() {
  root.querySelector('#ch3-a2-range').addEventListener('change', async event => {
    currentRange = event.target.value
    await fetchAndRender()
  })

  root.querySelector('#ch3-a2-magMin').addEventListener('input', () => {
    syncMagRange('min')
    renderAll()
  })

  root.querySelector('#ch3-a2-magMax').addEventListener('input', () => {
    syncMagRange('max')
    renderAll()
  })

  root.querySelector('#ch3-a2-refreshBtn').addEventListener('click', async () => {
    await fetchAndRender()
  })

  root.querySelector('#ch3-a2-clearFilterBtn').addEventListener('click', () => {
    selectedDay = null
    selectedHour = null
    selectedId = null

    root.querySelector('#ch3-a2-magMin').value = 0
    root.querySelector('#ch3-a2-magMax').value = 9

    syncMagRange()
    renderAll()
  })

  root.querySelector('#ch3-a2-clearSelect').addEventListener('click', () => {
    selectedId = null
    renderAll()
  })
}

function setupMap() {
  mapSvg = d3
    .select('#ch3-a2-map')
    .append('svg')
    .attr('viewBox', `0 0 ${mapCfg.width} ${mapCfg.height}`)
    .attr('role', 'img')
    .attr('aria-label', 'world earthquake map')

  mapLayer = mapSvg.append('g').attr('class', 'ch3-a2-map-layer')
  mapBaseG = mapLayer.append('g').attr('class', 'ch3-a2-map-base')
  mapPlateG = mapLayer.append('g').attr('class', 'ch3-a2-map-plates')
  mapPtsG = mapLayer.append('g').attr('class', 'ch3-a2-map-points')

  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on('zoom', event => {
      mapLayer.attr('transform', event.transform)
    })

  mapSvg.call(zoom)

  root.querySelector('#ch3-a2-resetZoom').addEventListener('click', () => {
    mapSvg.transition().duration(250).call(zoom.transform, d3.zoomIdentity)
  })

  mapSvg.on('click', () => {
    if (selectedId) {
      selectedId = null
      renderAll()
    }
  })

  mapLegendSvg = d3
    .select('#ch3-a2-mapLegend')
    .append('svg')
    .attr('viewBox', '0 0 640 110')
}

function setupScatter() {
  scatterSvg = d3
    .select('#ch3-a2-scatter')
    .append('svg')
    .attr('viewBox', `0 0 ${scatterCfg.width} ${scatterCfg.height}`)
    .attr('role', 'img')
    .attr('aria-label', 'time vs magnitude scatter plot')

  const defs = scatterSvg.append('defs')

  defs
    .append('clipPath')
    .attr('id', 'ch3-a2-scatterClip')
    .append('rect')

  scatterG = scatterSvg.append('g')

  scatterPlotG = scatterG
    .append('g')
    .attr('class', 'ch3-a2-scatter-plot')
    .attr('clip-path', 'url(#ch3-a2-scatterClip)')

  sxAxisG = scatterG
    .append('g')
    .attr('transform', `translate(0,${scatterCfg.height - scatterCfg.margin.bottom})`)

  syAxisG = scatterG
    .append('g')
    .attr('transform', `translate(${scatterCfg.margin.left},0)`)

  scatterG
    .append('text')
    .attr('class', 'ch3-a2-axis-label')
    .attr('x', scatterCfg.width / 2)
    .attr('y', scatterCfg.height - 14)
    .attr('text-anchor', 'middle')
    .text('时间')

  scatterG
    .append('text')
    .attr('class', 'ch3-a2-axis-label')
    .attr('transform', `translate(20,${scatterCfg.height / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('震级 M')

  legendSvg = d3
    .select('#ch3-a2-legend')
    .append('svg')
    .attr('viewBox', '0 0 640 110')
}

function setupCountBars() {
  countSvg = d3
    .select('#ch3-a2-countBars')
    .append('svg')
    .attr('viewBox', `0 0 ${countCfg.width} ${countCfg.height}`)
    .attr('role', 'img')
    .attr('aria-label', 'time vs earthquake count bar plot')

  countG = countSvg.append('g')

  cxAxisG = countG
    .append('g')
    .attr('transform', `translate(0,${countCfg.height - countCfg.margin.bottom})`)

  cyAxisG = countG
    .append('g')
    .attr('transform', `translate(${countCfg.margin.left},0)`)

  countG
    .append('text')
    .attr('class', 'ch3-a2-axis-label')
    .attr('x', countCfg.width / 2)
    .attr('y', countCfg.height - 14)
    .attr('text-anchor', 'middle')
    .text('时间')

  countG
    .append('text')
    .attr('class', 'ch3-a2-axis-label')
    .attr('transform', `translate(20,${countCfg.height / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text('地震数量')
}

async function fetchAndRender() {
  isLoading = true
  lastError = ''
  selectedId = null
  selectedDay = null
  selectedHour = null

  setSummary([])

  const worldPromise = ensureWorld()

  try {
    raw = await loadFeed(currentRange)
  } catch (error) {
    lastError = error?.message ? String(error.message) : String(error)
    raw = []
  } finally {
    isLoading = false
  }

  await worldPromise
  renderAll()
}

async function loadFeed(range) {
  const geo = await d3.json(FEEDS[range])

  return geo.features
    .filter(featureItem => featureItem?.properties?.mag != null && featureItem?.properties?.time != null)
    .map(featureItem => ({
      id: featureItem.id,
      mag: +featureItem.properties.mag,
      place: featureItem.properties.place ?? '',
      time: new Date(featureItem.properties.time),
      depth: featureItem.geometry?.coordinates?.[2],
      lon: featureItem.geometry?.coordinates?.[0],
      lat: featureItem.geometry?.coordinates?.[1],
      url: featureItem.properties.url
    }))
}

async function ensureWorld() {
  const mapStatusEl = root.querySelector('#ch3-a2-mapStatus')

  if (worldReady || worldError) return

  mapStatusEl.textContent = '正在加载世界地图与板块边界…'

  try {
    const [landTopo, countriesTopo, plateGeo] = await Promise.all([
      d3.json(WORLD_TOPO.land),
      d3.json(WORLD_TOPO.countries),
      d3.json(PLATE_BOUNDARIES)
    ])

    const land = feature(landTopo, landTopo.objects.land)

    const borders = mesh(
      countriesTopo,
      countriesTopo.objects.countries,
      (a, b) => a !== b
    )

    projection = d3
      .geoNaturalEarth1()
      .fitExtent(
        [
          [mapCfg.margin.left, mapCfg.margin.top],
          [mapCfg.width - mapCfg.margin.right, mapCfg.height - mapCfg.margin.bottom]
        ],
        { type: 'Sphere' }
      )

    geoPath = d3.geoPath(projection)

    mapBaseG.selectAll('*').remove()
    mapPlateG.selectAll('*').remove()

    mapBaseG
      .append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'ch3-a2-sphere')
      .attr('d', geoPath)

    mapBaseG
      .append('path')
      .datum(d3.geoGraticule10())
      .attr('class', 'ch3-a2-graticule')
      .attr('d', geoPath)

    mapBaseG
      .append('path')
      .datum(land)
      .attr('class', 'ch3-a2-land')
      .attr('d', geoPath)

    mapBaseG
      .append('path')
      .datum(borders)
      .attr('class', 'ch3-a2-borders')
      .attr('d', geoPath)

    mapPlateG
      .selectAll('path.ch3-a2-plate-boundary')
      .data(plateGeo.features)
      .join('path')
      .attr('class', 'ch3-a2-plate-boundary')
      .attr('d', geoPath)

    worldReady = true
    mapStatusEl.textContent = ''
  } catch (error) {
    worldError = error?.message ? String(error.message) : String(error)
    mapStatusEl.textContent = `地图或板块边界加载失败：${worldError}`
  }
}

function renderAll() {
  const base = getBaseData()
  const filtered = getFilteredData(base)

  if (selectedId && !filtered.some(item => item.id === selectedId)) {
    selectedId = null
  }

  updateCountPanelText()
  setSummary(filtered)
  renderMap(filtered)
  renderMagnitudeScatter(filtered)
  renderCountBars(base)
}

function getBaseData() {
  const { minMag, maxMag } = getMagRange()

  return raw.filter(item => item.mag >= minMag && item.mag <= maxMag)
}

function getFilteredData(base) {
  if (currentRange === 'day' && selectedHour) {
    return base.filter(item => +d3.timeHour(item.time) === +d3.timeHour(selectedHour))
  }

  if (selectedDay) {
    return base.filter(item => +d3.timeDay(item.time) === +d3.timeDay(selectedDay))
  }

  return base
}

function renderMap(filtered) {
  if (!worldReady || !projection) return

  const points = filtered
    .filter(item => Number.isFinite(item.lon) && Number.isFinite(item.lat))
    .map(item => {
      const projected = projection([item.lon, item.lat])
      if (!projected) return null

      return {
        ...item,
        px: projected[0],
        py: projected[1]
      }
    })
    .filter(Boolean)

  const depthExtentRaw = d3.extent(points, item => item.depth == null ? 0 : +item.depth)

  const depthExtent = [
    depthExtentRaw[0] ?? 0,
    depthExtentRaw[1] ?? (depthExtentRaw[0] ?? 0) + 1
  ]

  const color = d3.scaleSequential(d3.interpolateTurbo).domain(depthExtent)

  renderMapLegend(color, depthExtent)

  const circles = mapPtsG
    .selectAll('circle.ch3-a2-eqm')
    .data(points, item => item.id)

  circles.join(
    enter =>
      enter
        .append('circle')
        .attr('class', 'ch3-a2-eqm')
        .attr('cx', item => item.px)
        .attr('cy', item => item.py)
        .attr('r', 0)
        .attr('fill', item => color(item.depth ?? 0))
        .attr('fill-opacity', 0.85)
        .on('mouseenter', showQuakeTooltip)
        .on('mousemove', showQuakeTooltip)
        .on('mouseleave', hideTooltip)

        .on('click', (event, item) => {
          event.stopPropagation()
          selectedId = selectedId === item.id ? null : item.id
          renderAll()
        })
        .call(enterSelection =>
          enterSelection
            .transition()
            .duration(220)
            .attr('r', item => MAG_RADIUS(item.mag))
        ),
    update =>
      update.call(updateSelection =>
        updateSelection
          .transition()
          .duration(220)
          .attr('cx', item => item.px)
          .attr('cy', item => item.py)
          .attr('r', item => MAG_RADIUS(item.mag))
          .attr('fill', item => color(item.depth ?? 0))
      ),
    exit =>
      exit.call(exitSelection =>
        exitSelection
          .transition()
          .duration(160)
          .attr('r', 0)
          .remove()
      )
  )

  mapPtsG
    .selectAll('circle.ch3-a2-eqm')
    .classed('selected', item => item.id === selectedId)

  mapPtsG
    .selectAll('circle.ch3-a2-eqm')
    .filter(item => item.id === selectedId)
    .raise()
}

function renderMagnitudeScatter(filtered) {
  const { width, height, margin } = scatterCfg
  const now = new Date()

  let realStart
  let realEnd
  let tickValues
  let tickFormat

  if (currentRange === 'day') {
    realEnd = d3.timeHour.ceil(now)
    realStart = d3.timeHour.offset(realEnd, -24)

    const allHours = d3.timeHours(realStart, realEnd)
    tickValues = allHours.filter((_, index) => index % 3 === 0 || index === allHours.length - 1)
    tickFormat = d3.timeFormat('%H:%M')
  } else if (currentRange === 'week') {
    realEnd = d3.timeDay.offset(d3.timeDay(now), 1)
    realStart = d3.timeDay.offset(realEnd, -7)

    tickValues = d3.timeDays(realStart, realEnd)
    tickFormat = d3.timeFormat('%m-%d')
  } else {
    realEnd = d3.timeDay.offset(d3.timeDay(now), 1)
    realStart = d3.timeDay.offset(realEnd, -30)

    const allDays = d3.timeDays(realStart, realEnd)
    tickValues = allDays.filter((_, index) => index % 3 === 0 || index === allDays.length - 1)
    tickFormat = d3.timeFormat('%m-%d')
  }

  const plotLeft = margin.left
  const plotRight = width - margin.right
  const plotTop = margin.top
  const plotBottom = height - margin.bottom
  const plotWidth = plotRight - plotLeft
  const plotHeight = plotBottom - plotTop

  scatterSvg
    .select('#ch3-a2-scatterClip rect')
    .attr('x', plotLeft)
    .attr('y', plotTop)
    .attr('width', plotWidth)
    .attr('height', plotHeight)

  const x = d3
    .scaleTime()
    .domain([realStart, realEnd])
    .range([plotLeft, plotRight])

  const y = d3
    .scaleLinear()
    .domain([0, 9])
    .range([plotBottom, plotTop])


  const depthExtentRaw = d3.extent(filtered, item => item.depth == null ? 0 : +item.depth)

  const depthExtent = [
    depthExtentRaw[0] ?? 0,
    depthExtentRaw[1] ?? (depthExtentRaw[0] ?? 0) + 1
  ]

  const color = d3.scaleSequential(d3.interpolateTurbo).domain(depthExtent)

  sxAxisG.call(
    d3
      .axisBottom(x)
      .tickValues(tickValues)
      .tickFormat(tickFormat)
      .tickSizeOuter(0)
  )

  syAxisG.call(
    d3
      .axisLeft(y)
      .tickValues(d3.range(0, 10, 1))
  )

  renderLegend(color, depthExtent)

  const circles = scatterPlotG
    .selectAll('circle.ch3-a2-eq')
    .data(filtered, item => item.id)

  circles.join(
    enter =>
      enter
        .append('circle')
        .attr('class', 'ch3-a2-eq')
        .attr('cx', item => x(item.time))
        .attr('cy', item => y(item.mag))
        .attr('r', 0)
        .attr('fill', item => color(item.depth ?? 0))
        .attr('fill-opacity', 0.78)
        .on('mouseenter', showQuakeTooltip)
        .on('mousemove', showQuakeTooltip)
        .on('mouseleave', hideTooltip)
        .on('click', (_, item) => {
          selectedId = selectedId === item.id ? null : item.id
          renderAll()
        })
        .call(enterSelection =>
          enterSelection
            .transition()
            .duration(220)
            .attr('r', item => MAG_RADIUS(item.mag))
        ),
    update =>
      update.call(updateSelection =>
        updateSelection
          .transition()
          .duration(220)
          .attr('cx', item => x(item.time))
          .attr('cy', item => y(item.mag))
          .attr('r', item => MAG_RADIUS(item.mag))
          .attr('fill', item => color(item.depth ?? 0))
      ),
    exit =>
      exit.call(exitSelection =>
        exitSelection
          .transition()
          .duration(160)
          .attr('r', 0)
          .remove()
      )
  )

  scatterPlotG
    .selectAll('circle.ch3-a2-eq')
    .classed('selected', item => item.id === selectedId)

  scatterPlotG
    .selectAll('circle.ch3-a2-eq')
    .filter(item => item.id === selectedId)
    .raise()

  sxAxisG.raise()
  syAxisG.raise()
}

function renderCountBars(base) {
  const { width, height, margin } = countCfg
  const now = new Date()

  if (currentRange === 'day') {
    renderHourlyBars(base, width, height, margin, now)
    return
  }

  renderDailyBars(base, width, height, margin, now)
}

function renderHourlyBars(base, width, height, margin, now) {
  const endHour = d3.timeHour.ceil(now)
  const startHour = d3.timeHour.offset(endHour, -24)

  const countByHour = new Map(
    d3.rollups(
      base,
      values => values.length,
      item => +d3.timeHour(item.time)
    )
  )

  const allHours = d3.timeHours(startHour, endHour)

  const hourData = allHours.map(hour => ({
    bucket: hour,
    count: countByHour.get(+hour) ?? 0
  }))

  const x = d3
    .scaleTime()
    .domain([
      d3.timeMinute.offset(startHour, -30),
      d3.timeMinute.offset(endHour, -30)
    ])
    .range([margin.left, width - margin.right])

  const yMax = hourData.length ? d3.max(hourData, item => item.count) : 1

  const y = d3
    .scaleLinear()
    .domain([0, Math.max(1, yMax)])
    .range([height - margin.bottom, margin.top])
    .nice()

  const tickHours = allHours.filter(
    (_, index) => index % 3 === 0 || index === allHours.length - 1
  )

  cxAxisG.call(
    d3
      .axisBottom(x)
      .tickValues(tickHours)
      .tickFormat(d3.timeFormat('%H:%M'))
      .tickSizeOuter(0)
  )

  cyAxisG.call(d3.axisLeft(y).ticks(6))

  const oneHourWidth = x(d3.timeHour.offset(startHour, 1)) - x(startHour)
  const barWidth = Math.max(6, Math.min(16, oneHourWidth * 0.72))
  const avg = hourData.length ? d3.mean(hourData, item => item.count) : 0

  const bars = countG
    .selectAll('rect.ch3-a2-count-bar')
    .data(hourData, item => +item.bucket)

  bars.join(
    enter =>
      enter
        .append('rect')
        .attr('class', 'ch3-a2-count-bar')
        .attr('x', item => x(item.bucket) - barWidth / 2)
        .attr('y', y(0))
        .attr('width', barWidth)
        .attr('height', 0)
        .attr('rx', 4)
        .on('mousemove', (event, item) => {
          const nextHour = d3.timeHour.offset(item.bucket, 1)

          showTooltip(
            event,
            `
              <div><strong>${d3.timeFormat('%Y-%m-%d')(item.bucket)}</strong></div>
              <div>${d3.timeFormat('%H:%M')(item.bucket)} – ${d3.timeFormat('%H:%M')(nextHour)}</div>
              <div>地震数量：${item.count}</div>
              <div>平均值：${avg.toFixed(2)}</div>
            `
          )
        })
        .on('mouseleave', hideTooltip)
        .on('click', (_, item) => {
          const key = +d3.timeHour(item.bucket)

          selectedHour =
            selectedHour && +d3.timeHour(selectedHour) === key
              ? null
              : d3.timeHour(item.bucket)

          selectedDay = null
          selectedId = null

          renderAll()
        })
        .call(enterSelection =>
          enterSelection
            .transition()
            .duration(220)
            .attr('x', item => x(item.bucket) - barWidth / 2)
            .attr('y', item => y(item.count))
            .attr('width', barWidth)
            .attr('height', item => y(0) - y(item.count))
        ),
    update =>
      update.call(updateSelection =>
        updateSelection
          .transition()
          .duration(220)
          .attr('x', item => x(item.bucket) - barWidth / 2)
          .attr('y', item => y(item.count))
          .attr('width', barWidth)
          .attr('height', item => y(0) - y(item.count))
      ),
    exit =>
      exit.call(exitSelection =>
        exitSelection
          .transition()
          .duration(160)
          .attr('y', y(0))
          .attr('height', 0)
          .remove()
      )
  )

  styleCountBars(
    item =>
      !!selectedHour &&
      +d3.timeHour(selectedHour) === +d3.timeHour(item.bucket)
  )

  drawCountAverageLine(y, avg)
}

function renderDailyBars(base, width, height, margin, now) {
  const today = d3.timeDay(now)
  const endDay = d3.timeDay.offset(today, 1)

  const startDay =
    currentRange === 'week'
      ? d3.timeDay.offset(endDay, -7)
      : d3.timeDay.offset(endDay, -30)

  const countByDay = new Map(
    d3.rollups(
      base,
      values => values.length,
      item => +d3.timeDay(item.time)
    )
  )

  const allDays = d3.timeDays(startDay, endDay)

  const dayData = allDays.map(day => ({
    bucket: day,
    count: countByDay.get(+day) ?? 0
  }))

  const x = d3
    .scaleTime()
    .domain([
      d3.timeHour.offset(startDay, -12),
      d3.timeHour.offset(endDay, -12)
    ])
    .range([margin.left, width - margin.right])

  const yMax = dayData.length ? d3.max(dayData, item => item.count) : 1

  const y = d3
    .scaleLinear()
    .domain([0, Math.max(1, yMax)])
    .range([height - margin.bottom, margin.top])
    .nice()

  const tickDays =
    currentRange === 'month'
      ? allDays.filter((_, index) => index % 3 === 0 || index === allDays.length - 1)
      : allDays

  cxAxisG.call(
    d3
      .axisBottom(x)
      .tickValues(tickDays)
      .tickFormat(d3.timeFormat('%m-%d'))
      .tickSizeOuter(0)
  )

  cyAxisG.call(d3.axisLeft(y).ticks(6))

  const oneDayWidth = x(d3.timeDay.offset(startDay, 1)) - x(startDay)
  const barWidth = Math.max(10, Math.min(18, oneDayWidth * 0.72))
  const avg = dayData.length ? d3.mean(dayData, item => item.count) : 0

  const bars = countG
    .selectAll('rect.ch3-a2-count-bar')
    .data(dayData, item => +item.bucket)

  bars.join(
    enter =>
      enter
        .append('rect')
        .attr('class', 'ch3-a2-count-bar')
        .attr('x', item => x(item.bucket) - barWidth / 2)
        .attr('y', y(0))
        .attr('width', barWidth)
        .attr('height', 0)
        .attr('rx', 4)
        .on('mousemove', (event, item) => {
          showTooltip(
            event,
            `
              <div><strong>${fmtDay(item.bucket)}</strong></div>
              <div>地震数量：${item.count}</div>
              <div>平均值：${avg.toFixed(2)}</div>
            `
          )
        })
        .on('mouseleave', hideTooltip)
        .on('click', (_, item) => {
          const key = +d3.timeDay(item.bucket)

          selectedDay =
            selectedDay && +d3.timeDay(selectedDay) === key
              ? null
              : d3.timeDay(item.bucket)

          selectedHour = null
          selectedId = null

          renderAll()
        })
        .call(enterSelection =>
          enterSelection
            .transition()
            .duration(220)
            .attr('x', item => x(item.bucket) - barWidth / 2)
            .attr('y', item => y(item.count))
            .attr('width', barWidth)
            .attr('height', item => y(0) - y(item.count))
        ),
    update =>
      update.call(updateSelection =>
        updateSelection
          .transition()
          .duration(220)
          .attr('x', item => x(item.bucket) - barWidth / 2)
          .attr('y', item => y(item.count))
          .attr('width', barWidth)
          .attr('height', item => y(0) - y(item.count))
      ),
    exit =>
      exit.call(exitSelection =>
        exitSelection
          .transition()
          .duration(160)
          .attr('y', y(0))
          .attr('height', 0)
          .remove()
      )
  )

  styleCountBars(
    item =>
      !!selectedDay &&
      +d3.timeDay(selectedDay) === +d3.timeDay(item.bucket)
  )

  drawCountAverageLine(y, avg)
}

function renderLegend(color, depthExtent) {
  legendSvg.selectAll('*').remove()

  const [dmin, dmax] = depthExtent
  const samples = [
    { mag: 2, x: 40 },
    { mag: 4, x: 88 },
    { mag: 6, x: 146 }
  ]

  legendSvg
    .append('text')
    .attr('x', 10)
    .attr('y', 18)
    .attr('class', 'ch3-a2-legend-title')
    .text('散点图图例')

  legendSvg
    .append('text')
    .attr('x', 10)
    .attr('y', 40)
    .attr('class', 'ch3-a2-legend-tick')
    .text('圆点大小：震级')

  const baseY = 76

  legendSvg
    .selectAll('circle.ch3-a2-size-legend')
    .data(samples)
    .join('circle')
    .attr('class', 'ch3-a2-size-legend')
    .attr('cx', item => item.x)
    .attr('cy', item => baseY - MAG_RADIUS(item.mag))
    .attr('r', item => MAG_RADIUS(item.mag))

  legendSvg
    .selectAll('text.ch3-a2-size-label')
    .data(samples)
    .join('text')
    .attr('class', 'ch3-a2-legend-tick')
    .attr('x', item => item.x)
    .attr('y', 96)
    .attr('text-anchor', 'middle')
    .text(item => `M${item.mag}`)

  renderDepthLegend(legendSvg, color, dmin, dmax, 220)
}

function renderMapLegend(color, depthExtent) {
  mapLegendSvg.selectAll('*').remove()

  const [dmin, dmax] = depthExtent
  const samples = [
    { mag: 2, x: 40 },
    { mag: 4, x: 88 },
    { mag: 6, x: 146 }
  ]

  mapLegendSvg
    .append('text')
    .attr('x', 10)
    .attr('y', 18)
    .attr('class', 'ch3-a2-legend-title')
    .text('地图图例')

  mapLegendSvg
    .append('text')
    .attr('x', 10)
    .attr('y', 40)
    .attr('class', 'ch3-a2-legend-tick')
    .text('圆点大小：震级')

  const baseY = 76

  mapLegendSvg
    .selectAll('circle.ch3-a2-map-size-legend')
    .data(samples)
    .join('circle')
    .attr('class', 'ch3-a2-size-legend')
    .attr('cx', item => item.x)
    .attr('cy', item => baseY - MAG_RADIUS(item.mag))
    .attr('r', item => MAG_RADIUS(item.mag))

  mapLegendSvg
    .selectAll('text.ch3-a2-map-size-label')
    .data(samples)
    .join('text')
    .attr('class', 'ch3-a2-legend-tick')
    .attr('x', item => item.x)
    .attr('y', 96)
    .attr('text-anchor', 'middle')
    .text(item => `M${item.mag}`)

  renderDepthLegend(mapLegendSvg, color, dmin, dmax, 220)

  mapLegendSvg
    .append('line')
    .attr('class', 'ch3-a2-legend-plate-line')
    .attr('x1', 500)
    .attr('x2', 570)
    .attr('y1', 62)
    .attr('y2', 62)

  mapLegendSvg
    .append('text')
    .attr('x', 580)
    .attr('y', 66)
    .attr('class', 'ch3-a2-legend-tick')
    .text('板块分界线')
}

function renderDepthLegend(svg, color, dmin, dmax, startX) {
  svg
    .append('text')
    .attr('x', startX)
    .attr('y', 40)
    .attr('class', 'ch3-a2-legend-tick')
    .text('颜色：震源深度 km')

  const gradientId = `ch3-a2-depth-gradient-${Math.random().toString(36).slice(2)}`

  const defs = svg.append('defs')

  const gradient = defs
    .append('linearGradient')
    .attr('id', gradientId)
    .attr('x1', '0%')
    .attr('x2', '100%')
    .attr('y1', '0%')
    .attr('y2', '0%')

  d3.range(0, 1.0001, 0.02).forEach(t => {
    const value = dmin + t * (dmax - dmin)

    gradient
      .append('stop')
      .attr('offset', `${t * 100}%`)
      .attr('stop-color', color(value))
  })

  svg
    .append('rect')
    .attr('x', startX)
    .attr('y', 56)
    .attr('width', 220)
    .attr('height', 12)
    .attr('rx', 6)
    .attr('fill', `url(#${gradientId})`)
    .attr('stroke', 'rgba(0,0,0,0.18)')

  svg
    .append('text')
    .attr('x', startX)
    .attr('y', 88)
    .attr('class', 'ch3-a2-legend-tick')
    .text(`${Math.round(dmin)} km`)

  svg
    .append('text')
    .attr('x', startX + 220)
    .attr('y', 88)
    .attr('text-anchor', 'end')
    .attr('class', 'ch3-a2-legend-tick')
    .text(`${Math.round(dmax)} km`)
}

function drawCountAverageLine(y, avg) {
  countG.selectAll('.ch3-a2-avg-line, .ch3-a2-avg-line-label').remove()

  countG
    .append('line')
    .attr('class', 'ch3-a2-avg-line')
    .attr('x1', countCfg.margin.left)
    .attr('x2', countCfg.width - countCfg.margin.right)
    .attr('y1', y(avg))
    .attr('y2', y(avg))
    .attr('pointer-events', 'none')

  countG
    .append('text')
    .attr('class', 'ch3-a2-avg-line-label')
    .attr('x', countCfg.width - countCfg.margin.right - 4)
    .attr('y', y(avg) - 6)
    .attr('text-anchor', 'end')
    .style('pointer-events', 'none')
    .text(`平均值 ${avg.toFixed(2)}`)
}

function styleCountBars(isSelectedFn) {
  countG
    .selectAll('rect.ch3-a2-count-bar')
    .classed('selected', item => isSelectedFn(item))
}

function updateCountPanelText() {
  const countTitleEl = root.querySelector('#ch3-a2-countTitle')
  const countSelectionEl = root.querySelector('#ch3-a2-countSelection')

  if (countTitleEl) {
    countTitleEl.textContent =
      currentRange === 'day'
        ? '过去 24 小时每小时地震数量'
        : currentRange === 'week'
          ? '过去 7 天地震数量'
          : '过去 30 天地震数量'
  }

  if (countSelectionEl) {
    if (selectedHour) {
      countSelectionEl.textContent =
        `已选：${d3.timeFormat('%Y-%m-%d %H:00')(selectedHour)}`
    } else if (selectedDay) {
      countSelectionEl.textContent = `已选：${fmtDay(selectedDay)}`
    } else {
      countSelectionEl.textContent = '未筛选'
    }
  }
}

function setSummary(filtered) {
  const summaryEl = root.querySelector('#ch3-a2-summary')

  if (isLoading) {
    summaryEl.textContent = '正在加载数据…'
    return
  }

  if (lastError) {
    summaryEl.textContent = `加载失败：${lastError}`
    return
  }

  const { minMag, maxMag } = getMagRange()
  const total = raw.length
  const shown = filtered.length
  const shownMaxMag = shown ? d3.max(filtered, item => item.mag) : 0

  const hourPart = selectedHour
    ? `｜按小时筛选：${d3.timeFormat('%Y-%m-%d %H:00')(selectedHour)}`
    : ''

  const dayPart = !selectedHour && selectedDay
    ? `｜按天筛选：${fmtDay(selectedDay)}`
    : ''

  const point = selectedId ? filtered.find(item => item.id === selectedId) : null

  const pointPart = point
    ? `｜选中：M${point.mag.toFixed(1)} ${point.place}｜${fmtCoord(point.lon, 'lon')}，${fmtCoord(point.lat, 'lat')}`
    : ''

  summaryEl.textContent =
    `总记录：${total}｜当前筛选（震级 ${minMag.toFixed(1)} – ${maxMag.toFixed(1)}）：${shown}｜最大震级：${shownMaxMag.toFixed(1)}`
    + hourPart
    + dayPart
    + pointPart
}

function syncMagRange(changed) {
  const minEl = root.querySelector('#ch3-a2-magMin')
  const maxEl = root.querySelector('#ch3-a2-magMax')
  const maxAllowed = +minEl.max || 9

  let minMag = +minEl.value
  let maxMag = +maxEl.value

  if (minMag > maxMag) {
    if (changed === 'min') {
      maxEl.value = minEl.value
      maxMag = minMag
    } else if (changed === 'max') {
      minEl.value = maxEl.value
      minMag = maxMag
    }
  }

  const minPct = (minMag / maxAllowed) * 100
  const maxPct = (maxMag / maxAllowed) * 100

  root.querySelector('#ch3-a2-magRangeLabel').textContent =
    `${minMag.toFixed(1)} – ${maxMag.toFixed(1)}`

  const wrap = root.querySelector('#ch3-a2-magRange')
  wrap.style.setProperty('--min-pct', `${minPct}%`)
  wrap.style.setProperty('--max-pct', `${maxPct}%`)
}

function getMagRange() {
  const minEl = root.querySelector('#ch3-a2-magMin')
  const maxEl = root.querySelector('#ch3-a2-magMax')

  return {
    minMag: +minEl.value,
    maxMag: +maxEl.value
  }
}

function fmtDay(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

function fmtCoord(value, type) {
  if (!Number.isFinite(value)) return 'N/A'

  const abs = Math.abs(value).toFixed(3)

  if (type === 'lat') {
    return `${abs}°${value >= 0 ? 'N' : 'S'}`
  }

  if (type === 'lon') {
    return `${abs}°${value >= 0 ? 'E' : 'W'}`
  }

  return value.toFixed(3)
}


function quakeTooltipHtml(item) {
  return `
    <div><strong>M ${item.mag.toFixed(1)}</strong> · ${escapeHtml(item.place || '未知位置')}</div>
    <div>${item.time.toLocaleString()}</div>
    <div>经度：${fmtCoord(item.lon, 'lon')}</div>
    <div>纬度：${fmtCoord(item.lat, 'lat')}</div>
    <div>深度：${item.depth ?? 'N/A'} km</div>
  `
}

function showQuakeTooltip(event, item) {
  showTooltip(event, quakeTooltipHtml(item))
}


function showTooltip(event, html) {
  if (!tooltip) return

  const offsetX = 18
  const offsetY = 18

  tooltip
    .style('opacity', 1)
    .html(html)
    .style('left', `${event.clientX + offsetX}px`)
    .style('top', `${event.clientY + offsetY}px`)
}

function hideTooltip() {
  if (!tooltip) return
  tooltip.style('opacity', 0)
}


function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }

    return map[char]
  })
}
