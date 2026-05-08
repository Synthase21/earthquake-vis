import './style.css'
import { initCh1 } from './scripts/ch1-wave.js'
import { initCh2 } from './scripts/ch2-intensity.js'
import { initCh3 } from './scripts/ch3-global-data.js'

document.addEventListener('DOMContentLoaded', () => {
  initCh1()
  initCh2()
  initCh3()

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.5 })

  document.querySelectorAll('.step').forEach(s => observer.observe(s))
})
