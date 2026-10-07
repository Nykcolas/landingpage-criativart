// Dados da loja — fonte única para todo o texto variável da landing.
// O vite.config.js injeta estes valores no index.html no build ({{chave}}).
//
// Campos marcados com TODO ainda não foram confirmados com a loja.

export const site = {
  name: 'Criativart',
  slogan: 'Fluidez Criativa',
  city: 'Campina Grande — PB',
  url: 'https://criativart.com.br', // TODO: domínio definitivo

  // WhatsApp informado pela loja: +55 83 9338-9981 (mesmo da bio do Instagram).
  whatsapp: '558393389981',
  // Para ligação o celular precisa do 9 na frente, como no catálogo da loja.
  phone: '(83) 99338-9981',
  phoneHref: 'tel:+5583993389981',

  instagram: 'criativart_',
  instagramUrl: 'https://www.instagram.com/criativart_/',

  address: 'Rua Leonardo Costa Vasconcelos, 570E — Malvinas',
  cep: '58433-326',
  hoursWeek: 'Seg a sex · 8h às 12h e 14h às 18h',
  hoursSat: 'Sáb · 8h às 12h',
  hoursFaq: 'De segunda a sexta, das 8h ao meio-dia e das 14h às 18h. Aos sábados, das 8h ao meio-dia.',
  payment: 'Aceitamos Pix, cartão de crédito ou débito e pagamento em mãos.',
  delivery: 'Sim! Fazemos entregas pelo Uber. É só combinar com a gente pelo WhatsApp.',
  // Rota no Google Maps até a loja; sem origem, o Maps usa a localização de quem abre.
  routeUrl:
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent('Rua Leonardo Costa Vasconcelos, 570E, Malvinas, Campina Grande - PB, 58433-326'),

  // Campanha da seção "Novidades". Troque a cada data comemorativa.
  campaign: {
    tag: 'Dia do Professor · 15 de outubro',
    date: '2026-10-15',
  },

  year: String(new Date().getFullYear()),
}

export const messages = {
  default: 'Olá, Criativart! Vim pelo site e quero fazer um orçamento.',
  canecas: 'Olá, Criativart! Vim pelo site e quero saber mais sobre canecas personalizadas.',
  camisas: 'Olá, Criativart! Vim pelo site e quero saber mais sobre camisas e fardamentos.',
  dtf: 'Olá, Criativart! Vim pelo site e quero saber mais sobre impressão DTF UV.',
  laser: 'Olá, Criativart! Vim pelo site e quero saber mais sobre peças em MDF e corte a laser.',
  chaveiros: 'Olá, Criativart! Vim pelo site e quero saber mais sobre chaveiros e impressão 3D.',
  bottons: 'Olá, Criativart! Vim pelo site e quero saber mais sobre bottons.',
  luminarias: 'Olá, Criativart! Vim pelo site e quero saber mais sobre luminárias em acrílico.',
  campanha: 'Olá, Criativart! Quero um presente personalizado para o Dia do Professor.',
  loja: 'Olá, Criativart! Vim pelo site e quero saber como chegar na loja.',
}

export function waLink(key = 'default') {
  const text = messages[key]
  if (!text) throw new Error(`Mensagem de WhatsApp desconhecida: ${key}`)
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`
}
