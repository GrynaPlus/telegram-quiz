const tg = window.Telegram.WebApp;
tg.expand();

const quizData = [
    { totalDots: 30, redDots: 10, colors: ["red"] },
    { totalDots: 40, blueDots: 15, colors: ["blue"] },
    { totalDots: 50, greenDots: 20, colors: ["green"] },
    { totalDots: 35, yellowDots: 12, colors: ["yellow"] },
    { totalDots: 45, purpleDots: 18, colors: ["purple"] },
    { totalDots: 55, orangeDots: 22, colors: ["orange"] },
    { totalDots: 60, redDots: 25, colors: ["red"] },
    { totalDots: 42, blueDots: 16, colors: ["blue"] },
    { totalDots: 52, greenDots: 21, colors: ["green"] },
    { totalDots: 38, yellowDots: 14, colors: ["yellow"] },
    { totalDots: 65, purpleDots: 26, colors: ["purple"] },
    { totalDots: 70, orangeDots: 28, colors: ["orange"] },
    { totalDots: 75, redDots: 30, colors: ["red"] },
    { totalDots: 68, blueDots: 27, colors: ["blue"] },
    { totalDots: 72, greenDots: 29, colors: ["green"] },
    { totalDots: 80, yellowDots: 32, colors: ["yellow"] },
    { totalDots: 85, purpleDots: 34, colors: ["purple"] },
    { totalDots: 90, orangeDots: 36, colors: ["orange"] },
    { totalDots: 95, redDots: 38, colors: ["red"] },
    { totalDots: 100, blueDots: 40, colors: ["blue"] }
];

let currentQuestion = 0;
let score = 0;
let questionCounter = 0;
let consecutiveCorrectAnswers = 0;
let correctAnswer;
let lastAdTime = 0; // Czas ostatniej reklamy

const answersContainer = document.getElementById("answers");
const restartButton = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    questionCounter = 0;
    consecutiveCorrectAnswers = 0;
    restartButton.style.display = "none";
    loadQuestion();
}

function loadQuestion() {
    answersContainer.innerHTML = "";
    const currentQuiz = quizData[currentQuestion];
    const { totalDots } = currentQuiz;
    const color = currentQuiz.colors[0];

    correctAnswer = currentQuiz[color + "Dots"];
    answersContainer.innerHTML = `<div id="question-text">Policz kropki koloru ${color}:</div>`;
    generateDots(totalDots, correctAnswer, color);
}

function generateDots(totalDots, correctAnswer, color) {
    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (Math.random() < correctAnswer / totalDots) {
            dot.style.backgroundColor = color;
        } else {
            dot.style.backgroundColor = "black";
        }
        answersContainer.appendChild(dot);
    }

    const options = generateOptions(correctAnswer);
    options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.addEventListener("click", () => checkAnswer(option));
        answersContainer.appendChild(button);
    });
}

function generateOptions(correctAnswer) {
    const options = [correctAnswer, correctAnswer + 2, correctAnswer - 1, correctAnswer + 3];
    shuffleArray(options);
    return options;
}

function checkAnswer(selectedAnswer) {
    if (selectedAnswer === correctAnswer) {
        score++;
        consecutiveCorrectAnswers++;
        if (consecutiveCorrectAnswers === 2) {
            showSkipLevelAd();
        }
    } else {
        consecutiveCorrectAnswers = 0;
        score = 0;
        showRetryAd();
        return;
    }

    currentQuestion++;
    questionCounter++;

    scoreElement.textContent = `Wynik: ${score}/20`;

    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    answersContainer.innerHTML = `Koniec! Twój wynik: ${score}/20<br>Kod bonusowy: kropki`;
    restartButton.style.display = "block";
    tg.sendData(JSON.stringify({ score: score }));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showRetryAd() {
    if (confirm("Błędna odpowiedź. Obejrzyj reklamę, aby spróbować ponownie?")) {
        showRewardedAd(() => loadQuestion());
    } else {
        startQuiz();
    }
}

function showSkipLevelAd() {
    if (confirm("Dwie poprawne odpowiedzi z rzędu! Obejrzyj reklamę, aby pominąć poziom?")) {
        showRewardedAd(() => {
            currentQuestion++;
            loadQuestion();
        });
    }
}

function showRewardedAd(callback) {
    const currentTime = Date.now();
    if (currentTime - lastAdTime < 30000) { // 30 sekund odstępu
        setTimeout(() => showRewardedAd(callback), 30000 - (currentTime - last
