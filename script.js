// Sprawdzenie dostępności Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const quizData = [
    { totalDots: 40, redDots: 15 },
    { totalDots: 50, redDots: 20 },
    { totalDots: 60, redDots: 25 },
    { totalDots: 35, redDots: 12 },
    { totalDots: 45, redDots: 18 },
    { totalDots: 55, redDots: 22 },
    { totalDots: 30, redDots: 10 },
    { totalDots: 42, redDots: 16 },
    { totalDots: 52, redDots: 21 },
    { totalDots: 38, redDots: 14 }
];

let currentQuestion = 0;
let score = 0;
let questionCounter = 0;

const answersContainer = document.getElementById("answers");
const restartButton = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    questionCounter = 0;
    restartButton.style.display = "none";
    loadQuestion();
}

function loadQuestion() {
    answersContainer.innerHTML = "";
    const { totalDots, redDots } = quizData[currentQuestion];
    generateDots(totalDots, redDots);
}

function generateDots(totalDots, redDots) {
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (Math.random() < redDots / totalDots) {
            dot.classList.add("red");
        }
        answersContainer.appendChild(dot);
    }

    const options = generateOptions(redDots);
    options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.addEventListener("click", () => checkAnswer(option));
        answersContainer.appendChild(button);
    });
}

function generateOptions(correctAnswer) {
    const options = new Set();
    options.add(correctAnswer);
    while (options.size < 4) {
        options.add(correctAnswer + Math.floor(Math.random() * 5) - 2);
    }
    return Array.from(options).sort(() => Math.random() - 0.5);
}

function checkAnswer(selectedAnswer) {
    if (parseInt(selectedAnswer) === quizData[currentQuestion].redDots) {
        score++;
        currentQuestion++;
        questionCounter++;
        scoreElement.textContent = `Wynik: ${score}/10`;

        if (score === 10) {
            showBonusCode();
        } else if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            endQuiz();
        }
    } else {
        showAdOption();
    }
}

function showAdOption() {
    const watchAd = confirm("Zła odpowiedź! Chcesz obejrzeć reklamę, aby nie utracić postępu?");
    if (watchAd) {
        showRewardedAd();
    } else {
        resetProgress();
    }
}

function showRewardedAd() {
    if (typeof show_9058300 === "function") {
        show_9058300().then(() => {
            alert('Reklama obejrzana. Możesz kontynuować!');
            loadQuestion();
        }).catch(() => {
            alert('Nie obejrzano reklamy. Postęp został zresetowany.');
            resetProgress();
        });
    } else {
        alert('Reklama niedostępna. Postęp został zresetowany.');
        resetProgress();
    }
}

function resetProgress() {
    currentQuestion = 0;
    score = 0;
    questionCounter = 0;
    scoreElement.textContent = `Wynik: ${score}/10`;
    loadQuestion();
}

function showBonusCode() {
    answersContainer.innerHTML = `
        <h2>Gratulacje! Zdobyłeś 10/10 punktów!</h2>
        <p>Twój kod bonusowy: <strong>kropki</strong></p>
    `;
    restartButton.style.display = "block";

    if (tg) {
        tg.sendData(JSON.stringify({ bonusCode: "kropki" }));
    }
}

function endQuiz() {
    answersContainer.innerHTML = `Koniec! Twój wynik: ${score}/10`;
    restartButton.style.display = "block";

    if (tg) {
        tg.sendData(JSON.stringify({ score: score }));
    }
}

// Rozpoczęcie quizu
startQuiz();
