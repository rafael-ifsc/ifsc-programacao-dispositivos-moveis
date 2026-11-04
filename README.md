# Programação para Dispositivos Móveis

Projetos e atividades da disciplina **Programação para Dispositivos Móveis (PDM014703)** do curso Técnico em Informática para Internet — IFSC.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)

## Conteúdo

| Pasta | Descrição | Tecnologias |
|---|---|---|
| [`projetos/mm1-hidrosan-pwa`](projetos/mm1-hidrosan-pwa) | HidroSan: app de e-commerce (SPA + PWA) com catálogo e pedidos de materiais hidráulicos | Bootstrap, Axios, Fetch, Service Worker, json-server |
| [`projetos/json-sistema-norteador`](projetos/json-sistema-norteador) | Modelagem (diagrama ER) e dados JSON do sistema da lavação | JSON |
| [`docs`](docs) | Relatório do MM1 e imagens | — |

## Como executar o HidroSan

São dois terminais, dentro de `projetos/mm1-hidrosan-pwa`:

```bash
npx json-server db.json --port 3000   # API
npx serve .                           # aplicação
```

> O PWA só funciona via `http://localhost`, não abrindo o `index.html` direto do disco.

## Estrutura

```
.
├── projetos/   # entregas "Mão na Massa" (MM)
└── docs/       # relatórios e imagens
```

## Sobre

Repositório criado para organizar e documentar minha evolução no curso técnico do [IFSC](https://www.ifsc.edu.br/).
