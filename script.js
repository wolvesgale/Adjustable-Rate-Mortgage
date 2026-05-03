/* ── CONFIG（リンクはここで差し替え） ── */
const CFG = {
  fp_url:   "#fp",                       // FP無料相談URL（差し替え）
  book_url: "https://amzn.to/4t4AGcB",  // Kindle本
};

/* ── 質問データ ── */
const QUESTIONS = [
  {
    text: "現在の住宅ローン残高は？",
    opts: [
      { label: "2,000万円未満",      score: 3 },
      { label: "2,000〜3,500万円",   score: 2 },
      { label: "3,500〜5,000万円",   score: 1 },
      { label: "5,000万円以上",      score: 0 },
    ]
  },
  {
    text: "月々の返済額は手取り収入の何割ですか？",
    opts: [
      { label: "20%未満（余裕あり）", score: 3 },
      { label: "20〜30%",            score: 2 },
      { label: "30〜40%",            score: 1 },
      { label: "40%以上",            score: 0 },
    ]
  },
  {
    text: "緊急時の生活防衛資金は月収の何か月分ありますか？",
    opts: [
      { label: "6か月分以上",  score: 3 },
      { label: "3〜6か月分",  score: 2 },
      { label: "1〜3か月分",  score: 1 },
      { label: "1か月分未満", score: 0 },
    ]
  },
  {
    text: "今後3年以内に大きな支出の予定はありますか？",
    opts: [
      { label: "特にない",                   score: 3 },
      { label: "少しある（旅行・車など）",   score: 2 },
      { label: "ある（教育費・リフォームなど）", score: 1 },
      { label: "かなり重なる",               score: 0 },
    ]
  },
  {
    text: "金利が1%上昇した場合の返済増加分、対応できそうですか？",
    opts: [
      { label: "問題なく対応できる",       score: 3 },
      { label: "少し厳しいが何とかなる",   score: 2 },
      { label: "かなり厳しい",             score: 1 },
      { label: "対応は困難",               score: 0 },
    ]
  },
];

/* ── 結果定義 ── */
const RESULTS = [
  {
    min: 12,
    badgeClass: "b-safe",
    badgeText:  "✅ 耐性：高",
    gaugeColor: "#3fb950",
    title:  "現状は安定しています",
    body:   "変動金利上昇への耐性は十分です。ただし金利上昇局面は続く可能性があります。定期的な見直しで資産をさらに守り、育てましょう。",
    ctas: [
      { label: "📘 資産を育てるヒントを読む",     url: CFG.book_url, primary: true },
      { label: "FP無料相談で将来設計を確認する", url: CFG.fp_url,   primary: false },
    ]
  },
  {
    min: 7,
    badgeClass: "b-warn",
    badgeText:  "⚠️ 耐性：要注意",
    gaugeColor: "#f0b429",
    title:  "金利上昇の影響を受ける可能性があります",
    body:   "現状は乗り切れていますが、金利がさらに上昇すると返済が重くなるリスクがあります。今のうちに対策を確認しておくことをお勧めします。",
    ctas: [
      { label: "🔍 無料FP相談で対策を確認する",   url: CFG.fp_url,   primary: true },
      { label: "変動金利の正しい知識を読む（本）", url: CFG.book_url, primary: false },
    ]
  },
  {
    min: 0,
    badgeClass: "b-danger",
    badgeText:  "🚨 耐性：早急対応",
    gaugeColor: "#f85149",
    title:  "できるだけ早い見直しをお勧めします",
    body:   "変動金利上昇リスクが高い状態です。放置すると家計を圧迫するリスクがあります。専門家に相談して対策を立てましょう。",
    ctas: [
      { label: "🆘 無料FP相談を今すぐ受ける",   url: CFG.fp_url,   primary: true },
      { label: "まず読む：変動金利の基礎知識（本）", url: CFG.book_url, primary: false },
    ]
  },
];

/* ── State ── */
let currentQ  = 0;
let scores    = [];
let chosen    = null;

/* ── Screen transition ── */
function goto(fromId, toId, cb) {
  const from = document.getElementById(fromId);
  from.classList.add("leaving");
  setTimeout(() => {
    from.classList.remove("active", "leaving");
    const to = document.getElementById(toId);
    to.classList.add("active");
    if (cb) cb();
  }, 280);
}

