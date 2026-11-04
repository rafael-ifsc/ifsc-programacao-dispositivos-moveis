const CACHE_NAME = "hidrosan-cache-v2";
const CACHE_API = "hidrosan-api-v1";
const ARQUIVOS_CACHE = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
  "https://cdn.jsdelivr.net/npm/axios@1.7.9/dist/axios.min.js"
];

// instalação: guarda os arquivos do app no cache
self.addEventListener("install", evento => {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARQUIVOS_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ativação: apaga caches de versões antigas
self.addEventListener("activate", evento => {
  evento.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(
        nomes
          .filter(nome => nome !== CACHE_NAME && nome !== CACHE_API)
          .map(nome => caches.delete(nome))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", evento => {
  const req = evento.request;

  // POST (cadastro e pedido) sempre vai direto para a rede
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // API (json-server): tenta a rede primeiro e guarda a última resposta;
  // sem internet, devolve o catálogo salvo
  if (url.port === "3000") {
    evento.respondWith(
      fetch(req)
        .then(resposta => {
          const copia = resposta.clone();
          caches.open(CACHE_API).then(cache => cache.put(req, copia));
          return resposta;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // demais arquivos: cache primeiro; o que não estiver no cache
  // (ex.: fontes dos ícones) é baixado e guardado para uso offline
  evento.respondWith(
    caches.match(req).then(emCache => {
      if (emCache) return emCache;
      return fetch(req).then(resposta => {
        if (resposta.ok) {
          const copia = resposta.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copia));
        }
        return resposta;
      });
    })
  );
});
