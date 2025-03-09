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
    { question: "Który to kolor tęczy?", answers: ["Żółty", "Czarny", "Srebrny"], correct: "Żółty" },
    { question: "Kto odkrył Amerykę?", answers: ["Kopernik", "Kolumb", "Newton"], correct: "Kolumb" },
    { question: "Ile to 10 - 3?", answers: ["5", "7", "9"], correct: "7" },
    { question: "Największy kontynent to…", answers: ["Europa", "Azja", "Afryka"], correct: "Azja" },
    { question: "Jaki gaz jest niezbędny do oddychania?", answers: ["Azot", "Tlen", "Dwutlenek węgla"], correct: "Tlen" },
];

let currentQuestion = 0;
let score = 0;
let questionCounter = 0; // Dodajemy licznik pytań

// Elementy DOM
const questionElement = document.getElementById("question");
const answersContainer = document.getElementById("answers");
const restartButton = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");

// Rozpoczęcie gry
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    questionCounter = 0; // Resetujemy licznik pytań
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
    questionCounter++; // Zwiększamy licznik pytań

    scoreElement.textContent = `Wynik: ${score}/${questions.length}`;

    if (currentQuestion < questions.length) {
        if (questionCounter % 3 === 0 && questionCounter !== 0) {
            showInAppInterstitialAd(); // Wyświetlamy reklamę co 3 pytania
        }
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

function showInAppInterstitialAd() {
    show_9058300({
        type: 'inApp',
        inAppSettings: {
            frequency: 1, // Wyświetlamy tylko jedną reklamę
            capping: 1, // W ciągu jednej godziny
            interval: 0, // Bez odstępu czasowego
            timeout: 5, // 5 sekund opóźnienia
            everyPage: false // Sesja nie jest resetowana przy przejściu między stronami
        }
    });
}
