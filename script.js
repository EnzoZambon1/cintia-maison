const $ = (s) => document.querySelector(s),
  app = $("#app");
const brl = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const store = {
  get: (k, d) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};
let cart = store.get("cc_cart", []),
  favs = store.get("cc_favs", []),
  coupon = store.get("cc_coupon", null),
  ship = store.get("cc_ship", null);

const SZ = [36, 38, 40, 42, 44, 46, 48],
  SZC = ["PP", "P", "M", "G", "GG"];
const P = [
  {
    id: "conj-preto",
    img: "img/produtos/conjunto-preto.jpg",
    cat: "conjuntos",
    name: "Conjunto em linho feminino preto",
    color: "Preto",
    hex: "#2b2523",
    price: 197,
    isNew: 1,
  },
  {
    id: "conj-rosa",
    img: "img/produtos/conjunto-linho-amarelo.jpg",
    cat: "conjuntos",
    name: "Conjunto em linho feminino amarelo",
    color: "Rosa",
    hex: "#e9b8c4",
    price: 197,
    old: 259,
  },
  {
    id: "conj-azul",
    img: "img/produtos/conjunto-azul.jpg",
    cat: "conjuntos",
    name: "Conjunto em linho feminino azul",
    color: "Azul",
    hex: "#8fb4de",
    price: 197,
    isNew: 1,
  },
  {
    id: "conj-areia",
    cat: "conjuntos",
    img: "img/produtos/conjunto-linho-bege.jpg",
    name: "Conjunto em linho feminino bege",
    color: "Bege",
    hex: "#e6cfb8",
    price: 197,
    old: 259,
  },
  {
    id: "jeans-reta",
    img: "img/produtos/calca-jeans-reta-cintura-alta.webp",
    cat: "jeans",
    name: "Calça jeans reta cintura alta",
    color: "Azul",
    hex: "#5d7ea6",
    price: 159,
    mat: "Jeans",
  },
  {
    id: "jeans-wide",
    img: "img/produtos/calca-jeans-wide-leg.webp",
    cat: "jeans",
    name: "Calça jeans wide leg",
    color: "Preto",
    hex: "#3a3a3e",
    price: 169,
    old: 219,
  },
  {
    id: "pant-alf",
    img: "img/produtos/pantalona-alfaiataria.jpg",
    cat: "pantalonas",
    name: "Pantalona alfaiataria",
    color: "Preto",
    hex: "#34302e",
    price: 149,
    isNew: 1,
  },
  {
    id: "pant-linho",
    img: "img/produtos/pantalona-linho.jpg",
    cat: "pantalonas",
    name: "Pantalona em linho",
    color: "Bege",
    hex: "#dcc5ad",
    price: 139,
    old: 189,
  },
  {
    id: "cam-linho",
    img: "img/produtos/camisa-linho-manga-longa.jpg",
    cat: "camisas",
    name: "Camisa em linho manga longa",
    color: "Branco",
    hex: "#f3ece4",
    price: 129,
  },
  {
    id: "cam-verde",
    img: "img/produtos/camisa-viscose-vermelha.jpg",
    cat: "camisas",
    name: "Camisa em viscose vermelha",
    color: "Vermelho",
    hex: "#c92731",
    price: 119,
    isNew: 1,
  },
].map((p) => ({ sizes: SZ, img: "", ...p }));
const CAT = {
  conjuntos: "Conjuntos",
  jeans: "Jeans",
  pantalonas: "Pantalonas",
  camisas: "Camisas",
  ofertas: "Ofertas",
  novidades: "Novidades",
  favoritos: "Favoritos",
};
const byId = (id) => P.find((p) => p.id === id);
const MAXINST = 5,
  CODE = "CINTIA30",
  DISC = 0.3;

const shipFor = (uf) =>
  uf === "SP"
    ? { price: 15.9, days: 3 }
    : ["RJ", "MG", "ES", "PR", "SC", "RS"].includes(uf)
      ? { price: 22.9, days: 5 }
      : { price: 32.9, days: 8 };
