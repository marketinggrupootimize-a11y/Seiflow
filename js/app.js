/**
 * Seiflow — landing interactions
 * Motion matches the React Bits Pro SaaS template (scroll-scrub words,
 * staggered enter, timeline fill, quote ring). Brand from the Seiflow book.
 */
const CONFIG = {
  waNumberLead: "556291626249", // diagnóstico grátis / ainda não é cliente
  waNumberClient: "556292084328", // já é cliente
  waText: "Olá! Sou de uma instituição de ensino e quero o diagnóstico de 30 minutos do Seiflow — mapear a fila e o piloto.",
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const quotes = [
  {
    text: "O aluno pergunta no WhatsApp. A secretaria responde quando dá. A experiência da instituição começa a falhar em silêncio.",
    by: "Aluno e responsável · no WhatsApp da escola, 24 horas",
  },
  {
    text: "A secretaria gasta a jornada copiando e colando boleto, calendário e nota. O problema não é falta de esforço — é pergunta repetida.",
    by: "Secretaria acadêmica · operação no limite",
  },
  {
    text: "Sem a fila visível, a direção só descobre a insatisfação quando o aluno já quer sair — ou o responsável já reclamou.",
    by: "Direção e gestão · o sinal chega tarde",
  },
  {
    text: "A IA fecha o repetitivo da escola. A equipe fica com matrícula, exceção e empatia — com o contexto completo da conversa.",
    by: "Equipe da instituição · amplificação, não substituição",
  },
];

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function waUrl(number, extra = "") {
  const text = extra ? `${CONFIG.waText} E-mail: ${extra}` : CONFIG.waText;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function initChrome() {
  $$("[data-wa]").forEach((a) => {
    const number = a.dataset.wa === "client" ? CONFIG.waNumberClient : CONFIG.waNumberLead;
    a.href = waUrl(number);
  });

  const CONTACT_EMAIL = "comercial@seiflow.com.br";
  const form = $("#cta-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#cta-name")?.value.trim();
    const email = $("#cta-email")?.value.trim();
    const message = $("#cta-message")?.value.trim();
    const status = $("#cta-status");
    const submit = form.querySelector("button[type=submit]");
    if (!name || !email) return;
    const subject = `Diagnóstico Seiflow — ${name}`;
    const body = [
      `Nome: ${name}`,
      `E-mail: ${email}`,
      "",
      message || "Quero saber mais sobre a Seiflow para minha instituição.",
    ].join("\n");
    if (status) status.textContent = "Abrindo seu aplicativo de e-mail...";
    if (submit) {
      submit.disabled = true;
      submit.setAttribute("aria-disabled", "true");
    }
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

}

function initNav() {
  const nav = $("#nav");
  const toggle = $("#nav-toggle");
  const drawer = $("#nav-drawer");

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    if (drawer) drawer.hidden = !open;
  });

  $$("#nav a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
      if (drawer) drawer.hidden = true;
      closeDrops();
    });
  });

  $$("[data-drop]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-drop");
      const menu = $(`#drop-${id}`);
      const parent = btn.closest(".nav__drop");
      const wasOpen = parent.classList.contains("is-open");
      closeDrops();
      if (!wasOpen && menu) {
        parent.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        menu.hidden = false;
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav__drop")) closeDrops();
  });

  function closeDrops() {
    $$(".nav__drop").forEach((d) => {
      d.classList.remove("is-open");
      d.querySelector("[data-drop]")?.setAttribute("aria-expanded", "false");
      const menu = d.querySelector(".nav__menu");
      if (menu) menu.hidden = true;
    });
  }
}

function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem("seiflow-theme");
  apply(saved || "light");

  $("#theme-toggle")?.addEventListener("click", () => {
    apply(root.classList.contains("dark") ? "light" : "dark");
  });

  function apply(mode) {
    root.classList.toggle("dark", mode === "dark");
    localStorage.setItem("seiflow-theme", mode);
  }
}

function wrapStatement() {
  const el = $("#statement-text");
  if (!el || el.dataset.ready) return el;
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
  el.dataset.ready = "1";
  return el;
}

