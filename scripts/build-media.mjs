// Gera as mídias otimizadas da landing a partir de assets/ (originais do Instagram).
// Saída em public/media — rode `npm run media` sempre que trocar um original.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import ffmpeg from 'ffmpeg-static'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC_IMG = path.join(ROOT, 'assets/images')
const SRC_VID = path.join(ROOT, 'assets/videos')
const OUT_IMG = path.join(ROOT, 'public/media/img')
const OUT_VID = path.join(ROOT, 'public/media/video')
const OUT_BRAND = path.join(ROOT, 'public/brand')

for (const d of [OUT_IMG, OUT_VID, OUT_BRAND]) fs.mkdirSync(d, { recursive: true })

const WIDTHS = [480, 960, 1440]

// ---------------------------------------------------------------- imagens
const images = fs.readdirSync(SRC_IMG).filter((f) => /\.(jpe?g|png)$/i.test(f))
for (const file of images) {
  const slug = slugify(file)
  const input = sharp(path.join(SRC_IMG, file)).rotate()
  const { width } = await input.metadata()
  for (const w of WIDTHS) {
    if (w > width && w !== WIDTHS[0]) continue
    const out = path.join(OUT_IMG, `${slug}-${w}.webp`)
    if (fs.existsSync(out)) continue
    await input.clone().resize({ width: Math.min(w, width) }).webp({ quality: 74 }).toFile(out)
  }
  console.log('img', slug)
}

// ---------------------------------------------------------------- vídeos
// Cada clipe é uma lista de cortes [arquivo, início, fim] — só trechos sem
// legenda gravada. Mais de um corte vira montagem com crossfade.
const CLIPS = {
  hero: { width: 720, crf: 31, cuts: [
    ['lazer_mdf', 1.0, 5.0],
    ['maquina_drf_uv', 47.2, 51.0],
    ['maquina_drf_uv', 59.2, 63.2],
    ['lazer_mdf', 22.5, 26.5],
    ['luminaria_medico', 27.5, 31.5],
  ] },
  'show-laser': { width: 720, cuts: [['maquina_mdf', 18.0, 21.0], ['lazer_mdf', 5.0, 9.0]] },
  'show-uv': { width: 720, crf: 30, cuts: [['maquina_drf_uv', 47.2, 51.0], ['maquina_drf_uv', 59.2, 65.5]] },
  'show-luz': { width: 720, cuts: [['luminaria_arvore', 0.0, 8.0]] },
  'show-presente': { width: 720, cuts: [['luminaria_medico', 20.5, 33.0]] },
  essencia: { width: 720, cuts: [['luminaria_medico', 0.5, 11.0]] },
  campanha: { width: 720, cuts: [['relogio_acrilico_professor', 0.0, 12.0]] },
  'ig-brain': { width: 400, cuts: [['luminaria_brain', 3.0, 8.0]] },
  'ig-caixas': { width: 400, cuts: [['lazer_mdf', 13.0, 18.0]] },
  'ig-uv': { width: 400, cuts: [['maquina_drf_uv', 59.2, 64.2]] },
}

const FADE = 0.6