const maskCep = (v) => {
  v = v.replace(/\D/g, "").slice(0, 8);
  return v.length > 5 ? v.slice(0, 5) + "-" + v.slice(5) : v;
};
async function viacep(c) {
  c = c.replace(/\D/g, "");
  if (c.length !== 8) throw 0;
  const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
  const d = await r.json();
  if (d.erro) throw 0;
  return d;
}

const heart = `<svg viewBox="0 0 24 24"><path d="M12 20.500 4.400 13a5 5 0 0 1 7.100-7.100l.5.5.5-.5A5 5 0 0 1 19.600 13z"/></svg>`;
const ph = (p, label = "Foto do produto") =>
  p.img
    ? `<div class="ph" style="--c:${p.hex}"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy"></div>`
    : `<div class="ph" style="--c:${p.hex}" role="img" aria-label="${esc(p.name)}"><span>${label}</span></div>`;
const price = (p) =>
  `<div class="price">${p.old ? `<s>${brl(p.old)}</s>` : ""}${brl(p.price)}</div>`;
const save = () => {
  store.set("cc_cart", cart);
  store.set("cc_favs", favs);
  store.set("cc_coupon", coupon);
  store.set("cc_ship", ship);
};
let tt;
function toast(msg, link) {
  const t = $("#toast");
  t.innerHTML = esc(msg) + (link ? ` <a href="${link[1]}">${link[0]}</a>` : "");
  t.classList.add("show");
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove("show"), 3500);
}
function badge() {
  const n = cart.reduce((a, i) => a + i.qty, 0),
    b = $("#badge");
  b.hidden = !n;
  b.textContent = n;
}
function totals() {
  const sub = cart.reduce((a, i) => a + byId(i.id).price * i.qty, 0),
    disc = coupon ? sub * DISC : 0,
    fr = ship && cart.length ? ship.price : 0;
  return { sub, disc, fr, total: sub - disc + fr };
}
const card = (p) =>
  `<article class="card">${p.old ? `<span class="tag">-${Math.round((1 - p.price / p.old) * 100)}%</span>` : ""}<button class="fav ${favs.includes(p.id) ? "on" : ""}" data-act="fav" data-id="${p.id}" aria-label="Favoritar">${heart}</button><a href="#/produto/${p.id}">${ph(p)}<h3>${esc(p.name)}</h3>${price(p)}</a></article>`;

function route() {
  const [, r, a] = (location.hash || "#/").split("/");
  closeDrawer();
  (
    ({
      produto: () => product(a),
      sacola: cartPage,
      checkout: checkoutPage,
      rastrear: () => trackPage(a),
      busca: () => list("busca", decodeURIComponent(a || "")),
      favoritos: () => list("favoritos"),
      colecao: () => list(a),
    })[r] || home
  )();
  document
    .querySelectorAll("#menu a")
    .forEach((l) =>
      l.classList.toggle("on", l.getAttribute("href") === `#/${r}/${a}`),
    );
  scrollTo(0, 0);
  badge();
}
addEventListener("hashchange", () => {
  F = { c: [], s: [], max: 0 };
  route();
});