function paintWords(spans, progress) {
  const n = spans.length;
  spans.forEach((s, i) => {
    const local = Math.min(1, Math.max(0, progress * (n + 2) - i));
    s.style.opacity = String(0.14 + local * 0.86);
    s.style.filter = `blur(${((1 - local) * 8).toFixed(2)}px)`;
  });
}

function initStatement(gsap, ST) {
  const el = wrapStatement();
  if (!el) return;
  const spans = $$(".w", el);

  if (prefersReduced()) {
    paintWords(spans, 1);
    return;
  }

  if (gsap && ST) {
    ST.create({
      trigger: el,
      start: "top 82%",
      end: "bottom 28%",
      scrub: 0.45,
      onUpdate: (self) => paintWords(spans, self.progress),
    });
    return;
  }

  const update = () => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.82;
    const end = vh * 0.28;
    const t = (start - rect.top) / (start - end);
    paintWords(spans, Math.min(1, Math.max(0, t)));
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initHow(gsap, ST) {
  const fill = $("#how-fill");
  const steps = $(".how__steps");
  if (!fill || !steps) return;

  if (prefersReduced()) {
    fill.style.height = "100%";
    return;
  }

  const lis = $$(".how__steps li");
  const setOn = (progress) => {
    const n = lis.length;
    lis.forEach((li, i) => {
      li.classList.toggle("is-on", progress >= (i + 0.15) / n);
    });
  };

  if (gsap && ST) {
    ST.create({
      trigger: steps,
      start: "top 65%",
      end: "bottom 35%",
      scrub: 0.35,
      onUpdate: (self) => {
        fill.style.height = `${Math.round(self.progress * 1000) / 10}%`;
        setOn(self.progress);
      },
    });
    return;
  }

  const update = () => {
    const rect = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    const t = (vh * 0.65 - rect.top) / (rect.height + vh * 0.3);
    const p = Math.min(1, Math.max(0, t));
    fill.style.height = `${p * 100}%`;
    setOn(p);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initEnters(ST) {
  const els = $$(".anim");
  const reveal = (el) => el.classList.add("is-in");
  if (prefersReduced()) {
    els.forEach(reveal);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  els.forEach((el) => io.observe(el));
}

function initScrollFX(gsap, ST) {
  if (prefersReduced() || !gsap || !ST) return;

  $$(".campus-rail img").forEach((img) => {
    const fig = img.closest("figure");
    gsap.fromTo(
      img,
      { yPercent: -10, scale: 1.12 },
      {
        yPercent: 8,
        scale: 1.02,
        ease: "none",
        scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  });

  $$(".forwho article img").forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -12, scale: 1.14 },
      {
        yPercent: 8,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest("article"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });

  const shot = $(".hero__shot-frame");
  if (shot) {
    gsap.fromTo(
      shot,
      { y: 40 },
      {
        y: -28,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      }
    );
  }

  const glyphs = $$(".hero__glyphs .g");
  if (glyphs.length) {
    gsap.to(glyphs, {
      y: (i) => (i + 1) * 36,
      rotate: (i) => (i % 2 ? 14 : -18),
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  const chat = $(".proof__chat");
  if (chat) {
    gsap.fromTo(
      chat,
      { y: 36, rotate: -1.5 },
      {
        y: 0,
        rotate: 0,
        ease: "none",
        scrollTrigger: { trigger: chat, start: "top 92%", end: "top 55%", scrub: 0.5 },
      }
    );
  }

  $$(".how__steps li").forEach((li) => {
    gsap.fromTo(
      li,
      { x: 18 },
      {
        x: 0,
        ease: "none",
        scrollTrigger: { trigger: li, start: "top 90%", end: "top 62%", scrub: 0.35 },
      }
    );
  });
}

function readRgb(styles, name, fallback) {
  const raw = (styles.getPropertyValue(name) || "").trim();
  const parts = raw.split(",").map((n) => Number(n.trim()));
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) return parts;
  return fallback;
}

function initImmersiveScroll() {
  if (prefersReduced()) return;
  const layers = [
    [".hero__copy", 0.08], [".hero__shot", -0.14], [".edu-moment__frame", 0.1],
    [".proof__phones", -0.12], [".proof__copy", 0.06], [".quotes__body", -0.08],
    [".how__intro", 0.08], [".how__track", -0.06], [".agents__grid", 0.07],
    [".faq__intro", 0.06], [".faq__list", -0.06], [".footer__cta", 0.08],
  ].flatMap(([selector, depth]) => $$(selector).map((el) => ({ el, depth })));
  if (!layers.length) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const center = window.innerHeight * 0.5;
    layers.forEach(({ el, depth }) => {
      const rect = el.getBoundingClientRect();
      const distance = (center - (rect.top + rect.height * 0.5)) / window.innerHeight;
      el.style.setProperty("--parallax-shift", `${(distance * depth * 80).toFixed(2)}px`);
    });
  };
  const requestUpdate = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
}

function paintBlob(canvas, key) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const styles = getComputedStyle(document.documentElement);
  const colors = [1, 2, 3, 4].map((i) =>
    readRgb(styles, `--blob-${key}-${i}`, [35, 61, 255])
  );

  const orbs = [
    { x: 0.26, y: 0.3, r: 0.42, c: colors[0], p: 0.2 },
    { x: 0.74, y: 0.42, r: 0.36, c: colors[1], p: 1.6 },
    { x: 0.5, y: 0.72, r: 0.32, c: colors[2], p: 3.1 },
    { x: 0.16, y: 0.66, r: 0.26, c: colors[3], p: 4.8 },
  ];

  let w = 0;
  let h = 0;
  let mx = 0.5;
  let my = 0.4;
  let tx = 0.5;
  let ty = 0.4;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    tx = (e.clientX - rect.left) / rect.width;
    ty = (e.clientY - rect.top) / rect.height;
  }, { passive: true });

  let lastFrame = 0;
  let visible = true;
  let animationId = 0;
  function frame(t) {
    if (!visible) {
      animationId = 0;
      return;
    }
    if (t - lastFrame < 33) {
      animationId = requestAnimationFrame(frame);
      return;
    }
    lastFrame = t;
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    orbs.forEach((b) => {
      const ox = Math.sin(t / 1600 + b.p) * 0.1 + (mx - 0.5) * 0.2;
      const oy = Math.cos(t / 2000 + b.p * 0.85) * 0.09 + (my - 0.5) * 0.18;
      const x = (b.x + ox) * w;
      const y = (b.y + oy) * h;
      const r = b.r * Math.min(w, h);
      const g = ctx.createRadialGradient(x, y, r * 0.08, x, y, r);
      g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.7)`);
      g.addColorStop(0.42, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.26)`);
      g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";
    animationId = requestAnimationFrame(frame);
  }

  resize();
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(canvas.parentElement || canvas);
  } else {
    window.addEventListener("resize", resize);
  }
  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !animationId) animationId = requestAnimationFrame(frame);
    }, { rootMargin: "120px" });
    observer.observe(canvas);
  }
  animationId = requestAnimationFrame(frame);
}

