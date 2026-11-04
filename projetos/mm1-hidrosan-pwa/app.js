// =====================================================================
// HidroSan - app de e-commerce (SPA + API REST + PWA)
// API simulada pelo json-server:  npx json-server db.json --port 3000
// =====================================================================

const API = "http://localhost:3000";

// carrinho guardado no navegador para não se perder ao recarregar
let carrinho = lerCarrinho();
let produtos = [];

// ---------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------
function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// evita que um texto digitado pelo usuário vire HTML na página
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

function mostrarMensagem(idElemento, tipo, texto) {
  document.getElementById(idElemento).innerHTML =
    `<div class="alert alert-${tipo} mb-0">${texto}</div>`;
}

function lerCarrinho() {
  try {
    return JSON.parse(localStorage.getItem("carrinho")) || [];
  } catch {
    return [];
  }
}

function salvarCarrinho() {
  try {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  } catch {
    // sem localStorage o carrinho só vale enquanto a página estiver aberta
  }
}

// ---------------------------------------------------------------------
// SPA: navegação entre seções sem recarregar a página
// O endereço muda (#catalogo, #novo-produto, #carrinho), então os
// botões voltar/avançar do navegador também funcionam.
// ---------------------------------------------------------------------
const SECOES = ["catalogo", "novo-produto", "carrinho"];

function navegarPara(secao) {
  location.hash = secao;
}

