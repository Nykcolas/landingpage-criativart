// Camada de movimento: rolagem suave, entradas, parallax, showcase fixo,
// marquees. Só roda quando o usuário não pediu movimento reduzido.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { playVideo } from './ui.js'

gsap.registerPlugin(ScrollTrigger)

const DESKTOP = '(min-width: 1024px)'
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/** Roda `cb` quando o preloader (script inline no index.html) liberar a página. */
function onPreloaderDone(cb) {
  if (window.__preloaderDone) cb()
  else window.addEventListener('preloader:done', cb, { once: true })
}

export function initMotion() {
  const lenis = initSmoothScroll()
  ScrollTrigger.config({ ignoreMobileResize: true })

  initHero()
  initReveals()
  initParallax()
  initTicker()
  initShowcase()
  initWhy()
  initSteps()
  initMarquees(lenis)
  initMagnetic()
  initFinal()
  initChrome(lenis)

  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  window.addEventListener('load', () => ScrollTrigger.refresh())
}

// ------------------------------------------------------------ rolagem
function initSmoothScroll() {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)

  for (const a of document.querySelectorAll('a[href^="#"]')) {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')
      const target = id === '#' ? null : document.querySelector(id)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(id === '#inicio' ? 0 : target, { offset: -8, duration: 1.4 })
    })
  }
  // Sem rolagem enquanto o preloader cobre a página.
  if (!window.__preloaderDone) {
    lenis.stop()
    onPreloaderDone(() => lenis.start())
  }
  return lenis
}

// ------------------------------------------------------ texto dividido
/** Quebra o texto em palavras com máscara; preserva .grad em cada palavra. */
function splitWords(el) {
  const walk = (node, inGrad) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment()
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part) continue
          if (/^\s+$/.test(part)) {
            frag.append(document.createTextNode(' '))
            continue
          }
          const outer = document.createElement('span')
          outer.className = 'sw'
          const inner = document.createElement('span')
          inner.className = inGrad ? 'sw__i grad' : 'sw__i'
          inner.textContent = part
          outer.append(inner)
          frag.append(outer)
        }
        child.replaceWith(frag)
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        const isGrad = child.classList.contains('grad')
        if (isGrad) child.classList.replace('grad', 'grad-host')
        walk(child, inGrad || isGrad)
      }
    }
  }
  walk(el, false)
  el.classList.add('is-split')
  return el.querySelectorAll('.sw__i')
}

// ---------------------------------------------------------------- hero
function initHero() {
  const title = document.querySelector('[data-hero-title]')
  const words = splitWords(title)
  const mm = gsap.matchMedia()

  mm.add({ desktop: DESKTOP, mobile: '(max-width: 1023px)' }, ({ conditions }) => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
    onPreloaderDone(() => tl.play())
    if (conditions.desktop) {
      tl.fromTo('[data-hero-media]', { clipPath: 'inset(18% 18% 18% 18% round 32px)' }, { clipPath: 'inset(0% 0% 0% 0% round 32px)', duration: 1.8 }, 0)
    }
    tl.fromTo('.hero__video', { scale: 1.25 }, { scale: 1, duration: 2.4 }, 0)
      .fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.3, stagger: 0.06 }, 0.2)
      .fromTo('[data-hero-in]', { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.55)
      .fromTo('[data-hero-pop]', { autoAlpha: 0, scale: 0.85, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.3, stagger: 0.14 }, 0.9)

    // Saída do hero: o conteúdo sobe mais devagar e some; a mídia afunda.
    gsap.to('.hero__content', {
      yPercent: -14,
      autoAlpha: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    })
    gsap.to(conditions.desktop ? '[data-hero-stage]' : '.hero__media', {
      yPercent: conditions.desktop ? 10 : 18,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    })
    if (conditions.desktop) {
      gsap.to('.hero__float--a', { yPercent: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hero__float--b', { yPercent: -110, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('[data-float] img', { y: -12, duration: 3.4, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 1.1 })
    }
  })
}

