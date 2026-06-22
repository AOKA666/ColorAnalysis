import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { articles } from "../blog/articles.js";

const root = resolve(import.meta.dirname, "..");
const template = await readFile(resolve(root, "blog", "article-template.html"), "utf8");

function renderStaticArticle(article) {
  const palette = article.palette.map(([name, color]) => `
    <div class="article-swatch"><i style="--swatch:${color}"></i><span>${name}</span><small>${color}</small></div>`).join("");
  const sections = article.sections.map((section, index) => `
    <section class="article-section" id="section-${index + 1}">
      <span class="article-section-number">${String(index + 1).padStart(2, "0")}</span>
      <h2>${section.heading}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      ${section.list ? `<ul>${section.list.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
      ${section.callout ? `<aside class="article-callout"><span>HueKind note</span><p>${section.callout}</p></aside>` : ""}
    </section>`).join("");
  const faq = article.faq.map(([question, answer]) => `
    <details><summary>${question}<span>+</span></summary><p>${answer}</p></details>`).join("");

  return `
    <article>
      <header class="article-hero">
        <div class="article-hero-copy">
          <a class="article-back" href="/blog/">← HueKind Journal</a>
          <div class="blog-meta"><span>${article.category}</span><span>${article.date}</span><span>${article.readTime}</span></div>
          <h1>${article.title}</h1>
          <p>${article.excerpt}</p>
        </div>
        <figure><img src="${article.image}" alt="${article.alt}"></figure>
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
            <div><span class="blog-kicker">Palette preview</span><h2>Colors to start with</h2></div>
            <div class="article-swatches">${palette}</div>
          </section>
          ${sections}
          <section class="article-faq">
            <span class="blog-kicker">Quick answers</span><h2>Frequently asked questions</h2>
            <div>${faq}</div>
          </section>
          <aside class="article-disclaimer">Color analysis is a styling tool, not a medical or identity assessment. Lighting, camera processing, display calibration, and personal preference all affect how color appears.</aside>
        </div>
      </div>
    </article>`;
}

for (const article of articles) {
  const canonical = `https://huekind.online/blog/${article.slug}/`;
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.metaDescription,
    image: `https://huekind.online${article.image}`,
    datePublished: "2026-06-15",
    dateModified: "2026-06-15",
    author: { "@type": "Organization", name: "HueKind" },
    publisher: { "@type": "Organization", name: "HueKind" },
    mainEntityOfPage: canonical
  });
  const html = template
    .replace("<title>HueKind Journal</title>", `<title>${article.metaTitle}</title>`)
    .replace('content="Personal color analysis guide from HueKind."', `content="${article.metaDescription}"`)
    .replace('href="https://huekind.online/blog/"', `href="${canonical}"`)
    .replace('<script id="articleSchema" type="application/ld+json"></script>', `<script id="articleSchema" type="application/ld+json">${schema}</script>`)
    .replace('<main class="article-page" id="articlePage"></main>', `<main class="article-page" id="articlePage">${renderStaticArticle(article)}</main>`);
  const directory = resolve(root, "blog", article.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://huekind.online/</loc><lastmod>2026-06-15</lastmod></url>
  <url><loc>https://huekind.online/blog/</loc><lastmod>2026-06-15</lastmod></url>
${articles.map((article) => `  <url><loc>https://huekind.online/blog/${article.slug}/</loc><lastmod>2026-06-15</lastmod></url>`).join("\n")}
</urlset>
`;
await mkdir(resolve(root, "public"), { recursive: true });
await writeFile(resolve(root, "public", "sitemap.xml"), sitemap);

console.log(`Generated ${articles.length} blog article pages.`);
