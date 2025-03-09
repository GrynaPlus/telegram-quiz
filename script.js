const tg = window.Telegram.WebApp;
tg.expand();

const quizData = Array.from({ length: 100 }, (_, i) => ({
    totalDots: 30 + i * 2,
    redDots: Math.floor((30 + i * 2) * 0.4)
}));

let currentQuestion = parseInt(localStorage.getItem('currentQuestion')) || 0;
let score = parseInt(localStorage.getItem('score')) || 0;
let questionCounter = currentQuestion;

const answersContainer = document.getElementById("answers");
const restartButton = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");

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
    const currentQuiz = quizData[currentQuestion];
    const { totalDots, redDots } = currentQuiz;
    generateDots(totalDots, redDots);
    scoreElement.textContent = `Wynik: ${score}/100`;
}

function generateDots(totalDots, redDots) {
    answersContainer.innerHTML = "";
    const dots = [];

    let redCount = 0;
    let blackCount = 0;

    for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");

        if ((blackCount + 1) % 3 === 0 && redCount < redDots) {
            dot.classList.add("red");
            redCount++;
        } else {
            blackCount++;
        }

        dots.push(dot);
    }

    shuffleArray(dots);
    dots.forEach(dot => answersContainer.appendChild(dot));

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
        currentQuestion++;
        questionCounter++;
        
        // Zapisz postęp w LocalStorage
        localStorage.setItem('currentQuestion', currentQuestion);
        localStorage.setItem('score', score);

        if (currentQuestion === 100) {
            showFinalMessage();
        } else {
            if (questionCounter % 5 === 0) {
                showInterstitialAd();
            }
            if (questionCounter % 7 === 0) {
                showPopupAd();
            }
            loadQuestion();
        }
    } else {
        showRewardAdOption();
    }
}

function showFinalMessage() {
    answersContainer.innerHTML = `<h2>Gratulacje Wariacie 420!</h2>`;
    restartButton.style.display = "block";
    tg.sendData(JSON.stringify({ score: score }));
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('score');
}

function showRewardAdOption() {
    const message = document.createElement("p");
    message.innerHTML = "Źle! Chcesz obejrzeć reklamę, aby zachować postęp?";

    const yesButton = document.createElement("button");
    yesButton.textContent = "Tak, obejrzyj reklamę";
    yesButton.addEventListener("click", () => {
        showRewardAd();
    });

    const noButton = document.createElement("button");
    noButton.textContent = "Nie, zacznij od nowa";
    noButton.addEventListener("click", () => {
        startQuiz();
    });

    answersContainer.innerHTML = "";
    answersContainer.appendChild(message);
    answersContainer.appendChild(yesButton);
    answersContainer.appendChild(noButton);
}

function showRewardAd() {
    show_9058300('pop').then(() => {
        alert("Reklama obejrzana – kontynuujesz quiz!");
        loadQuestion();
    }).catch(() => {
        alert("Nie udało się załadować reklamy – zaczynasz od nowa.");
        startQuiz();
    });
}

function showInterstitialAd() {
    show_9058300({
        type: 'inApp',
        inAppSettings: {
            frequency: 5,
            capping: 0.1,
            interval: 30,
            timeout: 5,
            everyPage: false
        }
    });
}

function showPopupAd() {
    show_9058300('pop').then(() => {
        console.log("Popup ad obejrzana.");
    }).catch(() => {
        console.warn("Błąd podczas ładowania popup ad.");
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Sprawdź, czy są zapisane dane i załaduj je
if (currentQuestion > 0) {
    alert(`Wznawiasz grę od poziomu ${currentQuestion + 1}`);
    loadQuestion();
} else {
    startQuiz();
}
