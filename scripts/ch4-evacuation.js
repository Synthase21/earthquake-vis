import * as d3 from "d3";

// ============================================================
//  Seismic wave
// ============================================================
function seismicWave(svg, cx, cy) {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      svg.append("circle")
        .attr("cx", cx).attr("cy", cy).attr("r", 10)
        .attr("fill", "none").attr("stroke", "var(--highlight-gold)")
        .attr("stroke-width", 2.5).style("opacity", 0.65)
        .transition().duration(1500).ease(d3.easeCircleOut)
        .attr("r", 350).style("opacity", 0)
        .remove();
    }, i * 200);
  }
}

// ============================================================
//  Spot layout — 2×2 grid in lower portion
// ============================================================
const SPOTS = [
  { x: 50,  y: 425, w: 195, h: 120 },
  { x: 505, y: 425, w: 195, h: 120 },
  { x: 50,  y: 565, w: 195, h: 120 },
  { x: 505, y: 565, w: 195, h: 120 },
];

function neutralColor() { return "rgba(44,57,71,0.2)"; }

// ============================================================
//  Environments — each draws into y: 0 ~ 400
// ============================================================
const ENVS = {
  classroom(svg) {
    // Floor
    svg.append("rect").attr("x", 0).attr("y", 340).attr("width", 900).attr("height", 360)
      .attr("fill", "rgba(44,57,71,0.035)");
    svg.append("line").attr("x1", 0).attr("y1", 340).attr("x2", 900).attr("y2", 340)
      .attr("stroke", "var(--text-highlight)").attr("stroke-width", 2).attr("opacity", 0.22);
    // Blackboard
    svg.append("rect").attr("x", 180).attr("y", 14).attr("width", 540).attr("height", 140)
      .attr("fill", "rgba(44,57,71,0.09)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.6).attr("rx", 4);
    svg.append("text").attr("x", 450).attr("y", 92).attr("text-anchor", "middle")
      .attr("fill", "var(--text-highlight)").attr("font-size", 22).attr("opacity", 0.35).text("黑  板");
    // Windows
    for (let i = 0; i < 2; i++) {
      const wy = 30 + i * 160;
      svg.append("rect").attr("x", 740).attr("y", wy).attr("width", 120).attr("height", 130)
        .attr("fill", "rgba(84,122,149,0.07)").attr("stroke", "var(--accent-blue)").attr("stroke-width", 1.4).attr("rx", 3);
      svg.append("line").attr("x1", 800).attr("y1", wy).attr("x2", 800).attr("y2", wy + 130)
        .attr("stroke", "var(--accent-blue)").attr("stroke-width", 0.9).attr("opacity", 0.4);
      svg.append("line").attr("x1", 740).attr("y1", wy + 65).attr("x2", 860).attr("y2", wy + 65)
        .attr("stroke", "var(--accent-blue)").attr("stroke-width", 0.9).attr("opacity", 0.4);
    }
    // Door
    svg.append("rect").attr("x", 18).attr("y", 180).attr("width", 70).attr("height", 160)
      .attr("fill", "none").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.5).attr("rx", 3).attr("opacity", 0.38);
    svg.append("circle").attr("cx", 72).attr("cy", 265).attr("r", 4.5).attr("fill", "var(--highlight-gold)").attr("opacity", 0.5);
    // Desks — 3×3
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const dx = 210 + col * 190;
        const dy = 40 + row * 100;
        svg.append("rect").attr("x", dx).attr("y", dy).attr("width", 105).attr("height", 62)
          .attr("fill", "rgba(44,57,71,0.045)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 0.9).attr("rx", 3);
        svg.append("rect").attr("x", dx + 30).attr("y", dy + 14).attr("width", 45).attr("height", 34)
          .attr("fill", "var(--bg-color)").attr("stroke", "var(--text-main)").attr("stroke-width", 0.5).attr("opacity", 0.32);
      }
    }
  },

  office(svg) {
    svg.append("rect").attr("x", 0).attr("y", 340).attr("width", 900).attr("height", 360)
      .attr("fill", "rgba(44,57,71,0.035)");
    svg.append("line").attr("x1", 0).attr("y1", 340).attr("x2", 900).attr("y2", 340)
      .attr("stroke", "var(--text-highlight)").attr("stroke-width", 2).attr("opacity", 0.22);
    // Window wall
    for (let i = 0; i < 2; i++) {
      const wy = 15 + i * 160;
      svg.append("rect").attr("x", 10).attr("y", wy).attr("width", 170).attr("height", 140)
        .attr("fill", "rgba(84,122,149,0.08)").attr("stroke", "var(--accent-blue)").attr("stroke-width", 1.4).attr("rx", 3);
      svg.append("line").attr("x1", 95).attr("y1", wy).attr("x2", 95).attr("y2", wy + 140)
        .attr("stroke", "var(--accent-blue)").attr("stroke-width", 0.8).attr("opacity", 0.38);
      svg.append("line").attr("x1", 10).attr("y1", wy + 70).attr("x2", 180).attr("y2", wy + 70)
        .attr("stroke", "var(--accent-blue)").attr("stroke-width", 0.8).attr("opacity", 0.38);
    }
    // Core
    svg.append("rect").attr("x", 760).attr("y", 20).attr("width", 120).attr("height", 320)
      .attr("fill", "rgba(44,57,71,0.07)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.5).attr("rx", 4);
    svg.append("text").attr("x", 820).attr("y", 190).attr("text-anchor", "middle")
      .attr("fill", "var(--text-highlight)").attr("font-size", 14).attr("opacity", 0.38).text("核心筒");
    // Workstations 2×2
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const dx = 240 + col * 250;
        const dy = 40 + row * 150;
        svg.append("rect").attr("x", dx).attr("y", dy).attr("width", 150).attr("height", 75)
          .attr("fill", "rgba(44,57,71,0.045)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 0.9).attr("rx", 3);
        svg.append("rect").attr("x", dx + 48).attr("y", dy + 12).attr("width", 54).attr("height", 36)
          .attr("fill", "var(--bg-color)").attr("stroke", "var(--text-main)").attr("stroke-width", 0.6).attr("opacity", 0.42).attr("rx", 2);
        svg.append("circle").attr("cx", dx + 75).attr("cy", dy + 105).attr("r", 18)
          .attr("fill", "none").attr("stroke", "var(--text-main)").attr("stroke-width", 0.7).attr("opacity", 0.28);
      }
    }
  },

  street(svg) {
    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 900).attr("height", 340)
      .attr("fill", "rgba(84,122,149,0.025)");
    // Road
    svg.append("rect").attr("x", 0).attr("y", 240).attr("width", 900).attr("height", 100)
      .attr("fill", "rgba(44,57,71,0.05)");
    svg.append("line").attr("x1", 0).attr("y1", 290).attr("x2", 900).attr("y2", 290)
      .attr("stroke", "var(--text-main)").attr("stroke-width", 1.2).attr("stroke-dasharray", "30,15").attr("opacity", 0.26);
    // Sidewalk
    svg.append("rect").attr("x", 0).attr("y", 340).attr("width", 900).attr("height", 360)
      .attr("fill", "rgba(44,57,71,0.022)");
    svg.append("line").attr("x1", 0).attr("y1", 340).attr("x2", 900).attr("y2", 340)
      .attr("stroke", "var(--text-main)").attr("stroke-width", 1.8).attr("opacity", 0.2);
    // Building left
    svg.append("rect").attr("x", 20).attr("y", 10).attr("width", 160).attr("height", 230)
      .attr("fill", "rgba(44,57,71,0.065)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.3).attr("rx", 3);
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 3; c++) {
        svg.append("rect").attr("x", 40 + c * 44).attr("y", 26 + r * 30).attr("width", 28).attr("height", 22)
          .attr("fill", "rgba(84,122,149,0.1)").attr("stroke", "var(--accent-blue)").attr("stroke-width", 0.5).attr("opacity", 0.5);
      }
    }
    // Building right
    svg.append("rect").attr("x", 680).attr("y", 10).attr("width", 170).attr("height", 230)
      .attr("fill", "rgba(44,57,71,0.065)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.3).attr("rx", 3);
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 3; c++) {
        svg.append("rect").attr("x", 702 + c * 46).attr("y", 26 + r * 30).attr("width", 28).attr("height", 22)
          .attr("fill", "rgba(84,122,149,0.1)").attr("stroke", "var(--accent-blue)").attr("stroke-width", 0.5).attr("opacity", 0.5);
      }
    }
    // Pole
    svg.append("line").attr("x1", 650).attr("y1", 80).attr("x2", 650).attr("y2", 340)
      .attr("stroke", "var(--text-highlight)").attr("stroke-width", 5).attr("opacity", 0.42);
    svg.append("line").attr("x1", 620).attr("y1", 105).attr("x2", 680).attr("y2", 105)
      .attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.4).attr("opacity", 0.32);
    svg.append("rect").attr("x", 625).attr("y", 20).attr("width", 80).attr("height", 50)
      .attr("fill", "none").attr("stroke", "var(--highlight-gold)").attr("stroke-width", 1.3).attr("opacity", 0.38).attr("rx", 3);
    // Trees
    [220, 420].forEach(tx => {
      svg.append("circle").attr("cx", tx).attr("cy", 335).attr("r", 26)
        .attr("fill", "none").attr("stroke", "var(--accent-blue)").attr("stroke-width", 1.5).attr("opacity", 0.42);
      svg.append("line").attr("x1", tx).attr("y1", 335).attr("x2", tx).attr("y2", 340)
        .attr("stroke", "var(--accent-blue)").attr("stroke-width", 2.5).attr("opacity", 0.28);
    });
  },

  mall(svg) {
    svg.append("rect").attr("x", 0).attr("y", 340).attr("width", 900).attr("height", 360)
      .attr("fill", "rgba(44,57,71,0.035)");
    svg.append("line").attr("x1", 0).attr("y1", 340).attr("x2", 900).attr("y2", 340)
      .attr("stroke", "var(--text-highlight)").attr("stroke-width", 2).attr("opacity", 0.22);
    // Ceiling
    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 900).attr("height", 80)
      .attr("fill", "rgba(44,57,71,0.05)");
    for (let i = 0; i < 5; i++) {
      svg.append("circle").attr("cx", 130 + i * 160).attr("cy", 40).attr("r", 22)
        .attr("fill", "rgba(194,165,109,0.05)").attr("stroke", "var(--highlight-gold)").attr("stroke-width", 1).attr("opacity", 0.38);
      svg.append("line").attr("x1", 130 + i * 160).attr("y1", 62).attr("x2", 130 + i * 160).attr("y2", 78)
        .attr("stroke", "var(--text-main)").attr("stroke-width", 0.6).attr("opacity", 0.18);
    }
    // Columns
    [160, 460, 750].forEach(cx => {
      svg.append("rect").attr("x", cx - 14).attr("y", 80).attr("width", 28).attr("height", 260)
        .attr("fill", "rgba(44,57,71,0.055)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.3).attr("rx", 2);
      svg.append("rect").attr("x", cx - 18).attr("y", 330).attr("width", 36).attr("height", 12)
        .attr("fill", "rgba(44,57,71,0.085)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 0.8).attr("rx", 2);
    });
    // Escalator
    svg.append("rect").attr("x", 580).attr("y", 230).attr("width", 160).attr("height", 90)
      .attr("fill", "none").attr("stroke", "var(--highlight-gold)").attr("stroke-width", 1.2).attr("opacity", 0.3).attr("rx", 3);
    for (let s = 0; s < 8; s++) {
      svg.append("line").attr("x1", 586 + s * 20).attr("y1", 230 + s * 11)
        .attr("x2", 586 + s * 20 + 18).attr("y2", 230 + s * 11 + 9)
        .attr("stroke", "var(--text-main)").attr("stroke-width", 0.6).attr("opacity", 0.2);
    }
    // Shelves
    [200, 350].forEach(sx => {
      svg.append("rect").attr("x", sx).attr("y", 130).attr("width", 80).attr("height", 125)
        .attr("fill", "none").attr("stroke", "var(--text-main)").attr("stroke-width", 0.9).attr("opacity", 0.26).attr("rx", 3);
      for (let r = 0; r < 5; r++) {
        svg.append("line").attr("x1", sx + 7).attr("y1", 145 + r * 22).attr("x2", sx + 73).attr("y2", 145 + r * 22)
          .attr("stroke", "var(--text-main)").attr("stroke-width", 0.4).attr("opacity", 0.2);
      }
    });
  },

  bedroom(svg) {
    svg.append("rect").attr("x", 0).attr("y", 340).attr("width", 900).attr("height", 360)
      .attr("fill", "rgba(44,57,71,0.035)");
    svg.append("line").attr("x1", 0).attr("y1", 340).attr("x2", 900).attr("y2", 340)
      .attr("stroke", "var(--text-highlight)").attr("stroke-width", 2).attr("opacity", 0.22);
    // Bed
    svg.append("rect").attr("x", 60).attr("y", 90).attr("width", 320).attr("height", 240)
      .attr("fill", "rgba(84,122,149,0.065)").attr("stroke", "var(--accent-blue)").attr("stroke-width", 1.5).attr("rx", 6);
    svg.append("rect").attr("x", 82).attr("y", 112).attr("width", 276).attr("height", 186)
      .attr("fill", "var(--bg-color)").attr("stroke", "var(--accent-blue)").attr("stroke-width", 0.8).attr("opacity", 0.5).attr("rx", 3);
    svg.append("rect").attr("x", 96).attr("y", 126).attr("width", 240).attr("height", 72)
      .attr("fill", "rgba(44,57,71,0.038)").attr("rx", 5);
    // Window
    svg.append("rect").attr("x", 690).attr("y", 30).attr("width", 150).attr("height", 200)
      .attr("fill", "rgba(84,122,149,0.08)").attr("stroke", "var(--accent-blue)").attr("stroke-width", 1.4).attr("rx", 3);
    svg.append("line").attr("x1", 765).attr("y1", 30).attr("x2", 765).attr("y2", 230)
      .attr("stroke", "var(--accent-blue)").attr("stroke-width", 0.9).attr("opacity", 0.42);
    svg.append("line").attr("x1", 690).attr("y1", 130).attr("x2", 840).attr("y2", 130)
      .attr("stroke", "var(--accent-blue)").attr("stroke-width", 0.9).attr("opacity", 0.42);
    // Wardrobe
    svg.append("rect").attr("x", 560).attr("y", 90).attr("width", 105).attr("height", 250)
      .attr("fill", "rgba(44,57,71,0.05)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.2).attr("rx", 4);
    svg.append("line").attr("x1", 612).attr("y1", 90).attr("x2", 612).attr("y2", 340)
      .attr("stroke", "var(--text-highlight)").attr("stroke-width", 0.9).attr("opacity", 0.28);
    // Bathroom door
    svg.append("rect").attr("x", 30).attr("y", 170).attr("width", 72).attr("height", 135)
      .attr("fill", "rgba(84,122,149,0.045)").attr("stroke", "var(--accent-blue)").attr("stroke-width", 1.2).attr("rx", 3);
    svg.append("text").attr("x", 66).attr("y", 246).attr("text-anchor", "middle")
      .attr("fill", "var(--accent-blue)").attr("font-size", 14).attr("opacity", 0.42).text("卫");
    // Nightstand lamp
    svg.append("rect").attr("x", 420).attr("y", 200).attr("width", 46).attr("height", 46)
      .attr("fill", "none").attr("stroke", "var(--text-main)").attr("stroke-width", 0.8).attr("opacity", 0.28).attr("rx", 3);
    svg.append("circle").attr("cx", 443).attr("cy", 212).attr("r", 12)
      .attr("fill", "rgba(194,165,109,0.07)").attr("stroke", "var(--highlight-gold)").attr("stroke-width", 0.8).attr("opacity", 0.42);
  },

  subway(svg) {
    svg.append("rect").attr("x", 0).attr("y", 340).attr("width", 900).attr("height", 360)
      .attr("fill", "rgba(44,57,71,0.04)");
    // Ceiling
    svg.append("rect").attr("x", 0).attr("y", 0).attr("width", 900).attr("height", 80)
      .attr("fill", "rgba(44,57,71,0.07)");
    for (let i = 0; i < 8; i++) {
      svg.append("circle").attr("cx", 80 + i * 110).attr("cy", 40).attr("r", 13)
        .attr("fill", "rgba(194,165,109,0.06)").attr("stroke", "var(--highlight-gold)").attr("stroke-width", 0.8).attr("opacity", 0.32);
    }
    svg.append("line").attr("x1", 0).attr("y1", 340).attr("x2", 900).attr("y2", 340)
      .attr("stroke", "var(--text-highlight)").attr("stroke-width", 2).attr("opacity", 0.24);
    // Safety line
    svg.append("line").attr("x1", 0).attr("y1", 405).attr("x2", 900).attr("y2", 405)
      .attr("stroke", "var(--highlight-gold)").attr("stroke-width", 2).attr("stroke-dasharray", "22,12").attr("opacity", 0.42);
    // Track
    svg.append("rect").attr("x", 0).attr("y", 405).attr("width", 900).attr("height", 90)
      .attr("fill", "rgba(44,57,71,0.022)");
    svg.append("line").attr("x1", 0).attr("y1", 425).attr("x2", 900).attr("y2", 425)
      .attr("stroke", "var(--text-main)").attr("stroke-width", 1).attr("opacity", 0.16);
    svg.append("line").attr("x1", 0).attr("y1", 460).attr("x2", 900).attr("y2", 460)
      .attr("stroke", "var(--text-main)").attr("stroke-width", 1).attr("opacity", 0.16);
    // Columns
    [140, 380, 610].forEach(cx => {
      svg.append("rect").attr("x", cx - 11).attr("y", 90).attr("width", 22).attr("height", 250)
        .attr("fill", "rgba(44,57,71,0.05)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.2).attr("rx", 2);
      svg.append("rect").attr("x", cx - 15).attr("y", 330).attr("width", 30).attr("height", 10)
        .attr("fill", "rgba(44,57,71,0.08)").attr("stroke", "var(--text-highlight)").attr("stroke-width", 0.8).attr("rx", 2);
    });
    // Exit sign
    svg.append("rect").attr("x", 790).attr("y", 90).attr("width", 80).attr("height", 40)
      .attr("fill", "rgba(84,122,149,0.09)").attr("stroke", "var(--accent-blue)").attr("stroke-width", 1.2).attr("rx", 4);
    svg.append("text").attr("x", 830).attr("y", 116).attr("text-anchor", "middle")
      .attr("fill", "var(--accent-blue)").attr("font-size", 15).attr("font-weight", "bold").text("出口");
    // Machines
    for (let i = 0; i < 2; i++) {
      svg.append("rect").attr("x", 670 + i * 60).attr("y", 150).attr("width", 48).attr("height", 80)
        .attr("fill", "rgba(44,57,71,0.04)").attr("stroke", "var(--text-main)").attr("stroke-width", 0.8).attr("opacity", 0.3).attr("rx", 3);
    }
  },
};

// ============================================================
const SCENARIOS = [
  { id: "classroom", title: "标准教室",   sub: "学校教学楼 · 日常学习场景",    icon: "🏫", env: ENVS.classroom, startX: 410, startY: 260,
    spots: [
      { slot: 0, label: "课桌下方", type: "safe",   tip: "蹲下并护住头部，利用课桌形成遮挡空间。「伏地、遮挡、手抓牢」是国际通行的避险原则，课桌可阻挡坠落的灯具与天花板碎片。" },
      { slot: 1, label: "内墙墙角", type: "safe",   tip: "内墙墙角区域远离窗户，且有墙体三角支撑结构。震时蹲伏于墙角，以书包或手臂护住头颈，可有效降低被坠落物击中的风险。" },
      { slot: 2, label: "贴靠外墙站立", type: "danger", tip: "外墙在强震中易向外坍塌，玻璃窗破碎后高速飞溅是导致伤亡的主要原因之一。远离外墙与窗户是教室避险的基本要求。" },
      { slot: 3, label: "讲台旁空旷处", type: "danger", tip: "无遮挡的空旷区域无法防御坠落的灯具、天花板及投影设备。应寻找坚固家具下方或承重墙角作为掩护，而非停留在暴露区域。" },
    ],
  },
  { id: "office",   title: "高层办公室",   sub: "商务写字楼 · 开放工位环境",    icon: "🏢", env: ENVS.office, startX: 410, startY: 260,
    spots: [
      { slot: 0, label: "办公桌下方", type: "safe",   tip: "坚固的办公桌可提供有效遮挡。蹲伏于桌下，双手护住后颈，桌面板能阻隔坠落的天花板、灯具及空调风口部件，是办公室内首选避险位。" },
      { slot: 1, label: "核心筒/电梯间旁", type: "safe", tip: "核心筒是高层建筑中刚度最大的区域，由钢筋混凝土剪力墙构成，是整个楼宇最稳固的结构体。靠近核心筒避险可最大程度避免坍塌伤害。" },
      { slot: 2, label: "落地玻璃窗旁", type: "danger", tip: "高层建筑幕墙玻璃在强震变形中极易破碎，碎片以高速飞散。震时靠近玻璃幕墙是导致割伤及坠落伤亡的高风险行为，应立即远离。" },
      { slot: 3, label: "开放工位中央", type: "danger", tip: "工位中央无任何遮挡，天花板垮塌或悬挂物坠落时毫无防护。且开放区域家具倾倒易形成连锁伤害，不属于安全避险位置。" },
    ],
  },
  { id: "street",   title: "城市街道",     sub: "城市建成区 · 户外通行环境",    icon: "🏙️", env: ENVS.street, startX: 410, startY: 260,
    spots: [
      { slot: 0, label: "开阔空地中央", type: "safe",   tip: "远离所有建筑物、电线杆及广告牌的空旷区域是最安全的户外避险位置。保持蹲姿，观察周边环境，避免被地震波晃倒。" },
      { slot: 1, label: "低矮坚固建筑旁", type: "safe", tip: "低矮且结构坚固的建筑旁相对安全，其倒塌范围有限且无高层坠物风险。但应注意保持一定距离，防止外墙饰面或砖块剥落。" },
      { slot: 2, label: "紧贴高层建筑外墙", type: "danger", tip: "强震作用下高层建筑外墙装饰面、玻璃幕墙及空调外机等可能大面积脱落，地面行人被击中的致死率极高。切勿沿建筑外墙奔跑。" },
      { slot: 3, label: "电线杆及广告牌旁", type: "danger", tip: "电线杆在地震中极易倾倒，连带的高压线断裂可造成电击伤害。大型广告牌支座在地震作用下可能失稳坍塌，应迅速远离。" },
    ],
  },
  { id: "mall",     title: "商场中庭",     sub: "大型商业综合体 · 公共消费空间", icon: "🛍️", env: ENVS.mall, startX: 410, startY: 260,
    spots: [
      { slot: 0, label: "承重柱旁", type: "safe",   tip: "承重柱是商场中承载结构荷载的核心构件，钢筋混凝土现浇，抗剪强度高。蹲伏于柱旁可利用其结构刚度抵御坠落的屋顶构件与悬挂物。" },
      { slot: 1, label: "收银台/服务台下", type: "safe", tip: "坚固的收银或服务台面可充当临时掩体。蹲伏于台面下方，双手护住头颈，可有效规避屋顶坠落物及灯饰碎片带来的伤害。" },
      { slot: 2, label: "自动扶梯旁", type: "danger", tip: "自动扶梯的机械传动结构在强震中可能发生失效甚至解体，梯级塌陷风险极高。扶梯区域的悬挑结构也相对薄弱，不属于安全避险位置。" },
      { slot: 3, label: "玻璃橱窗及货架旁", type: "danger", tip: "商场货架与玻璃展柜在地震晃动中极易倾倒破碎，玻璃碎片高速飞散可造成严重割伤。应远离一切未固定的货架、展柜及大面积玻璃立面。" },
    ],
  },
  { id: "bedroom",  title: "家庭卧室",     sub: "住宅内部 · 夜间休息场景",      icon: "🛏️", env: ENVS.bedroom, startX: 410, startY: 260,
    spots: [
      { slot: 0, label: "床沿旁侧", type: "safe",   tip: "床架为坚固大件家具，地震中可在床沿与地面之间形成三角支撑空间。翻身蹲伏于床沿旁，以枕头护住头颈，利用床体结构作为屏障。" },
      { slot: 1, label: "卫生间内墙角", type: "safe", tip: "卫生间通常为小开间结构，四面墙体相互支撑，空间完整性好。管道井区域结构刚度较高，且无大型家具倾倒风险，是住宅内的优先避险空间。" },
      { slot: 2, label: "窗户下方", type: "danger", tip: "窗户玻璃在强烈震动下极易破碎，高速碎片可造成严重身体伤害。窗框变形后玻璃整体脱落风险同样不可忽视，震时应立即远离窗户区域。" },
      { slot: 3, label: "大衣柜正前方", type: "danger", tip: "大衣柜等高大且未固定的家具在强震中最先倾倒，是室内致伤致死的主要原因之一。切勿站立于衣柜、书柜或冰箱等高大物件正前方。" },
    ],
  },
  { id: "subway",   title: "地铁站台",     sub: "地下轨道交通 · 公共通勤空间",  icon: "🚇", env: ENVS.subway, startX: 410, startY: 260,
    spots: [
      { slot: 0, label: "站台承重柱旁", type: "safe",   tip: "地铁站台承重柱为钢筋混凝土结构，承载上部土体荷载，结构刚度极高。在地震中承重柱是地下空间最稳固的支撑点，蹲伏于柱旁可利用其强度保障安全。" },
      { slot: 1, label: "紧急通道口旁", type: "safe",   tip: "紧急疏散通道口的围护结构具有较高的耐火与抗震等级，且便于震后快速撤离。震时保持蹲姿靠于通道口侧墙，避免因人群恐慌踩踏造成二次伤害。" },
      { slot: 2, label: "站台边缘", type: "danger",   tip: "地震晃动可能导致站台边缘失稳或人员失衡跌落轨道。轨行区存在高压供电轨（第三轨），触电风险极高，务必远离站台边缘黄色安全线。" },
      { slot: 3, label: "自动售票机旁", type: "danger", tip: "自动售票机等大型设备在强震中可能移位甚至倾倒，其内部高压电路在设备损坏后有漏电风险。震时应远离未固定的机电设备及悬挂式显示屏。" },
    ],
  },
];

// ============================================================
//  Stick figure — bigger + invisible hit area
// ============================================================
function buildStickman(parent) {
  const g = parent.append("g").attr("class", "stickman").style("cursor", "grab");

  // Invisible hit circle (bigger target for easier grabbing)
  g.append("circle")
    .attr("cx", 0).attr("cy", 5).attr("r", 36)
    .attr("fill", "transparent").attr("stroke", "none");

  // Head
  g.append("circle").attr("cx", 0).attr("cy", -34).attr("r", 12)
    .attr("fill", "none").attr("stroke", "var(--text-highlight)").attr("stroke-width", 2.5);
  // Body
  g.append("line").attr("x1", 0).attr("y1", -22).attr("x2", 0).attr("y2", 28)
    .attr("stroke", "var(--text-highlight)").attr("stroke-width", 2.8);
  // Arms
  g.append("line").attr("x1", -16).attr("y1", -6).attr("x2", 16).attr("y2", -6)
    .attr("stroke", "var(--text-highlight)").attr("stroke-width", 2.5);
  // Legs
  g.append("line").attr("x1", 0).attr("y1", 28).attr("x2", -14).attr("y2", 56)
    .attr("stroke", "var(--text-highlight)").attr("stroke-width", 2.5);
  g.append("line").attr("x1", 0).attr("y1", 28).attr("x2", 14).attr("y2", 56)
    .attr("stroke", "var(--text-highlight)").attr("stroke-width", 2.5);
  // Face
  const face = g.append("g");
  face.append("circle").attr("cx", -5).attr("cy", -36).attr("r", 1.6).attr("fill", "var(--text-highlight)");
  face.append("circle").attr("cx", 5).attr("cy", -36).attr("r", 1.6).attr("fill", "var(--text-highlight)");
  const mouth = face.append("path")
    .attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.8).attr("fill", "none")
    .attr("d", "M-5,-28 L5,-28");
  return { group: g, mouth };
}

// ============================================================
//  Main entry
// ============================================================
export function initCh4Evacuation() {
  const container = d3.select("#ch4-evacuation-viz");
  container.html("");

  let currentScenario = null;

  function renderSelect() {
    container.html("");

    container.append("div")
      .style("text-align", "center").style("margin-bottom", "20px")
      .style("font-size", "0.9rem").style("color", "var(--text-main)")
      .style("opacity", "0.6")
      .text("请选择一个场景，开始地震避险演练");

    const wrapper = container.append("div").attr("class", "scenario-grid");
    SCENARIOS.forEach(s => {
      const card = wrapper.append("div").attr("class", "scenario-card");
      card.append("span").attr("class", "card-icon").text(s.icon);
      card.append("div").attr("class", "card-title").text(s.title);
      card.append("div").attr("class", "card-sub").text(s.sub);
      card.on("click", () => { currentScenario = s; renderGame(); });
    });
  }

  function renderGame() {
    container.html("");
    const s = currentScenario;
    const W = 900, H = 710;

    // Back
    const backBtn = container.append("button").attr("class", "game-back-btn");
    backBtn.append("span").text("← 选择其他场所");
    backBtn.on("click", () => renderSelect());

    const gameWrap = container.append("div").attr("class", "game-container");
    const svg = gameWrap.append("svg")
      .attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid meet");

    // Environment
    s.env(svg);

    // Spots — all neutral initially
    const spotGroups = s.spots.map((sp, i) => {
      const sl = SPOTS[sp.slot];
      const g = svg.append("g").attr("class", "zone").attr("data-spot-idx", i);

      g.append("rect")
        .attr("x", sl.x).attr("y", sl.y).attr("width", sl.w).attr("height", sl.h)
        .attr("fill", "var(--bg-color)")
        .attr("stroke", neutralColor()).attr("stroke-width", 2).attr("rx", 8).attr("stroke-dasharray", "6,3");

      const marker = g.append("circle")
        .attr("cx", sl.x + sl.w / 2).attr("cy", sl.y + 42).attr("r", 17)
        .attr("fill", "rgba(44,57,71,0.06)").attr("stroke", neutralColor()).attr("stroke-width", 1.5)
        .style("opacity", 0);

      const markerText = g.append("text")
        .attr("x", sl.x + sl.w / 2).attr("y", sl.y + 49)
        .attr("text-anchor", "middle")
        .attr("font-size", 20).attr("font-weight", "bold")
        .style("opacity", 0);

      g.append("text")
        .attr("x", sl.x + sl.w / 2).attr("y", sl.y + sl.h - 20)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--text-highlight)")
        .attr("font-size", 13).attr("font-weight", "bold")
        .text(sp.label);

      g.append("rect")
        .attr("x", sl.x + 20).attr("y", sl.y + sl.h - 6)
        .attr("width", sl.w - 40).attr("height", 2.5)
        .attr("fill", neutralColor()).attr("rx", 1);

      return { g, marker, markerText, slot: sl, sp };
    });

    // Result overlay — foreignObject for auto-wrapping Chinese text
    const resultFO = svg.append("foreignObject")
      .attr("x", 40).attr("y", 8).attr("width", W - 80).attr("height", 56)
      .style("opacity", 0);

    const resultDiv = resultFO.append("xhtml:div")
      .style("width", "100%").style("height", "100%")
      .style("display", "flex").style("align-items", "center").style("justify-content", "center")
      .style("font-size", "14px").style("font-weight", "600")
      .style("line-height", "1.5").style("text-align", "center")
      .style("padding", "6px 14px").style("box-sizing", "border-box")
      .style("border-radius", "8px");
    const resultText = resultDiv.append("span");

    // Instruction
    svg.append("text")
      .attr("x", W / 2).attr("y", H - 12)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-main)")
      .attr("font-size", 11).attr("opacity", 0.6)
      .text("拖拽火柴人至目标避险点 → 松手 → 等待 1 秒观察地震波反馈与科普说明");

    // Stick figure
    const stickmanG = svg.append("g")
      .attr("transform", `translate(${s.startX}, ${s.startY})`);
    const { mouth } = buildStickman(stickmanG);

    function resetAllSpots() {
      spotGroups.forEach(sg => {
        sg.g.select("rect:first-child").attr("stroke", neutralColor());
        sg.g.selectAll("rect:last-child").attr("fill", neutralColor());
        sg.marker.style("opacity", 0);
        sg.markerText.style("opacity", 0);
      });
    }

    function highlightSpot(idx) {
      resetAllSpots();
      if (idx == null) return;
      const sg = spotGroups[idx];
      const color = sg.sp.type === "safe" ? "var(--accent-blue)" : "var(--highlight-gold)";
      const bgColor = sg.sp.type === "safe" ? "rgba(84,122,149,0.1)" : "rgba(194,165,109,0.1)";
      sg.g.select("rect:first-child").attr("stroke", color);
      sg.g.selectAll("rect:last-child").attr("fill", color);
      sg.marker.style("opacity", 1).attr("stroke", color).attr("fill", bgColor);
      sg.markerText.style("opacity", 1).attr("fill", color).text(sg.sp.type === "safe" ? "✓" : "✗");
    }

    const drag = d3.drag()
      .on("start", function () {
        d3.select(this).style("cursor", "grabbing");
        resultFO.style("opacity", 0);
        mouth.attr("d", "M-5,-28 L5,-28");
        resetAllSpots();
      })
      .on("drag", function (event) {
        const tr = d3.select(this).attr("transform");
        const [cx, cy] = tr.match(/translate\(([^,]+),\s*([^)]+)\)/).slice(1).map(Number);
        d3.select(this).attr("transform", `translate(${cx + event.dx}, ${cy + event.dy})`);
      })
      .on("end", function () {
        d3.select(this).style("cursor", "grab");
        const tr = d3.select(this).attr("transform");
        const [cx, cy] = tr.match(/translate\(([^,]+),\s*([^)]+)\)/).slice(1).map(Number);

        let hitIdx = null;
        for (let i = 0; i < spotGroups.length; i++) {
          const sl = spotGroups[i].slot;
          if (cx >= sl.x && cx <= sl.x + sl.w && cy >= sl.y - 10 && cy <= sl.y + sl.h + 10) {
            hitIdx = i;
            break;
          }
        }

        highlightSpot(hitIdx);
        const hitSp = hitIdx != null ? s.spots[hitIdx] : null;

        setTimeout(() => {
          seismicWave(svg, cx, cy);
          if (!hitSp) {
            mouth.attr("d", "M-6,-26 Q0,-30 6,-26");
            resultFO.style("opacity", 1);
            resultDiv.style("background", "rgba(194,165,109,0.1)");
            resultText.style("color", "var(--highlight-gold)")
              .text("未到达避险区域，请将人物拖拽至标注的避险点");
          } else if (hitSp.type === "safe") {
            mouth.attr("d", "M-7,-26 Q0,-22 7,-26");
            resultFO.style("opacity", 1);
            resultDiv.style("background", "rgba(84,122,149,0.1)");
            resultText.style("color", "var(--accent-blue)")
              .text(`✓ 避险正确 — ${hitSp.tip}`);
          } else {
            mouth.attr("d", "M-7,-26 Q0,-32 7,-26");
            resultFO.style("opacity", 1);
            resultDiv.style("background", "rgba(194,165,109,0.1)");
            resultText.style("color", "var(--highlight-gold)")
              .text(`✗ 危险选择 — ${hitSp.tip}`);
          }
        }, 1000);
      });

    stickmanG.call(drag);

    // Reset
    const resetG = svg.append("g").attr("transform", `translate(${W - 100}, ${H - 34})`).style("cursor", "pointer")
      .on("click", () => {
        stickmanG.attr("transform", `translate(${s.startX}, ${s.startY})`);
        mouth.attr("d", "M-5,-28 L5,-28");
        resultFO.style("opacity", 0);
        resetAllSpots();
      });
    resetG.append("rect").attr("x", 0).attr("y", 0).attr("width", 82).attr("height", 26)
      .attr("fill", "none").attr("stroke", "var(--text-highlight)").attr("stroke-width", 1.2).attr("rx", 4);
    resetG.append("text").attr("x", 41).attr("y", 17.5).attr("text-anchor", "middle")
      .attr("fill", "var(--text-highlight)").attr("font-size", 11).text("重置位置");
  }

  renderSelect();
}