function initBlob() {
  if (prefersReduced()) return;
  $$("[data-blob]").forEach((canvas) => {
    paintBlob(canvas, canvas.getAttribute("data-blob") || "hero");
  });
}

function initEcoMarquee() {
  const root = $(".eco-marquee");
  const track = $(".eco-marquee__track", root || document);
  const group = $(".eco-marquee__group", root || document);
  if (!root || !track || !group) return;

  let groupWidth = 0;
  const measure = () => {
    groupWidth = group.getBoundingClientRect().width;
  };
  measure();
  window.addEventListener("resize", measure, { passive: true });

  const SPEED = 34; // px per second
  const DRAG_CLICK_THRESHOLD = 6; // px
  let pos = 0;
  let hovering = false;
  let dragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartPos = 0;
  let lastT = 0;

  const wrap = (p) => {
    if (!groupWidth) return 0;
    return ((p % groupWidth) + groupWidth) % groupWidth;
  };

  const render = () => {
    track.style.transform = `translateX(${-pos}px)`;
  };

  function frame(t) {
    if (!lastT) lastT = t;
    const dt = (t - lastT) / 1000;
    lastT = t;
    if (!dragging && !hovering && !prefersReduced()) {
      pos = wrap(pos + SPEED * dt);
      render();
    }
    requestAnimationFrame(frame);
  }

  root.addEventListener("pointerenter", () => { hovering = true; });
  root.addEventListener("pointerleave", () => { hovering = false; });

  root.addEventListener("pointerdown", (e) => {
    dragging = true;
    dragMoved = false;
    hovering = true;
    dragStartX = e.clientX;
    dragStartPos = pos;
    root.classList.add("is-dragging");
  });

  root.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    if (!dragMoved && Math.abs(dx) > DRAG_CLICK_THRESHOLD) {
      dragMoved = true;
      // Capture only once real dragging is confirmed — capturing on every
      // pointerdown would redirect the following click (and its target)
      // away from the card link, breaking plain clicks on the cards.
      root.setPointerCapture(e.pointerId);
    }
    pos = wrap(dragStartPos - dx);
    render();
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove("is-dragging");
    if (e && e.pointerId !== undefined && root.hasPointerCapture?.(e.pointerId)) {
      root.releasePointerCapture(e.pointerId);
    }
  };
  root.addEventListener("pointerup", endDrag);
  root.addEventListener("pointercancel", endDrag);

  root.addEventListener("click", (e) => {
    if (dragMoved) {
      e.preventDefault();
      e.stopPropagation();
      dragMoved = false;
    }
  }, true);

  requestAnimationFrame(frame);
}

