// ======= script.js =======

// ---- Telegram WebApp init ----
const tg = window.Telegram.WebApp;
tg.expand();

// ---- KONFIGURACJA Google Sheets ----
const G_SHEETS_URL =
  "https://script.google.com/macros/s/AKfycbxE60jxB3bsW5DmFsMGEMYkdsArMAxpNN765lozK8xuEgNS591Pl44IE_zcEZeWgvaV/exec";  // <-- Twój URL Web App

// ---- Funkcja wysyłki do arkusza ----
function sendUserData(level) {
  const data = new URLSearchParams();
  data.append("username", username);
  data.append("level", level);
  // data.append("date", new Date().toISOString()); // niepotrzebne — Apps Script doda datę sam

  fetch(G_SHEETS_URL, {
    method: "POST",
    mode: "no-cors",
    body: data
  })
  .then(() => console.log("✅ Wysłano do Sheets:", username, level))
  .catch(e => console.error("❌ Błąd wysyłki:", e));
}

// ---- Pobieramy zapisane dane użytkownika, jeśli istnieją ----
let currentQuestion = parseInt(localStorage.getItem('currentQuestion')) || 0;
let score           = parseInt(localStorage.getItem('score'))           || 0;
let username        = localStorage.getItem('username')                 || "";
let questionCounter = currentQuestion;

// ---- Elementy DOM ----
const answersContainer   = document.getElementById("answers");
const restartButton      = document.getElementById("restart-btn");
const scoreElement       = document.getElementById("score");
const usernameDisplay    = document.getElementById("username-display");
const usernameContainer  = document.getElementById("username-container");

// (tu wklej swoje letterPatterns i funkcje setUsername/updateUsernameDisplay itp.,
//  tak jak w oryginalnym skrypcie — nie modyfikujemy ich względem poprzednio)

// ---- Funkcje quizu ----
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    questionCounter = 0;
    localStorage.setItem('currentQuestion', 0);
    localStorage.setItem('score', 0);
    restartButton.style.display = "none";
    loadQuestion();
}

function loadQuestion() {
    answersContainer.innerHTML = "";
    const { totalDots, redDots } = quizData[currentQuestion];
    generateDots(totalDots, redDots);
    scoreElement.textContent = `Wynik: ${score}/1000`;
}

// ... tu wklej generateDots, generateOptions, shuffleArray, showRewardAdOption, showRewardAd,
//     showExtraRewardAd, showSkipRewardAdOption, showRewardAdSkip, showInterstitialAd itd.

// ---- Sprawdzanie odpowiedzi ----
function checkAnswer(selectedAnswer) {
    if (selectedAnswer === quizData[currentQuestion].redDots) {
        score++;
        currentQuestion++;
        questionCounter++;
        localStorage.setItem('currentQuestion', currentQuestion);
        localStorage.setItem('score', score);

        if (questionCounter % 10 === 0) {
            showExtraRewardAd();
        }
        if (currentQuestion === 1000) {
            showFinalMessage();
        } else {
            if (currentQuestion % 5 === 0 && currentQuestion !== 0) {
                showInterstitialAd();
            }
            loadQuestion();
        }
    } else {
        showRewardAdOption();
    }
}

// ---- KONIEC gry: wyświetl komunikat i WYŚLIJ DANE ----
function showFinalMessage() {
    answersContainer.innerHTML = `<h2>Gratulacje Wariacie 420!</h2>`;
    restartButton.style.display = "block";
    tg.sendData(JSON.stringify({ score: score }));
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('score');

    // --- Tutaj wysyłamy username + level (=currentQuestion) do arkusza ---
    sendUserData(currentQuestion);
}

// ---- Inicjalizacja ----
if (currentQuestion > 0) {
    alert(`Wznawiasz grę od poziomu ${currentQuestion + 1}`);
    loadQuestion();
} else {
    startQuiz();
}