const slides = [
  {
    l: "Oferta",
    b: "ESPECIAL",
    p: "conj-areia",
    img: "img/produtos/banner-oferta-pantalona.jpg",
    href: "#/colecao/ofertas",
    cta: "Ver ofertas",
  },
  {
    l: "Elegância em",
    b: "cada detalhe",
    p: "conj-azul",
    href: "#/colecao/conjuntos",
    cta: "Ver conjuntos",
  },
];
let si = 0;
function home() {
  const s = slides[si],
    p = byId(s.p);
  app.innerHTML = `<section class="hero" aria-label="Destaque">
  <div><h1>${s.l}<b>${s.b}</b></h1><a class="btn" href="${s.href}" style="margin-top:20px">${s.cta}</a></div>
  ${s.img ? `<div class="ph" style="--c:${p.hex}"><img src="${esc(s.img)}" alt="Pantalona em linho" loading="lazy"></div>` : ph(p)}
  <div class="off"><small>Até</small><big>26<sup>% OFF</sup></big><div class="cupom"><span>cupom</span><b>${CODE}</b></div></div>
  <button class="arrow" data-act="slide" aria-label="Próximo destaque">›</button></section>
  <div class="dots" aria-hidden="true">${slides.map((_, i) => `<i class="${i === si ? "on" : ""}"></i>`).join("")}</div>
 <div class="wrap" style="padding-top:0">
  <div class="cats">${[
    ["conjuntos", "img/categorias/conjuntos.jpg"],
    ["jeans", "img/categorias/jeans.png"],
    ["pantalonas", "img/categorias/pantalonas.webp"],
    ["camisas", "img/categorias/camisas.jpg"],
    ["ofertas", "img/categorias/ofertas.jpg"],
  ]
    .map(([c, img]) => {
      return `<a href="#/colecao/${c}"><div class="ph"><img src="${img}" alt="${CAT[c]}" loading="lazy"></div><b>${CAT[c]}</b></a>`;
    })
    .join("")}</div>
  <div class="sec-h"><h2>Novidades</h2><a class="link" href="#/colecao/novidades">Ver todas</a></div><div class="grid">${P.filter(
    (p) => p.isNew,
  )
    .slice(0, 4)
    .map(card)
    .join("")}</div>
  <div class="sec-h"><h2>Ofertas</h2><a class="link" href="#/colecao/ofertas">Ver todas</a></div><div class="grid">${P.filter(
    (p) => p.old,
  )
    .slice(0, 4)
    .map(card)
    .join("")}</div>
 </div>`;
}

let F = { c: [], s: [], max: 0 },
  curList = ["", ""];
function base(cat, q) {
  return P.filter((p) =>
    cat === "ofertas"
      ? p.old
      : cat === "novidades"
        ? p.isNew
        : cat === "favoritos"
          ? favs.includes(p.id)
          : cat === "busca"
            ? (p.name + " " + p.color + " " + CAT[p.cat])
                .toLowerCase()
                .includes(q.toLowerCase())
            : p.cat === cat,
  );
}
const filt = (l) =>
  l.filter(
    (p) =>
      (!F.c.length || F.c.includes(p.color)) &&
      (!F.s.length || F.s.some((s) => p.sizes.includes(s))) &&
      (!F.max || p.price <= F.max),
  );
function list(cat, q = "") {
  curList = [cat, q];
  const title =
      cat === "busca" ? `Resultados para “${esc(q)}”` : CAT[cat] || "Produtos",
    l = filt(base(cat, q));
  app.innerHTML = `<section class="wrap"><h1 class="page-h">${title}</h1>
 <div class="toolbar"><span class="muted">${l.length} produto${l.length === 1 ? "" : "s"}</span><button class="btn ghost" data-act="filters" style="padding:8px 22px">Filtros${F.c.length + F.s.length + (F.max ? 1 : 0) ? ` (${F.c.length + F.s.length + (F.max ? 1 : 0)})` : ""}</button></div>
 ${l.length ? `<div class="grid">${l.map(card).join("")}</div>` : `<p class="empty">Nenhum produto encontrado. <button class="link" data-act="clearf">Limpar filtros</button></p>`}</section>`;
}
function drawer() {
  const b = base(...curList),
    colors = [...new Set(b.map((p) => p.color))],
    sizes = [...new Set(b.flatMap((p) => p.sizes))],
    n = filt(b).length;
  const ch = (k, v, on, label = v) =>
    `<button class="chip ${on ? "on" : ""}" data-act="f" data-k="${k}" data-v="${v}" aria-pressed="${on}">${label}</button>`;
  $("#drawer").innerHTML =
    `<header>Filtrar por<button data-act="closef" aria-label="Fechar">✕</button></header><div class="body">
 <div class="fgroup"><h4>Cor</h4><div class="chips">${colors.map((c) => ch("c", c, F.c.includes(c))).join("")}</div></div>
 <div class="fgroup"><h4>Tamanho</h4><div class="chips">${sizes.map((s) => ch("s", s, F.s.includes(s))).join("")}</div></div>
 <div class="fgroup"><h4>Preço</h4><div class="chips">${[100, 150, 200].map((m) => ch("max", m, F.max === m, "Até " + brl(m))).join("")}</div></div></div>
 <footer><button class="btn ghost" data-act="clearf">Limpar filtros</button><button class="btn" data-act="closef">${n} produto${n === 1 ? "" : "s"}</button></footer>`;
}
function openDrawer() {
  drawer();
  $("#drawer").hidden = $("#overlay").hidden = false;
  $("#drawer button").focus();
}
function closeDrawer() {
  $("#drawer").hidden = $("#overlay").hidden = true;
}