// ------------------------------------------------------------- entradas
function initReveals() {
  for (const el of document.querySelectorAll('[data-split]')) {
    const words = splitWords(el)
    gsap.fromTo(words, { yPercent: 115 }, {
      yPercent: 0,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.045,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  }

  for (const el of document.querySelectorAll('[data-reveal]')) {
    gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
      autoAlpha: 1,
      y: 0,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  }

  for (const group of document.querySelectorAll('[data-reveal-group]')) {
    gsap.fromTo(group.querySelectorAll('[data-reveal-item]'), { autoAlpha: 0, y: 32 }, {
      autoAlpha: 1,
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    })
  }

  // Mídia que "abre" ao entrar na tela.
  for (const el of document.querySelectorAll('[data-clip-reveal]')) {
    const inner = el.querySelector('video, img')
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 35%', scrub: 1 } })
    tl.fromTo(el, { clipPath: 'inset(16% 12% 16% 12% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none' }, 0)
    if (inner) tl.fromTo(inner, { scale: 1.3 }, { scale: 1, ease: 'none' }, 0)
  }

  // Cards de categoria e diferenciais entram em sequência.
  gsap.utils.toArray('[data-cat]').forEach((card) => {
    gsap.fromTo(card, { autoAlpha: 0, y: 70 }, {
      autoAlpha: 1,
      y: 0,
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: card, start: 'top 94%', once: true },
    })
  })
}

// ------------------------------------------------------------- parallax
function initParallax() {
  for (const el of document.querySelectorAll('[data-parallax]')) {
    const amount = Number(el.dataset.parallax) || 10
    gsap.fromTo(el, { yPercent: -amount }, {
      yPercent: amount,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }

  for (const img of document.querySelectorAll('[data-zoom]')) {
    gsap.fromTo(img, { scale: 1.22 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom 40%', scrub: true },
    })
  }

  // Imagem dentro de cada categoria corre levemente contra a rolagem.
  const mm = gsap.matchMedia()
  mm.add(DESKTOP, () => {
    for (const wrap of document.querySelectorAll('.cat__img')) {
      gsap.fromTo(wrap, { yPercent: -6 }, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: wrap.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }
  })
}

// --------------------------------------------------------------- ticker
function initTicker() {
  const track = document.querySelector('[data-ticker]')
  if (!track) return
  gsap.fromTo(track, { xPercent: 0 }, {
    xPercent: -28,
    ease: 'none',
    scrollTrigger: { trigger: track.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
  })
}

// ------------------------------------------------------------- showcase
function initShowcase() {
  const stage = document.querySelector('[data-show]')
  if (!stage) return
  const scenes = gsap.utils.toArray('[data-scene]', stage)
  const bars = gsap.utils.toArray('[data-show-bar]', stage)
  const videos = scenes.map((s) => s.querySelector('video'))
  const last = scenes.length - 1
  let active = -1

  const setActive = (i) => {
    if (i === active) return
    active = i
    videos.forEach((v, j) => (j === i ? playVideo(v) : v.pause()))
  }

  scenes.forEach((s, i) => {
    s.style.zIndex = String(i + 1)
    if (i) gsap.set(s, { clipPath: 'inset(100% 0% 0% 0%)' })
    if (i) gsap.set(s.querySelectorAll('.scene__caption > *'), { autoAlpha: 0, y: 60 })
  })

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: () => `+=${last * window.innerHeight * 1.15}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress * last
        bars.forEach((b, i) => b.style.setProperty('--p', String(gsap.utils.clamp(0, 1, p - i + 1))))
        setActive(Math.min(last, Math.round(p)))
      },
      onToggle: (self) => {
        if (self.isActive) {
          const i = active < 0 ? 0 : active
          active = -1
          setActive(i)
        } else {
          videos.forEach((v) => v.pause())
          active = -1
        }
      },
    },
  })

  for (let i = 1; i <= last; i++) {
    const at = i - 1
    const prev = scenes[i - 1]
    const next = scenes[i]
    tl.to(next, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, at)
      .fromTo(next.querySelector('.scene__media'), { scale: 1.3 }, { scale: 1, duration: 1, ease: 'power2.out', immediateRender: false }, at)
      .fromTo(prev.querySelector('.scene__media'), { scale: 1, autoAlpha: 1 }, { scale: 0.86, autoAlpha: 0.35, duration: 1, immediateRender: false }, at)
      .to(prev.querySelectorAll('.scene__caption > *'), { y: -50, autoAlpha: 0, duration: 0.45, stagger: 0.04 }, at)
      .to(next.querySelectorAll('.scene__caption > *'), { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, at + 0.45)
  }
  tl.to({}, { duration: 0.35 })

  // Primeira cena cresce enquanto o palco chega ao topo.
  gsap.fromTo(scenes[0].querySelector('.scene__media'), { scale: 0.82 }, {
    scale: 1,
    ease: 'none',
    immediateRender: false,
    scrollTrigger: { trigger: stage, start: 'top bottom', end: 'top top', scrub: true },
  })
}

// ---------------------------------------------------------- por que nós
function initWhy() {
  const items = gsap.utils.toArray('[data-why-item]')
  const imgs = gsap.utils.toArray('[data-why-img]')
  const mm = gsap.matchMedia()
  mm.add(DESKTOP, () => {
    const activate = (i) => {
      items.forEach((el, j) => el.classList.toggle('is-active', j === i))
      imgs.forEach((el, j) => el.classList.toggle('is-active', j === i))
    }
    activate(0)
    items.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 62%',
        end: 'bottom 62%',
        onToggle: (self) => self.isActive && activate(i),
      })
    })
    return () => items.forEach((el) => el.classList.remove('is-active'))
  })
}

// ------------------------------------------------------- como funciona
function initSteps() {
  const wrap = document.querySelector('[data-steps]')
  if (!wrap) return
  const steps = gsap.utils.toArray('[data-step]', wrap)
  ScrollTrigger.create({
    trigger: wrap,
    start: 'top 72%',
    end: 'bottom 55%',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress
      wrap.style.setProperty('--p', p.toFixed(4))
      steps.forEach((s, i) => s.classList.toggle('is-on', p >= i / (steps.length - 1) - 0.02))
    },
  })
  gsap.fromTo(steps, { autoAlpha: 0, y: 40 }, {
    autoAlpha: 1,
    y: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.15,
    scrollTrigger: { trigger: wrap, start: 'top 82%', once: true },
  })
}

// -------------------------------------------------------------- marquee
function initMarquees(lenis) {
  const loops = []
  for (const row of document.querySelectorAll('[data-marquee]')) {
    const track = row.querySelector('.insta__track')
    // Duplica o conteúdo para o loop ficar contínuo. Via <template> porque
    // uma <img> clonada fora do documento baixa na hora e ignora o lazy.
    const tpl = document.createElement('template')
    tpl.innerHTML = track.innerHTML
    for (const clone of tpl.content.children) {
      clone.setAttribute('aria-hidden', 'true')
      clone.tabIndex = -1
    }
    track.append(tpl.content)
    const dir = Number(row.dataset.marquee)
    const tween = gsap.fromTo(track, { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration: 60, ease: 'none', repeat: -1 })
    const loop = { tween, hover: false }
    row.addEventListener('mouseenter', () => (loop.hover = true))
    row.addEventListener('mouseleave', () => (loop.hover = false))
    ScrollTrigger.create({ trigger: row, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? tween.play() : tween.pause()) })
    loops.push(loop)
  }
  if (!loops.length) return

  // A rolagem dá um empurrão no marquee; o hover desacelera.
  let boost = 0
  lenis.on('scroll', (e) => {
    boost = Math.max(boost, Math.min(Math.abs(e.velocity) / 5, 5))
  })
  gsap.ticker.add(() => {
    boost *= 0.93
    for (const l of loops) {
      const target = (l.hover ? 0.15 : 1) + boost
      const current = l.tween.timeScale()
      l.tween.timeScale(current + (target - current) * 0.08)
    }
  })
}

// ---------------------------------------------------- botões magnéticos
function initMagnetic() {
  const mm = gsap.matchMedia()
  mm.add(FINE_POINTER, () => {
    const handlers = []
    for (const btn of document.querySelectorAll('.btn--lg, .btn--xl')) {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3.out' })
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3.out' })
      const move = (e) => {
        const r = btn.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.22)
        yTo((e.clientY - r.top - r.height / 2) * 0.32)
      }
      const leave = () => {
        xTo(0)
        yTo(0)
      }
      btn.addEventListener('mousemove', move)
      btn.addEventListener('mouseleave', leave)
      handlers.push([btn, move, leave])
    }
    return () => {
      for (const [btn, move, leave] of handlers) {
        btn.removeEventListener('mousemove', move)
        btn.removeEventListener('mouseleave', leave)
      }
    }
  })
}

// ------------------------------------------------------------ CTA final
function initFinal() {
  const mark = document.querySelector('[data-final-mark]')
  if (!mark) return
  gsap.fromTo(mark, { scale: 0.8, rotate: -8 }, {
    scale: 1.05,
    rotate: 4,
    ease: 'none',
    scrollTrigger: { trigger: '[data-final]', start: 'top bottom', end: 'bottom top', scrub: true },
  })
}

// ---------------------------------------------------- cabeçalho e dock
function initChrome(lenis) {
  const header = document.querySelector('[data-header]')
  const dock = document.querySelector('[data-dock]')
  const hero = document.querySelector('.hero')
  const final = document.querySelector('[data-final]')
  let finalInView = false

  ScrollTrigger.create({
    trigger: final,
    start: 'top 85%',
    end: 'max',
    onToggle: (s) => (finalInView = s.isActive),
  })

  lenis.on('scroll', ({ scroll, direction }) => {
    header.classList.toggle('is-scrolled', scroll > 40)
    header.classList.toggle('is-hidden', direction === 1 && scroll > window.innerHeight * 0.6)
    const pastHero = scroll > hero.offsetHeight * 0.75
    dock.classList.toggle('is-visible', pastHero && !finalInView)
  })
}
