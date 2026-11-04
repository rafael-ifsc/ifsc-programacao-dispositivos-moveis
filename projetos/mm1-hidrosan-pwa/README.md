# HidroSan – App de e-commerce (Mão na Massa 1)

Catálogo e pedidos de materiais para saneamento e hidráulica.

| Tema | Onde está |
|---|---|
| **Bootstrap (responsivo)** | `index.html`: navbar que colapsa no celular, grid `row`/`col-*`, cards, formulário |
| **Single-Page Application** | `app.js` → `navegarPara()` / `mostrarSecao()`: troca de seções pelo `#hash`, sem recarregar a página (o botão voltar funciona) |
| **API REST com Axios** | `app.js` → `carregarProdutos()` (GET `/produtos`) e `finalizarPedido()` (POST `/pedidos`) |
| **API REST com Fetch** | `app.js` → `salvarProduto()` (POST `/produtos`) |
| **Progressive Web App** | `manifest.json`, `icons/`, `sw.js` (cache do app e do catálogo para uso offline) e o registro do service worker no fim do `app.js` |

## Como rodar

São dois terminais, ambos dentro da pasta do projeto.

**1. API (json-server)**

```bash
npx json-server db.json --port 3000
```

(Em versões antigas do json-server use `npx json-server --watch db.json --port 3000`.)

**2. Aplicação**

```bash
npx serve .
```

e abra o endereço mostrado (ex.: http://localhost:3000 já está em uso pela API, então o `serve`
vai sugerir outra porta, como http://localhost:5000). No VS Code também dá para usar a extensão
**Live Server**.

> O PWA (service worker) **não funciona** abrindo o `index.html` com dois cliques (`file://`).
> É preciso abrir por `http://localhost`.

## Testando o PWA

- No Chrome: F12 → aba **Application** → *Manifest* e *Service Workers*.
- Ícone de **Instalar** na barra de endereço.
- Em *Network*, marque **Offline** e recarregue: o app e o último catálogo carregado continuam aparecendo.
- Depois de alterar arquivos do app, troque `CACHE_NAME` no `sw.js` (ex.: `v3`) para o navegador pegar a versão nova.
