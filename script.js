const quests = {
  english: {
    type: { id: "English Quest", en: "English Quest" },
    title: { id: "Word Portal", en: "Word Portal" },
    question: {
      id: "Kata mana yang berarti 'belajar'?",
      en: "Which word means 'belajar'?"
    },
    answers: [
      { id: "Play", en: "Play", correct: false },
      { id: "Learn", en: "Learn", correct: true },
      { id: "Sleep", en: "Sleep", correct: false }
    ],
    win: {
      id: "Benar. Kamu membuka English Badge.",
      en: "Correct. You unlocked the English Badge."
    },
    lose: {
      id: "Belum benar. Coba pikirkan kata yang artinya belajar.",
      en: "Not yet. Think about the word that means belajar."
    }
  },
  math: {
    type: { id: "Math Tower", en: "Math Tower" },
    title: { id: "Tower Coin Challenge", en: "Tower Coin Challenge" },
    question: {
      id: "Satu tower harganya 5 koin. Kamu punya 12 koin. Kalau membeli 2 tower, sisa berapa koin?",
      en: "One tower costs 5 coins. You have 12 coins. If you buy 2 towers, how many coins are left?"
    },
    answers: [
      { id: "2 koin", en: "2 coins", correct: true },
      { id: "7 koin", en: "7 coins", correct: false },
      { id: "10 koin", en: "10 coins", correct: false }
    ],
    win: {
      id: "Benar. Kamu membuka Math Badge.",
      en: "Correct. You unlocked the Math Badge."
    },
    lose: {
      id: "Belum benar. 2 tower berarti 5 + 5 koin.",
      en: "Not yet. 2 towers means 5 + 5 coins."
    }
  },
  teamwork: {
    type: { id: "Teamwork Gate", en: "Teamwork Gate" },
    title: { id: "Friendship Mission", en: "Friendship Mission" },
    question: {
      id: "Kalau teman satu tim bingung, apa yang sebaiknya dilakukan?",
      en: "If a teammate is confused, what should you do?"
    },
    answers: [
      { id: "Membantu dan menjelaskan", en: "Help and explain", correct: true },
      { id: "Meninggalkan dia", en: "Leave them behind", correct: false },
      { id: "Menyalahkan dia", en: "Blame them", correct: false }
    ],
    win: {
      id: "Benar. Kamu membuka Teamwork Badge.",
      en: "Correct. You unlocked the Teamwork Badge."
    },
    lose: {
      id: "Belum benar. Game yang baik juga mengajarkan kerja sama.",
      en: "Not yet. A good game can also teach teamwork."
    }
  }
};

const state = {
  currentQuest: "english",
  badges: new Set()
};

const questType = document.getElementById("quest-type");
const questTitle = document.getElementById("quest-title");
const questQuestion = document.getElementById("quest-question");
const answerGrid = document.getElementById("answer-grid");
const questFeedback = document.getElementById("quest-feedback");
const demoProgress = document.getElementById("demo-progress");
const demoRank = document.getElementById("demo-rank");
const meterFill = document.getElementById("quest-meter-fill");
const questButtons = document.querySelectorAll("[data-quest]");
const resetButton = document.getElementById("reset-demo");
const languageRadios = document.querySelectorAll("input[name='language']");

function language() {
  return document.getElementById("lang-en").checked ? "en" : "id";
}

function text(value) {
  return value[language()];
}

function renderQuest() {
  const lang = language();
  const quest = quests[state.currentQuest];
  questType.textContent = text(quest.type);
  questTitle.textContent = text(quest.title);
  questQuestion.textContent = text(quest.question);
  answerGrid.innerHTML = "";

  quest.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = answer[lang];
    button.addEventListener("click", () => chooseAnswer(answer.correct));
    answerGrid.appendChild(button);
  });

  questButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.quest === state.currentQuest);
  });
}

function chooseAnswer(correct) {
  const quest = quests[state.currentQuest];

  if (correct) {
    state.badges.add(state.currentQuest);
    questFeedback.textContent = text(quest.win);
    questFeedback.classList.add("success");
  } else {
    questFeedback.textContent = text(quest.lose);
    questFeedback.classList.remove("success");
  }

  renderProgress();
}

function renderProgress() {
  const count = state.badges.size;
  const percent = Math.round((count / 3) * 100);
  meterFill.style.width = `${percent}%`;
  demoProgress.textContent = `${count}/3 badges`;

  if (count === 3) {
    demoRank.textContent = language() === "en" ? "EduQuest Creator" : "EduQuest Creator";
  } else if (count === 2) {
    demoRank.textContent = language() === "en" ? "Rising Developer" : "Rising Developer";
  } else if (count === 1) {
    demoRank.textContent = language() === "en" ? "Quest Builder" : "Quest Builder";
  } else {
    demoRank.textContent = language() === "en" ? "Starter Creator" : "Starter Creator";
  }
}

questButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.currentQuest = button.dataset.quest;
    questFeedback.textContent = language() === "en"
      ? "Choose an answer to earn a badge."
      : "Pilih jawaban untuk mendapatkan badge.";
    questFeedback.classList.remove("success");
    renderQuest();
  });
});

resetButton.addEventListener("click", () => {
  state.badges.clear();
  questFeedback.textContent = language() === "en"
    ? "Badges reset. Try the quests again."
    : "Badge direset. Coba quest lagi.";
  questFeedback.classList.remove("success");
  renderProgress();
});

languageRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    renderQuest();
    renderProgress();
  });
});

renderQuest();
renderProgress();
