import * as d3 from 'd3';

export const THEME = {
  bg: '#E8EDF2',
  textMain: '#000000',
  textHighlight: '#2C3947',
  accentBlue: '#547A95',
  highlightGold: '#C2A56D',
};

export function clearNode(selectorOrNode) {
  const node = typeof selectorOrNode === 'string' ? document.querySelector(selectorOrNode) : selectorOrNode;
  if (node) node.replaceChildren();
  return node;
}

export function getContainerSize(node, fallbackWidth = 900, fallbackHeight = 520) {
  const rect = node?.getBoundingClientRect?.();
  const width = Math.max(320, Math.round(rect?.width || fallbackWidth));
  return { width, height: fallbackHeight };
}

export function createSvg(container, options = {}) {
  const node = typeof container === 'string' ? document.querySelector(container) : container;
  if (!node) return null;
  const { width, height } = getContainerSize(node, options.width, options.height);
  const svg = d3.select(node)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', options.ariaLabel || 'interactive visualization')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .classed(options.className || 'responsive-svg', true);
  return { svg, width, height };
}

export function createSeismicWave(target, x, y, options = {}) {
  const svg = typeof target === 'string' ? d3.select(target) : d3.select(target);
  if (!svg || svg.empty()) return;

  const count = options.count ?? 4;
  const maxRadius = options.maxRadius ?? 220;
  const stroke = options.stroke ?? THEME.highlightGold;
  const duration = options.duration ?? 1400;
  const delayStep = options.delayStep ?? 130;

  const group = svg.append('g')
    .attr('class', 'seismic-wave-layer')
    .attr('pointer-events', 'none');

  d3.range(count).forEach((i) => {
    group.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 4)
      .attr('fill', 'none')
      .attr('stroke', stroke)
      .attr('stroke-width', Math.max(1, 3 - i * 0.35))
      .attr('opacity', 0.72)
      .transition()
      .delay(i * delayStep)
      .duration(duration)
      .ease(d3.easeCubicOut)
      .attr('r', maxRadius * (0.55 + i * 0.18))
      .attr('opacity', 0)
      .remove();
  });

  window.setTimeout(() => group.remove(), duration + count * delayStep + 80);
}

export function magnitudeRadius(mag) {
  const value = Number.isFinite(mag) ? mag : 0;
  return Math.max(2, Math.pow(value + 1, 1.55));
}

export function magnitudeColor(mag) {
  return mag >= 6 ? THEME.highlightGold : THEME.accentBlue;
}

export function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function formatDate(timestamp) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

export function debounce(fn, wait = 150) {
  let timer = null;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}
