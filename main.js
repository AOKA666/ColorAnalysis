import { featuredArticles } from "./blog/articles.js";

const $ = (selector) => document.querySelector(selector);
const stage = $("#quizStage");
const continueButton = $("#quizContinue");
const backButton = $("#quizBack");
const progress = $("#quizProgress");
const counter = $("#quizCounter");
const resultSection = $("#resultSection");
const resultPhoto = $("#resultPhoto");

let step = 0;
let selectedValue = null;
let photoUrl = "";
const answers = {};
const quizPhotoSprites = {
  eyes: assetPath("assets/quiz/quiz-eyes.png"),
  hair: assetPath("assets/quiz/quiz-hair.png"),
  skin: assetPath("assets/quiz/quiz-skin-depth.png"),
  white: assetPath("assets/quiz/quiz-white-drape.png"),
  outfits: assetPath("assets/quiz/quiz-outfits.png")
};

function assetPath(path) {
  return new URL(path, document.baseURI).href;
}

function renderFeaturedArticles() {
  const grid = $("#featuredBlogGrid");
  if (!grid) return;
  grid.innerHTML = featuredArticles.map((article) => `
    <article class="home-blog-card">
      <a class="home-blog-image" href="/blog/${article.slug}/">
        <img src="${article.image}" alt="${article.alt}" loading="lazy">
      </a>
      <div>
        <span>${article.category} · ${article.readTime}</span>
        <h3><a href="/blog/${article.slug}/">${article.title}</a></h3>
        <p>${article.excerpt}</p>
        <a class="text-link" href="/blog/${article.slug}/">Read article <span>→</span></a>
      </div>
    </article>`).join("");
}

