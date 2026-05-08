import './style.css'
import { initCh1 } from './scripts/ch1-wave.js'
import { initCh2 } from './scripts/ch2-intensity.js'
import { initCh3 } from './scripts/ch3-global-data.js'
import { initCh4Evacuation } from './scripts/ch4-evacuation.js'
import { initCh4Architecture } from './scripts/ch4-architecture.js'

document.addEventListener('DOMContentLoaded', () => {
    initCh1();
    initCh2();
    initCh3();
    initCh4Evacuation();
    initCh4Architecture();
});

// 滚动触发逻辑
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.step').forEach(s => observer.observe(s));