let selSize = null;
function product(id) {
  const p = byId(id);
  if (!p) {
    home();
    return;
  }
  selSize = null;
  const inst = p.price / MAXINST;
  app.innerHTML = `<div class="crumbs"><a href="#/">Início</a> / <a href="#/colecao/${p.cat}">${CAT[p.cat]}</a> / ${esc(p.name)}</div>
 <section class="pdp"><div class="gal">${ph(p, "Foto 1 – frente")}${ph(p, "Foto 2 – detalhe")}</div>
 <aside><h1>${esc(p.name)}<button class="fav ${favs.includes(p.id) ? "on" : ""}" style="position:static" data-act="fav" data-id="${p.id}" aria-label="Favoritar">${heart}</button></h1>
 <div class="stars" aria-label="Sem avaliações">☆☆☆☆☆ <span class="muted">(0)</span></div>
 ${price(p)}<p class="muted" style="font-size:14px">${MAXINST}x de ${brl(inst)} sem juros</p>
 <p style="margin-top:18px">Selecione um tamanho:</p>
 <div class="sizes" role="group" aria-label="Tamanho">${p.sizes.map((s) => `<button class="sz" data-act="size" data-v="${s}" aria-pressed="false">${s}</button>`).join("")}</div>
 <p class="err" id="szErr"></p>
 <button class="btn block" data-act="add" data-id="${p.id}">Adicionar à sacola</button>
 <div class="acc"><details><summary>Consultar frete</summary><form class="inl" id="pdpShip"><input id="pcep" inputmode="numeric" placeholder="CEP" maxlength="9" aria-label="CEP"><button class="btn ghost" style="padding:9px 18px">Calcular</button></form><p id="pdpShipOut" class="muted"></p></details>
 <details><summary>Formas de pagamento</summary><p>Pix ou cartão de crédito em até ${MAXINST}x sem juros. Débito à vista.</p></details>
 <details><summary>Troca fácil na loja – <span class="ok">GRÁTIS</span></summary><p>Você pode trocar a peça na loja sem custo.</p></details></div></aside></section>
 <div class="wrap"><div class="sec-h" style="margin-top:0"><h2>Você também pode gostar</h2></div><div class="grid">${P.filter(
   (x) => (x.id !== p.id && x.cat === p.cat) || x.id !== p.id,
 )
   .slice(0, 4)
   .map(card)
   .join("")}</div></div>`;
}

