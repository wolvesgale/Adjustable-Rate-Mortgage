const CFG = {
  lead_url: "#", // TikTok Instantフォームや計測URLに差し替え
  fp_url: "#https://px.a8.net/svt/ejp?a8mat=4B1HTJ+3R5F3M+5MAS+5YJRM",
  learn_links: [
    { label: "変動金利の正しい知識を読む（本）", url: "https://amzn.to/4t4AGcB" },
    { label: "変動金利の基礎を学ぶ（note）", url: "#" },
    { label: "動画で学ぶ（YouTube）", url: "#" },
  ],
};

const QUESTIONS = [
  {
    key: "rateType",
    text: "現在の金利タイプは？",
    opts: [
      { label: "固定金利", score: 3 },
      { label: "ミックス（固定＋変動）", score: 2 },
      { label: "変動金利", score: 1 },
    ]
  },
  {
    key: "paymentRatio",
    text: "月々の返済額は手取り月収の何割ですか？",
    opts: [
      { label: "20%未満（余裕あり）", score: 3 },
      { label: "20〜30%", score: 2 },
      { label: "30〜40%", score: 1 },
      { label: "40%以上", score: 0 },
    ]
  },
  {
    key: "reserve",
    text: "生活防衛資金は月収の何か月分ありますか？",
    opts: [
      { label: "6か月分以上", score: 3 },
      { label: "3〜6か月分", score: 2 },
      { label: "1〜3か月分", score: 1 },
      { label: "1か月分未満", score: 0 },
    ]
  },
  {
    key: "futureExpense",
    text: "今後3年以内に大きな支出の予定はありますか？",
    opts: [
      { label: "特にない", score: 3 },
      { label: "少しある（旅行・車など）", score: 2 },
      { label: "ある（教育費・リフォームなど）", score: 1 },
      { label: "かなり重なる", score: 0 },
    ]
  },
  {
    key: "monthlyIncome",
    text: "手取り月収に対して、金利上昇時の返済増を吸収できそうですか？",
    opts: [
      { label: "問題なく対応できる", score: 3 },
      { label: "少し厳しいが何とかなる", score: 2 },
      { label: "かなり厳しい", score: 1 },
      { label: "対応は困難", score: 0 },
    ]
  },
];

const RESULTS = {
  stable: {
    label: "余力あり",
    badgeClass: "b-safe",
    badgeText: "✅ 余力あり",
    gaugeColor: "#3fb950",
    title: "現時点では比較的余力があります",
    body: "返済比率・生活防衛資金ともに、現時点では大きな崩れは見えません。今後も定期的に返済比率と金利動向を確認しましょう。",
    actions: [
      "3〜6か月ごとに返済比率を見直す",
      "固定・借り換えの条件を定点チェックする",
      "学習導線で最新の金利情報を把握する",
    ],
    primaryCta: "無料で確認ポイントを受け取る",
    secondaryCta: "無料FP相談で対策を確認する",
  },
  caution: {
    label: "要注意",
    badgeClass: "b-warn",
    badgeText: "⚠️ 要注意",
    gaugeColor: "#f0b429",
    title: "金利上昇の影響を受ける可能性があります",
    body: "今のうちに対策を確認しておくことをおすすめします。返済比率、生活防衛資金、借り換え選択肢を優先して確認しましょう。",
    actions: [
      "返済比率が30%以内に収まるか試算する",
      "生活防衛資金を最低3か月分まで積み増す",
      "固定化や借り換えの選択肢を比較する",
    ],
    primaryCta: "結果を保存して確認ポイントを受け取る",
    secondaryCta: "無料FP相談で対策を確認する",
  },
  review: {
    label: "要見直し",
    badgeClass: "b-danger",
    badgeText: "🚨 要見直し",
    gaugeColor: "#f85149",
    title: "金利上昇時に家計への影響が大きい可能性があります",
    body: "返済負担率と生活防衛資金を優先的に見直してください。必要に応じて専門家相談も検討してください。",
    actions: [
      "毎月返済額と手取り月収のバランスを最優先で調整する",
      "生活防衛資金の確保を優先する",
      "早めに専門家へ相談し、見直し案を複数比較する",
    ],
    primaryCta: "結果を保存して確認ポイントを受け取る",
    secondaryCta: "無料FP相談で対策を確認する",
  }
};

let currentQ = 0;
let answers = [];
let chosen = null;

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

function startQuiz() {
  currentQ = 0;
  answers = [];
  chosen = null;
  goto("screen-intro", "screen-quiz", () => renderQ());
}

