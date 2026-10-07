// Interações que não dependem de animação: vídeos sob demanda, FAQ,
// carrosséis arrastáveis, contagem da campanha.

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Carrega o <source data-src> do vídeo na primeira vez que for preciso. */
export function loadVideo(video) {
  if (video.dataset.loaded) return
  video.dataset.loaded = '1'
  for (const source of video.querySelectorAll('source[data-src]')) source.src = source.dataset.src
  video.load()
}

export function playVideo(video) {
  if (reducedMotion()) return
  loadVideo(video)
  const p = video.play()
  if (p) p.catch(() => {})
}

/** Vídeos [data-lazy-video]: carregam perto da tela e só tocam visíveis. */
export function initLazyVideos() {
  // Pôsteres abaixo da dobra só baixam perto da tela, para não disputar
  // banda com o hero no primeiro carregamento.
  const posters = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.poster = e.target.dataset.poster
        posters.unobserve(e.target)
      }
    },
    { rootMargin: '800px 100%' },
  )
  for (const v of document.querySelectorAll('video[data-poster]')) posters.observe(v)

  const videos = document.querySelectorAll('video[data-lazy-video]')
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        if (!reducedMotion()) loadVideo(e.target)
        near.unobserve(e.target)
      }
    },
    { rootMargin: '300px 50%' },
  )
  const visible = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) playVideo(e.target)
        else e.target.pause()
      }
    },
    { threshold: 0.2 },
  )
  for (const v of videos) {
    near.observe(v)
    visible.observe(v)
  }

  const hero = document.querySelector('.hero__video')
  if (hero && reducedMotion()) hero.pause()
}

/** Acordeões com altura animada (o <details> nativo abre seco). */
export function initFaq() {
  for (const details of document.querySelectorAll('details.qa')) {
    const summary = details.querySelector('summary')
    const body = details.querySelector('.qa__body')
    let anim = null

    summary.addEventListener('click', (ev) => {
      if (reducedMotion()) return
      ev.preventDefault()
      anim?.cancel()
      const opening = !details.open
      const start = body.offsetHeight
      if (opening) details.open = true
      const end = opening ? body.scrollHeight : 0
      anim = body.animate(
        [{ height: `${opening ? 0 : start}px`, opacity: opening ? 0 : 1 }, { height: `${end}px`, opacity: opening ? 1 : 0 }],
        { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      )
      anim.onfinish = () => {
        if (!opening) details.open = false
        anim = null
      }
    })
  }
}

/** Arrastar com o mouse em trilhos com rolagem horizontal. */
export function initDragScroll() {
  for (const rail of document.querySelectorAll('[data-drag-scroll]')) {
    let startX = 0
    let startLeft = 0
    let moved = false
    let down = false

    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || rail.scrollWidth <= rail.clientWidth) return
      down = true
      moved = false
      startX = e.clientX
      startLeft = rail.scrollLeft
    })
    window.addEventListener('pointermove', (e) => {
      if (!down) return
      const dx = e.clientX - startX
      if (!moved && Math.abs(dx) > 6) {
        moved = true
        rail.classList.add('is-dragging')
      }
      if (moved) rail.scrollLeft = startLeft - dx
    })
    window.addEventListener('pointerup', () => {
      if (!down) return
      down = false
      rail.classList.remove('is-dragging')
    })
    // Um arraste não pode virar clique no card.
    rail.addEventListener(
      'click',
      (e) => {
        if (moved) {
          e.preventDefault()
          e.stopPropagation()
          moved = false
        }
      },
      true,
    )
    rail.addEventListener('dragstart', (e) => e.preventDefault())
  }

  for (const nav of document.querySelectorAll('[data-rail-nav]')) {
    const rail = nav.previousElementSibling
    const step = () => (rail.firstElementChild?.getBoundingClientRect().width ?? 300) + 16
    nav.querySelector('[data-rail-prev]').addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }))
    nav.querySelector('[data-rail-next]').addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }))
  }
}

/** "Faltam N dias" até a data da campanha; some depois dela. */
export function initCountdown() {
  const el = document.querySelector('[data-countdown]')
  if (!el) return
  const [y, m, d] = el.dataset.countdown.split('-').map(Number)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((new Date(y, m - 1, d) - today) / 86400000)
  if (days < 0) return
  el.innerHTML = days === 0 ? '<b>É hoje!</b>' : days === 1 ? '<b>1</b> dia para a data' : `<b>${days}</b> dias para a data`
  el.hidden = false
}