function cartPage() {
  const t = totals();
  app.innerHTML = `<section class="wrap"><h1 class="page-h">Sacola</h1>${
    cart.length
      ? `<div class="cols"><div>${cart
          .map((i, k) => {
            const p = byId(i.id);
            return `<div class="line">${ph(p)}<div><a href="#/produto/${p.id}"><b>${esc(p.name)}</b></a><div class="muted">Tam. ${i.size} · ${brl(p.price)}</div><div class="qty"><button data-act="qty" data-k="${k}" data-d="-1" aria-label="Diminuir">−</button><b>${i.qty}</b><button data-act="qty" data-k="${k}" data-d="1" aria-label="Aumentar">+</button></div> <button class="link" data-act="rm" data-k="${k}">Remover</button></div><b>${brl(p.price * i.qty)}</b></div>`;
          })
          .join("")}</div>
 <div class="sum"><h3>Resumo</h3>
  <form class="inl" id="cupForm" style="margin-bottom:10px"><input id="cup" placeholder="Cupom" aria-label="Cupom" value="${coupon ? CODE : ""}"><button class="btn ghost">Aplicar</button></form>
  <form class="inl" id="shipForm"><input id="scep" inputmode="numeric" placeholder="CEP" maxlength="9" aria-label="CEP" value="${ship ? maskCep(ship.cep) : ""}"><button class="btn ghost">Calcular frete</button></form>
  <p class="err" id="cartErr"></p>
  <div class="r"><span>Subtotal</span><span>${brl(t.sub)}</span></div>
  ${coupon ? `<div class="r ok"><span>Cupom ${CODE} (−30%)</span><span>−${brl(t.disc)}</span></div>` : ""}
  <div class="r"><span>Frete${ship ? ` · ${ship.city}/${ship.uf}, ${ship.days} dias úteis` : ""}</span><span>${ship ? brl(ship.price) : "—"}</span></div>
  <div class="r tot"><span>Total</span><span>${brl(t.total)}</span></div>
  <a class="btn block" href="#/checkout" style="margin-top:14px">Finalizar compra</a></div></div>`
      : `<p class="empty">Sua sacola está vazia.<br><a class="btn" href="#/colecao/conjuntos" style="margin-top:16px">Ver conjuntos</a></p>`
  }
 <div class="track"><h2 class="page-h" style="text-align:left;font-size:28px">Rastrear pedido</h2><form class="inl" id="trackForm" style="max-width:420px"><input id="tcode" placeholder="Código do pedido (ex.: CC-12345)" aria-label="Código do pedido"><button class="btn ghost">Rastrear</button></form></div></section>`;
}

let ck = { step: 1, pay: "pix", kind: "credito", inst: 1 };
function summary() {
  const t = totals();
  return `<div class="sum"><h3>Seu pedido</h3>${cart.map((i) => `<div class="r"><span>${esc(byId(i.id).name)} (${i.size}) ×${i.qty}</span><span>${brl(byId(i.id).price * i.qty)}</span></div>`).join("")}<div class="r"><span>Subtotal</span><span>${brl(t.sub)}</span></div>${coupon ? `<div class="r ok"><span>Cupom</span><span>−${brl(t.disc)}</span></div>` : ""}<div class="r"><span>Frete</span><span>${ship ? brl(ship.price) : "a calcular"}</span></div><div class="r tot"><span>Total</span><span>${brl(t.total)}</span></div></div>`;
}
const inp = (k, label, extra = "") =>
  `<label class="field"><span>${label}</span><input data-k="${k}" id="ck_${k}" value="${esc(ck[k])}" ${extra}></label>`;
