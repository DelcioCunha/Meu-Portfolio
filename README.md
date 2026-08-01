# Delcio Cunha — Portfólio Pessoal

Repositório do meu portfólio pessoal: um site de página única, com tema escuro e acentos vibrantes, para apresentar
o meu percurso como Software Developer, os meus projetos e as minhas competências técnicas.

## ✨ Funcionalidades

- **Tema escuro com acentos vibrantes**, com alternância para modo claro (preferência guardada no navegador).
- **Animações ao scroll** suaves em todas as secções, via `IntersectionObserver`.
- **Secções**: Hero, Sobre Mim, Competências, Projetos em Destaque, Experiência & Formação, Blog e Contacto.
- **Blog e Currículo** como páginas próprias (`blog.html`, `download-resume.html`).
- Estrutura pronta para expandir com **Prémios** e **Leitor de Música** quando houver conteúdo real (ver abaixo).

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 (variáveis CSS, Flexbox, Grid, animações)
- JavaScript puro (ES6+), sem frameworks
- Font Awesome para ícones

## 📁 Estrutura

```
├── index.html              # Página principal
├── blog.html                # Página de blog (em construção)
├── download-resume.html     # Página de download do CV
├── components/               # Header e footer, carregados via JS
├── css/components/           # CSS modular por secção
├── js/                       # Scripts (animações, tema, header, etc.)
└── assets/                   # Imagens e ícones
```

## 🚀 Como correr localmente

Não é preciso build. Basta abrir `index.html` no navegador, ou usar um servidor local simples:

```bash
python -m http.server 8000
```

## 📌 Próximos passos (checklist)

- [ ] Adicionar o CV real em `assets/resume/Delcio_Cunha_CV.pdf`
- [ ] Substituir a foto de perfil em `assets/my_image.jpg` e `assets/my_image1.jpg` por uma foto profissional (opcional — atualmente usa a versão artística)
- [ ] Substituir os placeholders de projetos por screenshots reais assim que estiverem disponíveis
- [ ] Adicionar links reais do GitHub a cada projeto
- [ ] Adicionar LinkedIn assim que criares o perfil
- [ ] Confirmar o número de WhatsApp usado no site
- [ ] Reativar a secção de **Prémios** quando tiveres uma conquista para mostrar (código comentado no fim de `index.html`)
- [ ] Reativar o **leitor de música** quando tiveres faixas próprias/licenciadas (ver instruções em `js/playlist.js`)
- [ ] Publicar os primeiros artigos do blog

## 👤 Contacto

- **Email:** delciobentocunha007@gmail.com
- **GitHub:** [github.com/DelcioCunha](https://github.com/DelcioCunha)
- **Facebook:** [facebook.com/delcio.cunha.2025](https://www.facebook.com/delcio.cunha.2025)
- **Instagram:** [@delcio_369](https://www.instagram.com/delcio_369)
