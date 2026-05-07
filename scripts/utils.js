import * as d3 from "d3";

/**
 * 在指定位置生成扩散波纹
 */
export function createSeismicWave(containerSelector, x, y) {
  const svg = d3.select(containerSelector);
  
  svg.append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 0)
    .attr("fill", "none")
    .attr("stroke", "var(--highlight-gold)")
    .attr("stroke-width", 2)
    .style("opacity", 0.8)
    .transition()
    .duration(2000)
    .ease(d3.easeCircleOut)
    .attr("r", 800)
    .style("opacity", 0)
    .remove();
}