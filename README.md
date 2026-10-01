# Délcio Cunha · Portfólio

Website pessoal de **Délcio Cunha**, Técnico de Infraestrutura de TI e Desenvolvedor Web (Luanda, Angola).
HTML, CSS e JavaScript puros: não precisa de instalar nada nem de compilar. Todas as bibliotecas e tipos de letra estão incluídos na pasta `assets/`, por isso o site funciona sem depender de serviços externos.

## Páginas

| Ficheiro | Página | O que tem |
|---|---|---|
| `index.html` | Início | Globo 3D em WebGL com os continentes em pontos e Luanda assinalada (arraste para rodar), nome animado, frase rotativa, mapa do site em grelha |
| `sobre.html` | Sobre mim | Perfil que se ilumina palavra a palavra ao rolar, ficha técnica que se escreve sozinha, números, princípios, percurso 2015–2026 desenhado à escala, idiomas e competências pessoais |
| `experiencia.html` | Experiência | Laboratório de rede interativo (pfSense, DNS, switch, ESXi, Zabbix/Nagios) com tráfego animado e simulação de incidente, linha do tempo, ciclo do trabalho freelance |
| `competencias.html` | Competências | Grafo de forças que liga cada competência aos sítios onde foi usada, rack 6U e terminal com comandos (`help`, `neofetch`, `top`, `abrir projetos`…) |
| `projetos.html` | Projetos | Galeria horizontal fixada ao scroll, maquetes interativas (troca PT/EN, drone que segue o rato, painel com filtros), estudos de caso em janela e pré-visualização ao vivo dos sites GEPGEO e C3-Geo em tamanho de computador, tablet e telemóvel |
| `contacto.html` | Contacto | Compositor de mensagem com pré-visualização ao vivo que envia por WhatsApp ou email, código QR, vCard, CV em PDF, hora de Luanda e diferença horária |
| `404.html` | Erro | Página de erro com traceroute |

## Funcionalidades comuns

- Cortina de transição entre páginas e ecrã de arranque (só na primeira visita da sessão)
- Paleta de comandos: **Ctrl K** (ou **⌘ K**, ou **/**) para saltar para qualquer página ou copiar o email
- Smooth scroll (Lenis), animações ligadas ao scroll (GSAP + ScrollTrigger + SplitText)
- Cursor personalizado, botões magnéticos e cartões com brilho que segue o rato
- PWA: instalável e com funcionamento offline depois da primeira visita (`sw.js`, `manifest.webmanifest`)
- SEO: descrições por página, Open Graph, dados estruturados Schema.org (`Person`) na página inicial
- Acessível: navegação por teclado, link "saltar para o conteúdo", alternativa em lista ao grafo, respeita "reduzir movimento"
- Adaptado de telemóveis pequenos (320 px) a ecrãs 4K, em vertical e horizontal, com toque ou rato

## Ver no computador

Basta abrir o ficheiro **`index.html`** com duplo clique. Não é preciso servidor nem instalar nada: o globo 3D, as animações, o terminal, o grafo e todas as outras funcionalidades funcionam diretamente a partir da pasta, em qualquer browser moderno (Chrome, Edge, Firefox, Safari).

As únicas coisas que só existem depois de publicar o site online são a instalação como app e o funcionamento sem internet (PWA). As pré-visualizações ao vivo dos sites GEPGEO e C3-Geo precisam de ligação à internet.

## Publicar (grátis)

- **GitHub Pages**: crie um repositório, envie o conteúdo desta pasta e ative Pages em *Settings → Pages* (branch `main`, pasta raiz).
- **Netlify**: arraste a pasta para app.netlify.com/drop.
- **Vercel**: `npx vercel` dentro da pasta.

Depois de ter o endereço final, troque `assets/img/og.jpg` nas meta tags `og:image` por um URL absoluto (ex.: `https://oseusite.com/assets/img/og.jpg`) para as pré-visualizações nas redes sociais funcionarem em todo o lado.

## Editar conteúdo

- Textos: diretamente nos ficheiros `.html`.
- Competências, grafo e comandos do terminal: `assets/js/pages/competencias.js` (listas `CATS`, `SKILLS`, `CTX`).
- Percurso à escala: `assets/js/pages/sobre.js` (lista `lanes`).
- Cenários do laboratório: `assets/js/pages/experiencia.js` (`INFO`, `SCEN`).
- Contactos usados em todo o site: `assets/js/core.js` (objeto `CONTACT`).
- Cores e tipografia: variáveis no topo de `assets/css/base.css`.
- Ao alterar ficheiros, aumente a versão em `sw.js` (`dc-portfolio-v1` → `v2`) para os visitantes receberem a versão nova.

## Estrutura

```
├── index.html, sobre.html, experiencia.html, competencias.html, projetos.html, contacto.html, 404.html
├── manifest.webmanifest, sw.js, robots.txt
└── assets/
    ├── css/        base.css, fonts.css (tipos de letra embutidos) + uma folha por página
    ├── js/         core.js (partilhado), world-dots.js (mapa do globo), pages/*.js
    ├── vendor/     GSAP 3, Lenis, Three.js, qrcode-generator
    ├── img/        foto, ícones, imagem de partilha
    └── docs/       CV-Delcio-Cunha.pdf
```

## Créditos

GSAP (GreenSock, licença padrão gratuita), Three.js (MIT), Lenis (MIT), qrcode-generator (MIT), dados de continentes Natural Earth (domínio público), tipos de letra sob SIL Open Font License.
