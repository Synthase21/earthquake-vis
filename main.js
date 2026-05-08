import './style.css'
import { initCh1 } from './scripts/ch1-wave.js'
// import { initCh2 } from './scripts/ch2-intensity.js' // 等待组员B提交
// 复制到 main.js：导入并初始化黄一杨负责的两个模块
import { initCh2} from './scripts/ch2-intensity.js';
import { initCh3 } from './scripts/ch3-global-data.js';


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
