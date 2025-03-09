// script.js

    const tg = window.Telegram.WebApp;
    tg.expand();

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
    const currentQuiz = quizData[currentQuestion];
    const { totalDots, redDots } = currentQuiz;

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
    const options = [correctAnswer, correctAnswer + 2, correctAnswer - 1, correctAnswer + 3];
    shuffleArray(options);
    return options;
    }

    function checkAnswer(selectedAnswer) {
    if (selectedAnswer === quizData[currentQuestion].redDots) {
    score++;
    }

    currentQuestion++;
    questionCounter++;

    scoreElement.textContent = `Wynik: ${score}/10`;

    if (currentQuestion < quizData.length) {
    if (questionCounter % 3 === 0 && questionCounter !== 0) {
    showInAppInterstitialAd();
    }
    loadQuestion();
    } else {
    endQuiz();
    }
    }

    function endQuiz() {
    answersContainer.innerHTML = `Koniec! Twój wynik: ${score}/10`;
    restartButton.style.display = "block";
    tg.sendData(JSON.stringify({ score: score }));
    }

    function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
    }
    }

    function showInAppInterstitialAd() {
    show_9058300({
    type: 'inApp',
    inAppSettings: {
    frequency: 2,
    capping: 0.1,
    interval: 30,
    timeout: 5,
    everyPage: false
    }
    });
    }

    startQuiz();
