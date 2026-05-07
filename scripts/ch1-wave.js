import * as d3 from "d3";

export function initCh1() {
    drawFault();
    drawWaveSims();
    setupScroll();
}

function drawFault() {
    const container = d3.select("#fault-viz");
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 380;
    const boundaryY = 160;

    const svg = container.append("svg").attr("width", "100%").attr("height", height);

    // 地层与岩石点绘制（代码同前，保持不变）
    svg.append("rect").attr("width", "100%").attr("height", boundaryY).attr("fill", "#C5D3E0");
    svg.append("rect").attr("y", boundaryY).attr("width", "100%").attr("height", height - boundaryY).attr("fill", "#A5B8C8");
    const createDots = (yS, yE, d, n) => {
        for(let i=0; i<n; i++){
            svg.append("circle").attr("cx", Math.random()*width).attr("cy", yS+Math.random()*(yE-yS))
               .attr("r", Math.random()*1.8).attr("fill", "#2C3947").attr("opacity", d);
        }
    };
    createDots(0, boundaryY, 0.2, 80);
    createDots(boundaryY, height, 0.5, 250);

    // 断层线
    svg.append("line").attr("x1","45%").attr("y1",40).attr("x2","55%").attr("y2",height-40)
       .attr("stroke","#2C3947").attr("stroke-width",3).attr("stroke-dasharray","6,6");

    // 点击交互：生成波纹 + 触发震动
    svg.on("click", (e) => {
        const [mx, my] = d3.pointer(e);
        
        // --- 核心修改：确保 body 加上 shaking 类 ---
        d3.select("body").classed("shaking", true);
        // 500ms 后移除，允许下次点击再次触发
        setTimeout(() => d3.select("body").classed("shaking", false), 500);

        for(let i=0; i<4; i++){
            const circle = svg.append("path").attr("fill","none").attr("stroke","#C2A56D").attr("stroke-width",2);
            const timer = d3.timer((elapsed) => {
                const t = (elapsed - i*500) / 3500;
                if(t<0) return;
                if(t>1) { circle.remove(); timer.stop(); return; }
                const segments = 80;
                const pathData = d3.range(segments+1).map(idx => {
                    const angle = (idx/segments)*Math.PI*2;
                    const baseR = t*700;
                    const py = my + Math.sin(angle)*baseR;
                    const speed = py > boundaryY ? 1.9 : 0.8;
                    return [mx + Math.cos(angle)*baseR*speed, my + Math.sin(angle)*baseR*speed];
                });
                circle.attr("d", d3.line().curve(d3.curveBasisClosed)(pathData)).style("opacity", 0.7*(1-t));
            });
        }
    });
}

function drawWaveSims() {
    const setup = (id, type) => {
        const box = d3.select(id);
        const w = 380, h = 180;
        const svg = box.append("svg").attr("viewBox", `0 0 ${w} ${h}`);
        
        // --- 核心修改：S波质点变为沙金色，P波保持钢蓝色 ---
        const particleColor = (type === 'P') ? "var(--accent-blue)" : "var(--highlight-gold)";
        const dots = svg.selectAll("circle")
                        .data(d3.range(35))
                        .join("circle")
                        .attr("r", 2.8)
                        .attr("fill", particleColor);

        const houseG = svg.append("g").attr("transform", `translate(${w-70}, ${h/2-20})`);
        
        const drawHouse = (g, color="#000") => {
            g.append("rect").attr("width",35).attr("height",35).attr("fill","none").attr("stroke",color).attr("stroke-width",2);
            g.append("path").attr("d","M 0 0 L 17.5 -18 L 35 0 Z").attr("fill","none").attr("stroke",color).attr("stroke-width",2);
            g.append("rect").attr("x",22).attr("y",15).attr("width",8).attr("height",20).attr("fill","none").attr("stroke",color);
        };
        drawHouse(houseG);

        // --- 核心修改：删掉绘制 sPath (黄色实线) 的逻辑 ---
        // const sPath = type==='S' ? ... // 已删除

        let active = false;
        let collapsed = false;

        box.on("click", () => {
            active = !active;
            if(!active && type==='S') collapsed = true;
        });

        d3.timer((elapsed) => {
            const t = elapsed/1000;
            if(active){
                if(type === 'P'){
                    dots.attr("cx", i => 30+i*8 + 10*Math.sin(t*6 - i*0.4)).attr("cy", h/2);
                    houseG.attr("transform", `translate(${w-70}, ${h/2-20 + 5*Math.sin(t*12)})`);
                } else {
                    // S波质点模拟：只上下波动
                    dots.attr("cx", i => 30+i*8).attr("cy", i => h/2 + 20*Math.sin(t*6 - i*0.3));
                    const wy = 15*Math.sin(t*6 - (w-70)*0.04);
                    houseG.attr("transform", `translate(${w-70+wy}, ${h/2-20}) skewX(${wy*0.6})`);
                }
            } else {
                if(type==='S' && collapsed){
                    houseG.transition().duration(500)
                          .attr("transform", `translate(${w-65}, ${h/2-10}) rotate(15) skewX(10)`)
                          .style("opacity", 0.8);
                } else {
                    houseG.attr("transform", `translate(${w-70}, ${h/2-20}) skewX(0) rotate(0)`);
                }
            }
        });
    };
    setup("#p-box", "P");
    setup("#s-box", "S");
}

function setupScroll() {
    const obs = new IntersectionObserver((es) => {
        es.forEach(e => {
            if(e.isIntersecting) e.target.classList.add('visible');
            else e.target.classList.remove('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.step').forEach(s => obs.observe(s));
}