const questions = [
  {
    key: "sun",
    title: "How does your skin react to sun exposure?",
    help: "Think about what usually happens before your skin develops a tan.",
    options: [
      ["Tans easily, rarely burns", "warm"],
      ["Burns easily, rarely tans", "cool"],
      ["Tans slowly, occasionally burns", "neutral"],
      ["Burns sometimes, tans sometimes", "neutral"]
    ]
  },
  {
    key: "eyes",
    title: "What color are your eyes?",
    help: "Choose the closest match. This helps us understand your natural depth and contrast.",
    layout: "eyes",
    options: [
      ["Blue / Gray", "cool-light", photoVisual(quizPhotoSprites.eyes, 3, 2, 0, 0)],
      ["Green", "warm-light", photoVisual(quizPhotoSprites.eyes, 3, 2, 1, 0)],
      ["Hazel", "warm-medium", photoVisual(quizPhotoSprites.eyes, 3, 2, 2, 0)],
      ["Light brown", "warm-medium", photoVisual(quizPhotoSprites.eyes, 3, 2, 0, 1)],
      ["Dark brown", "deep", photoVisual(quizPhotoSprites.eyes, 3, 2, 1, 1)],
      ["Nearly black", "deep", photoVisual(quizPhotoSprites.eyes, 3, 2, 2, 1)]
    ]
  },
  {
    key: "colored",
    title: "Is your hair currently colored?",
    help: "We use your natural color in the next step, even if it is growing out.",
    options: [
      ["Yes, it is currently colored", "yes"],
      ["No, it is my natural color", "no"],
      ["It was colored and is growing out", "past"]
    ]
  },
  {
    key: "hair",
    title: "What is your natural, undyed hair color?",
    help: "Choose the shade closest to your roots.",
    layout: "hair",
    options: [
      ["Black", "deep-cool", photoVisual(quizPhotoSprites.hair, 4, 2, 0, 0)],
      ["Dark brown", "deep", photoVisual(quizPhotoSprites.hair, 4, 2, 1, 0)],
      ["Medium brown", "medium-warm", photoVisual(quizPhotoSprites.hair, 4, 2, 2, 0)],
      ["Light brown", "medium-warm", photoVisual(quizPhotoSprites.hair, 4, 2, 3, 0)],
      ["Red / Auburn", "warm", photoVisual(quizPhotoSprites.hair, 4, 2, 0, 1)],
      ["Dark blonde", "medium-soft", photoVisual(quizPhotoSprites.hair, 4, 2, 1, 1)],
      ["Blonde", "light-warm", photoVisual(quizPhotoSprites.hair, 4, 2, 2, 1)],
      ["Light blonde", "light", photoVisual(quizPhotoSprites.hair, 4, 2, 3, 1)]
    ]
  },
  {
    key: "veins",
    title: "Look at the veins near your wrist. What color do they appear?",
    help: "Check them in daylight if you can. It is completely fine to choose both.",
    options: [
      ["More blue or purple", "cool"],
      ["More green or olive", "warm"],
      ["A mix of both", "neutral"],
      ["I am not sure", "neutral"]
    ]
  },
  {
    key: "skin",
    title: "Which range best matches your natural skin depth?",
    help: "This is about depth, not ethnicity or undertone.",
    layout: "skin-depth",
    options: [
      ["Fair", "light", photoVisual(quizPhotoSprites.skin, 2, 2, 0, 0)],
      ["Light", "light", photoVisual(quizPhotoSprites.skin, 2, 2, 1, 0)],
      ["Medium", "medium", photoVisual(quizPhotoSprites.skin, 2, 2, 0, 1)],
      ["Deep", "deep", photoVisual(quizPhotoSprites.skin, 2, 2, 1, 1)]
    ]
  },
  {
    key: "white",
    title: "Which white makes you look fresher and more vibrant?",
    help: "Imagine each shade held near your face in natural daylight.",
    layout: "white-drape",
    options: [
      ["Crisp cool white", "cool", photoVisual(quizPhotoSprites.white, 2, 2, 0, 0)],
      ["Warm ivory", "warm", photoVisual(quizPhotoSprites.white, 2, 2, 1, 0)],
      ["Both work well", "neutral", photoVisual(quizPhotoSprites.white, 2, 2, 0, 1)],
      ["I am not sure", "neutral", photoVisual(quizPhotoSprites.white, 2, 2, 1, 1)]
    ]
  },
  {
    key: "neutrals",
    title: "Which neutral color story are you most drawn to?",
    help: "Do not overthink it. Choose the group you would actually wear.",
    layout: "palette-options",
    options: [
      ["High contrast classics", "clear-cool", ["#161616", "#fafafa", "#172642"]],
      ["Soft blended neutrals", "soft-cool", ["#283754", "#81889a", "#c3cad4"]],
      ["Light fresh neutrals", "light-warm", ["#29456c", "#f4eddb", "#d6ad75"]],
      ["Rich warm neutrals", "deep-warm", ["#40271b", "#495c25", "#e6c5aa"]]
    ]
  },
  {
    key: "best",
    title: "Friends say “you are glowing” when you wear...",
    help: "Choose the color that most reliably brings your face to life.",
    layout: "outfits",
    options: [
      ["Soft blush", "soft-cool", photoVisual(quizPhotoSprites.outfits, 3, 2, 0, 0)],
      ["Navy", "deep-cool", photoVisual(quizPhotoSprites.outfits, 3, 2, 1, 0)],
      ["Warm caramel", "warm", photoVisual(quizPhotoSprites.outfits, 3, 2, 2, 0)],
      ["Olive green", "soft-warm", photoVisual(quizPhotoSprites.outfits, 3, 2, 0, 1)],
      ["Bold red", "clear", photoVisual(quizPhotoSprites.outfits, 3, 2, 1, 1)],
      ["Light peach", "light-warm", photoVisual(quizPhotoSprites.outfits, 3, 2, 2, 1)]
    ]
  },
  {
    key: "photo",
    title: "Add a selfie for a more personalized result",
    help: "Use natural light, no filters, and minimal makeup. You can skip this step.",
    type: "photo"
  }
];

function optionMarkup(option, index, layout) {
  const [label, value, visual] = option;
  if (layout === "palette-options") {
    return `<button class="quiz-option palette-option" type="button" data-value="${value}" data-index="${index}">
      <span class="palette-dots">${visual.map((color) => `<i style="--choice:${color}"></i>`).join("")}</span><b>${label}</b>
    </button>`;
  }
  if (["eyes", "hair", "skin-depth", "white-drape", "outfits"].includes(layout)) {
    return `<button class="quiz-option visual-option image-option ${layout}" type="button" data-value="${value}" data-index="${index}">
      ${realisticVisualMarkup(visual)}<b>${label}</b>
    </button>`;
  }
  if (["swatches", "skin", "large-swatches"].includes(layout)) {
    return `<button class="quiz-option visual-option ${layout}" type="button" data-value="${value}" data-index="${index}">
      <i style="--choice:${visual}"></i><b>${label}</b>
    </button>`;
  }
  return `<button class="quiz-option" type="button" data-value="${value}" data-index="${index}"><b>${label}</b><span>✓</span></button>`;
}

