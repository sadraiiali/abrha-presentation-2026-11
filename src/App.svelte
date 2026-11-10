<script>
  import hljs from "highlight.js/lib/core";
  import bash from "highlight.js/lib/languages/bash";
  import python from "highlight.js/lib/languages/python";
  import typescript from "highlight.js/lib/languages/typescript";
  import "highlight.js/styles/github-dark.min.css";
  import catalog from "./lib/parspack-ai-models.json";
  import Logo from "./lib/Logo.svelte";
  import { providerOf, kt, tokens } from "./lib/providers.js";
  import { mountChat } from "./chat/mount.js";
  import { mountTunnel } from "./chat/mount-tunnel.js";

  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("typescript", typescript);

  const bookmarkGroups = [
    {
      title: "",
      dir: "rtl",
      items: [
        ["پارس‌پک", "https://parspack.com"],
        ["مستندات API پارس‌پک", "https://docs.parspack.com/reference/instructions/"],
        ["مستندات API سرور ابری", "https://docs.parspack.com/reference/api/cloud-server/"],
        ["مستندات Terraform پارس‌پک", "https://docs.parspack.com/reference/terraform/"],
        ["پروایدر Terraform ابرها", "https://registry.terraform.io/providers/abrhacom/abrha/latest/docs"],
        ["مستندات AI Studio", "https://docs.parspack.com/ai-studio/overview/"],
        ["کلید API در AI Studio", "https://docs.parspack.com/ai-studio/api-keys/"],
      ],
    },
    {
      title: "ابزار ها",
      dir: "ltr",
      items: [
        ["OpenCode", "https://opencode.ai"],
        ["Grok", "https://grok.com"],
        ["claude-code", "https://claude.com/product/claude-code"],
        ["T3 Code", "https://t3.codes"],
      ],
    },
  ];

  const studioModels = catalog.models.map((model) => ({ slug: model.slug, name: model.name }));
  const defaultStudioModel = studioModels.find((model) => model.slug === "x-ai/grok-4.7")?.slug ?? studioModels[0].slug;

  function opencodeModelsBlock() {
    return studioModels
      .map((model) => `        ${JSON.stringify(model.slug)}: { "name": ${JSON.stringify(model.name)} }`)
      .join(",\n");
  }

  function grokModelBlocks(token) {
    return studioModels
      .map(
        (model) => `[model.${JSON.stringify(model.slug)}]
model = ${JSON.stringify(model.slug)}
name = ${JSON.stringify(model.name)}
base_url = "https://ai.parspack.com/v1"
api_key = ${JSON.stringify(token)}
api_backend = "chat_completions"`,
      )
      .join("\n\n");
  }

  const tutorials = {
    opencode: {
      title: "OpenCode",
      body: `OpenCode را با کلید AI Studio به آدرس OpenAI-compatible وصل کنید. هر ${studioModels.length} مدل کاتالوگ در همین پیکربندی است و با /models عوض می‌شود.`,
      install: `sudo pacman -S opencode
# or, on other systems:
curl -fsSL https://opencode.ai/v2/install | bash
opencode --version`,
      file: "این فایل را عوض کنید: ~/.config/opencode/opencode.jsonc — اگر پوشه نیست بسازیدش. روی این ماشین مجازی برای کاربر user همین مسیر از قبل وجود دارد.",
      code: (token) => `// File to edit: ~/.config/opencode/opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": ${JSON.stringify("parspack/" + defaultStudioModel)},
  "providers": {
    "parspack": {
      "name": "ParsPack AI Studio",
      "package": "@opencode/ai/providers/openai-compatible",
      "settings": {
        "baseURL": "https://ai.parspack.com/v1",
        "apiKey": ${JSON.stringify(token)}
      },
      "models": {
${opencodeModelsBlock()}
      }
    }
  }
}`,
      run: (token) => `export PARSPACK_API_KEY='${token}'
opencode`,
    },
    grok: {
      title: "Grok CLI",
      body: `این صفحه برای دستور grok است. فایل ~/.grok/config.toml هر ${studioModels.length} مدل کاتالوگ AI Studio را دارد. api_backend برابر chat_completions است چون آدرس استودیو OpenAI-compatible است.`,
      install: `curl -fsSL https://x.ai/cli/install.sh | bash
# or
npm i -g @xai-official/grok
grok --version`,
      file: "این فایل را عوض کنید: ~/.grok/config.toml — اگر پوشه ~/.grok نیست بسازیدش. این همان فایلی است که دستور grok موقع شروع می‌خواند.",
      code: (token) => `# File to edit: ~/.grok/config.toml
[models]
default = ${JSON.stringify(defaultStudioModel)}

[endpoints]
models_base_url = "https://ai.parspack.com/v1"

${grokModelBlocks(token)}`,
      run: (token) => `export PARSPACK_API_KEY='${token}'
export GROK_MODELS_BASE_URL='https://ai.parspack.com/v1'
export XAI_API_KEY="$PARSPACK_API_KEY"
grok`,
    },
    claude: {
      title: "Claude CLI",
      body: "دستور claude پروتکل Anthropic می‌خواهد. AI Studio پروتکل OpenAI می‌دهد، پس Claude CLI را مستقیم به استودیو وصل نکنید. 9router را جلو بگذارید و مدل anthropic/claude-sonnet-5.5 را در داشبورد انتخاب کنید.",
      install: `curl -fsSL https://claude.ai/install.sh | bash
claude --version`,
      file: "فایل پیکربندی کلود را عوض نکنید. دو خط export را در ترمینال بزنید. اگر می‌خواهید هر بار بماند، همان دو خط را به انتهای ~/.bashrc اضافه کنید.",
      code: (token) => `# No Claude config file. To keep this, edit ~/.bashrc
# In the 9router provider form, paste this AI Studio key:
# ${token}

export ANTHROPIC_BASE_URL='http://127.0.0.1:20128/v1'
export ANTHROPIC_API_KEY='the-9router-key'
claude`,
      run: () => "",
    },
    omniroute: {
      title: "OmniRoute",
      body: "OmniRoute یک روتر متن‌باز است: https://www.omniroute.online/ و مخزن cheaper-inference/OmniRoute. یک نقطه محلی OpenAI-compatible روی http://localhost:20128/v1 دارد و داشبوردش http://localhost:20128/dashboard است. درخواست‌های OpenAI، Claude، Gemini و Responses را می‌پذیرد و بین صدها provider جابه‌جا می‌کند. کلید AI Studio را فقط داخل داشبورد، روی یک provider با آدرس https://ai.parspack.com/v1 بگذارید. شناسه مدل را از فهرست مدل‌ها بردارید، مثلاً x-ai/grok-4.7 یا anthropic/claude-sonnet-5.5. پورت 20128 با 9router یکی است، پس فقط یکی از این دو را هم‌زمان اجرا کنید.",
      install: `npm install -g omniroute
omniroute`,
      file: "فایلی را عوض نکنید. بعد از omniroute، در داشبورد http://localhost:20128/dashboard یک provider بسازید و آدرس و کلید را آنجا بگذارید.",
      code: (token) => `# No file. Edit the provider form at http://localhost:20128/dashboard
npm install -g omniroute
omniroute
# dashboard http://localhost:20128/dashboard
# API      http://localhost:20128/v1
# provider base URL https://ai.parspack.com/v1
# provider API key  ${token}
# model x-ai/grok-4.7 or anthropic/claude-sonnet-5.5

curl http://localhost:20128/v1/chat/completions \\
  -H "Authorization: Bearer $OMNIROUTE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"x-ai/grok-4.7","messages":[{"role":"user","content":"سلام"}]}'`,
      run: (token) => `export PARSPACK_API_KEY='${token}'
export OPENAI_BASE_URL='http://localhost:20128/v1'`,
    },
    "9router": {
      title: "9router",
      body: "9router کلید AI Studio را نگه می‌دارد و برای ابزارهایی که فقط شکل API کلود را بلدند یک آدرس محلی می‌سازد. اگر مدل مسیر را x-ai/grok-4.7 بگذارید، همان کلاینت کلود به Grok می‌رود.",
      install: `npm install -g 9router
9router`,
      file: "فایلی را عوض نکنید. بعد از 9router، در داشبورد http://127.0.0.1:20128 یک provider بسازید و آدرس و کلید را آنجا بگذارید.",
      code: (token) => `# No file. Edit the provider form at http://127.0.0.1:20128
npm install -g 9router
9router
# dashboard http://127.0.0.1:20128
# provider base URL https://ai.parspack.com/v1
# provider API key ${token}
# model x-ai/grok-4.7 or anthropic/claude-sonnet-5.5`,
      run: () => "",
    },
  };

  const hrefFor = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\//, "")}`;

  function routeOf(href) {
    const url = new URL(href, location.href);
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
    let path = url.pathname.replace(/\/index\.html$/, "") || "/";
    if (basePath && path.startsWith(basePath)) path = path.slice(basePath.length) || "/";
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return path.startsWith("/") ? path : `/${path}`;
  }

  function currentPath() {
    if (location.hash.startsWith("#/")) return location.hash.slice(1);
    return routeOf(location.href);
  }

  let route = $state(currentPath());
  let homeLeaving = $state(false);

  function go(href) {
    const path = routeOf(href);
    if (path === "/talk" || path.startsWith("/talk/")) {
      location.assign(href);
      return;
    }
    history.pushState(null, "", href);
    route = path;
  }

  function follow(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const href = event.currentTarget.getAttribute("href");
    if (!href || /^(https?:)?\/\//.test(href)) return;
    event.preventDefault();
    go(href);
  }

  function openHomeHref(href) {
    if (!href) return;
    go(href);
    if (routeOf(href) === "/talk" || routeOf(href).startsWith("/talk/")) return;
    window.setTimeout(() => {
      homeLeaving = false;
    }, 120);
  }

  /** @type {import("svelte/attachments").Attachment} */
  function shineCards(node) {
    const setPoint = (card, event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    const cardFrom = (event) => {
      const card = event.target.closest("a.model-card");
      if (!card || !node.contains(card)) return null;
      return card;
    };
    const onMove = (event) => {
      const card = cardFrom(event);
      if (card) setPoint(card, event);
    };
    const onDown = (event) => {
      if (event.button !== 0 || homeLeaving) return;
      const card = cardFrom(event);
      if (!card) return;
      setPoint(card, event);
      card.classList.remove("is-press");
      void card.offsetWidth;
      card.classList.add("is-press");
    };
    const onUp = (event) => {
      const card = cardFrom(event) ?? node.querySelector("a.model-card.is-press");
      if (!card) return;
      window.setTimeout(() => card.classList.remove("is-press"), 420);
    };
    const onClick = (event) => {
      const card = cardFrom(event);
      if (!card || homeLeaving) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const href = card.getAttribute("href");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        openHomeHref(href);
        return;
      }
      window.setTimeout(() => {
        homeLeaving = true;
        window.setTimeout(() => openHomeHref(href), 480);
      }, 460);
    };
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerdown", onDown);
    node.addEventListener("pointerup", onUp);
    node.addEventListener("pointercancel", onUp);
    node.addEventListener("click", onClick, true);
    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerdown", onDown);
      node.removeEventListener("pointerup", onUp);
      node.removeEventListener("pointercancel", onUp);
      node.removeEventListener("click", onClick, true);
    };
  }

  const tutorialSlug = $derived(route.match(/^\/tutorials\/([^/]+)\/?$/)?.[1] ?? "");
  const tutorial = $derived(tutorials[tutorialSlug] ?? null);
  const page = $derived(
    route.startsWith("/models")
      ? "models"
      : route.startsWith("/bookmarks")
        ? "bookmarks"
        : route.startsWith("/tutorials")
          ? "tutorials"
          : route.startsWith("/agent-docs")
            ? "agent-docs"
            : "home",
  );
  let q = $state("");
  let chatOpen = $state(false);
  let chatModel = $state("abrha/free-model");
  let chatHost = $state(null);
  let skyHost = $state(null);
  let selectedId = $state(null);
  let sample = $state(0);
  let opened = $state({});
  let sideWidth = $state(360);

  function startDrag(event) {
    const startX = event.clientX;
    const startW = sideWidth;
    function move(e) {
      sideWidth = Math.min(Math.max(startW - (e.clientX - startX), 280), window.innerWidth - 280);
    }
    function stop() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  let models = catalog.models;

  let filtered = $derived(
    models.filter((model) => {
      const hay = `${model.name} ${model.slug} ${providerOf(model.slug)}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    }),
  );

  let groups = $derived.by(() => {
    const map = new Map();
    for (const model of filtered) {
      const name = providerOf(model.slug);
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(model);
    }
    for (const items of map.values()) {
      items.sort((a, b) => {
        const byOutput = b.output_token_price_per_million - a.output_token_price_per_million;
        if (byOutput) return byOutput;
        return b.input_token_price_per_million - a.input_token_price_per_million;
      });
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  });

  let selected = $derived(models.find((model) => model.model_id === selectedId) ?? null);

  let highlighted = $derived.by(() => {
    const code = selected?.sample_codes?.[sample];
    if (!code) return "";
    const language = code.language === "curl" ? "bash" : code.language;
    if (hljs.getLanguage(language)) return hljs.highlight(code.content, { language }).value;
    return hljs.highlightAuto(code.content).value;
  });

  function open(model) {
    selectedId = model.model_id;
    sample = 0;
    sideWidth = Math.round(window.innerWidth * 0.5);
  }

  function logoFor(items) {
    return items.find((model) => model.company_logo_url)?.company_logo_url ?? null;
  }

  function isOpen(name) {
    if (name in opened) return opened[name];
    return true;
  }

  function toggle(name) {
    opened[name] = !isOpen(name);
  }

  function openChat() {
    chatModel = selected?.slug ?? chatModel;
    chatOpen = true;
  }

  let agentDocs = $state("");
  let agentDocsStatus = $state("");

  $effect(() => {
    const onMove = () => {
      route = currentPath();
    };
    window.addEventListener("popstate", onMove);
    return () => {
      window.removeEventListener("popstate", onMove);
    };
  });

  $effect(() => {
    if (page !== "agent-docs" || agentDocs) return;
    agentDocsStatus = "در حال خواندن";
    const url = new URL("parspack-docs-for-agents.md", document.baseURI);
    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        agentDocs = text;
        agentDocsStatus = `${text.length.toLocaleString()} نویسه`;
      })
      .catch((error) => {
        agentDocsStatus = String(error);
      });
  });

  async function copyAgentDocs() {
    await navigator.clipboard.writeText(agentDocs);
    agentDocsStatus = "کپی شد";
  }

  $effect(() => {
    if (page !== "home" || !skyHost) return;
    const root = mountTunnel(skyHost);
    return () => root.unmount();
  });

  $effect(() => {
    if (!chatOpen || !chatHost) return;
    const root = mountChat(chatHost, {
      models: models.map((model) => ({ slug: model.slug, name: model.name })),
      initialModel: chatModel,
      onClose: () => {
        chatOpen = false;
      },
    });
    return () => root.unmount();
  });
</script>

<div
  class="layout"
  class:home={page === "home"}
  class:leaving={homeLeaving}
  class:open={selected}
  style:grid-template-columns={selected ? `minmax(0, 1fr) 6px ${sideWidth}px` : "minmax(0, 1fr)"}
>
  <div class="leave-veil" class:on={homeLeaving}></div>
  <main class="scroll">
    {#if page === "home"}
      <div class="sky" bind:this={skyHost}></div>
      <article class="home" dir="rtl" {@attach shineCards}>
        <div class="logos">
          <img src="{import.meta.env.BASE_URL}parspack-logo.png" alt="پارس‌پک" />
          <img src="{import.meta.env.BASE_URL}abrha-logo.png" alt="ابرها" />
        </div>
        <h1>آیا DevOps بدون دخالت انسان هم می‌تواند کار کند؟</h1>
        <p class="kicker">پارس‌پک · ۱۹ آبان ۱۴۰۵ · ساعت ۱۹:۰۰ تا ۲۱:۰۰</p>
        <a class="model-card" href="{import.meta.env.BASE_URL}talk/index.html">
          <svg class="card-logo" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
          </svg>
          <span class="card-copy">
            <strong>ارائه</strong>
          </span>
        </a>
        <a class="model-card" href={hrefFor("agent-docs")}>
          <svg class="card-logo" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <span class="card-copy">
            <strong>دانش مستندات پارس‌پک</strong>
          </span>
        </a>
        <a class="model-card" href={hrefFor("models")}>
          <svg class="card-logo" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          <span class="card-copy">
            <strong>مدل‌های ParsPack</strong>
          </span>
        </a>
        <a class="model-card" href={hrefFor("bookmarks")}>
          <svg class="card-logo" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
          </svg>
          <span class="card-copy">
            <strong>بوکمارک ها</strong>
          </span>
        </a>
        <a class="model-card" href={hrefFor("tutorials")}>
          <svg class="card-logo" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
          </svg>
          <span class="card-copy">
            <strong>آموزش اتصال کلید AI Studio</strong>
          </span>
        </a>
        <nav class="home-links" dir="ltr" aria-label="علیرضا صدرایی راد">
          <a href="https://sadraii.ir" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.356 2.171a13.26 13.26 0 0 1-4.21 6.247m0 0A13.27 13.27 0 0 1 12 15.75a13.27 13.27 0 0 1-4.146-2.748m8.292 0a13.26 13.26 0 0 0 4.21-6.247M3.157 9.753a13.26 13.26 0 0 0 4.21 6.247" />
            </svg>
            sadraii.ir
          </a>
          <a href="https://t.me/sadraiiali" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21.75 3.862 18.62 20.14c-.236 1.04-1.51 1.447-2.42.77l-4.73-3.52-2.28 2.2c-.252.244-.62.3-.93.14l.334-4.76 8.66-7.82c.377-.34-.083-.53-.586-.19L6.09 12.67l-4.61-1.44c-1-.313-1.01-1.003.216-1.48L20.35 3.1c.83-.32 1.56.2 1.4.762Z" />
            </svg>
            Telegram
          </a>
          <a href="https://x.com/sadraiiali" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            sadraiiali
          </a>
        </nav>
      </article>
    {:else if page === "tutorials" && tutorial}
      <article class="tutorial" dir="rtl">
        <p><a href={hrefFor("tutorials")} onclick={follow}>همه آموزش‌ها</a></p>
        <h1>{tutorial.title}</h1>
        <p>{tutorial.body}</p>
        <h2>نصب</h2>
        <pre dir="ltr"><code>{tutorial.install}</code></pre>
        <h2>کجا را عوض کنید</h2>
        <p>{tutorial.file}</p>
        <h2>پیکربندی</h2>
        <p dir="ltr"><strong>{tutorial.file}</strong></p>
        <p>
          آدرس پایه <code dir="ltr">https://ai.parspack.com/v1</code> است. شناسه‌ها را از
          <a href={hrefFor("models")} onclick={follow}>فهرست مدل‌ها</a> بردارید.
        </p>
        <pre dir="ltr"><code>{tutorial.code("YOUR_PARSPACK_TOKEN")}</code></pre>
        {#if tutorial.run("YOUR_PARSPACK_TOKEN")}<pre dir="ltr"><code>{tutorial.run("YOUR_PARSPACK_TOKEN")}</code></pre>{/if}
      </article>
    {:else if page === "tutorials"}
      <article class="tutorial" dir="rtl">
        <h1>آموزش اتصال کلید AI Studio</h1>
        <p>هر ابزار صفحه خودش را دارد. کلید را خودتان به‌جای <code dir="ltr">YOUR_PARSPACK_TOKEN</code> بگذارید. آدرس پایه <code dir="ltr">https://ai.parspack.com/v1</code> است.</p>
        <a class="model-card" href={hrefFor("tutorials/opencode")} onclick={follow}><strong>OpenCode</strong><span>پیکربندی کلاینت و دو مدل</span></a>
        <a class="model-card" href={hrefFor("tutorials/grok")} onclick={follow}><strong>Grok CLI</strong><span>دستور grok و فایل config.toml</span></a>
        <a class="model-card" href={hrefFor("tutorials/claude")} onclick={follow}><strong>Claude CLI</strong><span>از راه 9router</span></a>
        <a class="model-card" href={hrefFor("tutorials/9router")} onclick={follow}><strong>9router</strong><span>کلید استودیو پشت API کلود</span></a>
        <a class="model-card" href={hrefFor("tutorials/omniroute")} onclick={follow}><strong>OmniRoute</strong><span>روتر دیگر، همان پورت ۲۰۱۲۸</span></a>
      </article>
    {:else if page === "agent-docs"}
      <article class="tutorial" dir="rtl">
        <p><a href={hrefFor("")} onclick={follow}>خانه</a></p>
        <h1>دانش مستندات پارس‌پک</h1>
        <p>متن مقاله‌های docs.parspack.com در یک جا. برای عامل هوش مصنوعی همین متن را کپی کنید.</p>
        <button type="button" onclick={copyAgentDocs}>کپی همه</button>
        <p>{agentDocsStatus}</p>
        <pre dir="ltr"><code>{agentDocs}</code></pre>
      </article>
    {:else if page === "bookmarks"}
      <h1 dir="rtl">بوکمارک ها</h1>
      {#each bookmarkGroups as group}
        {#if group.title}<h2 dir="rtl">{group.title}</h2>{/if}
        <div class="bookmarks" class:square={group.dir === "ltr"} dir={group.dir}>
          {#each group.items as [name, href]}
            {@const host = new URL(href).host}
            <a href={href}>
              <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=128`} alt="" width="20" height="20" />
              <strong>{name}</strong>
              <span class="chip">{host}</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </a>
          {/each}
        </div>
      {/each}
    {:else}
    <h1 dir="rtl">مدل‌های ParsPack</h1>
    <p dir="rtl">{filtered.length} از {models.length} مورد از کاتالوگ AI Studio.</p>
    <div class="filter-row">
      <button type="button" class="chat-open" aria-label="Open chat" onclick={openChat}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      </button>
      <input dir="rtl" type="search" bind:value={q} placeholder="فیلتر بر اساس نام، اسلاگ یا شرکت" />
    </div>
    {#if chatOpen}
      <div class="chat-host" bind:this={chatHost}></div>
    {/if}

    {#each groups as [name, items] (name)}
      <section>
        <h2>
          <button type="button" class="provider" aria-expanded={isOpen(name)} onclick={() => toggle(name)}>
            <Logo provider={name} url={logoFor(items)} />
            <span>{name} · {items.length}</span>
            <span class="chev" class:open={isOpen(name)} aria-hidden="true"></span>
          </button>
        </h2>
        {#if isOpen(name)}
        <ul>
          {#each items as model (model.model_id)}
            <li>
              <button
                type="button"
                class:active={selectedId === model.model_id}
                onclick={() => open(model)}
              >
                <Logo provider={name} url={model.company_logo_url} />
                <span class="id">
                  <strong>{model.name}</strong>
                  <small>{model.slug}</small>
                </span>
                <span class="meta">{tokens(model.max_context_length)}</span>
                <span class="meta">
                  {#if model.is_free}
                    Free
                  {:else}
                    {kt(model.input_token_price_per_million)} / {kt(model.output_token_price_per_million)}
                  {/if}
                </span>
              </button>
            </li>
          {/each}
        </ul>
        {/if}
      </section>
    {:else}
      <p>No models match.</p>
    {/each}
    {/if}
  </main>

  {#if selected}
    <div
      class="split"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize model card"
      onpointerdown={startDrag}
    ></div>
    <aside class="scroll">
      <header>
        <Logo provider={providerOf(selected.slug)} url={selected.company_logo_url} />
        <div>
          <h2>{selected.name}</h2>
          <p>{selected.slug}</p>
        </div>
        <button type="button" class="close" onclick={() => (selectedId = null)} aria-label="Close">×</button>
      </header>

      <p class="desc" dir="rtl">{selected.description}</p>

      <div class="facts">
        <article>
          <h3>Context window</h3>
          <p>{tokens(selected.max_context_length)} tokens</p>
        </article>
        <article>
          <h3>Max output</h3>
          <p>{tokens(selected.max_output_tokens)} tokens</p>
        </article>
        <article>
          <h3>Input</h3>
          <p>{kt(selected.input_token_price_per_million)} <span>per 1M tokens</span></p>
        </article>
        <article>
          <h3>Output</h3>
          <p>{kt(selected.output_token_price_per_million)} <span>per 1M tokens</span></p>
        </article>
        <article>
          <h3>Tier</h3>
          <p>{selected.price_tier} · {selected.speed}</p>
        </article>
        {#if selected.license}
          <article>
            <h3>License</h3>
            <p dir="rtl">{selected.license}</p>
          </article>
        {/if}
        {#if selected.capabilities?.length}
          <article class="wide">
            <h3>Capabilities</h3>
            <p>{selected.capabilities.join(", ")}</p>
          </article>
        {/if}
        {#if selected.modalities?.length}
          <article class="wide">
            <h3>Modalities</h3>
            <p>{selected.modalities.map((item) => `${item.type.toLowerCase()} ${item.name}`).join(", ")}</p>
          </article>
        {/if}
        {#if selected.ideal_use_cases?.length}
          <article class="wide">
            <h3>Use cases</h3>
            <p dir="rtl">{selected.ideal_use_cases.join(" · ")}</p>
          </article>
        {/if}
      </div>

      {#if selected.sample_codes?.length}
        <div class="samples">
          {#each selected.sample_codes as code, index (code.sample_code_id)}
            <button type="button" class:active={sample === index} onclick={() => (sample = index)}>
              {code.title}
            </button>
          {/each}
          <pre dir="ltr"><code>{@html highlighted}</code></pre>
        </div>
      {/if}
    </aside>
  {/if}
</div>
