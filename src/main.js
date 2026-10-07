// A fonte Inter é declarada e pré-carregada no <head> (index.html).
import 'lenis/dist/lenis.css'
import './styles/main.css'

import { initCountdown, initDragScroll, initFaq, initLazyVideos } from './js/ui.js'
import { initMotion } from './js/motion.js'

initFaq()
initDragScroll()
initCountdown()

// A classe .motion é decidida no <head>; se o bundle demorar demais ela
// é removida lá e a página segue no modo estático.
if (document.documentElement.classList.contains('motion')) {
  window.__motionReady = true
  initMotion()
} else {
  initStaticChrome()
}

// Depois do movimento: o marquee clona os reels e os clones também precisam
// ser observados.
initLazyVideos()

// Sem animações: cabeçalho e CTA fixo reagem só à rolagem nativa.
function initStaticChrome() {
  const header = document.querySelector('[data-header]')
  const dock = document.querySelector('[data-dock]')
  const hero = document.querySelector('.hero')
  const final = document.querySelector('[data-final]')
  const onScroll = () => {
    header.classList.toggle('is-scrolled', scrollY > 40)
    const nearEnd = scrollY + innerHeight * 0.85 > final.offsetTop
    dock.classList.toggle('is-visible', scrollY > hero.offsetHeight * 0.75 && !nearEnd)
  }
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}