function ckStep() {
  if (ck.step === 1)
    return `<h2>Identificação</h2><br>${inp("email", "E-mail", 'type="email" autocomplete="email"')}${inp("name", "Nome completo", 'autocomplete="name"')}<p class="err" id="ckErr"></p><button class="btn" data-act="next">Continuar</button>`;
  if (ck.step === 2)
    return `<h2>Endereço</h2><br>${inp("cep", "CEP", 'inputmode="numeric" maxlength="9" autocomplete="postal-code"')}${inp("street", "Endereço completo (rua e bairro)", 'autocomplete="street-address"')}<div class="row2">${inp("num", "Número")}${inp("comp", "Complemento")}</div>${inp("city", "Cidade / UF", "readonly")}<p class="err" id="ckErr"></p><button class="btn ghost" data-act="back">Voltar</button> <button class="btn" data-act="next">Continuar</button>`;
  const t = totals(),
    cr = ck.kind === "credito";
  return `<h2>Pagamento (trabalho em progresso)</h2><br><div class="tabs" role="tablist"><button class="tab ${ck.pay === "pix" ? "on" : ""}" data-act="pay" data-v="pix" role="tab">PIX</button><button class="tab ${ck.pay === "card" ? "on" : ""}" data-act="pay" data-v="card" role="tab">CARTÃO</button></div>
 ${
   ck.pay === "pix"
     ? `<div class="qr">QR Code Pix<br></div><div class="code">00020126-SIMULADO-CINTIA-CAETANO-MAISON-${Math.round(t.total * 100)}</div><button class="btn ghost" data-act="copypix">Copiar código Pix</button> <button class="btn" data-act="pay_ok">Já paguei</button>`
     : `<div class="tabs"><button class="tab ${cr ? "on" : ""}" data-act="kind" data-v="credito" style="font-size:16px;padding:8px">Crédito</button><button class="tab ${!cr ? "on" : ""}" data-act="kind" data-v="debito" style="font-size:16px;padding:8px">Débito</button></div>
 <p class="brands">${cr ? "Mastercard · Visa · Elo" : "Visa Electron"}</p>
 ${cr ? `<label class="field"><span>Parcelar</span><select data-k="inst">${Array.from({ length: MAXINST }, (_, i) => `<option value="${i + 1}" ${ck.inst == i + 1 ? "selected" : ""}>${i + 1}x de ${brl(t.total / (i + 1))} sem juros</option>`).join("")}</select></label>` : ""}
 ${inp("holder", "Nome do titular", 'autocomplete="cc-name"')}${inp("card", "Número do cartão", 'inputmode="numeric" maxlength="19" autocomplete="cc-number"')}<div class="row2">${inp("exp", "Validade (MM/AA)", 'inputmode="numeric" maxlength="5" autocomplete="cc-exp"')}${inp("cvv", "CVV", 'inputmode="numeric" maxlength="4" autocomplete="cc-csc"')}</div>
 <p class="err" id="ckErr"></p><button class="btn ghost" data-act="back">Voltar</button> <button class="btn" data-act="pay_ok">Pagar ${brl(t.total)}</button>`
 }`;  
}
function checkoutPage() {
  if (!cart.length) {
    location.hash = "#/sacola";
    return;
  }
  const steps = ["Identificação", "Endereço", "Pagamento"];
  app.innerHTML = `<section class="wrap"><div class="stepper">${steps.map((s, i) => `<div class="st ${i + 1 === ck.step ? "cur" : ""}"><i></i>${s}</div>`).join("")}</div><div class="cols"><div>${ckStep()}</div>${summary()}</div></section>`;
}
const setErr = (m) => {
  const e = $("#ckErr");
  if (e) e.textContent = m;
};
async function next() {
  if (ck.step === 1) {
    if (!/^\S+@\S+\.\S+$/.test(ck.email || ""))
      return setErr("Informe um e-mail válido.");
    if ((ck.name || "").trim().split(/\s+/).length < 2)
      return setErr("Informe nome e sobrenome.");
  } else {
    if ((ck.cep || "").replace(/\D/g, "").length !== 8)
      return setErr("Informe um CEP com 8 dígitos.");
    if (!(ck.street || "").trim() || !(ck.num || "").trim())
      return setErr("Preencha endereço e número.");
  }
  ck.step++;
  checkoutPage();
}
function finish() {
  const d = (s) => (ck[s] || "").replace(/\D/g, "");
  if (ck.pay === "card") {
    const m = (ck.exp || "").match(/^(\d\d)\/(\d\d)$/),
      now = new Date();
    if ((ck.holder || "").trim().length < 3)
      return setErr("Informe o nome do titular.");
    if (d("card").length < 13) return setErr("Número do cartão inválido.");
    if (!m || +m[1] < 1 || +m[1] > 12 || new Date(2000 + +m[2], +m[1], 0) < now)
      return setErr("Validade inválida ou vencida.");
    if (d("cvv").length < 3) return setErr("CVV inválido.");
  }
  const t = totals(),
    order = {
      code: "CC-" + Math.floor(10000 + Math.random() * 90000),
      at: Date.now(),
      total: t.total,
      items: cart.map((i) => ({ ...i })),
      name: ck.name,
      city: ck.city,
    };
  store.set("cc_orders", [order, ...store.get("cc_orders", [])]);
  cart = [];
  save();
  badge();
  ck = { step: 1, pay: "pix", kind: "credito", inst: 1 };
  app.innerHTML = `<section class="wrap"><div class="box" style="margin:auto;text-align:center"><h1 class="page-h">Pedido confirmado</h1><p>Obrigada, ${esc(order.name.split(" ")[0])}! Seu código é</p><p class="price" style="font-size:30px;margin:8px 0 18px">${order.code}</p><p class="muted">Pagamento simulado – nenhum valor foi cobrado.</p><a class="btn" href="#/rastrear/${order.code}" style="margin-top:18px">Rastrear pedido</a></div></section>`;
}