for (const [name, { width, cuts, crf }] of Object.entries(CLIPS)) {
  const out = path.join(OUT_VID, `${name}.mp4`)
  if (!fs.existsSync(out)) {
    const args = ['-v', 'error', '-y']
    for (const [file, start, end] of cuts) {
      args.push('-ss', String(start), '-t', String(end - start), '-i', path.join(SRC_VID, `${file}.mp4`))
    }
    const norm = cuts.map((_, i) => `[${i}:v]scale=${width}:-2,fps=30,format=yuv420p,setsar=1,settb=AVTB[v${i}]`)
    let last = 'v0'
    let offset = 0
    const fades = []
    for (let i = 1; i < cuts.length; i++) {
      offset += cuts[i - 1][2] - cuts[i - 1][1] - FADE
      const label = i === cuts.length - 1 ? 'vout' : `x${i}`
      fades.push(`[${last}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(2)}[${label}]`)
      last = label
    }
    const graph = [...norm, ...fades].join(';')
    args.push(
      '-filter_complex', graph,
      '-map', cuts.length > 1 ? '[vout]' : '[v0]',
      '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf ?? (width > 500 ? 27 : 29)),
      '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out,
    )
    execFileSync(ffmpeg, args, { stdio: 'inherit' })
  }
  const poster = path.join(OUT_VID, `${name}.webp`)
  if (!fs.existsSync(poster)) {
    const tmp = path.join(OUT_VID, `${name}.poster.png`)
    execFileSync(ffmpeg, ['-v', 'error', '-y', '-ss', '0.2', '-i', out, '-frames:v', '1', tmp])
    await sharp(tmp).webp({ quality: 70 }).toFile(poster)
    fs.rmSync(tmp)
  }
  console.log('vid', name, (fs.statSync(out).size / 1e6).toFixed(2) + 'MB')
}

// ---------------------------------------------------------------- quadros
// Fotos extraídas dos vídeos para a seção da loja (sem legenda gravada).
const STILLS = {
  'still-loja-placa': ['luminaria_medico', 25.5],
  'still-loja-laser': ['maquina_mdf', 19.5],
  'still-loja-uv': ['maquina_drf_uv', 49.6],
}
for (const [name, [file, t]] of Object.entries(STILLS)) {
  const out = path.join(OUT_IMG, `${name}-480.webp`)
  if (fs.existsSync(out)) continue
  const tmp = path.join(OUT_IMG, `${name}.png`)
  execFileSync(ffmpeg, ['-v', 'error', '-y', '-ss', String(t), '-i', path.join(SRC_VID, `${file}.mp4`), '-frames:v', '1', tmp])
  await sharp(tmp).resize({ width: 480 }).webp({ quality: 74 }).toFile(out)
  await sharp(tmp).webp({ quality: 76 }).toFile(path.join(OUT_IMG, `${name}-960.webp`)) // 720px de largura real
  fs.rmSync(tmp)
  console.log('still', name)
}

// ---------------------------------------------------------------- marca
const logo = path.join(ROOT, 'assets/ca-logo.svg')
const brandOut = [
  ['ca-logo-160.webp', 160],
  ['ca-logo-360.webp', 360], // preloader (até 180px @2x)
  ['ca-logo-480.webp', 480],
  ['ca-logo-1400.webp', 1400],
]
for (const [name, w] of brandOut) {
  const out = path.join(OUT_BRAND, name)
  if (!fs.existsSync(out)) await sharp(logo, { density: 72 }).resize({ width: w }).webp({ quality: 88 }).toFile(out)
}
const fav = path.join(OUT_BRAND, 'favicon.png')
if (!fs.existsSync(fav)) {
  await sharp(logo).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(fav)
}
const og = path.join(OUT_BRAND, 'og.jpg')
if (!fs.existsSync(og)) {
  const mark = await sharp(logo).resize({ width: 640 }).png().toBuffer()
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0a0423' } })
    .composite([{ input: mark, gravity: 'center' }])
    .jpeg({ quality: 84 })
    .toFile(og)
}
console.log('brand ok')

// ---------------------------------------------------------------- fonte
// Inter servida de public/fonts com nome fixo, para o <head> poder fazer
// preload antes do bundle (o preloader já desenha texto em Inter).
const FONT_SRC = path.join(ROOT, 'node_modules/@fontsource-variable/inter/files')
const OUT_FONT = path.join(ROOT, 'public/fonts')
fs.mkdirSync(OUT_FONT, { recursive: true })
for (const f of ['inter-latin-wght-normal.woff2', 'inter-latin-ext-wght-normal.woff2']) {
  fs.copyFileSync(path.join(FONT_SRC, f), path.join(OUT_FONT, f))
}
console.log('fonts ok')

function slugify(file) {
  return file
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/\+/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
