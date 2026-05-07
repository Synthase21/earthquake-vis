import * as d3 from "d3";

export function initCh1() {
  const container = d3.select("#ch1-wave-viz");
  const width = 800;
  const height = 400;
  
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  // --- 纵波 (P-Wave) 模拟 ---
  const pGroup = svg.append("g").attr("transform", "translate(50, 100)");
  const numParticles = 40;
  const particles = d3.range(numParticles).map(i => ({ x: (width / numParticles) * i }));

  const pDots = pGroup.selectAll("circle")
    .data(particles)
    .join("circle")
    .attr("r", 4)
    .attr("fill", "var(--accent-blue)")
    .attr("cy", 0);

  // 使用 d3.timer 实现持续物理运动
  d3.timer((elapsed) => {
    pDots.attr("cx", d => {
      // 疏密波公式：位移沿传播方向偏移
      const offset = 20 * Math.sin(elapsed / 200 - d.x / 50);
      return d.x + offset;
    });
  });

  // --- 横波 (S-Wave) 模拟 ---
  const sGroup = svg.append("g").attr("transform", "translate(50, 250)");
  const sLine = d3.line()
    .curve(d3.curveBasis);

  const path = sGroup.append("path")
    .attr("fill", "none")
    .attr("stroke", "var(--highlight-gold)")
    .attr("stroke-width", 3);

  d3.timer((elapsed) => {
    const points = d3.range(0, 700, 10).map(x => {
      const y = 40 * Math.sin(elapsed / 200 - x / 50);
      return [x, y];
    });
    path.attr("d", sLine(points));
  });
}