function trackPage(code = "") {
  const orders = store.get("cc_orders", []),
    o = orders.find((x) => x.code === code.toUpperCase()),
    st = [
      "Pedido confirmado",
      "Em separação",
      "Enviado",
      "Em rota de entrega",
      "Entregue",
    ];
  const idx = o ? Math.min(4, Math.floor((Date.now() - o.at) / 120000)) : -1;
  app.innerHTML = `<section class="wrap"><h1 class="page-h">Rastrear pedido</h1><div class="box" style="margin:auto"><form class="inl" id="trackForm"><input id="tcode" placeholder="Código (ex.: CC-12345)" value="${esc(code)}" aria-label="Código do pedido"><button class="btn">Rastrear</button></form>
 ${code && !o ? `<p class="err" style="margin-top:12px">Pedido não encontrado neste navegador. Confira o código.</p>` : ""}
 ${o ? `<ul class="timeline">${st.map((s, i) => `<li class="${i <= idx ? "d" : ""}">${s}</li>`).join("")}</ul><p class="muted">Pedido ${o.code} · ${brl(o.total)}</p>` : ""}</div></section>`;
}

document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const a = b.dataset.act,
    id = b.dataset.id;
  if (a === "fav") {
    e.preventDefault();
    favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    save();
    b.classList.toggle("on");
    if (curList[0] === "favoritos" && location.hash === "#/favoritos") route();
  } else if (a === "slide") {
    si = (si + 1) % slides.length;
    home();
  } else if (a === "copycoupon") {
    try {
      await navigator.clipboard.writeText(CODE);
    } catch {}
    toast(`Cupom ${CODE} copiado`);
  } else if (a === "account")
    toast("Área do cliente ainda não está disponível");
  else if (a === "filters") openDrawer();
  else if (a === "closef") {
    closeDrawer();
    list(...curList);
  } else if (a === "clearf") {
    F = { c: [], s: [], max: 0 };
    $("#drawer").hidden ? list(...curList) : drawer();
  } else if (a === "f") {
    const k = b.dataset.k,
      v = k === "max" ? +b.dataset.v : b.dataset.v;
    if (k === "max") F.max = F.max === v ? 0 : v;
    else F[k] = F[k].includes(v) ? F[k].filter((x) => x !== v) : [...F[k], v];
    drawer();
    list(...curList);
    $("#drawer").hidden = false;
    $("#overlay").hidden = false;
  } else if (a === "size") {
    selSize = b.dataset.v;
    document.querySelectorAll(".sz").forEach((s) => {
      const on = s === b;
      s.classList.toggle("on", on);
      s.setAttribute("aria-pressed", on);
    });
    $("#szErr").textContent = "";
  } else if (a === "add") {
    if (!selSize) {
      $("#szErr").textContent = "Selecione um tamanho.";
      return;
    }
    const k = cart.find(
      (i) => i.id === id && String(i.size) === String(selSize),
    );
    k ? k.qty++ : cart.push({ id, size: selSize, qty: 1 });
    save();
    badge();
    toast("Adicionado à sacola", ["Ver sacola", "#/sacola"]);
  } else if (a === "qty") {
    const i = cart[+b.dataset.k];
    i.qty += +b.dataset.d;
    if (i.qty < 1) cart.splice(+b.dataset.k, 1);
    save();
    badge();
    cartPage();
  } else if (a === "rm") {
    cart.splice(+b.dataset.k, 1);
    save();
    badge();
    cartPage();
  } else if (a === "next") next();
  else if (a === "back") {
    ck.step--;
    checkoutPage();
  } else if (a === "pay") {
    ck.pay = b.dataset.v;
    checkoutPage();
  } else if (a === "kind") {
    ck.kind = b.dataset.v;
    if (ck.kind === "debito") ck.inst = 1;
    checkoutPage();
  } else if (a === "copypix") {
    try {
      await navigator.clipboard.writeText(
        document.querySelector(".code").textContent,
      );
    } catch {}
    toast("Código Pix copiado");
  } else if (a === "pay_ok") finish();
});
$("#overlay").addEventListener("click", () => {
  closeDrawer();
  list(...curList);
});
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("#drawer").hidden) {
    closeDrawer();
    list(...curList);
  }
});