function mostrarSecao() {
  let secao = location.hash.replace("#", "");
  if (!SECOES.includes(secao)) secao = "catalogo";

  document.querySelectorAll(".secao-conteudo").forEach(el => el.classList.remove("secao-ativa"));
  document.getElementById("secao-" + secao).classList.add("secao-ativa");

  // marca o link ativo no menu
  document.querySelectorAll(".nav-link[data-secao]").forEach(link => {
    link.classList.toggle("active", link.dataset.secao === secao);
  });

  // no celular, fecha o menu depois de escolher uma opção
  const menu = document.getElementById("navMenu");
  if (menu.classList.contains("show")) {
    bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }

  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", mostrarSecao);

// ---------------------------------------------------------------------
// Catálogo: GET /produtos com AXIOS
// ---------------------------------------------------------------------
async function carregarProdutos() {
  const grade = document.getElementById("grade-produtos");

  try {
    const resposta = await axios.get(`${API}/produtos`);
    produtos = resposta.data;
    renderizarProdutos();
  } catch (erro) {
    grade.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-1"></i>
          Não foi possível carregar o catálogo. Verifique se o json-server está rodando na porta 3000.
        </div>
      </div>`;
  }
}

function renderizarProdutos() {
  const grade = document.getElementById("grade-produtos");

  if (produtos.length === 0) {
    grade.innerHTML = `<div class="col-12 text-center text-muted">Nenhum produto cadastrado.</div>`;
    return;
  }

  grade.innerHTML = produtos.map(produto => `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card h-100 shadow-sm card-produto">
        <div class="card-body d-flex flex-column">
          <span class="badge text-bg-info align-self-start mb-2">${escaparHTML(produto.categoria)}</span>
          <h5 class="card-title">${escaparHTML(produto.nome)}</h5>
          <p class="card-text text-muted flex-grow-1">${escaparHTML(produto.descricao)}</p>
          <p class="fs-5 fw-bold text-primary mb-2">
            ${formatarPreco(produto.preco)}
            <small class="fs-6 text-muted fw-normal">/ ${escaparHTML(produto.unidade || "un")}</small>
          </p>
          <button class="btn btn-outline-primary" onclick="adicionarAoCarrinho('${produto.id}')">
            <i class="bi bi-cart-plus me-1"></i> Adicionar
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// ---------------------------------------------------------------------
// Cadastro: POST /produtos com FETCH
// ---------------------------------------------------------------------
async function salvarProduto(evento) {
  evento.preventDefault();

  const botao = document.getElementById("btn-salvar");
  const novoProduto = {
    nome: document.getElementById("nome").value.trim(),
    categoria: document.getElementById("categoria").value,
    preco: parseFloat(document.getElementById("preco").value),
    unidade: document.getElementById("unidade").value.trim(),
    descricao: document.getElementById("descricao").value.trim()
  };

  botao.disabled = true;

  try {
    const resposta = await fetch(`${API}/produtos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoProduto)
    });

    if (!resposta.ok) throw new Error("HTTP " + resposta.status);

    const produtoCriado = await resposta.json();
    produtos.push(produtoCriado);
    renderizarProdutos();

    document.getElementById("form-produto").reset();
    mostrarMensagem("msg-cadastro", "success",
      `<i class="bi bi-check-circle me-1"></i> "${escaparHTML(produtoCriado.nome)}" cadastrado no servidor.`);
  } catch (erro) {
    mostrarMensagem("msg-cadastro", "danger",
      "Não foi possível salvar. Verifique se o json-server está rodando.");
  } finally {
    botao.disabled = false;
  }
}

// ---------------------------------------------------------------------
// Carrinho / lista de materiais
// ---------------------------------------------------------------------
function adicionarAoCarrinho(id) {
  const produto = produtos.find(p => String(p.id) === String(id));
  if (!produto) return;

  const item = carrinho.find(i => String(i.id) === String(id));
  if (item) {
    item.quantidade++;
  } else {
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: Number(produto.preco),
      unidade: produto.unidade || "un",
      quantidade: 1
    });
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find(i => String(i.id) === String(id));
  if (!item) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) {
    carrinho = carrinho.filter(i => String(i.id) !== String(id));
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function calcularTotal() {
  return carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
}

function atualizarCarrinho() {
  const lista = document.getElementById("itens-carrinho");
  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);

  document.getElementById("contador-carrinho").textContent = totalItens;
  document.getElementById("total-carrinho").textContent = formatarPreco(calcularTotal());
  document.getElementById("btn-finalizar").disabled = carrinho.length === 0;

  if (carrinho.length === 0) {
    lista.innerHTML = `<li class="list-group-item text-muted text-center">Nenhum item selecionado.</li>`;
    return;
  }

  lista.innerHTML = carrinho.map(item => `
    <li class="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div>
        <div class="fw-semibold">${escaparHTML(item.nome)}</div>
        <small class="text-muted">${formatarPreco(item.preco)} / ${escaparHTML(item.unidade)}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidade('${item.id}', -1)"
                aria-label="Diminuir quantidade"><i class="bi bi-dash"></i></button>
        <span class="fw-bold">${item.quantidade}</span>
        <button class="btn btn-sm btn-outline-secondary" onclick="alterarQuantidade('${item.id}', 1)"
                aria-label="Aumentar quantidade"><i class="bi bi-plus"></i></button>
        <span class="ms-2 fw-semibold">${formatarPreco(item.preco * item.quantidade)}</span>
      </div>
    </li>
  `).join("");
}

// ---------------------------------------------------------------------
// Finalizar pedido: POST /pedidos com AXIOS
// ---------------------------------------------------------------------
async function finalizarPedido() {
  if (carrinho.length === 0) return;

  const botao = document.getElementById("btn-finalizar");
  const pedido = {
    data: new Date().toISOString(),
    itens: carrinho,
    total: Number(calcularTotal().toFixed(2))
  };

  botao.disabled = true;

  try {
    const resposta = await axios.post(`${API}/pedidos`, pedido);

    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();
    mostrarMensagem("msg-pedido", "success",
      `<i class="bi bi-check-circle me-1"></i> Pedido nº ${escaparHTML(String(resposta.data.id))} enviado com sucesso!`);
  } catch (erro) {
    botao.disabled = false;
    mostrarMensagem("msg-pedido", "danger",
      "Não foi possível enviar o pedido. Verifique sua conexão e o json-server.");
  }
}

// ---------------------------------------------------------------------
// PWA: registro do service worker e aviso de offline
// ---------------------------------------------------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("Service worker registrado."))
      .catch(erro => console.error("Falha ao registrar o service worker:", erro));
  });
}

function atualizarAvisoOffline() {
  document.getElementById("aviso-offline").classList.toggle("d-none", navigator.onLine);
}
window.addEventListener("online", atualizarAvisoOffline);
window.addEventListener("offline", atualizarAvisoOffline);

// ---------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------
document.getElementById("form-produto").addEventListener("submit", salvarProduto);
document.getElementById("btn-finalizar").addEventListener("click", finalizarPedido);

mostrarSecao();
atualizarCarrinho();
atualizarAvisoOffline();
carregarProdutos();