function renderQ() {
  const q = QUESTIONS[currentQ];
  chosen = null;

  document.getElementById("cur-q").textContent = currentQ + 1;
  document.getElementById("q-num").textContent = `Q${currentQ + 1}`;
  document.getElementById("q-text").textContent = q.text;
  document.getElementById("prog-fill").style.width = `${((currentQ + 1) / QUESTIONS.length) * 100}%`;

  const opts = document.getElementById("opts");
  opts.innerHTML = "";
  q.opts.forEach((o, i) => {
    const btn = document.createElement("button");
    btn.className = "opt";
    btn.innerHTML = `<span class="opt-dot"></span><span>${o.label}</span>`;
    btn.onclick = () => pick(i, o.score, btn);
    opts.appendChild(btn);
  });

  const nx = document.getElementById("btn-next");
  nx.classList.remove("on");
  nx.disabled = true;
}

function pick(idx, score, el) {
  document.querySelectorAll(".opt").forEach((b) => b.classList.remove("chosen"));
  el.classList.add("chosen");
  chosen = { idx, score };
  const nx = document.getElementById("btn-next");
  nx.classList.add("on");
  nx.disabled = false;
}

function nextQuestion() {
  if (chosen === null) return;
  const q = QUESTIONS[currentQ];
  answers.push({ key: q.key, score: chosen.score, index: chosen.idx });

  const card = document.getElementById("q-card");
  card.style.transition = "opacity .2s, transform .2s";
  card.style.opacity = "0";
  card.style.transform = "translateX(-28px)";

  setTimeout(() => {
    currentQ++;
    if (currentQ < QUESTIONS.length) {
      renderQ();
      card.style.opacity = "1";
      card.style.transform = "translateX(0)";
    } else {
      showResult();
    }
  }, 220);
}

function evaluateResult() {
  const scoreMap = Object.fromEntries(answers.map((a) => [a.key, a.score]));
  const total = answers.reduce((sum, a) => sum + a.score, 0);

  const hardRisk = scoreMap.paymentRatio <= 1 || scoreMap.reserve <= 1;
  const variableRisk = scoreMap.rateType <= 1;

  let resultKey = "stable";
  if (total <= 6 || (hardRisk && variableRisk)) {
    resultKey = "review";
  } else if (total <= 10 || hardRisk) {
    resultKey = "caution";
  }

  return { total, result: RESULTS[resultKey] };
}

function showResult() {
  const { total, result } = evaluateResult();

  goto("screen-quiz", "screen-result", () => {
    const badge = document.getElementById("res-badge");
    badge.className = `res-badge ${result.badgeClass}`;
    badge.textContent = result.badgeText;

    document.getElementById("res-title").textContent = result.title;
    document.getElementById("res-body").textContent = result.body;

    const actions = document.getElementById("res-actions");
    actions.innerHTML = "";
    result.actions.forEach((action) => {
      const li = document.createElement("li");
      li.textContent = action;
      actions.appendChild(li);
    });

    const fill = document.getElementById("g-fill");
    fill.style.stroke = result.gaugeColor;
    setTimeout(() => {
      fill.style.strokeDashoffset = 251.3 * (1 - total / 15);
    }, 80);

    const numEl = document.getElementById("gauge-num");
    numEl.textContent = "0";
    let n = 0;
    const iv = setInterval(() => {
      n++;
      numEl.textContent = n;
      if (n >= total) clearInterval(iv);
    }, 70);

    const stack = document.getElementById("cta-stack");
    stack.innerHTML = "";

    const primary = document.createElement("a");
    primary.href = CFG.lead_url;
    primary.className = "cta-p";
    primary.textContent = result.primaryCta;
    stack.appendChild(primary);

    const secondary = document.createElement("a");
    secondary.href = CFG.fp_url;
    secondary.className = "cta-s";
    secondary.textContent = result.secondaryCta;
    stack.appendChild(secondary);

    const learnWrap = document.createElement("div");
    learnWrap.className = "learn-links";
    learnWrap.innerHTML = `<p class="learn-title">学習コンテンツ</p>`;
    CFG.learn_links.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.url;
      link.textContent = item.label;
      link.className = "learn-link";
      if (item.url.startsWith("http")) link.target = "_blank";
      learnWrap.appendChild(link);
    });
    stack.appendChild(learnWrap);
  });
}

function retryQuiz() {
  const fill = document.getElementById("g-fill");
  fill.style.transition = "none";
  fill.style.strokeDashoffset = 251.3;
  setTimeout(() => { fill.style.transition = "stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1), stroke .6s"; }, 10);
  goto("screen-result", "screen-intro", null);
}
