const tg = window.Telegram.WebApp;
tg.expand();

let currentQuestion = parseInt(localStorage.getItem('currentQuestion')) || 0;
let score = parseInt(localStorage.getItem('score')) || 0;
let username = localStorage.getItem('username') || "";
let questionCounter = currentQuestion;

const answersContainer = document.getElementById("answers");
const restartButton = document.getElementById("restart-btn");
const scoreElement = document.getElementById("score");
const usernameDisplay = document.getElementById("username-display");
const usernameContainer = document.getElementById("username-container");

// === Nazwa użytkownika ===
function setUsername() {
    username = document.getElementById("username-input").value.trim();
    if (username) {
        localStorage.setItem('username', username);
        updateUsernameDisplay();
        usernameContainer.style.display = "none";
    }
}

function updateUsernameDisplay() {
    usernameDisplay.innerHTML = "";
    const name = username.toUpperCase();
    for (let char of name) {
        const pattern = letterPatterns[char];
        if (!pattern) continue;
        const letterContainer = document.createElement("div");
        letterContainer.classList.add("letter-container");
        for (let row of pattern) {
            const rowDiv = document.createElement("div");
            rowDiv.classList.add("letter-row");
            for (let ch of row) {
                const dot = document.createElement("div");
                dot.className = ch === "*" ? "letter-dot" : "empty-letter";
                rowDiv.appendChild(dot);
            }
            letterContainer.appendChild(rowDiv);
        }
        usernameDisplay.appendChild(letterContainer);
    }

    usernameDisplay.style.transform = "";
    const availableWidth = usernameDisplay.parentElement.clientWidth;
    const contentWidth = usernameDisplay.scrollWidth;
    if (contentWidth > availableWidth) {
        const scale = availableWidth / contentWidth;
        usernameDisplay.style.transform = `scale(${scale})`;
        usernameDisplay.style.transformOrigin = "center";
    }
}

if (username) {
    updateUsernameDisplay();
    usernameContainer.style.display = "none";
}

// === Gra ===

const quizData = Array.from({ length: 1000 }, (_, i) => {
    const totalDots = Math.min(30 + i * 2, 200);
    const redDots = Math.floor(totalDots * (0.2 + Math.random() * 0.7));
    return { totalDots, redDots };
});

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

    if (currentQuestion % 5 === 0 && currentQuestion !== 0) {
        const skipButton = document.createElement("button");
        skipButton.textContent = "Pomiń poziom (Reklama)";
        skipButton.addEventListener("click", showSkipRewardAdOption);
        answersContainer.appendChild(skipButton);
    }
}

function generateOptions(correctAnswer) {
    const range = Math.max(3, Math.floor(4 + currentQuestion * 0.4));
    const options = new Set([correctAnswer]);
    while (options.size < 4) {
        let randomOffset = Math.floor(Math.random() * range) - Math.floor(range / 2);
        let newOption = correctAnswer + randomOffset;
        if (newOption > 0 && newOption !== correctAnswer) {
            options.add(newOption);
        }
    }
    return shuffleArray(Array.from(options));
}

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
        } else if (currentQuestion % 5 === 0) {
            showInterstitialAd().finally(() => {
                loadQuestion();
            });
        } else {
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
    answersContainer.innerHTML = "";
    const message = document.createElement("p");
    message.innerHTML = "Źle! Chcesz obejrzeć reklamę, aby zachować postęp?";
    const yesButton = document.createElement("button");
    yesButton.textContent = "Tak, obejrzyj reklamę";
    yesButton.addEventListener("click", showRewardAd);
    const noButton = document.createElement("button");
    noButton.textContent = "Nie, utracisz postęp";
    noButton.addEventListener("click", startQuiz);
    answersContainer.appendChild(message);
    answersContainer.appendChild(yesButton);
    answersContainer.appendChild(noButton);
}

function showRewardAd() {
    show_9373277().then(() => {
        alert('Reklama zakończona – kontynuujesz!');
        loadQuestion();
    }).catch(() => {
        alert("Nie udało się załadować reklamy – zaczynasz od nowa.");
        startQuiz();
    });
}

function showExtraRewardAd() {
    show_9373277().then(() => {
        alert('Bonus! Obejrzałeś reklamę i zdobywasz dodatkowy punkt!');
        score++;
        localStorage.setItem('score', score);
    }).catch(() => {
        alert("Nie udało się załadować reklamy bonusowej.");
    });
}

function showSkipRewardAdOption() {
    answersContainer.innerHTML = "";
    const message = document.createElement("p");
    message.innerHTML = "Chcesz pominąć poziom za reklamę?";
    const yesButton = document.createElement("button");
    yesButton.textContent = "Tak, obejrzyj reklamę";
    yesButton.addEventListener("click", showRewardAdSkip);
    const noButton = document.createElement("button");
    noButton.textContent = "Nie";
    noButton.addEventListener("click", loadQuestion);
    answersContainer.appendChild(message);
    answersContainer.appendChild(yesButton);
    answersContainer.appendChild(noButton);
}

function showRewardAdSkip() {
    show_9373277().then(() => {
        alert("Poziom pominięty!");
        currentQuestion++;
        localStorage.setItem('currentQuestion', currentQuestion);
        loadQuestion();
    }).catch(() => {
        alert("Nie udało się załadować reklamy.");
        loadQuestion();
    });
}

// === REKLAMA INTERSTITIAL CO 5 POZIOMÓW ===
function showInterstitialAd() {
    return show_9373277({
        type: 'inApp',
        inAppSettings: {
            frequency: 1,
            capping: 0,
            interval: 30,
            timeout: 0,
            everyPage: false
        }
    });
}

// === Narzędzie pomocnicze ===
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Start
if (currentQuestion > 0) {
    alert(`Wznawiasz grę od poziomu ${currentQuestion + 1}`);
    loadQuestion();
} else {
    startQuiz();
}