function initQuotes() {
  const tabs = $$(".quotes__tab");
  const text = $("#quote-text");
  const by = $("#quote-by");
  const body = $(".quotes__body");
  if (!tabs.length || !text) return;

  let index = 0;
  let timer = null;

  function show(i) {
    index = i;
    tabs.forEach((t, n) => {
      const on = n === i;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    const apply = () => {
      text.textContent = `“${quotes[i].text.replace(/^“|”$/g, "")}”`;
      if (by) by.textContent = quotes[i].by;
      body?.classList.remove("is-swap");
    };
    if (prefersReduced() || !body) {
      apply();
    } else {
      body.classList.add("is-swap");
      window.setTimeout(apply, 180);
    }
    restart();
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(() => show((index + 1) % quotes.length), 7000);
  }

  tabs.forEach((t) => {
    t.addEventListener("click", () => show(Number(t.dataset.quote)));
  });

  restart();
}

function initFaq() {
  $$(".faq__item").forEach((item) => {
    const toggle = () => {
      const open = item.classList.contains("is-open");
      $$(".faq__item").forEach((el) => {
        el.classList.remove("is-open");
        el.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        item.setAttribute("aria-expanded", "true");
      }
    };
    item.addEventListener("click", toggle);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
}

function initShot() {
  const shot = new URLSearchParams(location.search).get("shot");
  if (!shot) return;
  document.documentElement.classList.add("is-shot");
  const el = document.getElementById(shot);
  if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
}

// Placeholder de respostas até a integração de IA real ser conectada.
// Troque `getAIResponse` por uma chamada de API quando o backend estiver pronto.
function getAIResponse(question) {
  const q = question.toLowerCase();
  const canned = [
    { k: ["nota", "boletim"], a: "As notas e o boletim ficam disponíveis direto pelo WhatsApp, consultando a base oficial da instituição." },
    { k: ["boleto", "pagamento", "mensalidade", "pix", "inadimpl"], a: "O agente Financeiro consulta situação financeira, emite 2ª via de boleto e orienta pagamento via PIX — inclusive avisando vencimentos antes de você perguntar." },
    { k: ["matr", "vestibular", "processo seletivo", "curso", "interessad"], a: "O agente Comercial e de Captação conduz do primeiro contato até a matrícula: cursos, valores, processo seletivo e documentação." },
    { k: ["erp", "integra", "sistema"], a: "A Seiflow se conecta ao ERP da instituição e pode executar processos reais — não só responder — como emitir documentos e consultar dados acadêmicos e financeiros." },
    { k: ["plano", "preço", "valor", "quanto custa"], a: "A equipe comercial apresenta a proposta conforme o tamanho, as filas e as integrações da sua instituição. Fale conosco para receber um diagnóstico." },
    { k: ["lgpd", "dado", "segur"], a: "Trabalhamos com isolamento por unidade, papéis de acesso e rastro de uso — a LGPD entra no desenho do piloto desde o primeiro dia." },
  ];
  const hit = canned.find((c) => c.k.some((word) => q.includes(word)));
  return hit
    ? hit.a
    : "Essa é uma ótima pergunta. Em breve nossa IA vai responder isso automaticamente — por enquanto, fale com a equipe no WhatsApp para uma resposta completa.";
}

function initAIChat() {
  const root = $("#ai-chat");
  const toggle = $("#ai-chat-toggle");
  const closeBtn = $("#ai-chat-close");
  const panel = $("#ai-chat-panel");
  const hint = $("#ai-chat-hint");
  const messages = $("#ai-chat-messages");
  const form = $("#ai-chat-form");
  const input = $("#ai-chat-input");
  if (!root || !toggle || !panel || !form || !input) return;

  function addMessage(text, from) {
    const div = document.createElement("div");
    div.className = `ai-chat__msg ai-chat__msg--${from}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function open() {
    root.classList.add("is-open");
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    if (hint) hint.style.display = "none";
    input.focus();
  }

  function close() {
    root.classList.remove("is-open");
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    if (panel.hidden) open();
    else close();
  });
  closeBtn?.addEventListener("click", close);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    addMessage(value, "user");
    input.value = "";
    window.setTimeout(() => addMessage(getAIResponse(value), "bot"), 350);
  });
}

function initSparkles() {
  const targets = $$("[data-sparkles]");
  if (!targets.length || prefersReduced()) return;

  const colors = ["#233dff", "#8f6bff"];
  const SPARKLE_SVG =
    '<svg viewBox="0 0 21 21" fill="none"><path d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 12.3916 6.39157 13.5 7.5C14.6084 8.60843 16.8077 8.59935 18.2797 9.13822L20.1561 9.82534C20.7858 10.0553 20.7858 10.9447 20.1561 11.1747L18.2797 11.8618C16.8077 12.4007 14.6084 12.3916 13.5 13.5C12.3916 14.6084 12.4006 16.8077 11.8618 18.2798L11.1746 20.1562C10.9446 20.7858 10.0553 20.7858 9.82531 20.1562L9.13819 18.2798C8.59932 16.8077 8.60843 14.6084 7.5 13.5C6.39157 12.3916 4.19225 12.4007 2.72023 11.8618L0.843814 11.1747C0.215148 10.9447 0.215148 10.0553 0.843814 9.82534L2.72023 9.13822C4.19225 8.59935 6.39157 8.60843 7.5 7.5C8.60843 6.39157 8.59932 4.19229 9.13819 2.72026L9.82531 0.843845Z" fill="currentColor"/></svg>';

  targets.forEach((target, i) => {
    const count = Number(target.dataset.sparklesCount) || 8;
    for (let n = 0; n < count; n++) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.innerHTML = SPARKLE_SVG;
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.width = sparkle.style.height = `${12 + Math.random() * 10}px`;
      sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.setProperty("--sparkle-delay", `${Math.random() * 1.6}s`);
      sparkle.style.setProperty("--sparkle-scale", `${(0.6 + Math.random() * 0.6).toFixed(2)}`);
      target.appendChild(sparkle);
    }
  });
}

function initMotion() {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (gsap && ST) gsap.registerPlugin(ST);
  initStatement(gsap, ST);
  initHow(gsap, ST);
  initEnters(ST);
  initScrollFX(gsap, ST);
}

function boot() {
  document.documentElement.classList.add("js");
  initTheme();
  initChrome();
  initNav();
  initQuotes();
  initEcoMarquee();
  initFaq();
  initShot();
  initMotion();
  initImmersiveScroll();
  initBlob();
  // initAIChat(); // desativado a pedido — reative aqui e no HTML (index.html) quando quiser voltar
  initSparkles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
