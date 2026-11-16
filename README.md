# portfolio

Portfólio em [portfolio.rillis.com.br](https://portfolio.rillis.com.br): lista os repositórios públicos de [github.com/rillis](https://github.com/rillis) com destaques, busca, filtro por linguagem e agrupamento por ano.

HTML, CSS e JavaScript puros, sem build e sem dependências. Os dados vêm ao vivo da API pública do GitHub (com cache de 10 minutos na sessão do navegador).

## Estrutura

- `index.html` — página principal
- `404.html` — página de erro do GitHub Pages
- `css/style.css` — estilos (tema claro/escuro)
- `js/app.js` — busca dos repositórios e renderização
- `CNAME` — domínio customizado

## Configurar

No topo de `js/app.js`:

- `FEATURED` — repositórios em destaque (com texto opcional no lugar da descrição do GitHub)
- `HIDDEN` — repositórios que não aparecem na página
- `COLORS` — cores por linguagem

## Rodar localmente

```bash
python3 -m http.server 8001
```

Abra http://localhost:8001.

## Deploy

GitHub Pages a partir da branch `master`: um push publica a nova versão.
