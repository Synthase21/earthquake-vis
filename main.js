import './style.css'
import { initCh1 } from './scripts/ch1-wave.js'
import { initCh4Evacuation } from './scripts/ch4-evacuation.js'
import { initCh4Architecture } from './scripts/ch4-architecture.js'

document.addEventListener('DOMContentLoaded', () => {
    // 初始化第一章
    initCh1();

    // 可以在此初始化后续章节
    // initCh2();

    // 成员C — 第四章
    initCh4Evacuation();
    initCh4Architecture();
});