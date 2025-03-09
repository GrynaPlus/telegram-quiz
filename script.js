const tg = window.Telegram.WebApp;
tg.expand();

// Generowanie 100 poziomów z rosnącą liczbą kropek
const quizData = Array.from({ length: 100 }, (_, i) => {
    const totalDots = 40 + i * 2; // Liczba kropek rośnie o 2 na poziom
    const redDots = Math.floor(totalDots * 0.4); // Około 40% kropek czerwonych
    return { totalDots, redDots };
});

let currentQuestion = 0;
let score = 0;

const answersContainer = document.getElementById("answers");
const restartButton = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");

function startQuiz() {
    currentQuestion = 0;
    score = 0;
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
    answersContainer.innerHTML = "";

    // Tworzenie tablicy kropek (naprzemiennie czerwone i czarne)
    const dots = Array.from({ length: totalDots }, (_, i) => (i < redDots ? 'red' : 'black'));

    // Tasowanie tablicy, by kropki były rozmieszczone losowo
    shuffleArray(dots);

    dots.forEach(dotColor => {
        const dot = document.createElement("div");
        dot.classList.add("dot", dotColor);
        answersContainer.appendChild(dot);
    });

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
        scoreElement.textContent = `Wynik: ${score}/100`;

        if (currentQuestion < quizData.length) {
            if (currentQuestion % 3 === 0) {
                showInAppInterstitialAd();
            }
            loadQuestion();
        } else {
            showFinalMessage();
        }
    } else {
        showRewardAdOption();
    }
}

function showFinalMessage() {
    answersContainer.innerHTML = `<h2>Gratulacje Wariacie 420 🎉</h2>`;
    restartButton.style.display = "block";
    tg.sendData(JSON.stringify({ score: score }));
}

function showRewardAdOption() {
    const message = document.createElement("p");
    message.innerHTML = "Źle! Chcesz obejrzeć reklamę, aby kontynuować?";

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
    show_9058300().then(() => {
        alert("Reklama obejrzana – kontynuujesz quiz!");
        loadQuestion();
    }).catch(() => {
        alert("Nie udało się załadować reklamy – zaczynasz od nowa.");
        startQuiz();
    });
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
