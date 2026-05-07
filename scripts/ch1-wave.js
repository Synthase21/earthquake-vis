import * as d3 from "d3";

export function initCh1() {
    drawFaultSimulation();
    drawWaveComparison();
    setupScrollEffects();
}

// 1.1 断层点击与差异波速模拟
function drawFaultSimulation() {
    const container = d3.select("#fault-viz");
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 350;
    const boundaryY = 150; // 分界面高度

    const svg = container.append("svg").attr("width", "100%").attr("height", height);

    // 绘制上下两个地层
    svg.append("rect").attr("width", "100%").attr("height", boundaryY).attr("fill", "#C5D3E0"); // 浅层
    svg.append("rect").attr("y", boundaryY).attr("width", "100%").attr("height", height - boundaryY).attr("fill", "#A5B8C8"); // 深层

    // 绘制岩石质感（点）
    const drawRocks = (yStart, yEnd, density, count) => {
        for (let i = 0; i < count; i++) {
            svg.append("circle")
                .attr("cx", Math.random() * width)
                .attr("cy", yStart + Math.random() * (yEnd - yStart))
                .attr("r", Math.random() * 2)
                .attr("fill", "#2C3947")
                .attr("opacity", density);
        }
    };
    drawRocks(0, boundaryY, 0.2, 100); // 稀疏
    drawRocks(boundaryY, height, 0.5, 300); // 密集

    // 断层斜线
    svg.append("line")
        .attr("x1", "40%").attr("y1", 30).attr("x2", "60%").attr("y2", height - 30)
        .attr("stroke", "#2C3947").attr("stroke-width", 3).attr("stroke-dasharray", "5,5");

    svg.on("click", (event) => {
        const [mx, my] = d3.pointer(event);
        
        // 触发抖动
        d3.select("body").classed("shaking", true);
        setTimeout(() => d3.select("body").classed("shaking", false), 400);

        // 产生4个同心圆，每个圆带有速度差异
        for (let i = 0; i < 4; i++) {
            const circle = svg.append("path")
                .attr("fill", "none")
                .attr("stroke", "#C2A56D")
                .attr("stroke-width", 2)
                .attr("opacity", 0.8);

            const timer = d3.timer((elapsed) => {
                const t = (elapsed - i * 400) / 3000;
                if (t < 0) return;
                if (t > 1) { circle.remove(); timer.stop(); return; }

                // 物理核心：在不同地层半径增长率不同
                // 简化模型：计算圆弧上的点，y坐标越深，半径扩张越快
                const segments = 60;
                const pathData = d3.range(segments + 1).map(idx => {
                    const angle = (idx / segments) * Math.PI * 2;
                    const baseR = t * 600;
                    // 如果点在下方地层，半径倍增 (速度快)
                    const currentY = my + Math.sin(angle) * baseR;
                    const speedMult = currentY > boundaryY ? 1.8 : 0.8;
                    return [
                        mx + Math.cos(angle) * baseR * speedMult,
                        my + Math.sin(angle) * baseR * speedMult
                    ];
                });
                circle.attr("d", d3.line().curve(d3.curveBasisClosed)(pathData))
                      .style("opacity", 0.8 * (1 - t));
            });
        }
    });
}

// 1.3 波形对比与房屋联动
function drawWaveComparison() {
    const renderWave = (containerId, type) => {
        const box = d3.select(containerId);
        const w = 350, h = 150;
        const svg = box.append("svg").attr("viewBox", `0 0 ${w} ${h}`);
        
        // 绘制质点链
        const numParticles = 30;
        const particles = d3.range(numParticles).map(i => ({ ox: 20 + i * 10, x: 20 + i * 10, y: h / 2 }));
        const dots = svg.selectAll("circle").data(particles).join("circle").attr("r", 2.5).attr("fill", "#547A95");

        // 绘制房屋 (由路径组成：底座矩形+顶三角形+门窗)
        const houseG = svg.append("g").attr("transform", `translate(${w - 60}, ${h / 2 - 20})`);
        houseG.append("rect").attr("width", 30).attr("height", 30).attr("fill", "none").attr("stroke", "#000"); // 墙
        houseG.append("path").attr("d", "M 0 0 L 15 -15 L 30 0 Z").attr("fill", "none").attr("stroke", "#000"); // 屋顶
        houseG.append("rect").attr("x", 18).attr("y", 15).attr("width", 8).attr("height", 15).attr("fill", "none").attr("stroke", "#000"); // 门
        houseG.append("rect").attr("x", 4).attr("y", 6).attr("width", 8).attr("height", 8).attr("fill", "none").attr("stroke", "#000"); // 窗

        let isActive = false;
        box.on("click", () => isActive = !isActive);

        d3.timer((elapsed) => {
            if (!isActive) return;
            const t = elapsed / 1000;
            
            if (type === 'P') {
                dots.attr("cx", d => d.ox + 8 * Math.sin(t * 5 - d.ox * 0.1)).attr("cy", h / 2);
                houseG.attr("transform", `translate(${w - 60}, ${h / 2 - 20 + 3 * Math.sin(t * 10)})`);
            } else {
                dots.attr("cx", d => d.ox).attr("cy", d => h / 2 + 15 * Math.sin(t * 5 - d.ox * 0.05));
                const waveY = 10 * Math.sin(t * 5 - (w - 60) * 0.05);
                houseG.attr("transform", `translate(${w - 60 + waveY}, ${h / 2 - 20}) skewX(${waveY * 0.5})`);
            }
        });
    };

    renderWave("#p-viz", "P");
    renderWave("#s-viz", "S");
}

// 修正后的滚动监听逻辑
function setupScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当元素进入视野
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // 离开视野时重置，确保下次翻回来还有动画效果
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.step').forEach(s => observer.observe(s));
}