// script.js

// Inicjalizacja Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Rozszerz okno

// Pytania do quizu
const questions = [
    { question: "Ile to 2 + 2?", answers: ["3", "4", "5"], correct: "4" },
    { question: "Stolica Polski to…", answers: ["Kraków", "Warszawa", "Gdańsk"], correct: "Warszawa" },
    { question: "Największy ocean to…", answers: ["Atlantycki", "Spokojny", "Indyjski"], correct: "Spokojny" },
    { question: "Ile to 5 x 5?", answers: ["20", "25", "30"], correct: "25" },
    { question: "Ile dni ma tydzień?", answers: ["5", "6", "7"], correct: "7" },
];

let currentQuestion = 0;
let score = 0;

// Elementy DOM
const questionElement = document.getElementById("question");
const answersContainer = document.getElementById("answers");
const restartButton = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");

// Rozpoczęcie gry
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    restartButton.style.display = "none";
    loadQuestion();
}

// Wczytaj pytanie
function loadQuestion() {
    answersContainer.innerHTML = "";
    const current = questions[currentQuestion];
    questionElement.textContent = current.question;

    current.answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer;
        button.addEventListener("click", () => checkAnswer(answer));
        answersContainer.appendChild(button);
    });
}

// Sprawdź odpowiedź
function checkAnswer(selected) {
    const correct = questions[currentQuestion].correct;
    if (selected === correct) score++;

    currentQuestion++;
    scoreElement.textContent = `Wynik: ${score}/${questions.length}`;

    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
}

// Koniec quizu
function endQuiz() {
    questionElement.textContent = `Koniec! Twój wynik: ${score}/${questions.length}`;
    answersContainer.innerHTML = "";
    restartButton.style.display = "block";

    // Przekazanie wyniku do Telegrama
    tg.sendData(JSON.stringify({ score: score }));
}

// Inicjalizacja
startQuiz();

function showRewardedAd() {
    show_9058300().then(() => {
        // Nagradzanie użytkownika za obejrzenie reklamy
        score++;
        scoreElement.textContent = `Wynik: ${score}/${questions.length}`;
        alert('Otrzymałeś punkt za obejrzenie reklamy!');
    }).catch(e => {
        // Obsługa błędów, jeśli reklama nie została wyświetlona
        console.error('Błąd wyświetlania reklamy:', e);
        alert('Wystąpił błąd podczas wyświetlania reklamy.');
    });
}
