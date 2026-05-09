import * as d3 from "d3";

// ============================================================
//  Earthquake Early Warning — P-wave vs S-wave time race
// ============================================================
export function initCh4Architecture() {
  const container = d3.select("#ch4-earlywarning-viz");
  container.html("");

  const W = 860, H = 520;
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("width", "100%").attr("height", "auto");

  const groundY = 255;
  const epiX = 70;
  const sourceY = groundY + 52; // 地下震源位置
  const sourceLabelX = epiX - 18; // 黄色“震中/震源”文字左移，避免和虚线重合
  const waveLabelY = groundY - 12; // P波/S波文字：刚好放在地面线上方


  // Cities (pSec/sSec = real physics seconds; animWarn = animation window in seconds)
  const cities = [
    { id: "cityA", name: "甲城", distKm: 60,  x: 280, pSec: 10, sSec: 17, warnSec: 7 },
    { id: "cityB", name: "乙城", distKm: 120, x: 510, pSec: 20, sSec: 34, warnSec: 14 },
    { id: "cityC", name: "丙城", distKm: 180, x: 740, pSec: 30, sSec: 51, warnSec: 21 },
  ];

  const pSpeed = 140; // px/s (animation)
  const sSpeed = 80;  // px/s (animation)

  // Precompute animation warning window per city
  cities.forEach(c => {
    c.animWarn = (c.x - epiX) / sSpeed - (c.x - epiX) / pSpeed;
  });

  let animating = false;
  let pWaveX = epiX;
  let sWaveX = epiX;
  let animTimer = null;
  let lastT = 0;

  // ---- Ground & subsurface ----
  // Surface line
  svg.append("line")
    .attr("x1", 30).attr("y1", groundY).attr("x2", W - 10).attr("y2", groundY)
    .attr("stroke", "var(--text-main)").attr("stroke-width", 2.2);

  // Subsurface
  svg.append("rect")
    .attr("x", 30).attr("y", groundY).attr("width", W - 40).attr("height", 130)
    .attr("fill", "rgba(44,57,71,0.04)");

  // Fault line through epicenter and hypocenter
  svg.append("line")
    .attr("x1", epiX).attr("y1", groundY - 60).attr("x2", epiX).attr("y2", sourceY + 28)
    .attr("stroke", "var(--highlight-gold)")
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", "8,4");

  // Surface point: 震中
  svg.append("circle")
    .attr("cx", epiX)
    .attr("cy", groundY)
    .attr("r", 8)
    .attr("fill", "var(--highlight-gold)")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  svg.append("text")
    .attr("x", sourceLabelX)
    .attr("y", groundY - 16)
    .attr("text-anchor", "middle")
    .attr("fill", "var(--highlight-gold)")
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .text("震中");


  // Underground point: 震源
  svg.append("circle")
    .attr("cx", epiX)
    .attr("cy", sourceY)
    .attr("r", 6.5)
    .attr("fill", "var(--highlight-gold)")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);

  svg.append("text")
    .attr("x", sourceLabelX)
    .attr("y", sourceY + 20)
    .attr("text-anchor", "middle")
    .attr("fill", "var(--highlight-gold)")
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .text("震源");


  svg.append("text")
    .attr("x", epiX)
    .attr("y", groundY + 22)
    .attr("text-anchor", "middle")
    .attr("fill", "var(--text-main)")
    .attr("font-size", 10)
    .attr("opacity", 0.6)
    .text("0 km");


  // ---- Distance axis ----
  const axisY = groundY + 105;
  svg.append("line")
    .attr("x1", epiX).attr("y1", axisY).attr("x2", W - 20).attr("y2", axisY)
    .attr("stroke", "var(--text-main)").attr("stroke-width", 0.8).attr("opacity", 0.3);

  [0, 40, 80, 120, 160, 200].forEach(d => {
    const ax = epiX + (d / 200) * (W - 50 - epiX);
    svg.append("line").attr("x1", ax).attr("y1", axisY - 5).attr("x2", ax).attr("y2", axisY + 5)
      .attr("stroke", "var(--text-main)").attr("stroke-width", 0.7).attr("opacity", 0.4);
    svg.append("text").attr("x", ax).attr("y", axisY + 20).attr("text-anchor", "middle")
      .attr("fill", "var(--text-main)").attr("font-size", 9).attr("opacity", 0.5).text(`${d} km`);
  });

  // ---- City nodes ----
  const cityGroups = cities.map(c => {
    const g = svg.append("g").attr("class", "city-node").attr("data-city", c.id);

    // City building icon
    g.append("rect").attr("x", c.x - 16).attr("y", groundY - 42).attr("width", 32).attr("height", 42)
      .attr("fill", "var(--bg-color)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.3).attr("rx", 3);
    // Windows
    for (let r = 0; r < 3; r++) {
      for (let col = 0; col < 2; col++) {
        g.append("rect").attr("x", c.x - 9 + col * 10).attr("y", groundY - 34 + r * 12)
          .attr("width", 6).attr("height", 7)
          .attr("fill", "rgba(84,122,149,0.2)").attr("rx", 1);
      }
    }

    // Distance label
    g.append("text").attr("x", c.x).attr("y", groundY + 18).attr("text-anchor", "middle")
      .attr("fill", "var(--text-main)").attr("font-size", 10).attr("opacity", 0.6)
      .text(`${c.distKm} km`);

    // City name
    g.append("text").attr("x", c.x).attr("y", groundY - 50).attr("text-anchor", "middle")
      .attr("fill", "var(--text-highlight)").attr("font-size", 13).attr("font-weight", "bold")
      .text(c.name);

    // Status panel (below city)
    const panelY = axisY + 36;
    const panel = g.append("g").attr("class", "status-panel");

    panel.append("rect")
      .attr("x", c.x - 60).attr("y", panelY).attr("width", 120).attr("height", 36)
      .attr("fill", "rgba(44,57,71,0.05)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 0.8).attr("rx", 6);

    // Status text
    const statusText = panel.append("text")
      .attr("x", c.x).attr("y", panelY + 15).attr("text-anchor", "middle")
      .attr("fill", "var(--text-main)").attr("font-size", 11);
    statusText.append("tspan").attr("x", c.x).text("监测中");

    // Countdown (hidden initially)
    const countdownText = panel.append("text")
      .attr("x", c.x).attr("y", panelY + 30).attr("text-anchor", "middle")
      .attr("fill", "var(--highlight-gold)").attr("font-size", 13).attr("font-weight", "bold")
      .style("opacity", 0);

    return { g, panel, statusText, countdownText, data: c };
  });

  // P-wave bar (blue) - 从地下震源向上发出
  const pBar = svg.append("line")
    .attr("x1", epiX).attr("y1", sourceY).attr("x2", epiX).attr("y2", sourceY)
    .attr("stroke", "var(--accent-blue)")
    .attr("stroke-width", 3.5)
    .attr("stroke-linecap", "round")
    .style("opacity", 0);

  const pLabel = svg.append("text")
    .attr("x", epiX)
    .attr("y", waveLabelY)
    .attr("text-anchor", "middle")
    .attr("fill", "var(--accent-blue)")
    .attr("font-size", 11)
    .attr("font-weight", "bold")
    .style("opacity", 0)
    .text("P波");

  // S-wave bar (gold) - 从地下震源向上发出
  const sBar = svg.append("line")
    .attr("x1", epiX).attr("y1", sourceY).attr("x2", epiX).attr("y2", sourceY)
    .attr("stroke", "var(--highlight-gold)")
    .attr("stroke-width", 3.5)
    .attr("stroke-linecap", "round")
    .style("opacity", 0);

  const sLabel = svg.append("text")
    .attr("x", epiX)
    .attr("y", waveLabelY)
    .attr("text-anchor", "middle")
    .attr("fill", "var(--highlight-gold)")
    .attr("font-size", 11)
    .attr("font-weight", "bold")
    .style("opacity", 0)
    .text("S波");


  // ---- Info annotation area (top right) ----
  const infoBox = svg.append("g").style("opacity", 0);
  infoBox.append("rect").attr("x", W - 290).attr("y", 8).attr("width", 272).attr("height", 70)
    .attr("fill", "rgba(44,57,71,0.06)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 0.8).attr("rx", 6);
  infoBox.append("text").attr("x", W - 154).attr("y", 28).attr("text-anchor", "middle")
    .attr("fill", "var(--accent-blue)").attr("font-size", 11).attr("font-weight", "bold")
    .text("P波 (纵波) 先到 · 速度快约6 km/s · 破坏性弱");
  infoBox.append("text").attr("x", W - 154).attr("y", 48).attr("text-anchor", "middle")
    .attr("fill", "var(--highlight-gold)").attr("font-size", 11).attr("font-weight", "bold")
    .text("S波 (横波) 后到 · 速度约3.5 km/s · 破坏性强");
  infoBox.append("text").attr("x", W - 154).attr("y", 68).attr("text-anchor", "middle")
    .attr("fill", "var(--text-main)").attr("font-size", 10).attr("opacity", 0.7)
    .text("P-S波时间差 = 地震预警的时间窗口");

  // ---- Trigger button ----
  const btnX = 340;
  const btnY = H - 55;
  const triggerBtn = svg.append("g")
    .attr("transform", `translate(${btnX}, ${btnY})`)
    .style("cursor", "pointer");

  const btnBg = triggerBtn.append("rect")
    .attr("x", 0).attr("y", 0).attr("width", 180).attr("height", 33)
    .attr("fill", "var(--text-highlight)").attr("rx", 8);

  const btnText = triggerBtn.append("text")
    .attr("x", 90).attr("y", 21.5).attr("text-anchor", "middle")
    .attr("fill", "var(--bg-color)").attr("font-size", 14).attr("font-weight", "bold")
    .text("模拟地震发生");

  // ---- Legend below ----
  svg.append("text").attr("x", 70).attr("y", H - 5)
    .attr("fill", "var(--text-main)").attr("font-size", 10).attr("opacity", 0.5)
    .text("基于真实波速比例：P波 ≈ 6 km/s | S波 ≈ 3.5 km/s | 时间尺度按可视化需要压缩");

  // ---- Interaction ----
  triggerBtn.on("click", () => {
    if (animating) return;
    animating = true;
    btnBg.attr("fill", "var(--accent-blue)").attr("opacity", 0.6);
    btnText.text("地震波传播中...");

    // Reset
    pWaveX = epiX; sWaveX = epiX;
    pBar.style("opacity", 1).attr("x1", epiX).attr("x2", epiX);
    sBar.style("opacity", 1).attr("x1", epiX).attr("x2", epiX);
    pLabel.style("opacity", 1).attr("x", epiX).attr("y", waveLabelY);
    sLabel.style("opacity", 1).attr("x", epiX).attr("y", waveLabelY);
    infoBox.style("opacity", 1);

    cityGroups.forEach(c => {
      c.statusText.select("tspan").text("监测中");
      c.statusText.attr("fill", "var(--text-main)");
      c.countdownText.style("opacity", 0);
      c.panel.select("rect").attr("fill", "rgba(44,57,71,0.05)");
    });

    lastT = performance.now();

    function tick(now) {
      const dt = Math.min((now - lastT) / 1000, 0.1);
      lastT = now;

      pWaveX += pSpeed * dt;
      sWaveX += sSpeed * dt;

      pBar
        .attr("x1", epiX).attr("y1", sourceY)
        .attr("x2", pWaveX).attr("y2", groundY);

      pLabel
        .attr("x", pWaveX - 14)
        .attr("y", waveLabelY);

      sBar
        .attr("x1", epiX).attr("y1", sourceY)
        .attr("x2", sWaveX).attr("y2", groundY);

      sLabel
        .attr("x", sWaveX - 14)
        .attr("y", waveLabelY);



      // Check city intersections
      cityGroups.forEach(c => {
        if (sWaveX >= c.data.x && sWaveX - sSpeed * dt < c.data.x) {
          // S-wave just arrived
          c.statusText.select("tspan").text("S波到达 · 强震!");
          c.statusText.attr("fill", "var(--highlight-gold)");
          c.countdownText.style("opacity", 0);
          c.panel.select("rect").attr("fill", "rgba(194,165,109,0.12)");

          // Shake building
          const bldg = c.g.select("rect:first-child");
          shakeBldg(bldg);

          // Wave circles at city
          spawnWave(svg, c.data.x, groundY);
        } else if (pWaveX >= c.data.x && (pWaveX - pSpeed * dt) < c.data.x) {
          // P-wave just arrived
          c.statusText.select("tspan").text("P波到达 · 预警启动");
          c.statusText.attr("fill", "var(--accent-blue)");
          c.panel.select("rect").attr("fill", "rgba(84,122,149,0.1)");

          // Show countdown
          c.countdownText.style("opacity", 1).text(`距S波到达还有 ${c.data.warnSec} 秒`);
          startCountdown(c.countdownText, c.data.warnSec, c.data.animWarn);
        }
      });

      // End condition
      if (sWaveX >= cities[2].x + 60) {
        cancelAnimationFrame(animTimer);
        animTimer = null;
        animating = false;
        btnBg.attr("fill", "var(--text-highlight)").attr("opacity", 1);
        btnText.text("重新模拟地震");

        // Fade wave bars after a delay
        setTimeout(() => {
          pBar.transition().duration(600).style("opacity", 0);
          sBar.transition().duration(600).style("opacity", 0);
          pLabel.transition().duration(600).style("opacity", 0);
          sLabel.transition().duration(600).style("opacity", 0);
          infoBox.transition().duration(600).style("opacity", 0);
        }, 2000);
      } else {
        animTimer = requestAnimationFrame(tick);
      }
    }

    animTimer = requestAnimationFrame(tick);
  });
}

// ---- Helpers ----
function shakeBldg(el) {
  el.transition().duration(60).attr("transform", "translate(3,0)")
    .transition().duration(60).attr("transform", "translate(-3,0)")
    .transition().duration(60).attr("transform", "translate(2,0)")
    .transition().duration(60).attr("transform", "translate(-2,0)")
    .transition().duration(60).attr("transform", "translate(0,0)");
}

function spawnWave(svg, cx, cy) {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      svg.append("circle")
        .attr("cx", cx).attr("cy", cy).attr("r", 6)
        .attr("fill", "none").attr("stroke", "var(--highlight-gold)")
        .attr("stroke-width", 2).style("opacity", 0.55)
        .transition().duration(1400).ease(d3.easeCircleOut)
        .attr("r", 100).style("opacity", 0)
        .remove();
    }, i * 180);
  }
}

function startCountdown(el, totalSec, animWindowSec) {
  let remaining = totalSec;
  el.style("opacity", 1);
  const tickMs = Math.max((animWindowSec / totalSec) * 1000, 100);
  const iv = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(iv);
      el.text("S波到达！");
      el.style("opacity", 0).transition().duration(200).style("opacity", 1);
      setTimeout(() => el.style("opacity", 0), 1200);
    } else {
      el.text(`距S波到达还有 ${remaining} 秒`);
    }
  }, tickMs);
}