/* ── Quiz start ── */
function startQuiz() {
  currentQ = 0; scores = []; chosen = null;
  goto("screen-intro", "screen-quiz", () => renderQ());
}

/* ── Render question ── */
function renderQ() {
  const q = QUESTIONS[currentQ];
  chosen = null;

  document.getElementById("cur-q").textContent  = currentQ + 1;
  document.getElementById("q-num").textContent  = `Q${currentQ + 1}`;
  document.getElementById("q-text").textContent = q.text;
  document.getElementById("prog-fill").style.width = `${((currentQ + 1) / QUESTIONS.length) * 100}%`;

  /* options */
  const opts = document.getElementById("opts");
  opts.innerHTML = "";
  q.opts.forEach((o, i) => {
    const btn = document.createElement("button");
    btn.className = "opt";
    btn.innerHTML = `<span class="opt-dot"></span><span>${o.label}</span>`;
    btn.onclick = () => pick(i, o.score, btn);
    opts.appendChild(btn);
  });

  /* next button */
  const nx = document.getElementById("btn-next");
  nx.classList.remove("on");
  nx.disabled = true;

  /* entrance */
  const card = document.getElementById("q-card");
  card.style.transition = "none";
  card.style.opacity    = "0";
  card.style.transform  = "translateX(28px)";
  requestAnimationFrame(() => {
    card.style.transition = "opacity .3s, transform .3s";
    card.style.opacity    = "1";
    card.style.transform  = "translateX(0)";
  });
}

/* ── Option select ── */
function pick(idx, score, el) {
  document.querySelectorAll(".opt").forEach(b => b.classList.remove("chosen"));
  el.classList.add("chosen");
  chosen = score;

  const nx = document.getElementById("btn-next");
  nx.classList.add("on");
  nx.disabled = false;
}

/* ── Next question ── */
function nextQuestion() {
  if (chosen === null) return;
  scores.push(chosen);

  const card = document.getElementById("q-card");
  card.style.transition = "opacity .2s, transform .2s";
  card.style.opacity    = "0";
  card.style.transform  = "translateX(-28px)";

  setTimeout(() => {
    currentQ++;
    if (currentQ < QUESTIONS.length) {
      renderQ();
    } else {
      showResult();
    }
  }, 220);
}

/* ── Result ── */
function showResult() {
  const total  = scores.reduce((a, b) => a + b, 0);
  const result = RESULTS.find(r => total >= r.min);

  goto("screen-quiz", "screen-result", () => {
    setTimeout(() => {

      /* badge */
      const badge = document.getElementById("res-badge");
      badge.className   = `res-badge ${result.badgeClass}`;
      badge.textContent = result.badgeText;

      /* text */
      document.getElementById("res-title").textContent = result.title;
      document.getElementById("res-body").textContent  = result.body;

      /* gauge color */
      const fill = document.getElementById("g-fill");
      fill.style.stroke = result.gaugeColor;

      /* gauge animation */
      setTimeout(() => {
        const offset = 251.3 * (1 - total / 15);
        fill.style.strokeDashoffset = offset;
      }, 80);

      /* score count-up */
      const numEl = document.getElementById("gauge-num");
      numEl.textContent = "0";
      let n = 0;
      const iv = setInterval(() => {
        n++;
        numEl.textContent = n;
        if (n >= total) clearInterval(iv);
      }, 80);

      /* CTAs */
      const stack = document.getElementById("cta-stack");
      stack.innerHTML = "";
      result.ctas.forEach(c => {
        const a = document.createElement("a");
        a.href      = c.url;
        a.className = c.primary ? "cta-p" : "cta-s";
        a.textContent = c.label;
        if (c.url.startsWith("http")) a.target = "_blank";
        stack.appendChild(a);
      });

    }, 120);
  });
}

/* ── Retry ── */
function retryQuiz() {
  /* reset gauge */
  const fill = document.getElementById("g-fill");
  fill.style.transition = "none";
  fill.style.strokeDashoffset = 251.3;
  goto("screen-result", "screen-intro", null);
}
