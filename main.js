import './style.css'
import { initCh1 } from './scripts/ch1-wave.js'
// import { initCh2 } from './scripts/ch2-intensity.js' // 等待组员B提交
// 复制到 main.js：导入并初始化黄一杨负责的两个模块
import { initCh2} from './scripts/ch2-intensity.js';
import { initCh3 } from './scripts/ch3-global-data.js';


document.querySelector('#app').innerHTML = `
  <section class="step" id="intro">
    <h1 style="color: var(--text-highlight)">地球表面并非铁板一块</h1>
    <p>在我们脚下，岩层正无声地积蓄着能量。</p>
    <div id="earth-section" style="width: 600px; height: 300px; background: #ddd; cursor: crosshair;">
      <!-- 这里放置地层剖面图SVG -->
      <p style="text-align:center; padding-top:100px">点击此处模拟断层破裂</p>
    </div>
  </section>

  <section class="step" id="ch1">
    <div class="content">
      <h2 style="color: var(--text-highlight)">地震波：能量的舞步</h2>
      <div id="ch1-wave-viz"></div>
      <div class="desc">
        <p><b style="color:var(--accent-blue)">P波 (纵波)</b>：质点沿传播方向前后往复，速度最快。</p>
        <p><b style="color:var(--highlight-gold)">S波 (横波)</b>：质点垂直于传播方向摇摆，是破坏力的主要来源。</p>
      </div>
    </div>
  </section>


  <section class="step" id="ch2">
    <div class="content">
      <h2 style="color: var(--text-highlight)">房屋震动与破坏</h2>
      <div id="ch2-intensity-viz"></div>
    </div>
  </section>

  <section class="step" id="ch3">
    <div class="content">
      <h2 style="color: var(--text-highlight)">全球地震数据</h2>
      <div id="ch3-global-data-viz"></div>
    </div>
  </section>
`

// 组长负责的初始化逻辑
initCh1();
initCh2();
initCh3();

// 简单的滚动触发逻辑
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // 这里可以触发特定章节的动画重置
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.step').forEach(s => observer.observe(s));