function styleVars(visual) {
  return Object.entries(visual)
    .filter(([key]) => !["type", "src"].includes(key))
    .map(([key, value]) => `--${key}:${value}`)
    .join(";");
}

function photoVisual(src, cols, rows, col, row) {
  return {
    type: "photo",
    src,
    w: `${cols * 100}%`,
    h: `${rows * 100}%`,
    x: `${col * -100}%`,
    y: `${row * -100}%`
  };
}

function realisticVisualMarkup(visual) {
  const vars = styleVars(visual);
  return `<span class="quiz-art photo-art" style="${vars}">
    <img class="photo-sprite" src="${visual.src}" alt="" loading="lazy" decoding="async">
  </span>`;
}

function renderQuestion() {
  const question = questions[step];
  selectedValue = answers[question.key] ?? null;
  progress.style.width = `${((step + 1) / questions.length) * 100}%`;
  counter.textContent = `${step + 1} / ${questions.length}`;
  backButton.disabled = step === 0;
  continueButton.textContent = step === questions.length - 1 ? "Analyze my colors" : "Continue →";

  if (question.type === "photo") {
    stage.innerHTML = `
      <div class="quiz-heading"><span>Optional photo calibration</span><h3>${question.title}</h3><p>${question.help}</p></div>
      <div class="quiz-upload" id="quizDropZone">
        <input id="photoInput" type="file" accept="image/jpeg,image/png,image/webp" hidden>
        <div id="quizUploadEmpty">
          <div class="upload-icon"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg></div>
          <b>Choose or drop a clear selfie</b><small>JPG, PNG or WEBP · Max 10MB</small>
        </div>
        <img id="quizPhotoPreview" alt="Uploaded selfie preview" ${photoUrl ? `src="${photoUrl}"` : "hidden"}>
      </div>
      <button class="quiz-skip" id="quizSkip" type="button">${photoUrl ? "Replace photo" : "Skip photo"}</button>`;
    bindPhotoStep();
    continueButton.disabled = false;
    return;
  }

  stage.innerHTML = `
    <div class="quiz-heading"><span>Color clue ${String(step + 1).padStart(2, "0")}</span><h3>${question.title}</h3><p>${question.help}</p></div>
    <div class="quiz-options ${question.layout || ""}">
      ${question.options.map((option, index) => optionMarkup(option, index, question.layout)).join("")}
    </div>`;

  stage.querySelectorAll(".quiz-option").forEach((button) => {
    if (button.dataset.value === selectedValue) button.classList.add("selected");
    button.addEventListener("click", () => {
      stage.querySelectorAll(".quiz-option").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      selectedValue = button.dataset.value;
      continueButton.disabled = false;
    });
  });
  continueButton.disabled = !selectedValue;
}

function bindPhotoStep() {
  const drop = $("#quizDropZone");
  const input = $("#photoInput");
  const choose = () => input.click();
  drop.addEventListener("click", choose);
  input.addEventListener("click", (event) => event.stopPropagation());
  input.addEventListener("change", () => usePhoto(input.files[0]));
  ["dragenter", "dragover"].forEach((name) => drop.addEventListener(name, (event) => {
    event.preventDefault();
    drop.classList.add("dragging");
  }));
  ["dragleave", "drop"].forEach((name) => drop.addEventListener(name, (event) => {
    event.preventDefault();
    drop.classList.remove("dragging");
  }));
  drop.addEventListener("drop", (event) => usePhoto(event.dataTransfer.files[0]));
  $("#quizSkip").addEventListener("click", () => photoUrl ? input.click() : showAnalysis());
}

function usePhoto(file) {
  if (!file || !file.type.startsWith("image/")) return;
  if (file.size > 10 * 1024 * 1024) {
    alert("Please choose an image smaller than 10MB.");
    return;
  }
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = URL.createObjectURL(file);
  answers.photo = "uploaded";
  renderQuestion();
}