document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.k) {
    if (t.dataset.k === "cep") t.value = maskCep(t.value);
    if (t.dataset.k === "card")
      t.value = t.value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    if (t.dataset.k === "exp") {
      let v = t.value.replace(/\D/g, "").slice(0, 4);
      t.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v;
    }
    ck[t.dataset.k] = t.value;
    if (t.dataset.k === "cep" && t.value.length === 9) lookupCheckout(t.value);
  }
  if (t.id === "pcep" || t.id === "scep") t.value = maskCep(t.value);
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.k === "inst") ck.inst = +e.target.value;
});

async function lookupCheckout(c) {
  setErr("");
  try {
    const d = await viacep(c);
    ck.street = [d.logradouro, d.bairro].filter(Boolean).join(" – ");
    ck.city = `${d.localidade}/${d.uf}`;
    ship = {
      cep: c.replace(/\D/g, ""),
      city: d.localidade,
      uf: d.uf,
      ...shipFor(d.uf),
    };
    save();
    $("#ck_street").value = ck.street;
    $("#ck_city").value = ck.city;
    $(".cols > .sum")?.replaceWith(
      Object.assign(document.createElement("div"), { innerHTML: summary() })
        .firstChild,
    );
  } catch {
    setErr("CEP não encontrado. Confira os números e tente de novo.");
  }
}
async function calcShip(c, out) {
  try {
    const d = await viacep(c);
    ship = {
      cep: c.replace(/\D/g, ""),
      city: d.localidade,
      uf: d.uf,
      ...shipFor(d.uf),
    };
    save();
    return ship;
  } catch {
    out("Não foi possível consultar o CEP. Confira e tente de novo.");
    return null;
  }
}
document.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target.id;
  if (f === "searchForm") {
    const q = $("#q").value.trim();
    if (q) {
      location.hash = "#/busca/" + encodeURIComponent(q);
      $("#q").value = "";
    }
  } else if (f === "pdpShip") {
    const o = $("#pdpShipOut");
    o.textContent = "Consultando…";
    const s = await calcShip($("#pcep").value, (m) => (o.textContent = m));
    if (s)
      o.textContent = `${s.city}/${s.uf}: ${brl(s.price)} · ${s.days} dias úteis`;
  } else if (f === "shipForm") {
    const s = await calcShip(
      $("#scep").value,
      (m) => ($("#cartErr").textContent = m),
    );
    if (s) cartPage();
  } else if (f === "cupForm") {
    const v = $("#cup").value.trim().toUpperCase();
    if (!v) {
      coupon = null;
      save();
      cartPage();
    } else if (v === CODE) {
      coupon = CODE;
      save();
      cartPage();
      toast("Cupom aplicado: 30% de desconto");
    } else $("#cartErr").textContent = "Cupom inválido.";
  } else if (f === "trackForm") {
    const c = $("#tcode").value.trim();
    if (c) location.hash = "#/rastrear/" + encodeURIComponent(c);
  }
});

route();
