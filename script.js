// ======= script.js (pełna, poprawiona wersja) =======

// ---- Telegram WebApp init ----
const tg = window.Telegram.WebApp;
tg.expand();

// ---- KONFIGURACJA Google Sheets ----
const G_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbx9-0X_sYVTQuLwAjOUwZhU6VGNT1PnmSK2FrcMRklt8FVwA5a_ijipv-TPqLEpLHHC/exec"; // <-- Twój Web App URL

// ---- Funkcja wysyłki do arkusza ----
function sendUserData(level) {
  const data = new URLSearchParams();
  data.append("username", username);                   // nazwa użytkownika
  data.append("lvl", level);                           // ukończony poziom
  data.append("date", new Date().toISOString());       // data w ISO 8601

  fetch(G_SHEETS_URL, {
    method: "POST",
    /* Jeśli Twój skrypt GAS ma nagłówek
       Access-Control-Allow-Origin: *     – zakomentuj następny wiersz,
       wówczas będziesz mógł odczytać odpowiedź. */
    // mode: "no-cors",
    body: data
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log("✅ Dane wysłane:", username, level);
    })
    .catch(e => console.error("❌ Błąd wysyłki:", e));
}

// ---- Pobieramy zapisane dane, jeśli istnieją ----
let currentQuestion = parseInt(localStorage.getItem("currentQuestion")) || 0;
let score           = parseInt(localStorage.getItem("score"))           || 0;
let username        = localStorage.getItem("username")                  || "";

// ---- Elementy DOM ----
const answersContainer  = document.getElementById("answers");
const restartButton     = document.getElementById("restart-btn");
const scoreElement      = document.getElementById("score");
const usernameInputEl   = document.getElementById("username-input");
const setUsernameBtn    = document.getElementById("set-username-btn");
const usernameDisplay   = document.getElementById("username-display");
const usernameContainer = document.getElementById("username-container");

// ---- Wzory liter 5×5 dla nazwy użytkownika ----
const letterPatterns = {
  /* … (patrz oryginał; tablica wzorów bez zmian) … */
  "9": [" *** ", "*   *", " ****", "    *", " *** "]
};

// ---- Ustawianie nazwy użytkownika ----
setUsernameBtn.addEventListener("click", () => {
  const v = usernameInputEl.value.trim();
  if (!v) return;
  username = v;
  localStorage.setItem("username", username);
  updateUsernameDisplay();
  usernameContainer.style.display = "none";
});
function updateUsernameDisplay() {
  usernameDisplay.innerHTML = "";
  const name = username.toUpperCase();
  for (let char of name) {
    const pattern = letterPatterns[char];
    if (!pattern) continue;
    const letterDiv = document.createElement("div");
    letterDiv.classList.add("letter-container");
    for (let row of pattern) {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("letter-row");
      for (let c of row) {
        const dot = document.createElement("div");
        dot.classList.add(c === "*" ? "letter-dot" : "empty-letter");
        rowDiv.appendChild(dot);
      }
      letterDiv.appendChild(rowDiv);
    }
    usernameDisplay.appendChild(letterDiv);
  }
  // Skalowanie, jeśli za szeroko
  usernameDisplay.style.transform = "";
  const avail = usernameDisplay.parentElement.clientWidth;
  const content = usernameDisplay.scrollWidth;
  if (content > avail) {
    const scale = avail / content;
    usernameDisplay.style.transform = `scale(${scale})`;
    usernameDisplay.style.transformOrigin = "center";
  }
}
if (username) {
  updateUsernameDisplay();
  usernameContainer.style.display = "none";
}

// ---- Dane quizu ----
const quizData = Array.from({ length: 1000 }, (_, i) => {
  const total = Math.min(30 + i * 2, 200);
  const red = Math.floor(total * (0.2 + Math.random() * 0.7));
  return { totalDots: total, redDots: red };
});