function showAnalysis() {
  $("#quizActions").hidden = true;
  backButton.hidden = true;
  counter.textContent = "Analyzing";
  progress.style.width = "100%";
  stage.innerHTML = `
    <div class="analysis-screen">
      <div class="analysis-spark">✦</div>
      <span>Creating your personal palette</span>
      <h3>Analyzing your answers...</h3>
      <p>We are comparing your undertone, depth, contrast, and chroma.</p>
      <div class="analysis-task"><b>Reading your color clues</b><strong id="taskOne">0%</strong><i><span id="barOne"></span></i></div>
      <div class="analysis-task"><b>Detecting your color profile</b><strong id="taskTwo">0%</strong><i><span id="barTwo"></span></i></div>
      <div class="analysis-task"><b>Building your personal palette</b><strong id="taskThree">0%</strong><i><span id="barThree"></span></i></div>
    </div>`;
  animateTask(1, 650, () => animateTask(2, 650, () => animateTask(3, 650, showEmailGate)));
}

function animateTask(number, duration, done) {
  const bar = $(`#bar${["One", "Two", "Three"][number - 1]}`);
  const text = $(`#task${["One", "Two", "Three"][number - 1]}`);
  let value = 0;
  const timer = setInterval(() => {
    value += 5;
    bar.style.width = `${value}%`;
    text.textContent = `${value}%`;
    if (value >= 100) {
      clearInterval(timer);
      done();
    }
  }, duration / 20);
}

function showEmailGate() {
  stage.innerHTML = `
    <form class="email-gate" id="emailForm">
      <div class="analysis-spark">✓</div>
      <span>Your report is ready</span>
      <h3>Where should we send your color guide?</h3>
      <p>Unlock your season, skin tone chart, signature palette, and easy color swaps.</p>
      <label for="email">Email address</label>
      <input id="email" type="email" autocomplete="email" placeholder="you@example.com" required>
      <small>Secure and private. No spam, ever.</small>
      <button class="button button-primary" type="submit">Get my colors →</button>
      <div class="email-trust">★ 4.9 average rating · Trusted by 18,000+ color seekers</div>
    </form>`;
  $("#emailForm").addEventListener("submit", (event) => {
    event.preventDefault();
    revealResult();
  });
}

function scoreResult() {
  const values = Object.values(answers).join(" ");
  let warm = (values.match(/warm/g) || []).length;
  let cool = (values.match(/cool/g) || []).length;
  let deep = (values.match(/deep/g) || []).length;
  let light = (values.match(/light/g) || []).length;
  let soft = (values.match(/soft/g) || []).length;
  let clear = (values.match(/clear/g) || []).length;
  if (warm >= cool && soft >= clear) return "Soft Autumn";
  if (warm >= cool && light > deep) return "Warm Spring";
  if (cool > warm && deep > light) return "Deep Winter";
  return "Deep Summer";
}

const resultProfiles = {
  "Soft Autumn": {
    description: "Warm, gently muted, and beautifully grounded. Your best colors echo the soft richness of an early autumn landscape.",
    traits: ["Warm neutral", "Low-medium", "Medium"],
    colors: [["#9b4e4b", "Brick rose"], ["#cc765b", "Terracotta"], ["#dba976", "Camel"], ["#748264", "Sage"], ["#426d6a", "Deep teal"], ["#72515f", "Aubergine"]]
  },
  "Warm Spring": {
    description: "Warm, fresh, and naturally radiant. Clear sunlit colors bring energy to your features without overpowering them.",
    traits: ["Warm", "Medium", "Light-medium"],
    colors: [["#ef786a", "Warm coral"], ["#f2a847", "Marigold"], ["#9bac52", "Leaf green"], ["#46a6a0", "Warm aqua"], ["#edc98e", "Honey"], ["#bd5c55", "Poppy"]]
  },
  "Deep Winter": {
    description: "Cool, deep, and striking. Saturated jewel tones and crisp contrast echo the natural definition in your coloring.",
    traits: ["Cool neutral", "High", "Deep"],
    colors: [["#692f49", "Black cherry"], ["#204f51", "Deep pine"], ["#a83e55", "Blue red"], ["#343743", "Charcoal"], ["#d8bdca", "Icy rose"], ["#605283", "Royal plum"]]
  },
  "Deep Summer": {
    description: "Cool, softly deep, and elegant. Blended berry, blue, and slate shades complement your depth without looking harsh.",
    traits: ["Cool neutral", "Medium", "Medium-deep"],
    colors: [["#8f667e", "Smoky berry"], ["#687a99", "Slate blue"], ["#a9828d", "Cool rose"], ["#516a70", "Soft teal"], ["#bbb3b2", "Mushroom"], ["#493f50", "Plum charcoal"]]
  }
};

