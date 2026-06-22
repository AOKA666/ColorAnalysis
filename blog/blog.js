import { articles, getArticle } from "./articles.js";

const page = document.body.dataset.blogPage;

function cardMarkup(article) {
  return `
    <article class="blog-card">
      <a class="blog-card-image" href="/blog/${article.slug}/">
        <img src="${article.image}" alt="${article.alt}" loading="lazy">
      </a>
      <div class="blog-card-copy">
        <div class="blog-meta"><span>${article.category}</span><span>${article.readTime}</span></div>
        <h2><a href="/blog/${article.slug}/">${article.title}</a></h2>
        <p>${article.excerpt}</p>
        <a class="blog-read-link" href="/blog/${article.slug}/">Read article <span>→</span></a>
      </div>
    </article>`;
}

function renderIndex() {
  document.querySelector("#blogGrid").innerHTML = articles.map(cardMarkup).join("");
}

function renderArticle() {
  const slug = location.pathname.split("/").filter(Boolean).at(-1);
  const article = getArticle(slug);

  if (!article) {
    document.querySelector("#articlePage").innerHTML = `
      <div class="blog-not-found">
        <span class="blog-kicker">HueKind Journal</span>
        <h1>Article not found.</h1>
        <a class="button button-primary" href="/blog/">Browse the journal</a>
      </div>`;
    return;
  }

  document.title = article.metaTitle;
  document.querySelector('meta[name="description"]').content = article.metaDescription;
  document.querySelector('link[rel="canonical"]').href = `https://huekind.online/blog/${article.slug}/`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.metaDescription,
    image: `https://huekind.online${article.image}`,
    datePublished: "2026-06-15",
    dateModified: "2026-06-15",
    author: { "@type": "Organization", name: "HueKind" },
    publisher: { "@type": "Organization", name: "HueKind" },
    mainEntityOfPage: `https://huekind.online/blog/${article.slug}/`
  };
  document.querySelector("#articleSchema").textContent = JSON.stringify(articleJsonLd);

  const palette = article.palette.map(([name, color]) => `
    <div class="article-swatch">
      <i style="--swatch:${color}"></i>
      <span>${name}</span>
      <small>${color}</small>
    </div>`).join("");

  const sections = article.sections.map((section, index) => `
    <section class="article-section">
      <span class="article-section-number">${String(index + 1).padStart(2, "0")}</span>
      <h2>${section.heading}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      ${section.list ? `<ul>${section.list.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
      ${section.callout ? `<aside class="article-callout"><span>HueKind note</span><p>${section.callout}</p></aside>` : ""}
    </section>`).join("");

  const faq = article.faq.map(([question, answer]) => `
    <details>
      <summary>${question}<span>+</span></summary>
      <p>${answer}</p>
    </details>`).join("");

  const related = articles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3)
    .map(cardMarkup)
    .join("");

  document.querySelector("#articlePage").innerHTML = `
    <article>
      <header class="article-hero">
        <div class="article-hero-copy">
          <a class="article-back" href="/blog/">← HueKind Journal</a>
          <div class="blog-meta"><span>${article.category}</span><span>${article.date}</span><span>${article.readTime}</span></div>
          <h1>${article.title}</h1>
          <p>${article.excerpt}</p>
        </div>
        <figure>
          <img src="${article.image}" alt="${article.alt}">
        </figure>
      </header>

      <div class="article-layout">
        <aside class="article-sidebar">
          <span>In this guide</span>
          ${article.sections.map((section, index) => `<a href="#section-${index + 1}">${String(index + 1).padStart(2, "0")} ${section.heading}</a>`).join("")}
          <a class="article-sidebar-cta" href="/#analyze">Find my colors →</a>
        </aside>

        <div class="article-body">
          <div class="article-intro">${article.intro.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div>
          <section class="article-palette">
            <div>
              <span class="blog-kicker">Palette preview</span>
              <h2>Colors to start with</h2>
            </div>
            <div class="article-swatches">${palette}</div>
          </section>
          ${sections}
          <section class="article-faq">
            <span class="blog-kicker">Quick answers</span>
            <h2>Frequently asked questions</h2>
            <div>${faq}</div>
          </section>
          <aside class="article-disclaimer">Color analysis is a styling tool, not a medical or identity assessment. Lighting, camera processing, display calibration, and personal preference all affect how color appears.</aside>
        </div>
      </div>
    </article>

    <section class="related-posts">
      <div class="related-heading">
        <div><span class="blog-kicker">Keep exploring</span><h2>More from the journal</h2></div>
        <a class="text-link" href="/blog/">View all articles <span>→</span></a>
      </div>
      <div class="blog-grid blog-grid-related">${related}</div>
    </section>`;

  document.querySelectorAll(".article-section").forEach((section, index) => {
    section.id = `section-${index + 1}`;
  });
  bindDetails();
}

function bindDetails() {
  document.querySelectorAll("details").forEach((detail) => detail.addEventListener("toggle", () => {
    detail.querySelector("summary span").textContent = detail.open ? "−" : "+";
  }));
}

const menu = document.querySelector(".menu-button");
menu?.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menu.setAttribute("aria-expanded", String(open));
});

if (page === "index") renderIndex();
if (page === "article") renderArticle();