// ---- Start i ładowanie ----
function startQuiz() {
  currentQuestion = 0;
  score = 0;
  localStorage.setItem("currentQuestion", 0);
  localStorage.setItem("score", 0);
  restartButton.style.display = "none";
  loadQuestion();
}
function loadQuestion() {
  answersContainer.innerHTML = "";
  const { totalDots, redDots } = quizData[currentQuestion];
  generateDots(totalDots, redDots);
  scoreElement.textContent = `Wynik: ${score}/1000`;
}

// ---- Generowanie kropek i opcji ----
function generateDots(total, redCount) {
  const dots = [];
  let red = 0,
    black = 0;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if ((black + 1) % 3 === 0 && red < redCount) {
      dot.classList.add("red");
      red++;
    } else {
      black++;
    }
    dots.push(dot);
  }
  shuffleArray(dots).forEach(d => answersContainer.appendChild(d));
  const options = generateOptions(redCount, currentQuestion);
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => checkAnswer(opt));
    answersContainer.appendChild(btn);
  });
  if (currentQuestion % 5 === 0 && currentQuestion !== 0) {
    const skip = document.createElement("button");
    skip.textContent = "Pomiń poziom (Reklama)";
    skip.addEventListener("click", showRewardAdSkip);
    answersContainer.appendChild(skip);
  }
}
function generateOptions(correct, idx) {
  const range = Math.max(3, Math.floor(4 + idx * 0.4));
  const opts = new Set([correct]);
  while (opts.size < 4) {
    const offset = Math.floor(Math.random() * range) - Math.floor(range / 2);
    const val = correct + offset;
    if (val > 0 && val !== correct) opts.add(val);
  }
  return shuffleArray([...opts]);
}

// ---- Sprawdzenie odpowiedzi ----
function checkAnswer(selected) {
  const { redDots } = quizData[currentQuestion];
  if (selected === redDots) {
    score++;
    currentQuestion++;
    localStorage.setItem("score", score);
    localStorage.setItem("currentQuestion", currentQuestion);
    if (currentQuestion % 10 === 0) showExtraRewardAd();
    if (currentQuestion === 1000) {
      showFinalMessage();
    } else {
      if (currentQuestion % 5 === 0) showInterstitialAd();
      loadQuestion();
    }
  } else {
    showRewardAdOption();
  }
}

// ---- Końcowy komunikat i wysyłka ----
function showFinalMessage() {
  answersContainer.innerHTML = `<h2>Gratulacje, Wariacie 420!</h2>`;
  restartButton.style.display = "block";
  tg.sendData(JSON.stringify({ score }));
  localStorage.removeItem("currentQuestion");
  localStorage.removeItem("score");

  /* Wysyłamy ukończony poziom (score) do Sheets.
     Jeśli chcesz przesłać coś innego, zmień argument. */
  sendUserData(score);
}

// ---- Reklamy i pomocnicze ----
function showRewardAdOption() {
  answersContainer.innerHTML = `
    <p>Źle! Chcesz obejrzeć reklamę, aby zachować postęp?</p>
    <button id="yes-ad">Tak</button>
    <button id="no-ad">Nie</button>`;
  document.getElementById("yes-ad").addEventListener("click", showRewardAd);
  document.getElementById("no-ad").addEventListener("click", startQuiz);
}
function showRewardAd() {
  show_9373277()
    .then(loadQuestion)
    .catch(startQuiz);
}
function showExtraRewardAd() {
  show_9373277()
    .then(() => {
      score++;
      localStorage.setItem("score", score);
    })
    .catch(() => {});
}
function showRewardAdSkip() {
  show_9373277()
    .then(() => {
      currentQuestion++;
      localStorage.setItem("currentQuestion", currentQuestion);
      loadQuestion();
    })
    .catch(loadQuestion);
}
function showInterstitialAd() {
  show_9373277({
    type: "inApp",
    inAppSettings: { frequency: 1, capping: 0, interval: 180, timeout: 1, everyPage: false }
  });
}
function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- Inicjalizacja ----
if (username) {
  usernameContainer.style.display = "none";
  updateUsernameDisplay();
} else {
  usernameContainer.style.display = "block";
}
restartButton.addEventListener("click", startQuiz);

if (currentQuestion > 0) {
  loadQuestion();
} else {
  startQuiz();
}