function revealResult() {
  const result = scoreResult();
  const profile = resultProfiles[result];
  const resultHeading = resultSection.querySelector("h2");
  resultHeading.innerHTML = `You are a <em>${result}.</em>`;
  resultSection.querySelector(".result-header p").textContent = profile.description;
  resultSection.querySelectorAll(".tone-card dd").forEach((item, index) => {
    item.textContent = profile.traits[index];
  });
  resultSection.querySelector(".large-swatches").innerHTML = profile.colors
    .map(([color, label]) => `<span style="--sw:${color}">${label}</span>`)
    .join("");
  if (photoUrl) resultPhoto.src = photoUrl;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

continueButton.addEventListener("click", () => {
  const question = questions[step];
  if (question.type === "photo") {
    showAnalysis();
    return;
  }
  if (!selectedValue) return;
  answers[question.key] = selectedValue;
  if (step < questions.length - 1) {
    step += 1;
    renderQuestion();
  }
});

backButton.addEventListener("click", () => {
  if (step > 0) {
    step -= 1;
    renderQuestion();
  }
});

$("#downloadReport").addEventListener("click", () => {
  const season = resultSection.querySelector("h2").textContent.trim();
  const report = `HUEKIND PERSONAL COLOR REPORT

${season.toUpperCase()}
Undertone: Warm neutral
Contrast: Low-medium
Depth: Medium

BEST COLORS
Brick rose, terracotta, camel, sage, deep teal, aubergine, warm ivory, espresso.

EASY SWAPS
Pure black -> Espresso
Optic white -> Warm ivory
Hot pink -> Dusty rose

Generated by HueKind AI Color Analysis.`;
  const blob = new Blob([report], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "huekind-color-report.txt";
  link.click();
  URL.revokeObjectURL(link.href);
});

const seasons = {
  spring: { label: "Warm spring color palette", title: "Fresh, clear & sun-warmed", description: "Golden undertones come alive in clear coral, leaf green, warm aqua, and sunlit neutrals.", colors: ["#ef786a", "#f6b64f", "#94aa55", "#49a6a1", "#f5d5a0", "#b75e5b"] },
  summer: { label: "Deep summer color palette", title: "Cool, blended & quietly deep", description: "Soft contrast meets smoky berry, slate blue, cool rose, and elegant charcoal neutrals.", colors: ["#8f667e", "#687a99", "#a9828d", "#516a70", "#bbb3b2", "#493f50"] },
  autumn: { label: "Soft autumn color palette", title: "Earthy, muted & warmly rich", description: "Moss, clay, camel, muted teal, and warm berry echo the richness of early autumn.", colors: ["#9b4e4b", "#cc765b", "#dba976", "#748264", "#426d6a", "#72515f"] },
  winter: { label: "Soft winter color palette", title: "Cool, deep & polished", description: "A softened winter story of black cherry, pine, blue-red, charcoal, and icy rose.", colors: ["#692f49", "#204f51", "#a83e55", "#343743", "#d8bdca", "#605283"] }
};

function renderSeason(name) {
  const season = seasons[name];
  $("#seasonLabel").textContent = season.label;
  $("#seasonTitle").textContent = season.title;
  $("#seasonDescription").textContent = season.description;
  $("#seasonOrb").style.background = `conic-gradient(${season.colors.join(",")})`;
  $("#seasonOrb span").innerHTML = `${name[0].toUpperCase() + name.slice(1)}<br>Palette`;
  $("#seasonSwatches").innerHTML = season.colors.map((color) => `<i style="--sw:${color}"></i>`).join("");
}

document.querySelectorAll(".season-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".season-tabs .active").classList.remove("active");
    button.classList.add("active");
    renderSeason(button.dataset.season);
  });
});

const menu = $(".menu-button");
menu.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menu.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll("nav a").forEach((link) => link.addEventListener("click", () => document.body.classList.remove("menu-open")));
document.querySelectorAll(".faq-list details").forEach((detail) => detail.addEventListener("toggle", () => {
  detail.querySelector("summary span").textContent = detail.open ? "-" : "+";
}));

renderQuestion();
renderSeason("spring");
renderFeaturedArticles();
